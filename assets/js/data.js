// ----------------------------------------------------------------------
// DATEI: assets/js/data.js
// INHALT: Lerninhalte AP1 Fachinformatiker - Finaler Abgleich Katalog 2025 + Historie
// STATUS: 100% Katalog-Konform + Gewichtung (Prio) korrigiert nach Häufigkeits-Analyse
// ----------------------------------------------------------------------

window.AP1_DATA = [
  {
    id: 'LF1',
    name: 'LF 1: Unternehmen & Umfeld',
    desc: 'Rechtsformen, Organisation, Change Mgmt',
    topics: [
      {
        id: '1.1',
        title: 'Rechtsformen & Strukturen',
        weight: 3,
        time: 90,
        sub: [
          'GmbH & UG (Haftung, Gründung, Stammkapital)',
          'KG & OHG (Unterschied Komplementär/Kommanditist)',
          'AG (Organe: Vorstand, Aufsichtsrat, HV)',
          'Gemeinnützige Vereine (e.V.) & Satzung',
          'Genossenschaften (eG) Basics',
        ],
      },
      {
        id: '1.2',
        title: 'Organisationsstrukturen',
        weight: 2,
        time: 60,
        sub: [
          'Aufbau- vs. Prozessorganisation',
          'Einlinien-, Mehrlinien-, Stabliniensystem',
          'Matrixorganisation (Vor-/Nachteile)',
          'Prokura vs. Handlungsvollmacht (Art/Umfang)',
          'Organigramme analysieren & erstellen',
        ],
      },
      {
        id: '1.3',
        title: 'Vertragsrecht & Störungen',
        weight: 5, // Erhöht: Kaufvertrag & Störungen sind Dauerbrenner
        time: 90,
        sub: [
          'Zustandekommen von Verträgen (Antrag/Annahme)',
          'Kauf-, Werk-, Dienst-, Mietvertrag (Abgrenzung)',
          'Nichtigkeit & Anfechtbarkeit von Rechtsgeschäften',
          'Lieferungsverzug & Zahlungsverzug (Mahnung)',
          'Mängelrechte (Nacherfüllung, Minderung, Rücktritt)',
        ],
      },
      {
        id: '1.4',
        title: 'Arbeitswelt & Mitbestimmung',
        weight: 2,
        time: 45,
        sub: [
          'Arbeitsvertrag (Pflichten AN/AG)',
          'Kündigungsschutz & Fristen',
          'Betriebsrat (Mitbestimmungsrechte)',
          'Jugendarbeitsschutzgesetz (JArbSchG)',
          'Tarifvertragsarten (Mantel/Lohn)',
        ],
      },
      {
        id: '1.5',
        title: 'Berufsbildung & Nachhaltigkeit',
        weight: 2,
        time: 45,
        sub: [
          'Rechte/Pflichten Azubi & Ausbilder (BBiG)',
          'Duales System (Lernorte)',
          'Green IT (Ressourceneffizienz, Recycling)',
          'Ökonomische, Ökologische, Soziale Ziele',
          'Lieferkettengesetz (Grundgedanke)',
        ],
      },
      {
        id: '1.6',
        title: 'Change Management',
        weight: 3,
        time: 60,
        sub: [
          'Phasen von Veränderungsprozessen',
          'Promoter, Bremser, Widerständler, Skeptiker',
          'Ursachen für Widerstände (Angst, fehlendes Wissen)',
          'Maßnahmen: Kommunikation & Partizipation',
          'Blended Learning & Multiplikatoren',
        ],
      },
    ],
  },
  {
    id: 'LF2',
    name: 'LF 2: Arbeitsplatz & Beschaffung',
    desc: 'Beschaffung, Ergonomie, Wirtschaftlichkeit',
    topics: [
      {
        id: '2.1',
        title: 'Beschaffungsprozesse',
        weight: 4, // Nutzwertanalyse (8 Pkt im Ranking)
        time: 90,
        sub: [
          'Nutzwertanalyse (Gewichtung & Berechnung)',
          'ABC-Analyse (Klassifizierung A/B/C-Güter)',
          'Angebotsvergleich (Quantitativ/Qualitativ)',
          'Make or Buy (Eigenfertigung vs. Fremdbezug)',
          'Bestellpunkt-, Meldebestand & eiserner Bestand',
        ],
      },
      {
        id: '2.2',
        title: 'Finanzierung & Wirtschaft',
        weight: 3,
        time: 60,
        sub: [
          'Kauf vs. Leasing vs. Miete (Vorteile/Nachteile)',
          'Rentabilität (Eigenkapital/Gesamtkapital)',
          'Liquidität (Grades 1, 2, 3)',
          'Skonto & Rabatt Berechnungen',
          'TCO (Total Cost of Ownership)',
        ],
      },
      {
        id: '2.3',
        title: 'Arbeitsplatz & Umwelt',
        weight: 2,
        time: 45,
        sub: [
          'Ergonomie (Tisch, Stuhl, Beleuchtung, 2-Sinne)',
          'DGUV Vorschrift 3 (Elektrische Prüfung)',
          'Barrierefreiheit am Arbeitsplatz',
          'Entsorgung (ElektroG) & Datenschutz bei Entsorgung',
          'Energielabels & Blauer Engel',
        ],
      },
    ],
  },
  {
    id: 'LF3',
    name: 'LF 3: Clients & Netzwerke',
    desc: 'Hardware, IPv6, Subnetting, Storage',
    topics: [
      {
        id: '3.1',
        title: 'Hardware & Schnittstellen',
        weight: 4, // Erhöht: USV (7 Pkt) ist sehr wichtig
        time: 90,
        sub: [
          'CPU, RAM, Mainboard (Formfaktoren, Busse)',
          'Schnittstellen: USB-C, HDMI, DisplayPort, Thunderbolt',
          'HDD vs. SSD (NVMe vs SATA, Aufbau)',
          'USV (Online/Offline, Dimensionierung VA/Watt)',
          'Drucktechnologien (Laser, Tinte) & TCO',
        ],
      },
      {
        id: '3.2',
        title: 'Netzwerktechnik (IPv4/IPv6)',
        weight: 5, // Top Prio: Subnetting & IPv6
        time: 120,
        sub: [
          'OSI-Modell (7 Schichten, PDU, Protokolle)',
          'IPv4 Subnetting (Netzanteil, Hostanteil, Broadcast)',
          'IPv6 Adressaufbau (Hex, Kürzung, Präfix)',
          'IPv6 Konfig: SLAAC vs. DHCPv6',
          'Netzwerkkomponenten: Layer-2/3 Switch, Router',
        ],
      },
      {
        id: '3.3',
        title: 'WLAN & VLAN',
        weight: 4, // Erhöht: VLAN (7 Pkt)
        time: 60,
        sub: [
          'WLAN Standards (Wi-Fi 5/6/7) & Frequenzen',
          'WLAN Sicherheit: WPA2 (PSK) vs. WPA3 (SAE)',
          'VLAN (Tagged vs. Untagged, Trunking)',
          'VPN (Site-to-Site, End-to-Site, Protokolle)',
        ],
      },
      {
        id: '3.4',
        title: 'Speicher & Backup',
        weight: 4, // Erhöht: Datensicherung (10 Pkt!)
        time: 60,
        sub: [
          'Backup: Voll, Differenziell, Inkrementell',
          'Generationenprinzip (Großvater-Vater-Sohn)',
          '3-2-1 Regel der Datensicherung',
          'NAS (Network Attached Storage) vs. SAN (Basics)',
          'Archivierungspflichten & GoBD',
        ],
      },
      {
        id: '3.5',
        title: 'IT-Berechnungen',
        weight: 5, // KORRIGIERT: Top Prio (9 Pkt Ranking)
        time: 60,
        sub: [
          'Übertragungsdauer (Größe / Geschwindigkeit)',
          'Speicherbedarf (Bildauflösung * Farbtiefe)',
          'Dezimal-Binär-Hexadezimal Umrechnung',
          'Datenraten: Mbit/s vs. MB/s (Faktor 8)',
          'KiB vs. KB (Präfixe)',
        ],
      },
    ],
  },
  {
    id: 'LF4',
    name: 'LF 4: Server & Betriebssysteme',
    desc: 'AD, Virtualisierung, Datenschutz',
    topics: [
      {
        id: '4.1',
        title: 'Betriebssysteme & AD',
        weight: 3,
        time: 60,
        sub: [
          'Windows vs. Linux (Kernel, Shell, Dateisystem)',
          'PC in Domäne einbinden (DNS, Computerkonto)',
          'Active Directory: OU, GPO (Gruppenrichtlinien)',
          'NTFS Berechtigungen (Vererbung, Allow/Deny)',
          'Benutzerverwaltung (lokal vs. zentral)',
        ],
      },
      {
        id: '4.2',
        title: 'Virtualisierung & Cloud',
        weight: 3,
        time: 60,
        sub: [
          'Hypervisor Typ 1 (Bare Metal) vs. Typ 2 (Hosted)',
          'Vorteile: Konsolidierung, Snapshot, Isolation',
          'Container (Docker) vs. VM (Unterschiede)',
          'Cloud: IaaS, PaaS, SaaS (Abgrenzung)',
          'Private vs. Public vs. Hybrid Cloud',
        ],
      },
      {
        id: '4.3',
        title: 'Datenschutz (DSGVO)',
        weight: 5, // KORRIGIERT: Absolute Top Prio (11 Pkt)
        time: 90,
        sub: [
          'Personenbezogene vs. Besondere Daten',
          'Rechte der Betroffenen (Auskunft, Löschung)',
          'Verarbeitungsverzeichnis (Verantwortlicher)',
          'Anonymisierung vs. Pseudonymisierung',
          'TOMs (Zutritt, Zugang, Zugriff, Weitergabe)',
        ],
      },
    ],
  },
  {
    id: 'LF5',
    name: 'LF 5: Software & Entwicklung',
    desc: 'UML, KI, PM, Coding Basics',
    topics: [
      {
        id: '5.1',
        title: 'Projektmanagement',
        weight: 5, // KORRIGIERT: Top Prio wegen Netzplan (9 Pkt)
        time: 90,
        sub: [
          'Wasserfallmodell vs. Scrum (Rollen, Artefakte)',
          'SMART-Formel für Projektziele',
          'Lastenheft (Kunde) vs. Pflichtenheft (Auftragnehmer)',
          'Netzplan: Kritischer Pfad & Pufferzeiten berechnen',
          'Meilensteine & Gantt-Diagramm',
        ],
      },
      {
        id: '5.2',
        title: 'Standardsoftware & Trends',
        weight: 2,
        time: 60,
        sub: [
          'ERP (Enterprise Resource Planning)',
          'CRM (Customer Relationship Management)',
          'SCM (Supply Chain Management)',
          'Künstliche Intelligenz (Machine vs. Deep Learning)',
          'Social Media & Barrierefreiheit (BITV)',
        ],
      },
      {
        id: '5.3',
        title: 'UML & Modellierung',
        weight: 4,
        time: 90,
        sub: [
          'Aktivitätsdiagramm (Raute, Start/Ende, Gabel)',
          'Klassendiagramm (Klassen, Attribute, Methoden)',
          'Use-Case Diagramm (Akteure, Beziehungen)',
          'ER-Modell (Entitäten, Relationen 1:n/m:n)',
          'EPK (Ereignis, Funktion, Konnektoren)',
        ],
      },
      {
        id: '5.4',
        title: 'Logik & Fehlersuche',
        weight: 3,
        time: 90,
        sub: [
          'Datentypen (Integer, String, Boolean, Array)',
          'Kontrollstrukturen (If/Else, Schleifen)',
          'Operatoren (Logisch AND/OR, Arithmetisch)',
          'Schreibtischtest (Code manuell durchgehen)',
          'Debugging: Breakpoints, Step-Over/Into',
        ],
      },
      {
        id: '5.5',
        title: 'Qualitätssicherung',
        weight: 2,
        time: 45,
        sub: [
          'Unit Test vs. Integrationstest vs. Systemtest',
          'Blackbox (Funktion) vs. Whitebox (Code) Test',
          'Datenschutz by Design & by Default',
          'Versionsverwaltung (Git: Commit, Push, Pull)',
        ],
      },
    ],
  },
  {
    id: 'LF6_7',
    name: 'LF 6-9: Service & Sicherheit',
    desc: 'Security, Support, Abnahme',
    topics: [
      {
        id: '6.1',
        title: 'Service & Support',
        weight: 2,
        time: 60,
        sub: [
          'Ticketsysteme: Incident vs. Problem (ITIL)',
          'SLA (Service Level Agreement, Reaktionszeit)',
          'Eskalationsstufen (1st, 2nd, 3rd Level)',
          'Fernwartung (Tools, Datenschutz)',
          'Kommunikation: Aktives Zuhören, Fragetechniken',
        ],
      },
      {
        id: '6.2',
        title: 'IT-Sicherheit (Concepts)',
        weight: 5, // Top Prio
        time: 120,
        sub: [
          'Schutzziele (CIA): Vertraulichkeit, Integrität, Verfügbarkeit',
          'Symmetrische vs. Asymmetrische Verschlüsselung',
          'Hashverfahren (Integrität) & Salting',
          'Digitale Zertifikate & Signaturen',
          'Härtung von Betriebssystemen (Updates, Ports zu)',
        ],
      },
      {
        id: '6.3',
        title: 'Angriff & Verteidigung',
        weight: 3,
        time: 60,
        sub: [
          'Social Engineering (Phishing, Pretexting)',
          'Malware: Ransomware, Trojaner, Virus, Wurm',
          'Man-in-the-Middle, DDoS, Brute Force',
          '2-Faktor-Authentifizierung (2FA: Wissen, Besitz, Biometrie)',
          'Passwort-Richtlinien (Länge, Komplexität)',
        ],
      },
      {
        id: '6.4',
        title: 'Übergabe & Abschluss',
        weight: 3,
        time: 60,
        sub: [
          'Rollout: Big Bang vs. Stufenweise',
          'Abnahmeprotokoll (Inhalt & Unterschrift)',
          'Mängelarten: Schlechtleistung, Falschlieferung, Minderlieferung',
          'Einweisung & Benutzerdokumentation',
          'Soll-Ist-Vergleich & Nachkalkulation',
        ],
      },
    ],
  },
];
