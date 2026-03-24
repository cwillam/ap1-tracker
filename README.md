# 🚀 AP1 Tracker - Dein Lernbegleiter

[![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)](https://github.com/cwillam/ap1-tracker)
[![License](https://img.shields.io/badge/License-AGPLv3-blue?style=for-the-badge)](LICENSE)
[![Hosting](https://img.shields.io/badge/Hosted_on-IONOS-003D51?style=for-the-badge&logo=ionos)](https://ap1.cwillam.de)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Local-green?style=for-the-badge)](https://ap1.cwillam.de)
[![Version](https://img.shields.io/badge/Version-v2.0.1-blue?style=for-the-badge)](https://ap1.cwillam.de)

> **Ein moderner, lokaler Fortschritts-Tracker für die Fachinformatiker Abschlussprüfung Teil 1.**  Keine Anmeldung. Kein Tracking. Deine Daten gehören dir.

---

## 🌐 Live Demo

Das Projekt ist live und einsatzbereit gehostet:

### 👉 [https://ap1.cwillam.de](https://ap1.cwillam.de)

---

## 💡 Über das Projekt

Der **AP1 Tracker** wurde entwickelt, um Fachinformatikern eine strukturierte Übersicht über die Lerninhalte der Abschlussprüfung Teil 1 zu geben.

Das Ziel war eine **„Offline-First" Web-App**, die sich wie eine native Anwendung anfühlt, aber komplett im Browser läuft. Der Fokus lag auf sauberem Code, Performance und maximalem Datenschutz.

### ✨ Features

- **Persistent Storage:** Speicherung des Lernfortschritts via `LocalStorage` (bleibt nach Neustart erhalten).
- **Gamification:** Ränge, Streaks und Konfetti-Belohnungen für Motivation.
- **Focus Timer:** Integrierter Pomodoro-Timer für effektive Lernphasen.
- **Smart Search:** Echtzeit-Filterung und direkte Google-Suche für Themen.
- **Responsive Design:** Optimiert für Desktop und Mobile (Tailwind CSS).
- **Import/Export:** JSON-basierte Backup-Funktion der eigenen Daten.
- **Lernkarten:** 1.228 Karten für alle 27 Themen (Anki-Style mit Strategie-Modus).
- **Safety-Fixes:** Import-Validierung, Storage-Monitoring, Corrupt-Data-Protection.

---

## 🛠️ Tech Stack & Workflow

Dieses Projekt ist ein Showcase für moderne Web-Entwicklung mit KI-Unterstützung. Es wurde bewusst auf komplexe Frameworks (React/Vue) verzichtet, um "Vanilla Web Technologies" auszureizen.

| Bereich                 | Technologie                                                                     |
| :---------------------- | :------------------------------------------------------------------------------ |
| **Frontend**            | HTML5, Vanilla JavaScript (ES6+)                                                |
| **Styling**             | Tailwind CSS (Lokal eingebunden)                                                |
| **Icons**               | FontAwesome (Lokal gehostet)                                                    |
| **Animation**           | Canvas Confetti                                                                 |
| **IDE**                 | VS Code                                                                         |
| **AI Pair Programming** | **Gemini 3 Pro** (Coding Logic) + **Perplexity Pro** (Research & Fact Checking) |

---

## 🔒 Privacy by Design

Datenschutz war ein Kernaspekt der Architektur. Um das Projekt rechtssicher und datensparsam bereitzustellen:

1.  **Keine Cookies:** Es werden keine Tracking-Cookies gesetzt.
2.  **Keine externen Requests:** Alle Bibliotheken (Tailwind, FontAwesome, JS) liegen lokal auf dem Server. Es fließen keine Daten an Google-Server oder CDNs (USA).
3.  **Local Data:** Alle User-Eingaben bleiben auf dem Endgerät des Nutzers.

---

## 📝 Changelog

### v2.0.1 (24. März 2026)
- ✅ **Lernkarten-System:** 1.228 Karten für alle 27 Themen (optimiert für AP1)
- ✅ **Safety-Fixes:** Import-Validierung, Storage-Monitoring, Corrupt-Data-Protection
- ✅ **Smart Focus 2.0:** Intelligente Empfehlung (Gewicht + Fortschritt + Reps)
- ✅ **Firefox-Fix:** Lernkarten-Button jetzt in allen Browsern klickbar
- ✅ **Modal:** Full-Screen Design (Strategie-Modus + Freies Training)
- ✅ **Optimiert:** Pseudocode-Fragen, Diagramm-Fragen, Verständnis-Fragen

### v1.3 (05. März 2026)
- AP1 Themen bereinigt (SQL, RAID, SAN, Rechtsformen entfernt)
- Prüfungs-Timer auf Herbst 2026 (30.09.) aktualisiert
- Kaufmännische Basics & Marktformen präzisiert

---

## 🔮 Roadmap

Das Projekt wird stetig optimiert. Geplante Erweiterungen:

- [ ] **Lernzettel & Skripte:** Bereitstellung von Zusammenfassungen (PDF/Markdown) direkt an den Themen.
- [ ] **Dark/Light Mode Toggle:** Manuelle Umschaltung des Designs.
- [ ] **PWA Support:** Installation als App auf dem Homescreen.

---

## ⚠️ Disclaimer

_Alle Lerninhalte wurden nach bestem Wissen und Gewissen auf Basis der aktuellen IHK-Prüfungskataloge zusammengestellt. Ich gebe mein Bestes, alles aktuell und korrekt zu halten, übernehme jedoch keine Gewähr für die Vollständigkeit oder Richtigkeit der prüfungsrelevanten Themen._

---

## ☕ Support

Gefällt dir das Projekt? Unterstütze meine Arbeit gerne mit einem Kaffee!

<a href="https://www.buymeacoffee.com/cwillam" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

---

## 📜 Lizenz

Dieses Projekt ist unter der **GNU Affero General Public License v3.0 (AGPLv3)** lizienziert.
