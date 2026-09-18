/**
 * Pseudocode-Labor & Algorithmen-Trainer – AP1 Tracker
 * 100% Client-Side, Offline-first, kein Tracking, kein Login.
 */

(() => {
  // ============================================================
  // 1. STATE & STORAGE
  // ============================================================
  const STORAGE_KEY = "ap1_pseudocode_state";

  function loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Konnte Pseudocode-State nicht laden:", e);
    }
    return {
      solvedExercises: [],
      currentTab: "guide",
      streak: 0,
    };
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Konnte Pseudocode-State nicht speichern:", e);
    }
  }

  const appState = loadState();

  // ============================================================
  // 2. TAB CONTROLLER
  // ============================================================
  window.switchTab = function (tabId) {
    const tabs = ["guide", "visualizer", "exercises"];
    tabs.forEach((id) => {
      const content = document.getElementById(`tabContent-${id}`);
      const btn = document.getElementById(`tabBtn-${id}`);
      if (!content || !btn) return;

      const iconBox = btn.querySelector(".tab-icon");
      const icon = btn.querySelector(".tab-icon i, .tab-icon svg");
      const title = btn.querySelector(".tab-title");
      const sub = btn.querySelector(".tab-sub");

      if (id === tabId) {
        content.classList.remove("hidden");
        btn.className = "tab-btn active flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2.5 p-2 sm:px-4 sm:py-2.5 rounded-xl text-center sm:text-left transition-all bg-dark-card border border-blue-500/50 text-white shadow-sm";
        if (iconBox) iconBox.className = "tab-icon w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 transition-colors";
        if (icon) icon.className = "w-4 h-4 text-blue-400";
        if (title) title.className = "tab-title text-[11px] sm:text-xs font-bold leading-tight truncate text-white";
        if (sub) sub.className = "tab-sub text-[9px] sm:text-[10px] text-blue-300 hidden sm:block truncate opacity-95";
      } else {
        content.classList.add("hidden");
        btn.className = "tab-btn flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2.5 p-2 sm:px-4 sm:py-2.5 rounded-xl text-center sm:text-left transition-all bg-dark-card/40 border border-dark-border text-dark-muted hover:text-white hover:border-dark-dim/40";
        if (iconBox) iconBox.className = "tab-icon w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-dark-bg border border-dark-border flex items-center justify-center shrink-0 transition-colors";
        if (icon) icon.className = "w-4 h-4 text-dark-muted";
        if (title) title.className = "tab-title text-[11px] sm:text-xs font-bold leading-tight truncate text-dark-muted";
        if (sub) sub.className = "tab-sub text-[9px] sm:text-[10px] text-dark-dim hidden sm:block truncate";
      }
    });

    appState.currentTab = tabId;
    saveState(appState);

    if (tabId === "visualizer") {
      if (algoEngine.steps.length === 0) {
        algoEngine.init();
      } else {
        algoEngine.render();
      }
    } else if (tabId === "exercises") {
      exerciseEngine.init();
    }

    if (window.lucide) lucide.createIcons();
  };

  // ============================================================
  // 3. ALGORITHMEN-VISUALIZER ENGINE
  // ============================================================
  const ALGORITHM_CODES = {
    linear_search: [
      { line: 1, text: "FUNKTION lineareSuche(array, ziel)" },
      { line: 2, text: "  FÜR i = 0 BIS LÄNGE(array) - 1" },
      { line: 3, text: "    WENN array[i] == ziel DANN" },
      { line: 4, text: "      RÜCKGABE i // Gefunden!" },
      { line: 5, text: "    ENDE WENN" },
      { line: 6, text: "  ENDE FÜR" },
      { line: 7, text: "  RÜCKGABE -1 // Nicht gefunden" },
      { line: 8, text: "ENDE FUNKTION" },
    ],
    find_min: [
      { line: 1, text: "FUNKTION findeMinimum(array)" },
      { line: 2, text: "  minWert = array[0]" },
      { line: 3, text: "  minIdx = 0" },
      { line: 4, text: "  FÜR i = 1 BIS LÄNGE(array) - 1" },
      { line: 5, text: "    WENN array[i] < minWert DANN" },
      { line: 6, text: "      minWert = array[i]" },
      { line: 7, text: "      minIdx = i" },
      { line: 8, text: "    ENDE WENN" },
      { line: 9, text: "  ENDE FÜR" },
      { line: 10, text: "  RÜCKGABE minIdx" },
      { line: 11, text: "ENDE FUNKTION" },
    ],
    bubble_sort: [
      { line: 1, text: "FUNKTION bubbleSort(array)" },
      { line: 2, text: "  n = LÄNGE(array)" },
      { line: 3, text: "  FÜR i = 0 BIS n - 2" },
      { line: 4, text: "    FÜR j = 0 BIS n - 2 - i" },
      { line: 5, text: "      WENN array[j] > array[j + 1] DANN" },
      { line: 6, text: "        TAUSCHE array[j], array[j + 1]" },
      { line: 7, text: "      ENDE WENN" },
      { line: 8, text: "    ENDE FÜR" },
      { line: 9, text: "  ENDE FÜR" },
      { line: 10, text: "  RÜCKGABE array" },
      { line: 11, text: "ENDE FUNKTION" },
    ],
  };

  class AlgoEngine {
    constructor() {
      this.currentArray = [15, 42, 8, 32, 19, 50, 11];
      this.currentAlgo = "linear_search";
      this.targetValue = 42;
      this.arraySize = 7;
      this.steps = [];
      this.currentStepIdx = 0;
      this.isPlaying = false;
      this.timer = null;
      this.speed = 600;
      this.comparisonsCount = 0;
    }

    init() {
      this.buildSteps();
      this.render();
    }

    setAlgorithm(algo) {
      this.pause();
      this.currentAlgo = algo;
      const targetWrapper = document.getElementById("targetValueWrapper");
      if (targetWrapper) {
        targetWrapper.style.display = algo === "linear_search" ? "flex" : "none";
      }
      if (algo === "linear_search" && !this.currentArray.includes(this.targetValue)) {
        this.targetValue = this.currentArray[Math.floor(this.currentArray.length / 2)];
        const targetInput = document.getElementById("targetSearchInput");
        if (targetInput) targetInput.value = this.targetValue;
      }
      this.buildSteps();
      this.render();
    }

    setArray(newArr) {
      this.pause();
      this.currentArray = [...newArr];
      this.arraySize = newArr.length;
      const sizeSlider = document.getElementById("sizeSlider");
      const sizeLabel = document.getElementById("sizeLabel");
      if (sizeSlider) sizeSlider.value = this.arraySize;
      if (sizeLabel) sizeLabel.textContent = this.arraySize;

      if (this.currentAlgo === "linear_search" && !this.currentArray.includes(this.targetValue)) {
        this.targetValue = this.currentArray[Math.floor(this.currentArray.length / 2)];
        const targetInput = document.getElementById("targetSearchInput");
        if (targetInput) targetInput.value = this.targetValue;
      }

      this.buildSteps();
      this.render();
    }

    setTargetValue(val) {
      this.targetValue = parseInt(val, 10) || 0;
      const targetInput = document.getElementById("targetSearchInput");
      if (targetInput) targetInput.value = this.targetValue;

      if (this.currentAlgo === "linear_search") {
        this.pause();
        this.buildSteps();
        this.render();
      }
    }

    buildSteps() {
      this.steps = [];
      this.comparisonsCount = 0;
      const arr = [...this.currentArray];

      if (this.currentAlgo === "linear_search") {
        this.generateLinearSearchSteps(arr, this.targetValue);
      } else if (this.currentAlgo === "find_min") {
        this.generateFindMinSteps(arr);
      } else if (this.currentAlgo === "bubble_sort") {
        this.generateBubbleSortSteps(arr);
      }

      this.currentStepIdx = 0;
    }

    // 1. Lineare Suche
    generateLinearSearchSteps(arr, target) {
      this.steps.push({
        line: 1,
        arrayState: [...arr],
        highlights: {},
        pointers: {},
        vars: { ziel: target, länge: arr.length },
        explanation: `Lineare Suche gestartet: Durchsuche das Array von Index 0 bis ${arr.length - 1} nach Zielwert ${target}.`,
        status: "Start",
      });

      let found = false;
      for (let i = 0; i < arr.length; i++) {
        this.comparisonsCount++;
        // Vergleichs-Schritt
        this.steps.push({
          line: 3,
          arrayState: [...arr],
          highlights: { [i]: "compare" },
          pointers: { i },
          vars: { i, "array[i]": arr[i], ziel: target, Bedingung: `${arr[i]} == ${target} ?` },
          explanation: `Schritt ${i + 1}: Prüfe Index ${i} (Wert ${arr[i]}). Ist ${arr[i]} == ${target}?`,
          status: "Vergleich",
        });

        if (arr[i] === target) {
          this.steps.push({
            line: 4,
            arrayState: [...arr],
            highlights: { [i]: "found" },
            pointers: { i },
            vars: { i, "array[i]": arr[i], ergebnis: i },
            explanation: `Treffer an Index ${i}! Wert ${target} gefunden. Die Funktion gibt Index ${i} zurück und endet sofort.`,
            status: "Gefunden",
          });
          found = true;
          break;
        }
      }

      if (!found) {
        this.steps.push({
          line: 7,
          arrayState: [...arr],
          highlights: {},
          pointers: {},
          vars: { ergebnis: -1 },
          explanation: `Schleife beendet: Zielwert ${target} existiert nicht im Array. Rückgabe ist -1.`,
          status: "Nicht gefunden",
        });
      }
    }

    // 2. Minimum & Index finden
    generateFindMinSteps(arr) {
      let minWert = arr[0];
      let minIdx = 0;

      this.steps.push({
        line: 2,
        arrayState: [...arr],
        highlights: { 0: "found" },
        pointers: { minIdx: 0 },
        vars: { minWert, minIdx: 0 },
        explanation: `Initialisiere Minimum: Nimm erstes Element als vorläufiges Minimum: minWert = ${minWert} (Index 0).`,
        status: "Start",
      });

      for (let i = 1; i < arr.length; i++) {
        this.comparisonsCount++;
        this.steps.push({
          line: 5,
          arrayState: [...arr],
          highlights: { [i]: "compare", [minIdx]: "found" },
          pointers: { i, minIdx },
          vars: { i, "array[i]": arr[i], minWert, minIdx, Bedingung: `${arr[i]} < ${minWert} ?` },
          explanation: `Prüfe Index ${i} (Wert ${arr[i]}): Ist ${arr[i]} kleiner als das bisherige Minimum (${minWert})?`,
          status: "Vergleich",
        });

        if (arr[i] < minWert) {
          minWert = arr[i];
          minIdx = i;
          this.steps.push({
            line: 6,
            arrayState: [...arr],
            highlights: { [minIdx]: "found" },
            pointers: { minIdx },
            vars: { minWert, minIdx },
            explanation: `Neues Minimum gefunden! Aktualisiere: minWert = ${minWert} an Index ${minIdx}.`,
            status: "Neues Minimum",
          });
        }
      }

      this.steps.push({
        line: 10,
        arrayState: [...arr],
        highlights: { [minIdx]: "found" },
        pointers: { minIdx },
        vars: { minWert, minIdx },
        explanation: `Suche beendet: Das kleinste Element im Array ist ${minWert} (an Index ${minIdx}).`,
        status: "Abgeschlossen",
      });
    }

    // 3. Bubble Sort
    generateBubbleSortSteps(arr) {
      const n = arr.length;
      const sortedIndices = {};

      this.steps.push({
        line: 1,
        arrayState: [...arr],
        highlights: {},
        pointers: {},
        vars: { n, i: 0, j: 0 },
        explanation: `Starte Bubble Sort für ${n} Elemente. In jeder Runde wandert das größte unsortierte Element wie eine Blase nach ganz rechts.`,
        status: "Start",
      });

      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
          this.comparisonsCount++;
          
          // 1. Schritt: Vergleich zeigen (mit unverändertem Array!)
          this.steps.push({
            line: 5,
            arrayState: [...arr],
            highlights: { ...sortedIndices, [j]: "compare", [j + 1]: "compare" },
            pointers: { i, j, "j+1": j + 1 },
            vars: { i, j, "array[j]": arr[j], "array[j+1]": arr[j + 1], Bedingung: `${arr[j]} > ${arr[j + 1]} ?` },
            explanation: `Vergleiche Nachbar-Paar: Index ${j} (${arr[j]}) und Index ${j + 1} (${arr[j + 1]}). Ist ${arr[j]} > ${arr[j + 1]}?`,
            status: "Vergleich",
          });

          if (arr[j] > arr[j + 1]) {
            const val1 = arr[j];
            const val2 = arr[j + 1];
            
            // Swap ausführen
            arr[j] = val2;
            arr[j + 1] = val1;

            // 2. Schritt: Tausch zeigen (jetzt mit getauschtem Array!)
            this.steps.push({
              line: 6,
              arrayState: [...arr],
              highlights: { ...sortedIndices, [j]: "swap", [j + 1]: "swap" },
              pointers: { j, "j+1": j + 1 },
              vars: { temp: val1, "array[j]": arr[j], "array[j+1]": arr[j + 1] },
              explanation: `Bedingung WAHR (${val1} > ${val2}): Tausche Werte an Position ${j} und ${j + 1} über die Hilfsvariable temp.`,
              status: "Tausch",
            });
          }
        }
        
        sortedIndices[n - 1 - i] = "found";
        this.steps.push({
          line: 3,
          arrayState: [...arr],
          highlights: { ...sortedIndices },
          pointers: { i },
          vars: { i, "sortiert bis Index": n - 1 - i },
          explanation: `Runde i = ${i} beendet: Größtes Element dieser Runde (${arr[n - 1 - i]}) ist sicher an seiner Endposition angelangt.`,
          status: "Runde beendet",
        });
      }

      for (let k = 0; k < n; k++) sortedIndices[k] = "found";
      this.steps.push({
        line: 10,
        arrayState: [...arr],
        highlights: { ...sortedIndices },
        pointers: {},
        vars: { status: "komplett sortiert" },
        explanation: "Bubble Sort erfolgreich abgeschlossen! Alle Elemente sind nun in aufsteigender Reihenfolge sortiert.",
        status: "Fertig sortiert",
      });
    }

    render() {
      if (this.steps.length === 0) return;
      const step = this.steps[this.currentStepIdx] || this.steps[0];

      // 1. Code Box
      const codeContainer = document.getElementById("codeContainer");
      if (codeContainer) {
        const lines = ALGORITHM_CODES[this.currentAlgo] || [];
        codeContainer.innerHTML = lines
          .map((l) => {
            const isActive = l.line === step.line;
            return `
              <div class="code-line ${isActive ? "active font-bold" : "text-dark-muted"} flex items-center px-2.5 py-1 rounded text-xs font-mono">
                <span class="w-6 text-dark-dim select-none text-[10px] shrink-0 text-right pr-2">${l.line}</span>
                <span class="whitespace-pre">${escapeHtml(l.text)}</span>
              </div>
            `;
          })
          .join("");
      }

      // 2. Bars
      const barContainer = document.getElementById("barContainer");
      if (barContainer) {
        const arr = step.arrayState;
        const maxVal = Math.max(...arr, 1);

        barContainer.innerHTML = arr
          .map((val, idx) => {
            const heightPercent = Math.max(18, Math.round((val / maxVal) * 80));
            const highlightType = step.highlights[idx];

            let bgClass = "bg-blue-600/80 border-blue-500 text-blue-100";
            let glow = "";
            if (highlightType === "compare") {
              bgClass = "bg-amber-400 border-amber-300 text-slate-950 font-black";
              glow = "box-shadow: 0 0 16px rgba(251, 191, 36, 0.6);";
            } else if (highlightType === "swap") {
              bgClass = "bg-rose-500 border-rose-400 text-white font-black";
              glow = "box-shadow: 0 0 16px rgba(244, 63, 94, 0.7);";
            } else if (highlightType === "found") {
              bgClass = "bg-emerald-500 border-emerald-400 text-slate-950 font-black";
              glow = "box-shadow: 0 0 16px rgba(16, 185, 129, 0.6);";
            }

            const activePointers = [];
            if (step.pointers) {
              for (const [key, pIdx] of Object.entries(step.pointers)) {
                if (pIdx === idx) activePointers.push(key);
              }
            }

            return `
              <div 
                onclick="algoEngine.setTargetValue(${val})"
                title="Klicken, um ${val} als Suchziel zu setzen"
                class="flex-1 flex flex-col items-center justify-end h-full max-w-[56px] min-w-[22px] sm:min-w-[30px] cursor-pointer group"
              >
                <!-- Bar Column -->
                <div
                  class="algo-bar w-full rounded-t-lg border flex items-center justify-center text-xs font-mono select-none group-hover:brightness-110 ${bgClass}"
                  style="height: ${heightPercent}%; ${glow}"
                >
                  <span class="drop-shadow-sm font-bold">${val}</span>
                </div>
                <!-- Index Label & Pointers -->
                <div class="mt-1 text-center font-mono">
                  <div class="text-[10px] text-dark-dim">[${idx}]</div>
                  <div class="h-4 text-[10px] font-bold text-amber-400 tracking-tighter truncate">
                    ${activePointers.length > 0 ? `▲ ${activePointers.join(",")}` : ""}
                  </div>
                </div>
              </div>
            `;
          })
          .join("");
      }

      // 3. Variable Inspector
      const varInspector = document.getElementById("variableInspector");
      if (varInspector) {
        const vars = step.vars || {};
        const entries = Object.entries(vars);
        if (entries.length === 0) {
          varInspector.innerHTML = `<div class="text-dark-dim text-xs font-mono italic">Keine aktiven Variablen</div>`;
        } else {
          varInspector.innerHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              ${entries
                .map(
                  ([k, v]) => `
                <div class="bg-dark-bg border border-dark-border rounded-lg p-2.5 font-mono">
                  <div class="text-[10px] text-dark-dim uppercase tracking-wider">${escapeHtml(k)}</div>
                  <div class="text-xs sm:text-sm font-bold text-blue-400 truncate mt-0.5">${escapeHtml(String(v))}</div>
                </div>
              `,
                )
                .join("")}
            </div>
          `;
        }
      }

      // 4. Texts
      const stepExplanation = document.getElementById("stepExplanation");
      if (stepExplanation) stepExplanation.textContent = step.explanation;

      const currentStepNum = document.getElementById("currentStepNumber");
      if (currentStepNum) currentStepNum.textContent = this.currentStepIdx + 1;

      const totalStepsNum = document.getElementById("totalStepsNumber");
      if (totalStepsNum) totalStepsNum.textContent = this.steps.length;

      const statusText = document.getElementById("algoStatusText");
      if (statusText) statusText.textContent = step.status || "Bereit";

      const opCounter = document.getElementById("operationCounter");
      if (opCounter) opCounter.textContent = `Vergleiche: ${this.comparisonsCount}`;
    }

    stepForward() {
      if (this.currentStepIdx < this.steps.length - 1) {
        this.currentStepIdx++;
        this.render();
      } else {
        this.pause();
      }
    }

    stepBackward() {
      if (this.currentStepIdx > 0) {
        this.currentStepIdx--;
        this.render();
      }
    }

    play() {
      if (this.isPlaying) return;
      if (this.currentStepIdx >= this.steps.length - 1) {
        this.currentStepIdx = 0;
      }
      this.isPlaying = true;
      this.updatePlayBtn();

      this.timer = setInterval(() => {
        if (this.currentStepIdx < this.steps.length - 1) {
          this.stepForward();
        } else {
          this.pause();
        }
      }, this.speed);
    }

    pause() {
      this.isPlaying = false;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.updatePlayBtn();
    }

    toggle() {
      if (this.isPlaying) this.pause();
      else this.play();
    }

    reset() {
      this.pause();
      this.currentStepIdx = 0;
      this.render();
    }

    updatePlayBtn() {
      const btnText = document.getElementById("playBtnText");
      const icon = document.getElementById("playIcon");
      if (btnText) btnText.textContent = this.isPlaying ? "Pause" : "Start";
      if (icon) {
        icon.setAttribute("data-lucide", this.isPlaying ? "pause" : "play");
        if (window.lucide) lucide.createIcons();
      }
    }
  }

  const algoEngine = new AlgoEngine();
  window.algoEngine = algoEngine;
  window.selectBarAsTarget = function (val) {
    algoEngine.setTargetValue(val);
  };

  // Globals for visualizer
  window.onAlgorithmChange = function () {
    const sel = document.getElementById("algoSelect");
    if (sel) algoEngine.setAlgorithm(sel.value);
  };

  window.generateNewArray = function () {
    const size = algoEngine.arraySize;
    const pool = new Set();
    while (pool.size < size) {
      pool.add(Math.floor(Math.random() * 85) + 8);
    }
    const newArr = Array.from(pool);
    if (algoEngine.currentAlgo === "linear_search") {
      algoEngine.targetValue = newArr[Math.floor(newArr.length / 2)];
      const targetInput = document.getElementById("targetSearchInput");
      if (targetInput) targetInput.value = algoEngine.targetValue;
    }
    algoEngine.setArray(newArr);
  };

  window.applyArrayPreset = function (preset) {
    const size = algoEngine.arraySize;
    let arr = [];
    if (preset === "nearly_sorted") {
      arr = Array.from({ length: size }, (_, i) => (i + 1) * 12);
      if (size > 3) {
        // swap two adjacent elements
        const tmp = arr[2];
        arr[2] = arr[3];
        arr[3] = tmp;
      }
    } else if (preset === "reverse") {
      arr = Array.from({ length: size }, (_, i) => (size - i) * 12);
    } else if (preset === "small_numbers") {
      arr = Array.from({ length: size }, (_, i) => Math.floor(Math.random() * 18) + 2);
    } else if (preset === "duplicates") {
      arr = [10, 24, 24, 38, 52, 52, 66, 80, 80, 94].slice(0, size);
    } else {
      const pool = new Set();
      while (pool.size < size) {
        pool.add(Math.floor(Math.random() * 85) + 8);
      }
      arr = Array.from(pool);
    }
    if (algoEngine.currentAlgo === "linear_search") {
      algoEngine.targetValue = arr[Math.floor(arr.length / 2)];
      const targetInput = document.getElementById("targetSearchInput");
      if (targetInput) targetInput.value = algoEngine.targetValue;
    }
    algoEngine.setArray(arr);
  };

  window.updateArraySize = function (size) {
    const s = parseInt(size, 10);
    algoEngine.arraySize = s;
    const label = document.getElementById("sizeLabel");
    if (label) label.textContent = s;
    generateNewArray();
  };

  window.togglePlayPause = function () {
    algoEngine.toggle();
  };

  window.stepForward = function () {
    algoEngine.pause();
    algoEngine.stepForward();
  };

  window.stepBackward = function () {
    algoEngine.pause();
    algoEngine.stepBackward();
  };

  window.resetAlgorithm = function () {
    algoEngine.reset();
  };

  window.updateSpeed = function (val) {
    const inverted = 1300 - parseInt(val, 10);
    algoEngine.speed = inverted;
    const label = document.getElementById("speedLabel");
    if (label) {
      if (inverted > 850) label.textContent = "Langsam";
      else if (inverted < 350) label.textContent = "Schnell";
      else label.textContent = "Normal";
    }
    if (algoEngine.isPlaying) {
      algoEngine.pause();
      algoEngine.play();
    }
  };

  window.updateSearchTarget = function (val) {
    algoEngine.setTargetValue(val);
  };

  // ============================================================
  // 4. GROSSE AUFGABENSAMMLUNG: SCHREIBTISCHTESTS & PUZZLES
  // ============================================================
  const EXERCISES_TRACE = [
    {
      id: "trace_1",
      title: "1. Summenbildung (Akkumulator-Schleife)",
      difficulty: "AP1 Basis",
      code: [
        "summe = 0",
        "werte = [4, 10, 2, 7]",
        "FÜR i = 0 BIS 3",
        "  summe = summe + werte[i]",
        "ENDE FÜR",
      ],
      explanation: "Wie verändert sich die Variable summe in jedem Schleifendurchlauf?",
      headers: ["Schritt", "i", "werte[i]", "summe"],
      rows: [
        { step: "Init", values: ["-", "-", "0"], locked: [true, true, true] },
        { step: "1 (i=0)", values: ["0", "4", "4"], locked: [false, false, false] },
        { step: "2 (i=1)", values: ["1", "10", "14"], locked: [false, false, false] },
        { step: "3 (i=2)", values: ["2", "2", "16"], locked: [false, false, false] },
        { step: "4 (i=3)", values: ["3", "7", "23"], locked: [false, false, false] },
      ],
    },
    {
      id: "trace_2",
      title: "2. Bedingte Zählung (Gerade Zahlen mit Modulo)",
      difficulty: "AP1 Basis",
      code: [
        "anzahl = 0",
        "werte = [3, 8, 12, 5, 14]",
        "FÜR i = 0 BIS 4",
        "  WENN werte[i] % 2 == 0 DANN",
        "    anzahl = anzahl + 1",
        "  ENDE WENN",
        "ENDE FÜR",
      ],
      explanation: "Protokolliere, ob die Zahl gerade ist (% 2 == 0) und wie anzahl hochgezählt wird:",
      headers: ["Schritt", "i", "werte[i]", "Gerade? (JA/NEIN)", "anzahl"],
      rows: [
        { step: "Init", values: ["-", "-", "-", "0"], locked: [true, true, true, true] },
        { step: "1 (i=0)", values: ["0", "3", "NEIN", "0"], locked: [false, false, false, false] },
        { step: "2 (i=1)", values: ["1", "8", "JA", "1"], locked: [false, false, false, false] },
        { step: "3 (i=2)", values: ["2", "12", "JA", "2"], locked: [false, false, false, false] },
        { step: "4 (i=3)", values: ["3", "5", "NEIN", "2"], locked: [false, false, false, false] },
        { step: "5 (i=4)", values: ["4", "14", "JA", "3"], locked: [false, false, false, false] },
      ],
    },
    {
      id: "trace_3",
      title: "3. Kopfgesteuerte Schleife (Subtraktion & Verdopplung)",
      difficulty: "AP1 Mittelschwer",
      code: [
        "x = 20",
        "y = 1",
        "SOLANGE x > 5 TUE",
        "  x = x - 6",
        "  y = y * 2",
        "ENDE SOLANGE",
      ],
      explanation: "Trage den Wahrheitswert der Schleifenbedingung und die Werte von x und y ein:",
      headers: ["Schritt", "x > 5? (JA/NEIN)", "x", "y"],
      rows: [
        { step: "Start", values: ["JA", "20", "1"], locked: [true, true, true] },
        { step: "Durchlauf 1", values: ["JA", "14", "2"], locked: [false, false, false] },
        { step: "Durchlauf 2", values: ["JA", "8", "4"], locked: [false, false, false] },
        { step: "Durchlauf 3", values: ["NEIN", "2", "8"], locked: [false, false, false] },
      ],
    },
    {
      id: "trace_4",
      title: "4. Minimum & Index finden im Array",
      difficulty: "AP1 Prüfungsstandard",
      code: [
        "werte = [18, 5, 23, 3]",
        "minWert = werte[0]",
        "minIdx = 0",
        "FÜR i = 1 BIS 3",
        "  WENN werte[i] < minWert DANN",
        "    minWert = werte[i]",
        "    minIdx = i",
        "  ENDE WENN",
        "ENDE FÜR",
      ],
      explanation: "Welche Werte haben minWert und minIdx nach jedem Schritt?",
      headers: ["Schritt", "i", "werte[i]", "werte[i] < minWert?", "minWert", "minIdx"],
      rows: [
        { step: "Start", values: ["-", "-", "-", "18", "0"], locked: [true, true, true, true, true] },
        { step: "1 (i=1)", values: ["1", "5", "JA", "5", "1"], locked: [false, false, false, false, false] },
        { step: "2 (i=2)", values: ["2", "23", "NEIN", "5", "1"], locked: [false, false, false, false, false] },
        { step: "3 (i=3)", values: ["3", "3", "JA", "3", "3"], locked: [false, false, false, false, false] },
      ],
    },
    {
      id: "trace_5",
      title: "5. Schachtelschleife (Multiplikationstabelle)",
      difficulty: "AP1 Mittelschwer",
      code: [
        "summe = 0",
        "FÜR i = 1 BIS 2",
        "  FÜR j = 1 BIS 3",
        "    summe = summe + (i * j)",
        "  ENDE FÜR",
        "ENDE FÜR",
      ],
      explanation: "Protokolliere jeden Schritt der inneren Schleife:",
      headers: ["Schritt", "i", "j", "i * j", "summe"],
      rows: [
        { step: "Init", values: ["-", "-", "-", "0"], locked: [true, true, true, true] },
        { step: "1", values: ["1", "1", "1", "1"], locked: [false, false, false, false] },
        { step: "2", values: ["1", "2", "2", "3"], locked: [false, false, false, false] },
        { step: "3", values: ["1", "3", "3", "6"], locked: [false, false, false, false] },
        { step: "4", values: ["2", "1", "2", "8"], locked: [false, false, false, false] },
        { step: "5", values: ["2", "2", "4", "12"], locked: [false, false, false, false] },
        { step: "6", values: ["2", "3", "6", "18"], locked: [false, false, false, false] },
      ],
    },
    {
      id: "trace_6",
      title: "6. Fußgesteuerte Schleife (WIEDERHOLE ... BIS)",
      difficulty: "AP1 Prüfungsstandard",
      code: [
        "zahl = 50",
        "durchlaeufe = 0",
        "WIEDERHOLE",
        "  zahl = zahl - 15",
        "  durchlaeufe = durchlaeufe + 1",
        "BIS zahl <= 10",
      ],
      explanation: "Achtung: Fußgesteuerte Schleifen prüfen die Abbruchbedingung am Ende:",
      headers: ["Durchlauf", "zahl vor Abzug", "zahl nach Abzug", "durchlaeufe", "Abbruch? (JA/NEIN)"],
      rows: [
        { step: "1", values: ["50", "35", "1", "NEIN"], locked: [false, false, false, false] },
        { step: "2", values: ["35", "20", "2", "NEIN"], locked: [false, false, false, false] },
        { step: "3", values: ["20", "5", "3", "JA"], locked: [false, false, false, false] },
      ],
    },
    {
      id: "trace_7",
      title: "7. Schwellenwert-Filter (Werte über 50 zählen)",
      difficulty: "AP1 Basis",
      code: [
        "treffer = 0",
        "sensoren = [45, 82, 12, 95, 50, 61]",
        "FÜR i = 0 BIS 5",
        "  WENN sensoren[i] > 50 DANN",
        "    treffer = treffer + 1",
        "  ENDE WENN",
        "ENDE FÜR",
      ],
      explanation: "Nur Werte, die ECHT GRÖSSER als 50 sind, zählen:",
      headers: ["Index i", "sensoren[i]", "> 50? (JA/NEIN)", "treffer"],
      rows: [
        { step: "i=0", values: ["45", "NEIN", "0"], locked: [false, false, false] },
        { step: "i=1", values: ["82", "JA", "1"], locked: [false, false, false] },
        { step: "i=2", values: ["12", "NEIN", "1"], locked: [false, false, false] },
        { step: "i=3", values: ["95", "JA", "2"], locked: [false, false, false] },
        { step: "i=4", values: ["50", "NEIN", "2"], locked: [false, false, false] },
        { step: "i=5", values: ["61", "JA", "3"], locked: [false, false, false] },
      ],
    },
    {
      id: "trace_8",
      title: "8. Bubble Sort – 1. Durchlauf vollständig",
      difficulty: "AP1 Fortgeschritten",
      code: [
        "// Gegeben: arr = [9, 3, 7, 2]",
        "FÜR j = 0 BIS 2",
        "  WENN arr[j] > arr[j + 1] DANN",
        "    TAUSCHE arr[j], arr[j + 1]",
        "  ENDE WENN",
        "ENDE FÜR",
      ],
      explanation: "Trage das Array nach jedem Paarvergleich ein:",
      headers: ["Vergleich j", "arr[j]", "arr[j+1]", "Tausch nötig? (JA/NEIN)", "Array nach Schritt"],
      rows: [
        { step: "Start", values: ["-", "-", "-", "[9, 3, 7, 2]"], locked: [true, true, true, true] },
        { step: "j = 0", values: ["9", "3", "JA", "[3, 9, 7, 2]"], locked: [false, false, false, false] },
        { step: "j = 1", values: ["9", "7", "JA", "[3, 7, 9, 2]"], locked: [false, false, false, false] },
        { step: "j = 2", values: ["9", "2", "JA", "[3, 7, 2, 9]"], locked: [false, false, false, false] },
      ],
    },
    {
      id: "trace_9",
      title: "9. Vokale zählen in Zeichenkette (String-Iteration)",
      difficulty: "AP1 Standard",
      code: [
        "text = 'INFORMATIK'",
        "vokale = 0",
        "FÜR i = 0 BIS 4",
        "  z = text[i]",
        "  WENN z == 'A' ODER z == 'E' ODER z == 'I' ODER z == 'O' ODER z == 'U' DANN",
        "    vokale = vokale + 1",
        "  ENDE WENN",
        "ENDE FÜR",
      ],
      explanation: "Zähle die Vokale im Wort 'INFORMATIK' für die ersten 5 Zeichen (I, N, F, O, R):",
      headers: ["Index i", "Zeichen z", "Ist Vokal? (JA/NEIN)", "vokale"],
      rows: [
        { step: "Init", values: ["-", "-", "-", "0"], locked: [true, true, true, true] },
        { step: "i = 0", values: ["0", "I", "JA", "1"], locked: [false, false, false, false] },
        { step: "i = 1", values: ["1", "N", "NEIN", "1"], locked: [false, false, false, false] },
        { step: "i = 2", values: ["2", "F", "NEIN", "1"], locked: [false, false, false, false] },
        { step: "i = 3", values: ["3", "O", "JA", "2"], locked: [false, false, false, false] },
        { step: "i = 4", values: ["4", "R", "NEIN", "2"], locked: [false, false, false, false] },
      ],
    },
    {
      id: "trace_10",
      title: "10. Lagerbestand abbuchen (SOLANGE mit Mindestbestand)",
      difficulty: "AP1 Praxis",
      code: [
        "bestand = 80",
        "auftrag = 20",
        "mindest = 25",
        "anzahl = 0",
        "SOLANGE (bestand - auftrag) >= mindest TUE",
        "  bestand = bestand - auftrag",
        "  anzahl = anzahl + 1",
        "ENDE SOLANGE",
      ],
      explanation: "Wie oft kann der Auftrag à 20 Stück geliefert werden, ohne den Mindestbestand von 25 zu unterschreiten?",
      headers: ["Schritt", "bestand vor Abzug", "(bestand - 20) >= 25?", "bestand nach Abzug", "anzahl"],
      rows: [
        { step: "Start", values: ["80", "-", "-", "0"], locked: [true, true, true, true] },
        { step: "Durchlauf 1", values: ["80", "JA", "60", "1"], locked: [false, false, false, false] },
        { step: "Durchlauf 2", values: ["60", "JA", "40", "2"], locked: [false, false, false, false] },
        { step: "Abbruch-Prüfung", values: ["40", "NEIN", "40", "2"], locked: [false, false, false, false] },
      ],
    },
  ];

  const EXERCISES_PUZZLE = [
    {
      id: "puzzle_1",
      title: "1. Durchschnitt eines Arrays berechnen",
      difficulty: "AP1 Basis",
      description: "Bringe die Codezeilen in die richtige logische Reihenfolge:",
      lines: [
        { id: 1, text: "summe = 0" },
        { id: 2, text: "FÜR i = 0 BIS LÄNGE(werte) - 1" },
        { id: 3, text: "  summe = summe + werte[i]" },
        { id: 4, text: "ENDE FÜR" },
        { id: 5, text: "durchschnitt = summe / LÄNGE(werte)" },
        { id: 6, text: "RÜCKGABE durchschnitt" },
      ],
    },
    {
      id: "puzzle_2",
      title: "2. Lineare Suche implementieren",
      difficulty: "AP1 Standard",
      description: "Sortiere die Zeilen der Suchfunktion:",
      lines: [
        { id: 1, text: "FUNKTION suche(array, ziel)" },
        { id: 2, text: "  FÜR i = 0 BIS LÄNGE(array) - 1" },
        { id: 3, text: "    WENN array[i] == ziel DANN" },
        { id: 4, text: "      RÜCKGABE i" },
        { id: 5, text: "    ENDE WENN" },
        { id: 6, text: "  ENDE FÜR" },
        { id: 7, text: "  RÜCKGABE -1" },
        { id: 8, text: "ENDE FUNKTION" },
      ],
    },
    {
      id: "puzzle_3",
      title: "3. Werte zweier Variablen tauschen (Swap)",
      difficulty: "AP1 Basis",
      description: "Wie tauscht man a und b mit einer Hilfsvariable temp?",
      lines: [
        { id: 1, text: "FUNKTION tausche(a, b)" },
        { id: 2, text: "  temp = a" },
        { id: 3, text: "  a = b" },
        { id: 4, text: "  b = temp" },
        { id: 5, text: "  RÜCKGABE a, b" },
        { id: 6, text: "ENDE FUNKTION" },
      ],
    },
    {
      id: "puzzle_4",
      title: "4. Rabattstaffel mit WENN / SONST",
      difficulty: "AP1 Standard",
      description: "Reihenfolge zur Berechnung von 10% Rabatt ab 100 €:",
      lines: [
        { id: 1, text: "WENN bestellwert >= 100 DANN" },
        { id: 2, text: "  rabatt = bestellwert * 0.10" },
        { id: 3, text: "SONST" },
        { id: 4, text: "  rabatt = 0" },
        { id: 5, text: "ENDE WENN" },
        { id: 6, text: "endpreis = bestellwert - rabatt" },
      ],
    },
    {
      id: "puzzle_5",
      title: "5. Maximum in einem Array finden",
      difficulty: "AP1 Standard",
      description: "Finde das größte Element eines Arrays:",
      lines: [
        { id: 1, text: "maxWert = array[0]" },
        { id: 2, text: "FÜR i = 1 BIS LÄNGE(array) - 1" },
        { id: 3, text: "  WENN array[i] > maxWert DANN" },
        { id: 4, text: "    maxWert = array[i]" },
        { id: 5, text: "  ENDE WENN" },
        { id: 6, text: "ENDE FÜR" },
        { id: 7, text: "RÜCKGABE maxWert" },
      ],
    },
    {
      id: "puzzle_6",
      title: "6. Array rückwärts durchlaufen",
      difficulty: "AP1 Mittelschwer",
      description: "Ausgabe der Elemente von hinten nach vorne:",
      lines: [
        { id: 1, text: "n = LÄNGE(arr)" },
        { id: 2, text: "FÜR i = n - 1 BIS 0 SCHRITT -1" },
        { id: 3, text: "  drucke(arr[i])" },
        { id: 4, text: "ENDE FÜR" },
      ],
    },
    {
      id: "puzzle_7",
      title: "7. Filter-Algorithmus (Positive Zahlen übernehmen)",
      difficulty: "AP1 Standard",
      description: "Bringe die Zeilen zum Filtern eines Arrays in die richtige Reihenfolge:",
      lines: [
        { id: 1, text: "FUNKTION filterPositiv(werte)" },
        { id: 2, text: "  positiv = []" },
        { id: 3, text: "  FÜR i = 0 BIS LÄNGE(werte) - 1" },
        { id: 4, text: "    WENN werte[i] > 0 DANN" },
        { id: 5, text: "      FÜGE_HINZU(positiv, werte[i])" },
        { id: 6, text: "    ENDE WENN" },
        { id: 7, text: "  ENDE FÜR" },
        { id: 8, text: "  RÜCKGABE positiv" },
        { id: 9, text: "ENDE FUNKTION" },
      ],
    },
    {
      id: "puzzle_8",
      title: "8. Palindrom-Prüfung (Wort vorwärts = rückwärts)",
      difficulty: "AP1 Fortgeschritten",
      description: "Ordne die Prüflogik, ob ein Wort von beiden Seiten identisch ist (z. B. ANNA, OTTO):",
      lines: [
        { id: 1, text: "links = 0, rechts = LÄNGE(wort) - 1" },
        { id: 2, text: "SOLANGE links < rechts TUE" },
        { id: 3, text: "  WENN wort[links] != wort[rechts] DANN" },
        { id: 4, text: "    RÜCKGABE FALSCH" },
        { id: 5, text: "  ENDE WENN" },
        { id: 6, text: "  links = links + 1, rechts = rechts - 1" },
        { id: 7, text: "ENDE SOLANGE" },
        { id: 8, text: "RÜCKGABE WAHR" },
      ],
    },
  ];

  class ExerciseEngine {
    constructor() {
      this.subMode = "trace";
      this.currentExId = "trace_1";
      this.puzzleState = [];
    }

    init() {
      this.updateStreakBadge();
      this.renderDropdown();
      this.renderCurrentExercise();
    }

    setSubMode(mode) {
      this.subMode = mode;
      const btnTrace = document.getElementById("btnSubMode-trace");
      const btnPuzzle = document.getElementById("btnSubMode-puzzle");

      if (mode === "trace") {
        btnTrace.className = "px-2.5 sm:px-3.5 py-1.5 rounded-md font-semibold transition-all bg-blue-600 text-white shadow-sm text-center text-[11px] sm:text-xs";
        btnPuzzle.className = "px-2.5 sm:px-3.5 py-1.5 rounded-md font-semibold transition-all text-dark-muted hover:text-white text-center text-[11px] sm:text-xs";
        this.currentExId = EXERCISES_TRACE[0].id;
      } else {
        btnPuzzle.className = "px-2.5 sm:px-3.5 py-1.5 rounded-md font-semibold transition-all bg-blue-600 text-white shadow-sm text-center text-[11px] sm:text-xs";
        btnTrace.className = "px-2.5 sm:px-3.5 py-1.5 rounded-md font-semibold transition-all text-dark-muted hover:text-white text-center text-[11px] sm:text-xs";
        this.currentExId = EXERCISES_PUZZLE[0].id;
      }

      this.renderDropdown();
      this.renderCurrentExercise();
    }

    renderDropdown() {
      const select = document.getElementById("exerciseSelect");
      if (!select) return;

      const list = this.subMode === "trace" ? EXERCISES_TRACE : EXERCISES_PUZZLE;
      select.innerHTML = list
        .map((ex) => {
          const isSolved = appState.solvedExercises.includes(ex.id);
          return `<option value="${ex.id}">${isSolved ? "✓ " : ""}${escapeHtml(ex.title)}</option>`;
        })
        .join("");

      select.value = this.currentExId;
    }

    renderCurrentExercise() {
      const stage = document.getElementById("exerciseStage");
      if (!stage) return;

      if (this.subMode === "trace") {
        this.renderTraceExercise(stage);
      } else {
        this.renderPuzzleExercise(stage);
      }

      if (window.lucide) lucide.createIcons();
    }

    // Render Trace Exercise
    renderTraceExercise(stage) {
      const ex = EXERCISES_TRACE.find((e) => e.id === this.currentExId) || EXERCISES_TRACE[0];
      const isSolved = appState.solvedExercises.includes(ex.id);

      stage.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-dark-border">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                ${escapeHtml(ex.difficulty)}
              </span>
              ${isSolved ? '<span class="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold">✓ Bereits gelöst</span>' : ""}
            </div>
            <h2 class="text-base sm:text-lg font-bold text-white mt-1.5">${escapeHtml(ex.title)}</h2>
          </div>
          <div class="text-xs text-dark-muted">
            Fülle alle freien Felder aus und klicke auf <strong>Prüfen</strong>.
          </div>
        </div>

        <!-- Code Block -->
        <div class="bg-dark-bg border border-dark-border rounded-lg p-3.5 sm:p-4 font-mono text-xs text-dark-text leading-relaxed custom-scroll overflow-x-auto">
          ${ex.code.map((line, i) => `<div><span class="text-dark-dim select-none pr-3 text-[10px]">${i + 1}</span>${escapeHtml(line)}</div>`).join("")}
        </div>

        <p class="text-xs sm:text-sm text-dark-muted font-medium">${escapeHtml(ex.explanation)}</p>

        <!-- Trace Table -->
        <div class="flex items-center justify-between text-[11px] text-dark-muted font-mono"><span class="hidden sm:inline">Trace-Tabelle:</span><span class="sm:hidden flex items-center gap-1 text-dark-dim text-[10px]"><i data-lucide="move-horizontal" class="w-3 h-3"></i> Horizontal wischen</span></div>
        <div class="custom-scroll overflow-x-auto rounded-lg border border-dark-border">
          <table class="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr class="bg-dark-card text-dark-text border-b border-dark-border">
                ${ex.headers.map((h) => `<th class="p-2.5 sm:p-3 font-bold border-r border-dark-border last:border-r-0 whitespace-nowrap">${escapeHtml(h)}</th>`).join("")}
              </tr>
            </thead>
            <tbody class="divide-y divide-dark-border bg-dark-bg">
              ${ex.rows
                .map((row, rIdx) => {
                  return `
                  <tr class="hover:bg-dark-card/50 transition-colors">
                    <td class="p-2.5 sm:p-3 font-bold text-dark-muted bg-dark-bg/60 border-r border-dark-border whitespace-nowrap">${escapeHtml(row.step)}</td>
                    ${row.values
                      .map((val, cIdx) => {
                        const isLocked = row.locked[cIdx];
                        if (isLocked) {
                          return `<td class="p-2.5 sm:p-3 text-dark-muted border-r border-dark-border last:border-r-0 text-center bg-dark-bg/40 whitespace-nowrap">${escapeHtml(val)}</td>`;
                        }
                        return `
                          <td class="p-1 sm:p-1.5 border-r border-dark-border last:border-r-0 text-center">
                            <input
                              type="text"
                              id="trace_${rIdx}_${cIdx}"
                              data-correct="${escapeHtml(val.toUpperCase())}"
                              class="trace-input w-full min-w-[75px] bg-dark-bg border border-dark-border rounded-md px-2 py-1.5 text-center text-xs sm:text-sm text-white font-mono focus:border-blue-500 focus:outline-none uppercase"
                              placeholder="?"
                            />
                          </td>
                        `;
                      })
                      .join("")}
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onclick="exerciseEngine.checkTraceTable()"
              class="flex-1 sm:flex-initial px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>Ergebnis prüfen</span>
            </button>
            <button
              type="button"
              onclick="exerciseEngine.revealTraceHint()"
              class="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 bg-dark-card border border-dark-border hover:border-dark-dim text-dark-muted hover:text-white rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-colors active:scale-95"
            >
              <i data-lucide="help-circle" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>Tipp aufdecken</span>
            </button>
          </div>
          <div id="exerciseFeedback" class="text-xs sm:text-sm font-medium"></div>
        </div>
      `;
    }

    checkTraceTable() {
      const ex = EXERCISES_TRACE.find((e) => e.id === this.currentExId);
      if (!ex) return;

      const inputs = document.querySelectorAll(".trace-input");
      let allCorrect = true;
      let emptyCount = 0;

      inputs.forEach((input) => {
        const expected = input.getAttribute("data-correct").trim().replace(/\s+/g, "");
        const actual = input.value.trim().toUpperCase().replace(/\s+/g, "");

        input.classList.remove("correct", "wrong");

        if (!actual) {
          emptyCount++;
          allCorrect = false;
        } else if (
          actual === expected ||
          actual.includes(expected) ||
          expected.includes(actual) ||
          (expected === "JA" && actual === "WAHR") ||
          (expected === "NEIN" && actual === "FALSCH")
        ) {
          input.classList.add("correct");
        } else {
          input.classList.add("wrong");
          allCorrect = false;
        }
      });

      const feedback = document.getElementById("exerciseFeedback");
      if (allCorrect) {
        feedback.innerHTML = `<span class="text-emerald-400 flex items-center gap-1.5 font-bold">✓ Perfekt gelöst! Alle Tabellenwerte sind 100% korrekt.</span>`;
        this.markSolved(ex.id);
        if (window.confetti) confetti();
      } else if (emptyCount > 0) {
        feedback.innerHTML = `<span class="text-amber-400">Bitte fülle noch alle leeren Zellen mit Fragezeichen aus.</span>`;
      } else {
        feedback.innerHTML = `<span class="text-rose-400">Einige Werte stimmen noch nicht (rot markiert). Überprüfe die Werte schrittweise!</span>`;
      }
    }

    revealTraceHint() {
      const inputs = Array.from(document.querySelectorAll(".trace-input"));
      const firstWrongOrEmpty = inputs.find(
        (inp) => !inp.classList.contains("correct") || !inp.value.trim(),
      );

      if (firstWrongOrEmpty) {
        const expected = firstWrongOrEmpty.getAttribute("data-correct");
        firstWrongOrEmpty.value = expected;
        firstWrongOrEmpty.classList.remove("wrong");
        firstWrongOrEmpty.classList.add("correct");

        const feedback = document.getElementById("exerciseFeedback");
        if (feedback) {
          feedback.innerHTML = `<span class="text-amber-300 text-xs">Ein Feld aufgedeckt: Wert ist <strong>${escapeHtml(expected)}</strong>.</span>`;
        }
      }
    }

    // Render Puzzle Exercise
    renderPuzzleExercise(stage) {
      const ex = EXERCISES_PUZZLE.find((e) => e.id === this.currentExId) || EXERCISES_PUZZLE[0];
      const isSolved = appState.solvedExercises.includes(ex.id);

      if (this.puzzleState.length === 0 || this.puzzleStateExId !== ex.id) {
        this.puzzleState = [...ex.lines].sort(() => Math.random() - 0.5);
        this.puzzleStateExId = ex.id;
      }

      stage.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-dark-border">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                ${escapeHtml(ex.difficulty)}
              </span>
              ${isSolved ? '<span class="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold">✓ Bereits gelöst</span>' : ""}
            </div>
            <h2 class="text-base sm:text-lg font-bold text-white mt-1.5">${escapeHtml(ex.title)}</h2>
          </div>
          <p class="text-xs text-dark-muted">${escapeHtml(ex.description)}</p>
        </div>

        <p class="text-xs sm:text-sm text-dark-muted">
          Verschiebe die Code-Zeilen mit den Pfeilen <span class="font-bold text-blue-400">▲ / ▼</span> in die richtige logische Reihenfolge:
        </p>

        <!-- Puzzle List -->
        <div id="puzzleList" class="space-y-2 sm:space-y-2.5">
          ${this.puzzleState
            .map((item, idx) => {
              return `
              <div class="puzzle-line flex items-center justify-between gap-2 sm:gap-3 bg-dark-bg border border-dark-border hover:border-dark-dim/50 rounded-lg p-2.5 sm:p-3 transition-all overflow-hidden">
                <div class="flex items-center gap-2 sm:gap-3 font-mono text-[11px] sm:text-xs md:text-sm text-dark-text min-w-0 flex-1 overflow-x-auto custom-scroll py-0.5">
                  <span class="text-dark-dim select-none text-[10px] w-4 text-right shrink-0">${idx + 1}</span>
                  <span class="whitespace-nowrap font-mono">${escapeHtml(item.text)}</span>
                </div>
                <div class="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    type="button"
                    onclick="exerciseEngine.movePuzzleLine(${idx}, -1)"
                    ${idx === 0 ? "disabled" : ""}
                    class="p-1.5 sm:p-2 rounded-md bg-dark-card border border-dark-border text-dark-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
                    title="Nach oben"
                    aria-label="Nach oben"
                  >
                    <i data-lucide="chevron-up" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
                  </button>
                  <button
                    type="button"
                    onclick="exerciseEngine.movePuzzleLine(${idx}, 1)"
                    ${idx === this.puzzleState.length - 1 ? "disabled" : ""}
                    class="p-1.5 sm:p-2 rounded-md bg-dark-card border border-dark-border text-dark-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
                    title="Nach unten"
                    aria-label="Nach unten"
                  >
                    <i data-lucide="chevron-down" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
                  </button>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onclick="exerciseEngine.checkPuzzleOrder()"
            class="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <i data-lucide="check" class="w-4 h-4"></i>
            <span>Reihenfolge prüfen</span>
          </button>
          <div id="exerciseFeedback" class="text-xs sm:text-sm font-medium"></div>
        </div>
      `;
    }

    movePuzzleLine(index, direction) {
      const targetIdx = index + direction;
      if (targetIdx < 0 || targetIdx >= this.puzzleState.length) return;

      const temp = this.puzzleState[index];
      this.puzzleState[index] = this.puzzleState[targetIdx];
      this.puzzleState[targetIdx] = temp;

      this.renderCurrentExercise();
    }

    checkPuzzleOrder() {
      const ex = EXERCISES_PUZZLE.find((e) => e.id === this.currentExId);
      if (!ex) return;

      const isCorrect = this.puzzleState.every((item, idx) => item.id === ex.lines[idx].id);
      const feedback = document.getElementById("exerciseFeedback");

      if (isCorrect) {
        feedback.innerHTML = `<span class="text-emerald-400 flex items-center gap-1.5 font-bold">✓ Großartig! Der Code ist exakt in der richtigen Reihenfolge.</span>`;
        this.markSolved(ex.id);
        if (window.confetti) confetti();
      } else {
        feedback.innerHTML = `<span class="text-rose-400">Die Reihenfolge passt noch nicht ganz. Schau dir die Einrückungen und Initialisierungen an!</span>`;
      }
    }

    markSolved(exId) {
      if (!appState.solvedExercises.includes(exId)) {
        appState.solvedExercises.push(exId);
        appState.streak = appState.solvedExercises.length;
        saveState(appState);
        this.updateStreakBadge();
        this.renderDropdown();
      }
    }

    updateStreakBadge() {
      const countEl = document.getElementById("streakCount");
      if (countEl) countEl.textContent = appState.solvedExercises.length;
    }
  }

  const exerciseEngine = new ExerciseEngine();
  window.exerciseEngine = exerciseEngine;

  window.setExerciseSubMode = function (mode) {
    exerciseEngine.setSubMode(mode);
  };

  window.onExerciseChange = function () {
    const sel = document.getElementById("exerciseSelect");
    if (sel) {
      exerciseEngine.currentExId = sel.value;
      exerciseEngine.renderCurrentExercise();
    }
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.addEventListener("DOMContentLoaded", () => {
    const initialTab = appState.currentTab || "guide";
    switchTab(initialTab);
    exerciseEngine.updateStreakBadge();
  });
})();
