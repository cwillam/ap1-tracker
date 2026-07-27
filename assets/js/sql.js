/* SQL-Labor – AP1 Tracker
 * Leichtgewichtige Mock-SQL-Engine (kein WASM).
 * Features: SELECT [DISTINCT], WHERE, ORDER BY, LIMIT, Aggregationen,
 *           INSERT / UPDATE / DELETE / CREATE TABLE / ALTER TABLE (Bonus).
 * Daten werden im Speicher gehalten (JS-Objekte).
 */
(() => {
	/* ===========================================================
	 *  Mock-Datenbank (reset-fähig)
	 * =========================================================== */
	const INITIAL_DB = {
		Mitarbeiter: {
			columns: [
				{ name: "ID", type: "INT", pk: true },
				{ name: "Name", type: "VARCHAR" },
				{ name: "Abteilung", type: "VARCHAR" },
				{ name: "Gehalt", type: "INT" },
				{ name: "Eintritt", type: "DATE" },
			],
			rows: [
				{
					ID: 1,
					Name: "Anna Schmidt",
					Abteilung: "IT",
					Gehalt: 5500,
					Eintritt: "2020-03-15",
				},
				{
					ID: 2,
					Name: "Ben Yilmaz",
					Abteilung: "IT",
					Gehalt: 4800,
					Eintritt: "2021-07-01",
				},
				{
					ID: 3,
					Name: "Clara Weber",
					Abteilung: "Vertrieb",
					Gehalt: 4200,
					Eintritt: "2019-11-22",
				},
				{
					ID: 4,
					Name: "David Klein",
					Abteilung: "HR",
					Gehalt: 3900,
					Eintritt: "2022-01-10",
				},
				{
					ID: 5,
					Name: "Eva Müller",
					Abteilung: "IT",
					Gehalt: 6200,
					Eintritt: "2018-05-04",
				},
				{
					ID: 6,
					Name: "Felix Roth",
					Abteilung: "Vertrieb",
					Gehalt: 5100,
					Eintritt: "2020-09-12",
				},
				{
					ID: 7,
					Name: "Greta Hoffmann",
					Abteilung: "Marketing",
					Gehalt: 4700,
					Eintritt: "2023-02-20",
				},
				{
					ID: 8,
					Name: "Hannes Schulz",
					Abteilung: "HR",
					Gehalt: 4400,
					Eintritt: "2017-08-18",
				},
				{
					ID: 9,
					Name: "Ida Krüger",
					Abteilung: "Marketing",
					Gehalt: 5300,
					Eintritt: "2021-04-30",
				},
				{
					ID: 10,
					Name: "Jonas Wagner",
					Abteilung: "IT",
					Gehalt: 5800,
					Eintritt: "2019-06-25",
				},
			],
		},
		Abteilungen: {
			columns: [
				{ name: "AbtID", type: "INT", pk: true },
				{ name: "Name", type: "VARCHAR" },
				{ name: "Standort", type: "VARCHAR" },
			],
			rows: [
				{ AbtID: 1, Name: "IT", Standort: "Berlin" },
				{ AbtID: 2, Name: "Vertrieb", Standort: "Hamburg" },
				{ AbtID: 3, Name: "HR", Standort: "Berlin" },
				{ AbtID: 4, Name: "Marketing", Standort: "München" },
			],
		},
	};

	let db = clone(INITIAL_DB);
	let txBackup = null;

	function clone(x) {
		return JSON.parse(JSON.stringify(x));
	}
	function reset() {
		db = clone(INITIAL_DB);
		txBackup = null;
	}
	function snapshot() {
		return clone(db);
	}

	/* ===========================================================
	 *  Hilfsfunktionen – Lexer / Normalisierung
	 * =========================================================== */
	function stripLineComments(q) {
		// Nur Zeilenkommentare (-- ...) entfernen, String-Literale unangetastet lassen
		return q.replace(/--[^\n]*/g, "");
	}

	function tokenize(q) {
		const norm = stripLineComments(q).trim();
		if (!norm) return [];
		// Klammern, Kommas, Punkte als eigene Tokens; Strings in single/double quotes als Ganzes
		const re =
			/\s*([(),*;]|<>|!=|<=|>=|=|<|>|'[^']*'|"[^"]*"|[A-Za-z_ÄÖÜäöüß][A-Za-z0-9_ÄÖÜäöüß]*|-?\d+(?:\.\d+)?)/g;
		const out = [];
		let m;
		while ((m = re.exec(norm)) !== null) {
			out.push(m[1]);
		}
		return out;
	}

	function isAgg(name) {
		const u = name.toUpperCase();
		return (
			u === "COUNT" || u === "SUM" || u === "AVG" || u === "MIN" || u === "MAX"
		);
	}

	function unquote(s) {
		if (s == null) return s;
		if (
			(s.startsWith("'") && s.endsWith("'")) ||
			(s.startsWith('"') && s.endsWith('"'))
		) {
			return s.substring(1, s.length - 1);
		}
		return s;
	}

	function toNum(s) {
		if (typeof s === "number") return s;
		const n = parseFloat(s);
		return isNaN(n) ? null : n;
	}

	/* ===========================================================
	 *  WHERE-Ausdruck (sehr einfach rekursiv-descent)
	 * =========================================================== */
	function evalWhere(tokens, start, row) {
		let i = start;
		function peek() {
			return tokens[i];
		}
		function eat(t) {
			const x = peek();
			if (x && x.toUpperCase() === t.toUpperCase()) {
				i++;
				return true;
			}
			return false;
		}

		function parseOr() {
			let left = parseAnd();
			while (peek() && peek().toUpperCase() === "OR") {
				i++;
				const right = parseAnd();
				left = left || right;
			}
			return left;
		}
		function parseAnd() {
			let left = parseAtom();
			while (peek() && peek().toUpperCase() === "AND") {
				i++;
				const right = parseAtom();
				left = left && right;
			}
			return left;
		}
		function parseAtom() {
			// Klammer-Ausdruck
			if (eat("(")) {
				const v = parseOr();
				eat(")");
				return v;
			}
			// NOT col IS NULL  | col IS NOT NULL
			const a = peek();
			const b = tokens[i + 1];
			if (a && a.toUpperCase() === "NOT" && b && b.toUpperCase() === "IS") {
				i += 2; // NOT IS
				return !evalIsNull(row, tokens[i++]);
			}
			// col IS [NOT] NULL
			if (a && b && b.toUpperCase() === "IS") {
				const colTok = a;
				i += 2;
				const notKw = peek() && peek().toUpperCase() === "NOT";
				if (notKw) i++;
				const nullKw = peek() && peek().toUpperCase() === "NULL";
				if (nullKw) i++;
				const isNull = row[colTok] == null;
				return notKw ? !isNull : isNull;
			}
			if (!a) return true;
			// Operator-Vergleich
			if (
				b &&
				(b === "=" ||
					b === "<>" ||
					b === "!=" ||
					b === "<" ||
					b === "<=" ||
					b === ">" ||
					b === ">=")
			) {
				const col = a;
				const op = b;
				i += 2;
				const valTok = peek();
				i++;
				return compare(row[col], op, unquote(valTok));
			}
			// NOT IN (...)
			if (a && a.toUpperCase() === "NOT" && b && b.toUpperCase() === "IN") {
				i += 2; // NOT IN
				if (!eat("(")) return true;
				const vals = [];
				while (i < tokens.length && peek() !== ")") {
					if (peek() === ",") {
						i++;
						continue;
					}
					vals.push(unquote(peek()));
					i++;
				}
				if (peek() === ")") i++;
				const target = row[tokens[i]];
				return !vals.includes(String(target));
			}
			// col IN (...)
			if (b && b.toUpperCase() === "IN") {
				const col = a;
				i += 2;
				if (!eat("(")) return true;
				const vals = [];
				while (i < tokens.length && peek() !== ")") {
					if (peek() === ",") {
						i++;
						continue;
					}
					vals.push(unquote(peek()));
					i++;
				}
				if (peek() === ")") i++;
				return vals.includes(String(row[col]));
			}
			// BETWEEN a AND b
			if (b && b.toUpperCase() === "BETWEEN") {
				const col = a;
				i += 2; // col BETWEEN
				const low = unquote(peek());
				i++;
				if (peek() && peek().toUpperCase() === "AND") i++;
				const high = unquote(peek());
				i++;
				const v = row[col];
				const n = toNum(v),
					lo = toNum(low),
					hi = toNum(high);
				if (n != null && lo != null && hi != null) return n >= lo && n <= hi;
				return String(v) >= String(low) && String(v) <= String(high);
			}
			// LIKE 'pattern' (sehr einfach: % -> .*, _ -> .)
			if (b && b.toUpperCase() === "LIKE") {
				const col = a;
				i += 2;
				const pattern = unquote(peek());
				i++;
				const rx =
					"^" +
					pattern
						.replace(/[.+^${}()|[\]\\]/g, "\\$&")
						.replace(/%/g, ".*")
						.replace(/_/g, ".") +
					"$";
				try {
					return new RegExp(rx, "i").test(String(row[col]));
				} catch (e) {
					return false;
				}
			}
			// Nur Spaltenname als truthy
			if (/^[A-Za-z_ÄÖÜäöüß]/.test(a)) {
				i++;
				return !!row[a];
			}
			i++;
			return true;
		}

		function evalIsNull(row, tok) {
			if (!tok) return false;
			return row[tok] == null;
		}

		const result = parseOr();
		return { value: result, next: i };
	}

	function compare(a, op, b) {
		if (op === "=") return String(a) === String(b);
		if (op === "<>" || op === "!=") return String(a) !== String(b);
		const an = toNum(a),
			bn = toNum(b);
		if (an != null && bn != null) {
			if (op === "<") return an < bn;
			if (op === "<=") return an <= bn;
			if (op === ">") return an > bn;
			if (op === ">=") return an >= bn;
		}
		// fallback string
		const A = String(a),
			B = String(b);
		if (op === "<") return A < B;
		if (op === "<=") return A <= B;
		if (op === ">") return A > B;
		if (op === ">=") return A >= B;
		return false;
	}

	/* ===========================================================
	 *  SELECT-Parser
	 * =========================================================== */
	function runSelect(q) {
		const tokens = tokenize(q);
		if (!tokens.length) return { error: "Leere Abfrage" };
		if (tokens[0].toUpperCase() !== "SELECT")
			return { error: "Erwartete SELECT" };
		let i = 1;

		// DISTINCT?
		let distinct = false;
		if (tokens[i] && tokens[i].toUpperCase() === "DISTINCT") {
			distinct = true;
			i++;
		}

		// Spaltenliste bis FROM
		const selectCols = [];
		while (i < tokens.length && tokens[i].toUpperCase() !== "FROM") {
			const t = tokens[i];
			if (t === ",") {
				i++;
				continue;
			}
			// Aggregationsfunktion oder *
			if (t === "*") {
				selectCols.push({ kind: "star" });
				i++;
				continue;
			}
			if (isAgg(t) && tokens[i + 1] === "(") {
				const fn = t.toUpperCase();
				i += 2; // FN (
				const inner = [];
				while (i < tokens.length && tokens[i] !== ")") {
					inner.push(tokens[i]);
					i++;
				}
				i++; // )
				const arg = inner.join(" ").trim();
				selectCols.push({ kind: "agg", fn, arg });
				continue;
			}
			// Spaltenname (mit optionalem AS alias)
			const colName = t;
			i++;
			if (tokens[i] && tokens[i].toUpperCase() === "AS") {
				i++;
				selectCols.push({ kind: "col", col: colName, alias: tokens[i] });
				i++;
			} else {
				selectCols.push({ kind: "col", col: colName, alias: null });
			}
		}
		if (tokens[i] && tokens[i].toUpperCase() === "FROM") i++;

		// Tabellenname (nur eine, ohne JOIN für AP1)
		if (!tokens[i]) return { error: "Erwartete Tabellenname nach FROM" };
		const tableName = tokens[i];
		if (!db[tableName])
			return { error: `Tabelle '${tableName}' existiert nicht` };
		i++;

		const table = db[tableName];

		// WHERE
		let rows = table.rows.slice();
		if (tokens[i] && tokens[i].toUpperCase() === "WHERE") {
			i++;
			const sub = tokens.slice(i);
			const filtered = [];
			for (const row of rows) {
				const r = evalWhere(sub, 0, row);
				if (r.value) filtered.push(row);
			}
			rows = filtered;
		}

		// GROUP BY + HAVING (vor ORDER BY/LIMIT, damit Reihenfolge sauber bleibt)
		let groupCols = null;
		if (tokens[i] && tokens[i].toUpperCase() === "GROUP") {
			i++;
			if (tokens[i] && tokens[i].toUpperCase() === "BY") i++;
			groupCols = [];
			while (
				i < tokens.length &&
				tokens[i] !== ";" &&
				!["ORDER", "LIMIT", "HAVING"].includes(tokens[i].toUpperCase())
			) {
				if (tokens[i] !== ",") groupCols.push(tokens[i]);
				i++;
			}
		}
		let havingTokens = null;
		if (tokens[i] && tokens[i].toUpperCase() === "HAVING") {
			i++;
			const start = i;
			while (
				i < tokens.length &&
				tokens[i] !== ";" &&
				tokens[i].toUpperCase() !== "ORDER" &&
				tokens[i].toUpperCase() !== "LIMIT"
			)
				i++;
			havingTokens = tokens.slice(start, i);
		}

		// ORDER BY (mit mehreren Spalten)
		if (tokens[i] && tokens[i].toUpperCase() === "ORDER") {
			i++;
			if (tokens[i] && tokens[i].toUpperCase() === "BY") i++;
			const sortKeys = [];
			while (
				i < tokens.length &&
				tokens[i] !== ";" &&
				tokens[i].toUpperCase() !== "LIMIT"
			) {
				const col = tokens[i];
				i++;
				let dir = 1;
				if (
					tokens[i] &&
					(tokens[i].toUpperCase() === "DESC" ||
						tokens[i].toUpperCase() === "ASC")
				) {
					dir = tokens[i].toUpperCase() === "DESC" ? -1 : 1;
					i++;
				}
				if (tokens[i] === ",") i++;
				sortKeys.push({ col, dir });
			}
			rows.sort((a, b) => {
				for (const { col, dir } of sortKeys) {
					const av = a[col],
						bv = b[col];
					if (av == null && bv == null) continue;
					if (av == null) return 1;
					if (bv == null) return -1;
					if (typeof av === "number" && typeof bv === "number") {
						const d = (av - bv) * dir;
						if (d !== 0) return d;
					} else {
						const d = String(av).localeCompare(String(bv)) * dir;
						if (d !== 0) return d;
					}
				}
				return 0;
			});
		}

		// LIMIT
		if (tokens[i] && tokens[i].toUpperCase() === "LIMIT") {
			i++;
			const n = parseInt(tokens[i], 10);
			if (!isNaN(n)) rows = rows.slice(0, n);
		}

		// Aggregationen vs. normale Spalten
		const hasAgg = selectCols.some((c) => c.kind === "agg");
		let outColumns = [];
		let outRows = [];

		if (hasAgg || groupCols) {
			if (groupCols) {
				// Gruppieren
				const groups = new Map();
				for (const row of rows) {
					const key = groupCols.map((c) => String(row[c])).join("|");
					if (!groups.has(key)) groups.set(key, []);
					groups.get(key).push(row);
				}
				const out = [];
				for (const [, groupRows] of groups) {
					// HAVING-Filter
					if (havingTokens) {
						// HAVING bezieht sich auf eine (fiktive) aggregierte Repräsentation
						const sample = Object.assign({}, groupRows[0]);
						for (const sel of selectCols) {
							if (sel.kind === "agg")
								sample[sel.alias || sel.fn + "(" + (sel.arg || "*") + ")"] =
									computeAgg(sel, groupRows);
						}
						const r = evalWhere(havingTokens, 0, sample);
						if (!r.value) continue;
					}
					const projected = {};
					for (const sel of selectCols) {
						if (sel.kind === "star") Object.assign(projected, groupRows[0]);
						else if (sel.kind === "col")
							projected[sel.alias || sel.col] = groupRows[0][sel.col];
						else if (sel.kind === "agg")
							projected[sel.alias || sel.fn + "(" + (sel.arg || "*") + ")"] =
								computeAgg(sel, groupRows);
					}
					out.push(projected);
				}
				outRows = out;
				outColumns = selectCols.map(
					(c) =>
						c.alias ||
						(c.kind === "agg" ? c.fn + "(" + (c.arg || "*") + ")" : c.col),
				);
				if (selectCols.length === 1 && selectCols[0].kind === "star") {
					outColumns = table.columns.map((c) => c.name);
				}
			} else {
				const aggRow = {};
				for (const sel of selectCols) {
					if (sel.kind !== "agg") {
						return {
							error: `Gemischte Spalten/AGG nicht erlaubt: '${sel.col}'`,
						};
					}
					const val = computeAgg(sel, rows);
					const label = sel.alias || sel.fn + "(" + (sel.arg || "*") + ")";
					aggRow[label] = val;
					outColumns.push(label);
				}
				outRows.push(aggRow);
			}
		} else {
			// Projektion
			outColumns = selectCols.map((c) => c.alias || c.col);
			const projFns = selectCols.map((c) => {
				if (c.kind === "star") return (row) => Object.assign({}, row);
				return (row) => ({ [c.alias || c.col]: row[c.col] });
			});
			const projected = [];
			for (const r of rows) {
				const merged = {};
				for (const fn of projFns) Object.assign(merged, fn(r));
				projected.push(merged);
			}
			outRows = projected;
			// Falls SELECT * dann originalspaltennamen
			if (selectCols.length === 1 && selectCols[0].kind === "star") {
				outColumns = table.columns.map((c) => c.name);
			}
		}

		if (distinct) {
			const seen = new Set();
			const uniq = [];
			for (const r of outRows) {
				const key = outColumns.map((c) => String(r[c])).join("|");
				if (!seen.has(key)) {
					seen.add(key);
					uniq.push(r);
				}
			}
			outRows = uniq;
		}

		return { type: "select", columns: outColumns, rows: outRows };
	}

	function computeAgg(sel, rows) {
		const fn = sel.fn,
			arg = sel.arg;
		if (fn === "COUNT") {
			if (!arg || arg === "*") return rows.length;
			return rows.filter((r) => r[arg] != null).length;
		}
		const nums = rows.map((r) => toNum(r[arg])).filter((v) => v != null);
		if (!nums.length) return null;
		if (fn === "SUM") return nums.reduce((a, b) => a + b, 0);
		if (fn === "AVG") return nums.reduce((a, b) => a + b, 0) / nums.length;
		if (fn === "MIN") return Math.min(...nums);
		if (fn === "MAX") return Math.max(...nums);
		return null;
	}

	/* ===========================================================
	 *  DDL – CREATE TABLE
	 * =========================================================== */
	function runCreate(q) {
		const tokens = tokenize(q);
		if (
			tokens[0].toUpperCase() !== "CREATE" ||
			tokens[1].toUpperCase() !== "TABLE"
		)
			return { error: "Erwartete CREATE TABLE" };
		const name = tokens[2];
		let i = 3;
		if (tokens[i] !== "(") return { error: "Erwartete '(' nach Tabellenname" };
		i++;
		const cols = [];
		let cur = "";
		while (i < tokens.length && tokens[i] !== ")") {
			cur += (cur ? " " : "") + tokens[i];
			i++;
			if (tokens[i] === "," || tokens[i] === ")") {
				const trimmed = cur.trim();
				const m = trimmed.match(
					/^([A-Za-z_ÄÖÜäöüß]+)\s+([A-Za-z]+)(\s+PRIMARY\s+KEY)?$/i,
				);
				if (m) {
					cols.push({ name: m[1], type: m[2].toUpperCase(), pk: !!m[3] });
				}
				if (tokens[i] === ",") i++;
				cur = "";
			}
		}
		db[name] = { columns: cols, rows: [] };
		return {
			type: "ddl",
			message: `Tabelle '${name}' angelegt (${cols.length} Spalten).`,
		};
	}

	/* ===========================================================
	 *  DDL – ALTER TABLE ... ADD COLUMN
	 * =========================================================== */
	function runAlter(q) {
		const tokens = tokenize(q);
		if (
			tokens[0].toUpperCase() !== "ALTER" ||
			tokens[1].toUpperCase() !== "TABLE"
		)
			return { error: "Erwartete ALTER TABLE" };
		const name = tokens[2];
		if (!db[name]) return { error: `Tabelle '${name}' existiert nicht` };
		if (tokens[3].toUpperCase() !== "ADD")
			return { error: "Erwartete ADD COLUMN" };
		if (tokens[4].toUpperCase() !== "COLUMN")
			return { error: "Erwartete COLUMN" };
		const colName = tokens[5];
		const colType = (tokens[6] || "VARCHAR").toUpperCase();
		db[name].columns.push({ name: colName, type: colType });
		return {
			type: "ddl",
			message: `Spalte '${colName}' zu '${name}' hinzugefügt.`,
		};
	}

	/* ===========================================================
	 *  DML – INSERT
	 * =========================================================== */
	function runInsert(q) {
		const tokens = tokenize(q);
		if (
			tokens[0].toUpperCase() !== "INSERT" ||
			tokens[1].toUpperCase() !== "INTO"
		)
			return { error: "Erwartete INSERT INTO" };
		const name = tokens[2];
		if (!db[name]) return { error: `Tabelle '${name}' existiert nicht` };
		let i = 3;
		let cols = null;
		if (tokens[i] === "(") {
			i++;
			cols = [];
			while (i < tokens.length && tokens[i] !== ")") {
				if (tokens[i] !== ",") cols.push(tokens[i]);
				i++;
			}
			i++; // )
		}
		if (tokens[i].toUpperCase() !== "VALUES")
			return { error: "Erwartete VALUES" };
		i++;
		if (tokens[i] !== "(") return { error: "Erwartete (' nach VALUES" };
		i++;
		const vals = [];
		let cur = "";
		while (i < tokens.length && tokens[i] !== ")") {
			if (tokens[i] === ",") {
				vals.push(unquote(cur.trim()));
				cur = "";
				i++;
				continue;
			}
			cur += (cur ? " " : "") + tokens[i];
			i++;
		}
		vals.push(unquote(cur.trim()));
		const row = {};
		if (!cols) {
			cols = db[name].columns.map((c) => c.name);
		}
		for (let j = 0; j < cols.length; j++) {
			row[cols[j]] =
				toNum(vals[j]) != null && /^-?\d+(\.\d+)?$/.test(vals[j])
					? toNum(vals[j])
					: vals[j];
		}
		db[name].rows.push(row);
		return {
			type: "dml",
			message: `1 Zeile in '${name}' eingefügt.`,
			rows: db[name].rows.length,
		};
	}

	/* ===========================================================
	 *  DML – UPDATE
	 * =========================================================== */
	function runUpdate(q) {
		const tokens = tokenize(q);
		if (tokens[0].toUpperCase() !== "UPDATE")
			return { error: "Erwartete UPDATE" };
		const name = tokens[1];
		if (!db[name]) return { error: `Tabelle '${name}' existiert nicht` };
		let i = 2;
		if (tokens[i].toUpperCase() !== "SET") return { error: "Erwartete SET" };
		i++;
		const sets = {};
		while (i < tokens.length && tokens[i].toUpperCase() !== "WHERE") {
			const col = tokens[i];
			const op = tokens[i + 1];
			const val = tokens[i + 2];
			i += 3;
			if (tokens[i] === ",") i++;
			sets[col] =
				op === "="
					? toNum(val) != null && /^-?\d+(\.\d+)?$/.test(val)
						? toNum(val)
						: unquote(val)
					: val;
		}
		let affected = 0;
		for (const row of db[name].rows) {
			let match = true;
			if (tokens[i] && tokens[i].toUpperCase() === "WHERE") {
				i++;
				const r = evalWhere(tokens.slice(i), 0, row);
				match = r.value;
			}
			if (match) {
				Object.assign(row, sets);
				affected++;
			}
		}
		return {
			type: "dml",
			message: `${affected} Zeile(n) aktualisiert.`,
			rows: affected,
		};
	}

	/* ===========================================================
	 *  DML – DELETE
	 * =========================================================== */
	function runDelete(q) {
		const tokens = tokenize(q);
		if (
			tokens[0].toUpperCase() !== "DELETE" ||
			tokens[1].toUpperCase() !== "FROM"
		)
			return { error: "Erwartete DELETE FROM" };
		const name = tokens[2];
		if (!db[name]) return { error: `Tabelle '${name}' existiert nicht` };
		let i = 3;
		const before = db[name].rows.length;
		if (tokens[i] && tokens[i].toUpperCase() === "WHERE") {
			i++;
			db[name].rows = db[name].rows.filter((row) => {
				const r = evalWhere(tokens.slice(i), 0, row);
				return !r.value;
			});
		} else {
			db[name].rows = [];
		}
		return {
			type: "dml",
			message: `${before - db[name].rows.length} Zeile(n) gelöscht.`,
			rows: before - db[name].rows.length,
		};
	}

	/* ===========================================================
	 *  Öffentliche API
	 * =========================================================== */
	function execute(q) {
		if (!q || !q.trim()) return { error: "Leere Abfrage" };
		const upper = q.trim().toUpperCase();
		if (upper === "COMMIT") {
			txBackup = null;
			return { type: "tx", message: "Transaktion committed." };
		}
		if (upper === "ROLLBACK") {
			if (txBackup) db = txBackup;
			txBackup = null;
			return { type: "tx", message: "Transaktion zurückgerollt." };
		}
		if (
			upper === "BEGIN" ||
			upper === "BEGIN TRANSACTION" ||
			upper === "START TRANSACTION"
		) {
			txBackup = clone(db);
			return { type: "tx", message: "Transaktion gestartet." };
		}
		return runDispatch(q);
	}
	function runDispatch(q) {
		const u = q.trim().toUpperCase();
		if (u.startsWith("SELECT")) return runSelect(q);
		if (u.startsWith("CREATE TABLE")) return runCreate(q);
		if (u.startsWith("ALTER TABLE")) return runAlter(q);
		if (u.startsWith("INSERT")) return runInsert(q);
		if (u.startsWith("UPDATE")) return runUpdate(q);
		if (u.startsWith("DELETE")) return runDelete(q);
		return { error: "Nicht unterstützter Befehl: " + q.split(/\s+/)[0] };
	}

	/* ===========================================================
	 *  Tasks
	 * =========================================================== */
	const TASKS = [
		{
			id: 1,
			level: "Stufe 1",
			title: "Alle Mitarbeiter anzeigen",
			prompt: "Zeige alle Spalten aller Mitarbeiter an.",
			hint: "SELECT * FROM Mitarbeiter;",
			solution: "SELECT * FROM Mitarbeiter;",
			verify: (res) =>
				res.type === "select" &&
				res.rows.length === 10 &&
				res.columns.includes("Name"),
		},
		{
			id: 2,
			level: "Stufe 1",
			title: "Nur Name und Abteilung",
			prompt: "Liste Name und Abteilung aller Mitarbeiter auf.",
			hint: "SELECT Name, Abteilung FROM Mitarbeiter;",
			solution: "SELECT Name, Abteilung FROM Mitarbeiter;",
			verify: (res) =>
				res.type === "select" &&
				res.columns.length === 2 &&
				res.columns.includes("Name") &&
				res.columns.includes("Abteilung") &&
				res.rows.length === 10,
		},
		{
			id: 3,
			level: "Stufe 1",
			title: "Mitarbeiter der IT filtern",
			prompt: "Welche Mitarbeiter arbeiten in der IT? Zeige Name und Gehalt.",
			hint: "SELECT Name, Gehalt FROM Mitarbeiter WHERE Abteilung = 'IT';",
			solution: "SELECT Name, Gehalt FROM Mitarbeiter WHERE Abteilung = 'IT';",
			verify: (res) =>
				res.type === "select" &&
				res.rows.length === 4 &&
				res.rows.every((r) => r["Gehalt"] != null && r["Name"] != null),
		},
		{
			id: 4,
			level: "Stufe 1",
			title: "Nach Gehalt absteigend sortieren",
			prompt:
				"Sortiere alle Mitarbeiter nach Gehalt absteigend. Zeige Name und Gehalt.",
			hint: "SELECT Name, Gehalt FROM Mitarbeiter ORDER BY Gehalt DESC;",
			solution: "SELECT Name, Gehalt FROM Mitarbeiter ORDER BY Gehalt DESC;",
			verify: (res) =>
				res.type === "select" &&
				res.rows.length === 10 &&
				res.rows[0]["Gehalt"] >= res.rows[res.rows.length - 1]["Gehalt"],
		},
		{
			id: 5,
			level: "Stufe 1",
			title: "Top 3 nach Gehalt",
			prompt: "Zeige die 3 bestbezahlten Mitarbeiter mit Name und Gehalt.",
			hint: "SELECT Name, Gehalt FROM Mitarbeiter ORDER BY Gehalt DESC LIMIT 3;",
			solution:
				"SELECT Name, Gehalt FROM Mitarbeiter ORDER BY Gehalt DESC LIMIT 3;",
			verify: (res) =>
				res.type === "select" &&
				res.rows.length === 3 &&
				res.rows[0]["Gehalt"] === 6200,
		},
		{
			id: 6,
			level: "Stufe 1",
			title: "Eindeutige Abteilungen",
			prompt: "Welche unterschiedlichen Abteilungen gibt es? (DISTINCT)",
			hint: "SELECT DISTINCT Abteilung FROM Mitarbeiter;",
			solution: "SELECT DISTINCT Abteilung FROM Mitarbeiter;",
			verify: (res) => res.type === "select" && res.rows.length === 4,
		},
		{
			id: 7,
			level: "Stufe 1",
			title: "Anzahl Mitarbeiter pro Abteilung",
			prompt: "Wie viele Mitarbeiter hat jede Abteilung?",
			hint: "SELECT Abteilung, COUNT(*) FROM Mitarbeiter GROUP BY Abteilung;",
			solution:
				"SELECT Abteilung, COUNT(*) FROM Mitarbeiter GROUP BY Abteilung;",
			verify: (res) =>
				res.type === "select" &&
				res.rows.length === 4 &&
				res.rows.some((r) => r["Abteilung"] === "IT" && r["COUNT(*)"] === 4),
		},
		{
			id: 8,
			level: "Stufe 1",
			title: "Durchschnittsgehalt IT",
			prompt: "Wie hoch ist das Durchschnittsgehalt der IT-Abteilung?",
			hint: "SELECT AVG(Gehalt) FROM Mitarbeiter WHERE Abteilung = 'IT';",
			solution: "SELECT AVG(Gehalt) FROM Mitarbeiter WHERE Abteilung = 'IT';",
			verify: (res) =>
				res.type === "select" &&
				Math.abs(res.rows[0]["AVG(Gehalt)"] - 5575) < 1,
		},
		{
			id: 9,
			level: "Stufe 1",
			title: "Gesamtgehaltssumme aller Mitarbeiter",
			prompt: "Wie viel Gehalt wird insgesamt ausgezahlt?",
			hint: "SELECT SUM(Gehalt) FROM Mitarbeiter;",
			solution: "SELECT SUM(Gehalt) FROM Mitarbeiter;",
			verify: (res) =>
				res.type === "select" && res.rows[0]["SUM(Gehalt)"] === 49900,
		},
		{
			id: 10,
			level: "Stufe 1",
			title: "Gehaltsbereich",
			prompt: "Wie hoch sind das niedrigste und höchste Gehalt?",
			hint: "SELECT MIN(Gehalt), MAX(Gehalt) FROM Mitarbeiter;",
			solution: "SELECT MIN(Gehalt), MAX(Gehalt) FROM Mitarbeiter;",
			verify: (res) =>
				res.type === "select" &&
				res.rows[0]["MIN(Gehalt)"] === 3900 &&
				res.rows[0]["MAX(Gehalt)"] === 6200,
		},
		{
			id: 11,
			level: "Stufe 1",
			title: "WHERE mit AND",
			prompt: "Zeige alle Mitarbeiter der IT-Abteilung mit Gehalt über 5500.",
			hint: "SELECT Name, Gehalt FROM Mitarbeiter WHERE Abteilung = 'IT' AND Gehalt > 5500;",
			solution:
				"SELECT Name, Gehalt FROM Mitarbeiter WHERE Abteilung = 'IT' AND Gehalt > 5500;",
			verify: (res) => res.type === "select" && res.rows.length === 2,
		},
		{
			id: 12,
			level: "Stufe 1",
			title: "WHERE mit OR",
			prompt: "Wer hat ein Gehalt über 6000 oder arbeitet in der HR-Abteilung?",
			hint: "SELECT Name, Gehalt, Abteilung FROM Mitarbeiter WHERE Gehalt > 6000 OR Abteilung = 'HR';",
			solution:
				"SELECT Name, Gehalt, Abteilung FROM Mitarbeiter WHERE Gehalt > 6000 OR Abteilung = 'HR';",
			verify: (res) => res.type === "select" && res.rows.length === 3,
		},
		{
			id: 13,
			level: "Stufe 1",
			title: "IN-Operator",
			prompt: "Zeige alle Mitarbeiter aus den Abteilungen IT oder Vertrieb.",
			hint: "SELECT Name, Abteilung FROM Mitarbeiter WHERE Abteilung IN ('IT', 'Vertrieb');",
			solution:
				"SELECT Name, Abteilung FROM Mitarbeiter WHERE Abteilung IN ('IT', 'Vertrieb');",
			verify: (res) => res.type === "select" && res.rows.length === 6,
		},
		{
			id: 14,
			level: "Stufe 1",
			title: "BETWEEN",
			prompt:
				"Welche Mitarbeiter haben ein Gehalt zwischen 4500 und 5500 (inklusive)?",
			hint: "SELECT Name, Gehalt FROM Mitarbeiter WHERE Gehalt BETWEEN 4500 AND 5500;",
			solution:
				"SELECT Name, Gehalt FROM Mitarbeiter WHERE Gehalt BETWEEN 4500 AND 5500;",
			verify: (res) => res.type === "select" && res.rows.length === 5,
		},
		{
			id: 15,
			level: "Stufe 1",
			title: "LIKE – Namenssuche",
			prompt: "Finde alle Mitarbeiter, deren Name mit 'A' beginnt.",
			hint: "SELECT Name FROM Mitarbeiter WHERE Name LIKE 'A%';",
			solution: "SELECT Name FROM Mitarbeiter WHERE Name LIKE 'A%';",
			verify: (res) =>
				res.type === "select" &&
				res.rows.length === 1 &&
				res.rows[0].Name.startsWith("Anna"),
		},
		{
			id: 16,
			level: "Stufe 1",
			title: "Sortieren mit zwei Spalten",
			prompt:
				"Sortiere Mitarbeiter zuerst nach Abteilung (ABC), dann nach Gehalt absteigend.",
			hint: "SELECT Name, Abteilung, Gehalt FROM Mitarbeiter ORDER BY Abteilung ASC, Gehalt DESC;",
			solution:
				"SELECT Name, Abteilung, Gehalt FROM Mitarbeiter ORDER BY Abteilung ASC, Gehalt DESC;",
			verify: (res) => {
				if (res.type !== "select") return false;
				const r = res.rows;
				if (r.length !== 10) return false;
				// Erste 4 Zeilen sollten HR sein (aufsteigend nach Abt), innerhalbdessen Gehalt DESC
				const grp = r.filter((x) => x.Abteilung === "HR").map((x) => x.Gehalt);
				return grp[0] >= grp[grp.length - 1];
			},
		},
	];

	/* ===========================================================
	 *  UI / Rendering
	 * =========================================================== */
	function renderSchema() {
		const target = document.getElementById("schemaExplorer");
		if (!target) return;
		target.innerHTML = Object.entries(db)
			.map(([tname, t]) => {
				const cols = t.columns
					.map((c) => {
						const flags = [];
						if (c.pk) flags.push("PK");
						return `<div class="flex items-center justify-between py-1 px-2 rounded hover:bg-dark-bg/60">
          <span class="font-mono text-xs text-slate-300">${c.name}</span>
          <span class="flex items-center gap-1">
            <span class="text-[10px] text-dark-muted">${c.type}</span>
            ${flags.map((f) => `<span class="text-[9px] bg-dark-accent/15 text-dark-accent px-1 rounded">${f}</span>`).join("")}
          </span>
        </div>`;
					})
					.join("");
				const rows = `<div class="text-[10px] text-dark-muted mt-2">${t.rows.length} Zeilen</div>`;
				return `<div class="bg-dark-card border border-dark-border rounded-xl p-3">
        <div class="flex items-center gap-2 mb-2">
          <i data-lucide="table-2" class="w-4 h-4 text-dark-accent"></i>
          <span class="font-bold text-white text-sm font-mono">${tname}</span>
        </div>
        <div class="space-y-0.5">${cols}</div>
        ${rows}
      </div>`;
			})
			.join("");
		if (window.lucide) lucide.createIcons();
	}

	function renderResult(res) {
		const out = document.getElementById("resultTable");
		if (!out) return;
		if (res.error) {
			out.innerHTML = `<div class="text-red-400 font-mono text-xs p-4 bg-red-500/10 border border-red-500/30 rounded-lg">⚠ ${res.error}</div>`;
			return;
		}
		if (res.type === "select") {
			if (!res.rows.length) {
				out.innerHTML = `<div class="text-dark-muted text-xs p-4 bg-dark-card border border-dark-border rounded-lg font-mono">(0 Zeilen)</div>`;
				return;
			}
			const head = res.columns
				.map(
					(c) =>
						`<th class="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-dark-muted font-mono border-b border-dark-border">${c}</th>`,
				)
				.join("");
			const body = res.rows
				.map(
					(r) =>
						`<tr>${res.columns
							.map((c) => {
								const v = r[c];
								return `<td class="px-3 py-1.5 font-mono text-xs text-slate-300 border-b border-dark-border/50">${v == null ? "<span class='text-dark-muted'>NULL</span>" : v}</td>`;
							})
							.join("")}</tr>`,
				)
				.join("");
			out.innerHTML = `
        <div class="overflow-x-auto rounded-lg border border-dark-border">
          <table class="w-full">
            <thead class="bg-dark-bg/80"><tr>${head}</tr></thead>
            <tbody>${body}</tbody>
          </table>
        </div>
        <div class="text-[10px] text-dark-muted mt-2 font-mono">${res.rows.length} Zeile(n) · ${res.columns.length} Spalte(n)</div>`;
			return;
		}
		if (res.type === "dml" || res.type === "ddl" || res.type === "tx") {
			out.innerHTML = `<div class="text-emerald-400 font-mono text-xs p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">✓ ${res.message}</div>`;
			return;
		}
		out.innerHTML = `<pre class="text-xs text-slate-300 font-mono whitespace-pre-wrap">${JSON.stringify(res, null, 2)}</pre>`;
	}

	/* ===========================================================
	 *  Game-Logik
	 * =========================================================== */
	let xp = 0,
		streak = 0;
	let currentTaskIdx = 0;

	function setXp(v) {
		xp = Math.max(0, v);
		document.getElementById("xpBadge").textContent = `${xp} XP`;
	}
	function setStreak(v) {
		streak = Math.max(0, v);
		document.getElementById("streakBadge").textContent = `🔥 ${streak}`;
	}

	function showTask(idx) {
		if (idx < 0 || idx >= TASKS.length) return;
		currentTaskIdx = idx;
		const t = TASKS[idx];
		document.getElementById("taskLevel").textContent = t.level;
		document.getElementById("taskTitle").textContent = t.title;
		document.getElementById("taskPrompt").textContent = t.prompt;
		document.getElementById("taskCounter").textContent =
			`${idx + 1} / ${TASKS.length}`;
		document.getElementById("editor").value = "";
		document.getElementById("resultTable").innerHTML =
			`<div class="text-dark-muted text-xs font-mono p-3">Tipp: SQL hier eingeben und "Ausführen" drücken.</div>`;
		document.getElementById("feedback").innerHTML = "";
		setNextPulse(false);
	}

	function normalize(q) {
		return q.replace(/\s+/g, " ").trim().replace(/;$/, "").trim();
	}

	function checkAnswer() {
		const userQ = normalize(document.getElementById("editor").value);
		if (!userQ) return;
		const t = TASKS[currentTaskIdx];
		let res;
		try {
			res = execute(userQ);
		} catch (e) {
			res = { error: e.message };
		}
		renderResult(res);

		const fb = document.getElementById("feedback");
		const ok = !res.error && t.verify(res);
		if (ok) {
			setXp(xp + 10);
			setStreak(streak + 1);
			const lastTask = currentTaskIdx >= TASKS.length - 1;
			fb.innerHTML = `<div class="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm">
        <div class="text-emerald-400 font-bold mb-1">✓ Richtig! +10 XP</div>
        <div class="text-dark-muted text-xs">Streak: ${streak} in Folge.${lastTask ? " · Alle Aufgaben gelöst!" : ' · Klicke "Weiter" für die nächste Aufgabe.'}</div>
      </div>`;
			if (window.confetti && Math.random() < 0.4) {
				try {
					window.confetti({
						particleCount: 60,
						spread: 70,
						origin: { y: 0.6 },
					});
				} catch (e) {}
			}
			setNextPulse(true);
		} else {
			setStreak(0);
			fb.innerHTML = `<div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm">
        <div class="text-red-400 font-bold mb-1">✗ Noch nicht richtig.</div>
        <div class="text-dark-muted text-xs mb-2">Tipp: <code class="font-mono text-amber-300">${t.hint}</code></div>
        <details class="text-xs text-dark-muted">
          <summary class="cursor-pointer hover:text-white">Lösung anzeigen</summary>
          <pre class="font-mono text-emerald-300 mt-2 whitespace-pre-wrap">${t.solution}</pre>
        </details>
      </div>`;
		}
		renderSchema();
	}

	function setNextPulse(on) {
		const btn = document.getElementById("btnNext");
		if (!btn) return;
		if (on) {
			btn.classList.add("sql-next-pulse");
			btn.innerHTML =
				'<i data-lucide="check" class="w-3 h-3 inline mr-1"></i> Weiter';
		} else {
			btn.classList.remove("sql-next-pulse");
			btn.innerHTML =
				'Weiter <i data-lucide="chevron-right" class="w-3 h-3 inline"></i>';
		}
		if (window.lucide) lucide.createIcons();
	}

	function nextTask() {
		setNextPulse(false);
		if (currentTaskIdx < TASKS.length - 1) showTask(currentTaskIdx + 1);
		else showTask(0);
	}
	function prevTask() {
		setNextPulse(false);
		if (currentTaskIdx > 0) showTask(currentTaskIdx - 1);
	}
	function resetDb() {
		reset();
		renderSchema();
		document.getElementById("resultTable").innerHTML =
			`<div class="text-dark-muted text-xs font-mono p-3">Datenbank zurückgesetzt.</div>`;
		document.getElementById("feedback").innerHTML = "";
	}

	/* ===========================================================
	 *  Bootstrap
	 * =========================================================== */
	function init() {
		reset();
		setXp(0);
		setStreak(0);
		showTask(0);
		renderSchema();

		document.getElementById("btnRun").addEventListener("click", checkAnswer);
		document.getElementById("btnNext").addEventListener("click", nextTask);
		document.getElementById("btnPrev").addEventListener("click", prevTask);
		document.getElementById("btnReset").addEventListener("click", resetDb);
		document.getElementById("editor").addEventListener("keydown", (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
				e.preventDefault();
				checkAnswer();
			}
		});
	}

	// Demo / Self-Check (run via `node assets/js/sql.js` or `?selftest=1`)
	function selfTest() {
		reset();
		const results = [];
		for (const t of TASKS) {
			reset();
			const res = execute(t.solution);
			const ok = !res.error && t.verify(res);
			results.push({ id: t.id, title: t.title, ok, res });
		}
		const pass = results.filter((r) => r.ok).length;
		console.log(`SQL-SelfTest: ${pass}/${results.length} ok`);
		results
			.filter((r) => !r.ok)
			.forEach((r) =>
				console.log(
					"FAIL",
					r.id,
					r.title,
					r.res.error || JSON.stringify(r.res),
				),
			);
		return pass === results.length;
	}
	if (typeof window === "undefined") {
		// Node-SelfTest-Pfad
		module.exports = { execute, selfTest };
	}

	window.SQL = { init, execute, resetDb, selfTest, getDb: snapshot };
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
