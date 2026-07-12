# AP1 Tracker - Dein Lernbegleiter

[![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)](https://github.com/cwillam/ap1-tracker)
[![License](https://img.shields.io/badge/License-AGPLv3-blue?style=for-the-badge)](LICENSE)
[![Hosting](https://img.shields.io/badge/Hosted_on-IONOS-003D51?style=for-the-badge&logo=ionos)](https://ap1.cwillam.de)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Local-green?style=for-the-badge)](https://ap1.cwillam.de)
[![Version](https://img.shields.io/badge/Version-v2.3.0-blue?style=for-the-badge)](https://ap1.cwillam.de)

> **Ein moderner, lokaler Fortschritts-Tracker für die Fachinformatiker Abschlussprüfung Teil 1.** Keine Anmeldung. Kein Tracking. Deine Daten gehören dir.

---

## Live Demo

Das Projekt ist live und einsatzbereit gehostet:

### 👉 [https://ap1.cwillam.de](https://ap1.cwillam.de)

---

## Über das Projekt

Der **AP1 Tracker** wurde entwickelt, um Fachinformatikern eine strukturierte Übersicht über die Lerninhalte der Abschlussprüfung Teil 1 zu geben.

Das Ziel war eine **„Offline-First" Web-App**, die sich wie eine native Anwendung anfühlt, aber komplett im Browser läuft. Der Fokus lag auf sauberem Code, Performance und maximalem Datenschutz.

### Features

- **Persistent Storage:** Speicherung des Lernfortschritts via `LocalStorage` (bleibt nach Neustart erhalten).
- **Gamification:** Ränge, Streaks und Konfetti-Belohnungen für Motivation.
- **Focus Timer:** Integrierter Pomodoro-Timer für effektive Lernphasen.
- **Smart Search:** Echtzeit-Filterung und direkte Google-Suche für Themen.
- **Responsive Design:** Optimiert für Desktop und Mobile (Tailwind CSS).
- **Import/Export:** JSON-basierte Backup-Funktion der eigenen Daten.
- **Lernkarten:** 1.228 Karten für alle 27 Themen (Anki-Style mit Strategie-Modus und Tastatur-Shortcuts).
- **Safety-Fixes:** Import-Validierung, Storage-Monitoring, Corrupt-Data-Protection.

---

## Tech Stack & Workflow

Dieses Projekt ist ein Showcase für moderne Web-Entwicklung mit KI-Unterstützung. Es wurde bewusst auf komplexe Frameworks (React/Vue) verzichtet, um "Vanilla Web Technologies" auszureizen.

| Bereich                 | Technologie                                                                     |
| :---------------------- | :------------------------------------------------------------------------------ |
| **Frontend**            | HTML5, Vanilla JavaScript (ES6+)                                                |
| **Styling**             | Tailwind CSS (Lokal eingebunden)                                                |
| **Icons**               | Lucide Icons (Lokal gehostet)                                                   |
| **Animation**           | Canvas Confetti                                                                 |
| **IDE**                 | VS Code                                                                         |
| **AI Pair Programming** | API-Unterstützung durch **Gemini**, **Perplexity** und die **MiniMaxM3 API**    |

---

## Privacy by Design

Datenschutz war ein Kernaspekt der Architektur. Um das Projekt rechtssicher und datensparsam bereitzustellen:

1.  **Keine Cookies:** Es werden keine Tracking-Cookies gesetzt.
2.  **Keine externen Requests:** Alle Bibliotheken (Tailwind, Lucide, JS) liegen lokal auf dem Server. Es fließen keine Daten an Google-Server oder CDNs (USA).
3.  **Local Data:** Alle User-Eingaben bleiben auf dem Endgerät des Nutzers.

---

## Changelog

### v2.3.0 (12. Juli 2026)
- **PWA-Support:** Vollwertige Progressive Web App mit Service Worker (Offline-Caching) für 100% Offline-Fähigkeit der Lernkarten.
- **Homescreen-Installation:** Mobil-optimierte PWA-Meta-Tags und `apple-touch-icon` für die Homescreen-Installation auf iOS & Android.
- **Kaffeekasse-Modal:** Neues Spenden-Modal mit direkten Optionen für PayPal (spendenfrei) und Buy Me a Coffee.
- **Theme-Konsistenz:** Vereinheitlichung der theme-color Meta-Tags und des PWA-Brandings auf allen Unterseiten.

### v2.2.1 (23. Juni 2026)
- **Modul-Fortschrittskreise:** Zirkuläre SVG-Verlaufsringe visualisieren den Lernfortschritt pro Modul und leuchten grün bei 100%
- **Tastatur-Shortcuts:** Lernkarten-Steuerung über Leertaste, Eingabe, Pfeiltasten und Esc (ausführliche Erklärungen in der neuen Hilfe-Sektion)
- **Aktivitäts-Graph:** Erhöhung des Aktivitätszeitfensters von 40 auf 80 Tage für einen besseren Lernüberblick
- **Hilfe-System:** Integration einer ausführlichen Hilfeseite (`help.html`) mit praktischen Tipps zu Caching, Backups und Fehlerberichten

### v2.1.1 (22. Juni 2026)
- **Lucide Icons:** Komplette Migration auf ressourcenschonende Vektorgrafiken (vollständig offline-fähig)
- **Sleek Header Tiles:** Modernisierung des Navigations-Headers im Kacheldesign mit flüssigen Hover-Animations
- **Lernkarten-Fixes:** Fehlerbehebung bei den Trainings-Modi, optimierte Textgrößen und verbesserte Layout-Zentrierung
- **Fokus-Timer:** Play/Pause-Steuerung und Widget-Layout-Zentrierung korrigiert
- **Mobile Optimierung:** Responsive Kachelgrößen und optimierte Spacings für kleinere Bildschirme

### v2.1.0 (24. März 2026)
- **Update-Notification Modal:** Informiert Nutzer über neue Features & Lernkarten
- **SEO-Optimierung:** Google Indexierung für alle Fachrichtungen (FI-AE, FI-SI, FI-DP, Digitale Vernetzung)
- **Sitemap & robots.txt:** Für bessere Suchmaschinen-Integration
- **Structured Data:** Schema.org Markup für EducationalApplication
- **Meta-Tags:** Optimierte Beschreibungen & Keywords für alle IHK-Fachrichtungen

### v2.0.1 (24. März 2026)
- **Lernkarten-System:** 1.228 Karten für alle 27 Themen (optimiert für AP1)
- **Safety-Fixes:** Import-Validierung, Storage-Monitoring, Corrupt-Data-Protection
- **Smart Focus 2.0:** Intelligente Empfehlung (Gewicht + Fortschritt + Reps)
- **Firefox-Fix:** Lernkarten-Button jetzt in allen Browsern klickbar
- **Modal:** Full-Screen Design (Strategie-Modus + Freies Training)
- **Optimiert:** Pseudocode-Fragen, Diagramm-Fragen, Verständnis-Fragen

### v1.3 (05. März 2026)
- AP1 Themen bereinigt (SQL, RAID, SAN, Rechtsformen entfernt)
- Prüfungs-Timer auf Herbst 2026 (30.09.) aktualisiert
- Kaufmännische Basics & Marktformen präzisiert

---

## Roadmap

Das Projekt wird stetig optimiert. Aktueller Entwicklungsstand:

- [x] **PWA-Unterstützung:** Installation als App auf dem Homescreen/Desktop und 100% Offline-Fähigkeit via Service Worker.
- [ ] **In Arbeit: Lernzettel & Skripte:** Inkl. Fragen, Diagramme und Zusammenfassungen für alle AP1 Themen.
- [ ] **Geplant: Druck-Ansicht:** CSS-Optimierungen für den Ausdruck der Checklisten auf Papier.

---

## Disclaimer

_Alle Lerninhalte wurden nach bestem Wissen und Gewissen auf Basis der aktuellen IHK-Prüfungskataloge zusammengestellt. Ich gebe mein Bestes, alles aktuell und korrekt zu halten, übernehme jedoch keine Gewähr für die Vollständigkeit oder Richtigkeit der prüfungsrelevanten Themen._

---

## Support

Gefällt dir das Projekt? Unterstütze meine Arbeit gerne mit einem Kaffee!

<a href="https://www.buymeacoffee.com/cwillam" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

---

## Lizenz

Dieses Projekt ist unter der **GNU Affero General Public License v3.0 (AGPLv3)** lizenziert.
