// ----------------------------------------------------------------------
// DATEI: assets/js/app.js
// INHALT: App Logik, Timer, Rendering (MIT ALLEN FEATURES & GEWICHTUNG 1-5)
// ----------------------------------------------------------------------

// 1. Daten holen (aus data.js)
const AP1_DATA = window.AP1_DATA || [];

if (AP1_DATA.length === 0) {
  console.error('FEHLER: data.js wurde nicht vor app.js geladen oder ist leer!');
}

// 2. App Logik
const app = {
  state: {},
  openTopics: new Set(),
  filter: 'all',
  recId: null,
  timer: null,
  timerRunning: false,
  timeLeft: 1500,
  searchQuery: '',

  quotes: [
    '„Jede Zeile Code ist ein Schritt zur Meisterschaft.“',
    '„Erfolg hat drei Buchstaben: TUN.“ - Goethe',
    '„Der beste Weg, die Zukunft vorherzusagen, ist, sie zu erfinden.“ - Alan Kay',
    '„Auch ein Wolkenkratzer fängt mal im Keller an.“',
    '„Debugging ist wie ein Krimi, in dem du Täter und Detektiv zugleich bist.“',
    '„IT ist 10% Technik und 90% Google.“',
    '„Ein Experte ist jemand, der in einem begrenzten Feld alle möglichen Fehler gemacht hat.“',
    '„Schmerz vergeht, der GitHub Commit bleibt.“',
  ],

  ranks: [
    { min: 0, name: 'Hello World', color: '#94a3b8' },
    { min: 2, name: 'Skript-Kiddie', color: '#64748b' },
    { min: 5, name: 'Junior Dev', color: '#0ea5e9' },
    { min: 8, name: 'Git Committer', color: '#10b981' },
    { min: 12, name: 'Code Monkey', color: '#f59e0b' },
    { min: 15, name: 'Stack Overflow Pro', color: '#f97316' },
    { min: 18, name: 'Senior Dev', color: '#ec4899' },
    { min: 21, name: 'Solution Architect', color: '#8b5cf6' },
    { min: 23, name: 'Root User', color: '#ef4444' },
    { min: 25, name: 'IT-Gott', color: '#FFDD00' },
  ],

  // --- INIT ---
  init() {
    const msgs = ['Lade Datenbank...', 'Initialisiere Module...', 'Berechne Lernpfad...'];
    let msgIdx = 0;
    const loadInt = setInterval(() => {
      const el = document.getElementById('loadingText');
      if (el) el.textContent = msgs[msgIdx++ % msgs.length];
    }, 150);

    const hideLoader = () => {
      clearInterval(loadInt);
      const el = document.getElementById('loadingOverlay');
      if (el) {
        el.classList.add('force-hide');
        setTimeout(() => (el.style.display = 'none'), 600);
      }
    };

    try {
      // WICHTIG: Nutzt deinen existierenden State-Key, damit Daten nicht verloren gehen
      const s = localStorage.getItem('ap1_dark_state_v1');
      if (s) this.state = JSON.parse(s);

      if (localStorage.getItem('ap1_infobox_dismissed')) {
        const infoBox = document.getElementById('infoBox');
        if (infoBox) infoBox.classList.add('hidden');
      }

      const quoteEl = document.getElementById('motivationQuote');
      if (quoteEl)
        quoteEl.textContent = this.quotes[Math.floor(Math.random() * this.quotes.length)];

      this.renderActivityGraph();
      this.updateCountdown();
      setInterval(() => this.updateCountdown(), 60000);
      this.render();
    } catch (err) {
      console.error('Critical Init Error:', err);
    } finally {
      setTimeout(hideLoader, 600);
    }
  },

  // --- SAVE & STATE ---
  save() {
    try {
      localStorage.setItem('ap1_dark_state_v1', JSON.stringify(this.state));
    } catch (e) {
      console.error('Storage quota exceeded or error', e);
    }
    this.updateStats();
  },

  hideInfoBox() {
    const el = document.getElementById('infoBox');
    if (el) el.remove();
    localStorage.setItem('ap1_infobox_dismissed', 'true');
  },

  getState(id) {
    if (!this.state[id])
      this.state[id] = {
        done: false,
        subDone: [],
        stars: 0,
        reps: [false, false, false],
        last: null,
      };
    return this.state[id];
  },

  trackActivity() {
    if (!this.state.activity) this.state.activity = {};
    const today = new Date().toISOString().split('T')[0];
    this.state.activity[today] = (this.state.activity[today] || 0) + 1;
    this.save();
    this.renderActivityGraph();
  },

  renderActivityGraph() {
    const container = document.getElementById('streakGraph');
    if (!container) return;
    container.innerHTML = '';
    const days = 40;
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = this.state.activity ? this.state.activity[dateStr] || 0 : 0;

      let colorClass = 'bg-dark-border';
      if (count > 0) colorClass = 'bg-dark-accent/40';
      if (count > 4) colorClass = 'bg-dark-accent/70';
      if (count > 8) colorClass = 'bg-dark-accent';

      const el = document.createElement('div');
      el.className = `w-3 h-3 sm:w-4 sm:h-4 rounded-sm ${colorClass} streak-cell cursor-default`;
      el.title = `${dateStr}: ${count} Aktionen`;
      container.appendChild(el);
    }
  },

  // --- TIMER ---
  updateCountdown() {
    const target = new Date('2026-02-25T08:00:00');
    const now = new Date();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    const el = document.getElementById('headerCountdown');
    if (el) el.textContent = diff > 0 ? diff : '0';
  },

  setPomoTime(min) {
    if (this.timerRunning) {
      if (!confirm('Timer läuft. Wirklich abbrechen?')) return;
      clearInterval(this.timer);
      this.timerRunning = false;
      document.getElementById('pomoBtn').innerHTML =
        '<i class="fa-solid fa-play text-lg ml-1"></i>';
    }
    this.timeLeft = min * 60;
    this.updateTimerDisplay();
  },

  updateTimerDisplay() {
    const m = Math.floor(this.timeLeft / 60)
      .toString()
      .padStart(2, '0');
    const s = (this.timeLeft % 60).toString().padStart(2, '0');
    document.getElementById('pomoTimer').textContent = `${m}:${s}`;
    document.title = this.timerRunning ? `${m}:${s} - Focus` : 'AP1 Tracker';
  },

  togglePomodoro() {
    const btn = document.getElementById('pomoBtn');
    if (this.timerRunning) {
      clearInterval(this.timer);
      this.timerRunning = false;
      btn.innerHTML = '<i class="fa-solid fa-play text-lg ml-1"></i>';
      btn.classList.remove('bg-dark-accent', 'text-white', 'scale-105');
      btn.classList.add('bg-dark-border', 'text-dark-muted');
    } else {
      this.timerRunning = true;
      btn.innerHTML = '<i class="fa-solid fa-pause text-lg"></i>';
      btn.classList.add('bg-dark-accent', 'text-white', 'scale-105');
      btn.classList.remove('bg-dark-border', 'text-dark-muted');
      this.timer = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          clearInterval(this.timer);
          this.timerRunning = false;
          this.timeLeft = 1500;

          alert('Pomodoro beendet! Gönn dir eine Pause.');
          btn.innerHTML = '<i class="fa-solid fa-play text-lg ml-1"></i>';
          btn.classList.remove('bg-dark-accent', 'text-white', 'scale-105');
          btn.classList.add('bg-dark-border', 'text-dark-muted');
        }
        this.updateTimerDisplay();
      }, 1000);
    }
  },

  // --- IMPORT / EXPORT ---
  exportData() {
    const dataStr = JSON.stringify(this.state);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute(
      'download',
      'ap1_master_backup_' + new Date().toISOString().slice(0, 10) + '.json'
    );
    linkElement.click();
  },

  importData(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        this.state = JSON.parse(e.target.result);
        this.save();
        alert('Backup erfolgreich geladen!');
        location.reload();
      } catch (err) {
        alert('Fehler beim Laden der Datei. Format ungültig.');
      }
    };
    reader.readAsText(file);
  },

  resetData() {
    if (confirm('Wirklich ALLE Daten unwiderruflich löschen?')) {
      localStorage.removeItem('ap1_dark_state_v1');
      localStorage.removeItem('ap1_infobox_dismissed');
      location.reload();
    }
  },

  // --- INTERACTION ---
  search() {
    this.searchQuery = document.getElementById('searchInput').value.toLowerCase();
    this.render();
  },

  toggleTopic(id, checked, element) {
    const s = this.getState(id);
    const t = this.findTopic(id);
    s.done = checked;
    s.last = Date.now();

    if (t && t.sub) {
      s.subDone = new Array(t.sub.length).fill(checked);
      const card = element.closest('.topic-card');
      const subs = card.querySelectorAll('.subtask-list input');
      const texts = card.querySelectorAll('.subtask-list span');
      subs.forEach((input) => (input.checked = checked));
      texts.forEach((span) => {
        if (checked) {
          span.classList.add('line-through', 'opacity-50');
          span.classList.remove('group-hover/item:text-white');
        } else {
          span.classList.remove('line-through', 'opacity-50');
          span.classList.add('group-hover/item:text-white');
        }
      });
    }

    const card = element.closest('.topic-card');
    if (checked) card.classList.add('border-dark-accent/30');
    else card.classList.remove('border-dark-accent/30');

    this.trackActivity();
    this.save();

    if (checked) {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0ea5e9', '#10b981'],
        });
      }
    }
    this.updateStats(); // Update stats immediately
  },

  toggleSub(id, idx, checked, element) {
    const s = this.getState(id);
    const t = this.findTopic(id);
    if (!s.subDone) s.subDone = [];
    s.subDone[idx] = checked;

    const doneCount = s.subDone.filter(Boolean).length;
    const allDone = doneCount === t.sub.length && t.sub.length > 0;

    if (s.done !== allDone) {
      s.done = allDone;
      const card = element.closest('.topic-card');
      const mainCheck = card.querySelector('.topic-check');
      if (mainCheck) {
        mainCheck.checked = allDone;
        if (allDone) {
          card.classList.add('border-dark-accent/30');
          if (typeof confetti === 'function') {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#0ea5e9', '#10b981'],
            });
          }
        } else card.classList.remove('border-dark-accent/30');
      }
    }

    const span = element.parentElement.nextElementSibling;
    if (checked) {
      span.classList.add('line-through', 'opacity-50');
      span.classList.remove('group-hover/item:text-white');
    } else {
      span.classList.remove('line-through', 'opacity-50');
      span.classList.add('group-hover/item:text-white');
    }

    s.last = Date.now();
    this.trackActivity();
    this.save();
    this.updateStats(); // Update stats immediately
  },

  randomTopic() {
    const open = [];
    AP1_DATA.forEach((cat) => {
      cat.topics.forEach((t) => {
        if (!this.getState(t.id).done) open.push(t.id);
      });
    });

    if (open.length === 0) {
      alert('Wow! Alles erledigt! Du bist bereit.');
      return;
    }
    const randId = open[Math.floor(Math.random() * open.length)];
    this.recId = randId;
    this.scrollToRec();
  },

  toggleAccordion(header) {
    const body = header.nextElementSibling;
    const icon = header.querySelector('.accordion-icon');
    const topicId = header.closest('.topic-card').dataset.id;

    if (body.classList.contains('open')) {
      body.classList.remove('open');
      icon.style.transform = 'rotate(0deg)';
      icon.classList.remove('bg-dark-accent', 'text-white');
      icon.classList.add('bg-dark-bg/50', 'text-dark-muted');
      this.openTopics.delete(topicId);
    } else {
      body.classList.add('open');
      icon.style.transform = 'rotate(180deg)';
      icon.classList.add('bg-dark-accent', 'text-white');
      icon.classList.remove('bg-dark-bg/50', 'text-dark-muted');
      this.openTopics.add(topicId);
    }
  },

  setRep(id, level, element) {
    const s = this.getState(id);
    let newState = [false, false, false];
    let currentMax = -1;
    if (s.reps[2]) currentMax = 2;
    else if (s.reps[1]) currentMax = 1;
    else if (s.reps[0]) currentMax = 0;

    if (currentMax === level) {
      if (level === 0) newState = [false, false, false];
      else {
        for (let i = 0; i < level; i++) newState[i] = true;
      }
    } else {
      for (let i = 0; i <= level; i++) newState[i] = true;
    }

    s.reps = newState;
    this.save();
    const card = element.closest('.topic-card');
    const checkboxes = card.querySelectorAll('.rep-check');
    checkboxes.forEach((cb, idx) => {
      cb.checked = s.reps[idx];
    });
    this.updateRepHeader(card, s.reps);
  },

  updateRepHeader(card, reps) {
    const count = reps.filter(Boolean).length;
    const badge = card.querySelector('.rep-indicator');
    if (count > 0) {
      badge.textContent = count + 'x Wiederholt';
      badge.classList.remove('hidden');
      if (count === 3)
        badge.classList.add('bg-dark-success/20', 'text-dark-success', 'border-dark-success/30');
      else
        badge.classList.remove('bg-dark-success/20', 'text-dark-success', 'border-dark-success/30');
    } else {
      badge.classList.add('hidden');
    }
  },

  setFilter(f) {
    this.filter = f;
    document.querySelectorAll('.filter-btn').forEach((b) => {
      if (b.dataset.filter === f) {
        b.classList.add('bg-dark-card', 'text-white', 'border-dark-border');
        b.classList.remove('text-dark-muted', 'border-transparent');
      } else {
        b.classList.remove('bg-dark-card', 'text-white', 'border-dark-border');
        b.classList.add('text-dark-muted', 'border-transparent');
      }
    });
    this.render();
  },

  findTopic(id) {
    for (const c of AP1_DATA) {
      const f = c.topics.find((t) => t.id === id);
      if (f) return f;
    }
    return null;
  },

  scrollToRec() {
    if (!this.recId) return;
    if (this.filter !== 'all') this.setFilter('all');
    setTimeout(() => {
      const el = document.querySelector(`.topic-card[data-id="${this.recId}"]`);
      if (el) {
        const body = el.querySelector('.topic-body');
        const header = el.querySelector('.header-area');
        if (!body.classList.contains('open')) {
          this.toggleAccordion(header);
        }
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-dark-accent', 'shadow-glow');
        setTimeout(() => el.classList.remove('ring-2', 'ring-dark-accent', 'shadow-glow'), 2000);
      }
    }, 100);
  },

  resetCategory(catId) {
    if (!confirm('Wirklich den Fortschritt dieser Kategorie zurücksetzen?')) return;
    const cat = AP1_DATA.find((c) => c.id === catId);
    if (cat) {
      cat.topics.forEach((t) => {
        if (this.state[t.id]) {
          this.state[t.id].done = false;
          this.state[t.id].subDone = [];
          this.state[t.id].reps = [false, false, false];
        }
      });
      this.save();
      this.render();
    }
  },

  // --- LEGAL / MODALS ---
  openLegal(type) {
    const modal = document.getElementById('legalModal');
    const content = document.getElementById('legalContent');
    modal.classList.remove('hidden');

    if (type === 'impressum') {
      content.innerHTML = `
              <h1 class="text-2xl font-bold text-dark-accent mb-6">Impressum</h1>
              <div class="space-y-4 text-dark-text">
                <p><strong>Angaben gemäß § 5 TMG</strong></p>
                <p>
                  Christoph Willam<br />
                  Tocklergasse 14<br />
                  96129 Strullendorf
                </p>
                <h2 class="text-xl font-semibold mt-6 mb-2">Kontakt</h2>
                <p>E-Mail: <a href="mailto:info@cwillam.de" class="text-dark-accent hover:underline">info@cwillam.de</a></p>
                <h2 class="text-xl font-semibold mt-6 mb-2">Berufsbezeichnung</h2>
                <p>Fachinformatiker für Anwendungsentwicklung</p>
                <p class="text-xs text-dark-muted mt-8">Quelle: <a href="https://www.e-recht24.de" target="_blank" class="hover:underline">e-recht24.de</a></p>
              </div>
            `;
    } else {
      content.innerHTML = `
                <h1 class="text-2xl font-bold text-dark-accent mb-6">Datenschutz</h1>
                <div class="space-y-4 text-dark-text text-sm">

                  <h2 class="text-lg font-bold text-white">1. Grundlegendes</h2>
                  <p>Diese Datenschutzerklärung klärt Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten innerhalb unseres Online-Angebotes auf.</p>

                  <h2 class="text-lg font-bold text-white mt-4">2. Hosting & Server-Logfiles (IONOS)</h2>
                  <p>Wir hosten diese Website bei <strong>IONOS SE</strong> (Elgendorfer Str. 57, 56410 Montabaur). <br>
                  Der Provider erhebt und speichert automatisch Informationen in so genannten Server-Logfiles, die Ihr Browser automatisch an uns übermittelt. Dies sind:</p>
                  <ul class="list-disc pl-5 text-dark-muted">
                    <li>Browsertyp und Browserversion</li>
                    <li>Verwendetes Betriebssystem</li>
                    <li>Referrer URL</li>
                    <li>Hostname des zugreifenden Rechners</li>
                    <li>Uhrzeit der Serveranfrage</li>
                    <li>IP-Adresse</li>
                  </ul>
                  <p>Diese Daten werden nicht mit anderen Datenquellen zusammengeführt. Die Erfassung dieser Daten erfolgt auf Grundlage von <strong>Art. 6 Abs. 1 lit. f DSGVO</strong>. Der Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien Darstellung und der Optimierung seiner Website – hierzu müssen die Server-Logfiles erfasst werden. Die Daten werden nach 7 Tagen automatisch gelöscht.</p>

                  <h2 class="text-lg font-bold text-white mt-4">3. Lokale Speicherung (LocalStorage)</h2>
                  <p>Diese Anwendung speichert Ihren Lernfortschritt (Status der Checkboxen, Timer-Einstellungen) ausschließlich lokal in Ihrem Browser ("LocalStorage").</p>
                  <p><strong>Rechtsgrundlage:</strong> Die Speicherung ist für die Funktion der Website (Lern-Tracker) <strong>unbedingt erforderlich</strong> (gemäß § 25 Abs. 2 Nr. 2 TTDSG). Ohne diese Speicherung kann der Dienst "Fortschrittskontrolle" nicht erbracht werden. Es findet <strong>kein Tracking</strong>, keine Analyse und keine Weitergabe an Dritte statt. Die Daten verlassen Ihr Endgerät nicht.</p>

                  <h2 class="text-lg font-bold text-white mt-4">4. Externe Dienste</h2>
                  <p>Diese Website arbeitet <strong>autark</strong>. Es werden keine externen CDNs (Content Delivery Networks), keine Google Fonts und keine externen Analysetools (wie Google Analytics) eingesetzt. Alle Skripte und Ressourcen werden vom eigenen Server geladen.</p>

                  <h2 class="text-lg font-bold text-white mt-4">5. Ihre Rechte</h2>
                  <p>Bezüglich der Server-Logs haben Sie das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung. Da die Lerndaten nur auf Ihrem Gerät liegen, haben wir auf diese keinen Zugriff – Sie können diese Daten jederzeit selbst löschen, indem Sie den Browser-Cache leeren oder den "Reset"-Button in der App nutzen.</p>
                </div>
            `;
    }
  },

  closeLegal() {
    document.getElementById('legalModal').classList.add('hidden');
  },

  // --- RENDER ---
  updateStats() {
    const all = AP1_DATA.flatMap((c) => c.topics);
    const total = all.length;
    const done = all.filter((t) => this.getState(t.id).done).length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);

    const totalTopEl = document.getElementById('totalPercentTop');
    if (totalTopEl) totalTopEl.textContent = pct + '%';

    const mainProgress = document.getElementById('mainProgressBar');
    if (mainProgress) mainProgress.style.width = pct + '%';

    const doneCountEl = document.getElementById('doneCount');
    if (doneCountEl) doneCountEl.textContent = done;

    let currentRank = this.ranks[0];
    let nextRank = null;
    let rankPct = 0;

    for (let i = 0; i < this.ranks.length; i++) {
      if (done >= this.ranks[i].min) {
        currentRank = this.ranks[i];
        nextRank = this.ranks[i + 1] || null;
      }
    }

    const rankNameEl = document.getElementById('levelName');
    if (rankNameEl) {
      rankNameEl.textContent = currentRank.name;
      rankNameEl.style.color = currentRank.color;
    }

    if (nextRank) {
      const range = nextRank.min - currentRank.min;
      const currentInRank = done - currentRank.min;
      rankPct = (currentInRank / range) * 100;
    } else {
      rankPct = 100;
    }

    const rankBar = document.getElementById('levelProgress');
    if (rankBar) {
      rankBar.style.width = rankPct + '%';
      rankBar.style.backgroundColor = currentRank.color;
    }

    let best = null,
      maxScore = -1;
    all.forEach((t) => {
      const s = this.getState(t.id);
      if (!s.done) {
        const score = t.weight * 10 + Math.random() * 5;
        if (score > maxScore) {
          maxScore = score;
          best = t;
        }
      }
    });
    const recShort = document.getElementById('recShort');
    if (recShort) {
      if (best) {
        this.recId = best.id;
        recShort.textContent = `${best.title}`;
      } else {
        this.recId = null;
        recShort.textContent = 'Alles erledigt!';
      }
    }
  },

  render() {
    const list = document.getElementById('contentList');
    if (!list) return;
    list.innerHTML = '';
    let hasVisible = false;

    const activityDates = Object.keys(this.state.activity || {});
    if (activityDates.length > 0) {
      const badge = document.getElementById('streakBadge');
      if (badge) badge.classList.remove('hidden');
      const streakCount = document.getElementById('streakCount');
      if (streakCount) streakCount.textContent = activityDates.length;
    }

    AP1_DATA.forEach((cat) => {
      const visibleTopics = cat.topics.filter((t) => {
        const s = this.getState(t.id);
        let matchesSearch = true;
        if (this.searchQuery) {
          matchesSearch =
            t.title.toLowerCase().includes(this.searchQuery) ||
            t.sub.some((sub) => sub.toLowerCase().includes(this.searchQuery));
        }
        if (!matchesSearch) return false;
        if (this.filter === 'open' && s.done) return false;
        if (this.filter === 'high' && t.weight < 3) return false;
        return true;
      });

      if (visibleTopics.length === 0) return;
      hasVisible = true;

      const catNode = document.getElementById('tpl-category').content.cloneNode(true);
      catNode.querySelector('.cat-title').textContent = cat.name;
      const descEl = catNode.querySelector('.cat-desc');
      if (descEl) descEl.textContent = cat.desc;
      catNode.querySelector('.cat-reset').onclick = () => this.resetCategory(cat.id);

      const container = catNode.querySelector('.cat-topics');

      visibleTopics.forEach((t) => {
        const s = this.getState(t.id);
        const node = document.getElementById('tpl-topic').content.cloneNode(true);
        const card = node.querySelector('.topic-card');
        card.dataset.id = t.id;

        if (
          this.openTopics.has(t.id) ||
          (this.searchQuery && t.sub.some((sub) => sub.toLowerCase().includes(this.searchQuery)))
        ) {
          node.querySelector('.topic-body').classList.add('open');
          const icon = node.querySelector('.accordion-icon');
          icon.style.transform = 'rotate(180deg)';
          icon.classList.add('bg-dark-accent', 'text-white');
          icon.classList.remove('bg-dark-bg/50', 'text-dark-muted');
        }

        node.querySelector('.topic-title').textContent = t.title;
        node.querySelector(
          '.time-label'
        ).innerHTML = `<i class="fa-regular fa-clock mr-1"></i>~${t.time} min`;

        const repIndicator = node.querySelector('.rep-indicator');
        const repCount = s.reps.filter(Boolean).length;
        if (repCount > 0) {
          repIndicator.textContent = repCount + 'x Wiederholt';
          repIndicator.classList.remove('hidden');
          if (repCount === 3)
            repIndicator.classList.add(
              'bg-dark-success/20',
              'text-dark-success',
              'border-dark-success/30'
            );
        }

        const googleLinks = node.querySelectorAll('.google-link, .google-link-mobile');
        googleLinks.forEach((gl) => {
          gl.href = `https://www.google.com/search?q=Fachinformatiker+AP1+${encodeURIComponent(
            t.title
          )}`;
        });
        const duckduckgoLink = node.querySelectorAll('.duckduckgo-link, .duckduckgo-link-mobile');
        duckduckgoLink.forEach((dl) => {
          dl.href = `https://www.duckduckgo.com/?q=Fachinformatiker+AP1+${encodeURIComponent(
              t.title
          )}`;
        });

        // -------------------------------------------------------------
        // NEUE GEWICHTUNGSLOGIK (1-5)
        // -------------------------------------------------------------
        const wb = node.querySelector('.weight-badge');
        if (t.weight >= 4) {
          // 4 & 5 -> SEHR HOCH (Rot)
          wb.textContent = 'SEHR HOCH';
          wb.classList.add('text-dark-danger', 'border-dark-danger/30', 'bg-dark-danger/10');
        } else if (t.weight === 3) {
          // 3 -> HOCH (Orange)
          wb.textContent = 'HOCH';
          wb.classList.add('text-dark-warning', 'border-dark-warning/30', 'bg-dark-warning/10');
        } else if (t.weight === 2) {
          // 2 -> MITTEL (Grün)
          wb.textContent = 'MITTEL';
          wb.classList.add('text-dark-success', 'border-dark-success/30', 'bg-dark-success/10');
        } else {
          // 1 -> NIEDRIG (Grau)
          wb.textContent = 'NIEDRIG';
          wb.classList.add('text-dark-muted', 'border-dark-border', 'bg-dark-bg');
        }
        // -------------------------------------------------------------

        const cb = node.querySelector('.topic-check');
        cb.checked = s.done;
        cb.onchange = (e) => this.toggleTopic(t.id, e.target.checked, e.target);

        if (s.done) card.classList.add('border-dark-accent/30');
        node.querySelector('.header-area').onclick = (e) => this.toggleAccordion(e.currentTarget);

        const ul = node.querySelector('.subtask-list');
        t.sub.forEach((sub, idx) => {
          const isDone = s.subDone && s.subDone[idx];
          const li = document.createElement('li');
          li.className = 'flex items-start gap-3 text-xs text-dark-muted group/item transition-all';
          li.innerHTML = `
                  <div class="shrink-0 flex items-center justify-center w-5 h-5 relative">
                      <input type="checkbox" class="peer appearance-none w-4 h-4 rounded border border-dark-border bg-dark-bg checked:bg-dark-accent checked:border-dark-accent cursor-pointer transition-colors" ${
                        isDone ? 'checked' : ''
                      }>
                      <i class="fa-solid fa-check text-[10px] text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"></i>
                  </div>
                  <span class="transition-colors cursor-pointer pt-0.5 ${
                    isDone ? 'line-through opacity-50' : 'group-hover/item:text-white'
                  }">${sub}</span>
                `;
          const subCb = li.querySelector('input');
          subCb.onclick = (e) => e.stopPropagation();
          subCb.onchange = (e) => this.toggleSub(t.id, idx, e.target.checked, e.target);
          li.querySelector('span').onclick = (e) => {
            e.stopPropagation();
            subCb.click();
          };
          ul.appendChild(li);
        });

        const reps = node.querySelectorAll('.rep-check');
        reps.forEach((r, i) => {
          r.checked = s.reps[i];
          r.onchange = (e) => this.setRep(t.id, i, e.target);
        });

        container.appendChild(node);
      });
      list.appendChild(catNode);
    });

    const emptyState = document.getElementById('emptyState');
    if (emptyState) emptyState.classList.toggle('hidden', hasVisible);
    this.updateStats();
  },
};

document.addEventListener('DOMContentLoaded', () => app.init());
