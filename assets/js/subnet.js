// Global states
let currentIpv4 = {};
let currentIpv6 = {};
let ipv4Streak = 0;
let ipv6Streak = 0;

// IPv4 Helper Functions
function intToIp(value) {
	return [
		(value >>> 24) & 255,
		(value >>> 16) & 255,
		(value >>> 8) & 255,
		value & 255
	].join('.');
}

function ipToInt(ip) {
	return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function intToBinaryStr(value) {
	return (value >>> 0).toString(2).padStart(32, '0');
}

function formatBinaryWithDot(binStr) {
	return [
		binStr.slice(0, 8),
		binStr.slice(8, 16),
		binStr.slice(16, 24),
		binStr.slice(24, 32)
	].join('.');
}

function generateIPv4() {
	// Clear panel & feedback
	const solutionPanel = document.getElementById("solutionPanel");
	const btnSolution = document.getElementById("btnSolution");
	if (solutionPanel) solutionPanel.classList.add("hidden");
	if (btnSolution) btnSolution.classList.add("hidden");
	clearIPv4Feedback();

	// Generate random subnet sizes
	const prefixes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
	const cidr = prefixes[Math.floor(Math.random() * prefixes.length)];
	
	// Generate random host IP address
	let rawIp = 0;
	if (cidr >= 24) {
		rawIp = ipToInt(`192.168.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`);
	} else if (cidr >= 16) {
		rawIp = ipToInt(`172.${Math.floor(Math.random() * 16) + 16}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`);
	} else {
		rawIp = ipToInt(`${Math.floor(Math.random() * 125) + 10}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`);
	}

	// Calculate Subnet Math
	const maskBinary = ~((1 << (32 - cidr)) - 1) >>> 0;
	const networkBinary = (rawIp & maskBinary) >>> 0;
	const wildcardBinary = ~maskBinary >>> 0;
	const broadcastBinary = (rawIp | wildcardBinary) >>> 0;
	const usableHosts = Math.pow(2, 32 - cidr) - 2;

	currentIpv4 = {
		ip: intToIp(rawIp),
		cidr: cidr,
		mask: intToIp(maskBinary),
		network: intToIp(networkBinary),
		broadcast: intToIp(broadcastBinary),
		firstIp: intToIp(networkBinary + 1),
		lastIp: intToIp(broadcastBinary - 1),
		hosts: usableHosts,
		binary: {
			ip: intToBinaryStr(rawIp),
			mask: intToBinaryStr(maskBinary),
			network: intToBinaryStr(networkBinary)
		}
	};

	const targetEl = document.getElementById("ipv4Target");
	if (targetEl) {
		targetEl.innerText = `${currentIpv4.ip}/${cidr}`;
	}
}

function clearIPv4Feedback() {
	const fields = ["Mask", "Net", "Bcast", "Hosts"];
	fields.forEach(f => {
		const input = document.getElementById("ans" + f);
		const feedback = document.getElementById("feedback" + f);
		if (input) {
			input.value = "";
			input.className = "w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-white focus:border-dark-accent outline-none font-mono";
		}
		if (feedback) {
			feedback.innerText = "";
		}
	});
}

// IPv6 compression logic
function generateIPv6() {
	const solutionPanelIpv6 = document.getElementById("solutionPanelIpv6");
	const ansIpv6 = document.getElementById("ansIpv6");
	const feedbackIpv6 = document.getElementById("feedbackIpv6");
	const ipv6Hint = document.getElementById("ipv6Hint");

	if (solutionPanelIpv6) solutionPanelIpv6.classList.add("hidden");
	if (ipv6Hint) {
		ipv6Hint.classList.add("hidden");
		ipv6Hint.innerText = "";
	}
	if (ansIpv6) {
		ansIpv6.value = "";
		ansIpv6.className = "w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-white focus:border-dark-accent outline-none font-mono";
	}
	if (feedbackIpv6) feedbackIpv6.innerText = "";

	const hextetts = new Array(8).fill(null);
	const mode = Math.random();

	if (mode < 0.50) {
		// Scenario 1: One contiguous sequence of 2-4 zeros
		const len = 2 + Math.floor(Math.random() * 3); // 2, 3, or 4
		const start = Math.floor(Math.random() * (9 - len));
		for (let i = 0; i < len; i++) {
			hextetts[start + i] = "0000";
		}
	} else if (mode < 0.72) {
		// Scenario 2: Two zero sequences (e.g. 2 and 2, or 2 and 3) to practice tie-breaking / longest sequence
		hextetts[1] = "0000";
		hextetts[2] = "0000";
		hextetts[5] = "0000";
		hextetts[6] = "0000";
		if (Math.random() < 0.5) hextetts[7] = "0000"; // 2nd sequence is longer (3 vs 2)
	} else if (mode < 0.88) {
		// Scenario 3: Only isolated single zero blocks (trains RFC 5952 § 4.2.2 rule!)
		const pos1 = Math.floor(Math.random() * 3);
		const pos2 = 4 + Math.floor(Math.random() * 3);
		hextetts[pos1] = "0000";
		hextetts[pos2] = "0000";
	} else {
		// Scenario 4: Boundary patterns (loopback ::1 or network prefix ::)
		if (Math.random() < 0.5) {
			for (let i = 0; i < 7; i++) hextetts[i] = "0000";
			hextetts[7] = "0001";
		} else {
			hextetts[0] = "2001";
			hextetts[1] = "0db8";
			for (let i = 4; i < 8; i++) hextetts[i] = "0000";
		}
	}

	// Fill remaining empty hextets
	for (let i = 0; i < 8; i++) {
		if (hextetts[i] === null) {
			const r = Math.random();
			if (r < 0.35) {
				// Small values with leading zeros (e.g. 0005, 004a)
				const val = Math.floor(1 + Math.random() * 255).toString(16);
				hextetts[i] = val.padStart(4, "0");
			} else {
				hextetts[i] = Math.floor(Math.random() * 65536).toString(16).padStart(4, "0");
			}
		}
	}

	const fullIpv6 = hextetts.join(":");
	currentIpv6 = {
		full: fullIpv6,
		compressed: compressIPv6(fullIpv6)
	};

	const targetEl = document.getElementById("ipv6Target");
	if (targetEl) {
		targetEl.innerText = fullIpv6;
	}
}

function compressIPv6(ip) {
	// 1. Remove leading zeros in blocks
	let blocks = ip.split(':').map(block => {
		let cleaned = block.replace(/^0+/, '');
		return cleaned === '' ? '0' : cleaned;
	});

	// 2. Find longest sequence of '0' blocks
	let maxZeroCount = 0;
	let maxZeroIndex = -1;
	let currentZeroCount = 0;
	let currentZeroIndex = -1;

	for (let i = 0; i < blocks.length; i++) {
		if (blocks[i] === '0') {
			if (currentZeroIndex === -1) {
				currentZeroIndex = i;
			}
			currentZeroCount++;
		} else {
			if (currentZeroCount > maxZeroCount) {
				maxZeroCount = currentZeroCount;
				maxZeroIndex = currentZeroIndex;
			}
			currentZeroCount = 0;
			currentZeroIndex = -1;
		}
	}
	if (currentZeroCount > maxZeroCount) {
		maxZeroCount = currentZeroCount;
		maxZeroIndex = currentZeroIndex;
	}

	// Replace only sequences of length >= 2 with empty string (leads to ::)
	if (maxZeroCount >= 2) {
		blocks.splice(maxZeroIndex, maxZeroCount, '');
		let res = blocks.join(':');
		// Handle cases of double colons on boundaries
		if (res.startsWith(':')) res = ':' + res;
		if (res.endsWith(':')) res = res + ':';
		if (res === '') return '::';
		return res;
	}

	return blocks.join(':');
}

function switchTab(tab) {
	const tabIpv4 = document.getElementById("tab-ipv4");
	const tabIpv6 = document.getElementById("tab-ipv6");
	const btnIpv4 = document.getElementById("btn-ipv4");
	const btnIpv6 = document.getElementById("btn-ipv6");

	const activeClass = "px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-colors bg-blue-600/15 border border-blue-500/40 text-blue-400";
	const inactiveClass = "px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-colors text-dark-muted hover:text-white border border-transparent";

	if (tab === 'ipv4') {
		if (tabIpv4) tabIpv4.classList.remove("hidden");
		if (tabIpv6) tabIpv6.classList.add("hidden");
		if (btnIpv4) btnIpv4.className = activeClass;
		if (btnIpv6) btnIpv6.className = inactiveClass;
		generateIPv4();
	} else {
		if (tabIpv4) tabIpv4.classList.add("hidden");
		if (tabIpv6) tabIpv6.classList.remove("hidden");
		if (btnIpv4) btnIpv4.className = inactiveClass;
		if (btnIpv6) btnIpv6.className = activeClass;
		generateIPv6();
	}
	if (window.lucide) lucide.createIcons();
}

function checkIPv4() {
	const ansMask = document.getElementById("ansMask") ? document.getElementById("ansMask").value.trim() : "";
	const ansNet = document.getElementById("ansNet") ? document.getElementById("ansNet").value.trim() : "";
	const ansBcast = document.getElementById("ansBcast") ? document.getElementById("ansBcast").value.trim() : "";
	const ansHostsVal = document.getElementById("ansHosts") ? document.getElementById("ansHosts").value.trim().replace(/[\.\s]/g, "") : "";

	const isMaskCorrect = ansMask === currentIpv4.mask;
	const isNetCorrect = ansNet === currentIpv4.network;
	const isBcastCorrect = ansBcast === currentIpv4.broadcast;
	const isHostsCorrect = parseInt(ansHostsVal, 10) === currentIpv4.hosts;

	setFieldStatus("Mask", isMaskCorrect);
	setFieldStatus("Net", isNetCorrect);
	setFieldStatus("Bcast", isBcastCorrect);
	setFieldStatus("Hosts", isHostsCorrect);

	const ipv4StreakEl = document.getElementById("ipv4Streak");
	const btnSolutionEl = document.getElementById("btnSolution");

	if (isMaskCorrect && isNetCorrect && isBcastCorrect && isHostsCorrect) {
		ipv4Streak++;
		if (ipv4StreakEl) ipv4StreakEl.innerHTML = `<i data-lucide="flame" class="w-3.5 h-3.5 text-amber-500"></i> ${ipv4Streak}er Streak`;
	} else {
		ipv4Streak = 0;
		if (ipv4StreakEl) ipv4StreakEl.innerHTML = `<i data-lucide="flame" class="w-3.5 h-3.5 text-dark-dim"></i> 0er Streak`;
		if (btnSolutionEl) btnSolutionEl.classList.remove("hidden");
	}
	if (window.lucide) lucide.createIcons();
}

function setFieldStatus(field, isCorrect) {
	const input = document.getElementById("ans" + field);
	const feedback = document.getElementById("feedback" + field);

	if (isCorrect) {
		if (input) input.className = "w-full bg-dark-bg border border-emerald-500/40 rounded-lg px-3.5 py-2.5 text-sm text-emerald-400 focus:border-emerald-400 outline-none font-mono";
		if (feedback) {
			feedback.innerText = "✓";
			feedback.className = "absolute right-3 top-2.5 text-emerald-400 font-bold";
		}
	} else {
		if (input) input.className = "w-full bg-dark-bg border border-red-500/40 rounded-lg px-3.5 py-2.5 text-sm text-red-400 focus:border-red-400 outline-none font-mono";
		if (feedback) {
			feedback.innerText = "✗";
			feedback.className = "absolute right-3 top-2.5 text-red-400 font-bold";
		}
	}
}

function checkIPv6() {
	const ansEl = document.getElementById("ansIpv6");
	const feedbackEl = document.getElementById("feedbackIpv6");
	const ipv6StreakEl = document.getElementById("ipv6Streak");
	const solutionPanelIpv6 = document.getElementById("solutionPanelIpv6");
	const ipv6SolutionText = document.getElementById("ipv6SolutionText");
	const ipv6Hint = document.getElementById("ipv6Hint");

	const ans = ansEl ? ansEl.value.trim().toLowerCase() : "";
	const expected = currentIpv6.compressed.toLowerCase();
	const isCorrect = ans === expected;

	if (isCorrect) {
		if (ansEl) ansEl.className = "w-full bg-dark-bg border border-emerald-500/40 rounded-lg px-3.5 py-2.5 text-sm text-emerald-400 focus:border-emerald-400 outline-none font-mono";
		if (feedbackEl) {
			feedbackEl.innerText = "✓";
			feedbackEl.className = "absolute right-3 top-2.5 text-emerald-400 font-bold";
		}
		if (ipv6Hint) ipv6Hint.classList.add("hidden");
		ipv6Streak++;
		if (ipv6StreakEl) ipv6StreakEl.innerHTML = `<i data-lucide="flame" class="w-3.5 h-3.5 text-amber-500"></i> ${ipv6Streak}er Streak`;
	} else {
		if (ansEl) ansEl.className = "w-full bg-dark-bg border border-red-500/40 rounded-lg px-3.5 py-2.5 text-sm text-red-400 focus:border-red-400 outline-none font-mono";
		if (feedbackEl) {
			feedbackEl.innerText = "✗";
			feedbackEl.className = "absolute right-3 top-2.5 text-red-400 font-bold";
		}
		ipv6Streak = 0;
		if (ipv6StreakEl) ipv6StreakEl.innerHTML = `<i data-lucide="flame" class="w-3.5 h-3.5 text-dark-dim"></i> 0er Streak`;
		if (solutionPanelIpv6) solutionPanelIpv6.classList.remove("hidden");
		if (ipv6SolutionText) ipv6SolutionText.innerText = currentIpv6.compressed;

		// Pedagogical hint based on specific mistake
		if (ipv6Hint) {
			let hintText = "";
			if (ans.includes("::") && !expected.includes("::")) {
				hintText = "💡 IHK-Tipp (RFC 5952 § 4.2.2): Ein einzelner 0-Block darf NICHT durch :: ersetzt werden, sondern bleibt als :0: stehen (keine Zeichenersparnis). :: erfordert mindestens 2 aufeinanderfolgende 0-Blöcke.";
			} else if (ans.split("::").length > 2) {
				hintText = "💡 RFC 5952 Regel: '::' darf in der gesamten IPv6-Adresse nur genau ein einziges Mal vorkommen!";
			} else if (!ans.includes("::") && expected.includes("::")) {
				hintText = "💡 RFC 5952 Regel: Aufeinanderfolgende 0-Blöcke (mind. 2) müssen zwingend mit :: zusammengefasst werden.";
			} else if (ans.includes("::") && expected.includes("::") && ans !== expected) {
				hintText = "💡 RFC 5952 § 4.2.3: Es muss immer die längste Null-Sequenz gekürzt werden (bei Gleichstand die am weitesten links stehende).";
			}
			if (hintText) {
				ipv6Hint.innerText = hintText;
				ipv6Hint.classList.remove("hidden");
			} else {
				ipv6Hint.classList.add("hidden");
			}
		}
	}
	if (window.lucide) lucide.createIcons();
}

function showSolution() {
	const panel = document.getElementById("solutionPanel");
	const content = document.getElementById("solutionContent");

	// Binary visualization step-by-step
	const html = `
		<div>
			<p class="font-bold text-white mb-2">1. Binäre Gegenüberstellung (IP &amp; Maske):</p>
			<div class="bg-dark-bg p-3 rounded-lg border border-dark-border text-xs leading-5">
				IP:   ${currentIpv4.binary.ip ? formatBinaryWithDot(currentIpv4.binary.ip) : ""} (${currentIpv4.ip})<br>
				Mask: ${currentIpv4.binary.mask ? formatBinaryWithDot(currentIpv4.binary.mask) : ""} (${currentIpv4.mask})
			</div>
		</div>
		<div>
			<p class="font-bold text-white mb-2 mt-4">2. Berechnung der Netzadresse (Binäres UND):</p>
			<div class="bg-dark-bg p-3 rounded-lg border border-dark-border text-xs leading-5">
				IP:   ${currentIpv4.binary.ip ? formatBinaryWithDot(currentIpv4.binary.ip) : ""}<br>
				Mask: ${currentIpv4.binary.mask ? formatBinaryWithDot(currentIpv4.binary.mask) : ""}<br>
				<span class="text-dark-success font-bold">NET:  ${currentIpv4.binary.network ? formatBinaryWithDot(currentIpv4.binary.network) : ""} (${currentIpv4.network})</span>
			</div>
		</div>
		<div class="space-y-2 mt-4 text-xs">
			<p><strong class="text-white">Broadcast-Adresse:</strong> Ergibt sich, wenn alle Host-Bits auf 1 gesetzt werden. ➔ <span class="text-white font-bold">${currentIpv4.broadcast}</span></p>
			<p><strong class="text-white">Host-Range:</strong> Erste IP nach Netz-ID (Netz-ID + 1) bis letzte IP vor Broadcast (Broadcast-ID - 1) ➔ <span class="text-white font-bold">${currentIpv4.firstIp} - ${currentIpv4.lastIp}</span></p>
			<p><strong class="text-white">Nutzbare Hostadressen:</strong> 2<sup>(32 - ${currentIpv4.cidr})</sup> - 2 = 2<sup>${32 - currentIpv4.cidr}</sup> - 2 = <span class="text-white font-bold">${currentIpv4.hosts ? currentIpv4.hosts.toLocaleString('de-DE') : ""} Adressen</span>.</p>
		</div>
	`;
	if (content) content.innerHTML = html;
	if (panel) panel.classList.remove("hidden");
}

// Load first task on start
window.onload = () => {
	generateIPv4();
};
