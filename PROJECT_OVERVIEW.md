# TCW Interclub 2026 - Projektuebersicht (Technische Doku)

Stand: 25. Maerz 2026

## 1) Zielbild
Es wurde eine Webloesung fuer den TC Waidberg umgesetzt mit:
- oeffentlicher Seite fuer Teams, Trainingsplan und Spieltermine
- interner Admin-UI fuer Pflege der Teams/Spieler
- SQL-basierter Teamdatenhaltung
- automatisiertem taeglichen Import der Spieltermine aus SwissTennis PDF

Hinweis: Diese Doku enthaelt bewusst keine Inhalte zu PowerPoint/Slides.

## 2) Laufende Komponenten

### Oeffentliche Seite
- Port: `8090`
- Zweck: Anzeige fuer Besucher (Cloudflare -> nginx -> App)
- Servercode: `app.py`
- Frontend-Dateien: unter `public/`

### Admin-UI (intern)
- Port: `8091`
- Zweck: Team-/Spielerpflege im LAN
- Servercode: `admin_app.py`
- Frontend: `admin.html`

### Datenbank
- Engine: SQLite
- Datei (Server): `/mnt/apps/interclub-website/ic_teams.sqlite`
- Haupttabellen:
  - `teams`
  - `players`
  - `training_slots`

## 3) Aktuelle Datenquellen

### Teamdaten
- Quelle: SQL Datenbank (`teams`, `players`)
- Anzeige ueber API: `GET /api/teams`

### Trainingsplan
- Quelle: SQL Datenbank (`training_slots`) plus statische Legende im Frontend
- Anzeige ueber API: `GET /api/training-slots`

### Spieltermine
- Quelle: SwissTennis PDF
  - URL: `https://comp.swisstennis.ch/ic/servlet/ClubResult.pdf?ClubName=1298&Lang=D`
- Import: `import_clubresult.py`
- Ziel-Datei fuer Website: `public/matches.json`

## 4) Frontend-Architektur

### Single-Page Aufbau
- Einstiegsseite: `public/index.html`
- Bereiche:
  - `#teams`
  - `#training`
  - `#matches`
- Umschalten erfolgt clientseitig (kein Full Page Reload)

### Asset-Struktur (oeffentlich)
Pfad: `public/`
- `index.html`
- `style.css`
- `app.js`
- `bg-home.jpg`
- `logo-tcw.png`
- `favicon.ico`, `favicon.png`
- `fonts/manrope-*.ttf`
- `matches.json`

## 5) API- und Sortierlogik

### Oeffentliche API
- `GET /api/health`
- `GET /api/teams`

### Team-/Spieler-Sortierung (Anzeige)
- Teams: Liga zuerst (`NLA > NLB > NLC > 1.Liga > 2.Liga > 3.Liga`), danach Alterskategorie (`Aktiv > 30+ > 35+ > ...`)
- Spielerliste je Team:
  - Captain zuerst
  - danach Capt. Stv.
  - danach uebrige Spieler nach Klassierung und Name

### Klassierungslogik
- Reihenfolge: `N1 > N2 > ... > R1 > R2 > ...`

## 6) MyTennis-Anbindung

### Datenfelder in `players`
- `name`
- `klassierung`
- `myTennisID`
- `team_id`
- `captain_status`

### Verhalten
- Bei neuen Spielern oder Namensaenderungen kann automatisiert eine Suche gegen MyTennis ausgefuehrt werden.
- Treffer werden in `klassierung` und `myTennisID` zurueckgeschrieben.
- Suchlogik wurde fuer Sonderzeichen sowie Nachnamensvarianten (z.B. Apostroph/Bindestrich) verbessert.

## 7) PDF-Import Spieltermine

### Parser
- Script: `import_clubresult.py`
- Extraktion via `pdftotext -layout`
- Ausgabeformat: JSON mit
  - `source`
  - `updated_at` (Stand aus PDF)
  - `matches[]`

### Wichtige Korrektur
- Parsing wurde so angepasst, dass Zeit und Liga robust getrennt werden (kein Vermischen von Uhrzeit in Liga-Spalte).

## 8) Automatisierung auf TrueNAS

### Server-Update-Script
- Datei: `/mnt/apps/interclub-website/update_matches_server.sh`
- Ablauf:
  1. PDF von SwissTennis laden
  2. PDF lokal speichern (`ClubResult.pdf`)
  3. `import_clubresult.py` im Docker-One-Shot mit `poppler-utils` ausfuehren
  4. `public/matches.json` aktualisieren
  5. alte Root-Datei `matches.json` entfernen (Vermeidung doppelter Quelle)

### Cronjob
- Root crontab:
  - `0 5 * * * sh /mnt/apps/interclub-website/update_matches_server.sh >> /mnt/apps/interclub-website/update_matches_server.log 2>&1`

### Logfile
- `/mnt/apps/interclub-website/update_matches_server.log`

## 9) Security-Haertung (oeffentliche Seite)

### Umgesetzt
- Oeffentliche Auslieferung auf explizite Allowlist begrenzt (`app.py`)
- Webroot getrennt: nur `public/` wird fuer statische Inhalte bedient
- Sensible Projektdateien (DB, Skripte, Logs) werden auf `8090` nicht ausgeliefert
- Fehlerantworten gehaertet (`/api/teams` liefert keine Roh-Exception mehr)
- Security Header aktiv:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Frame-Options: SAMEORIGIN`

### Nicht Ziel dieser Haertung
- Admin-Auth/Hardening auf `8091` wurde bewusst nicht veraendert (internes LAN-Tool).

## 10) Wichtige Dateien (Codebasis)
- `app.py` - Public Server + API `/api/teams`
- `admin_app.py` - Admin API + Admin Seite
- `admin.html` - UI fuer Teams/Spielerpflege
- `public/index.html` - Einstieg SPA
- `public/style.css` - Styling
- `public/app.js` - Clientlogik
- `import_clubresult.py` - PDF -> JSON
- `update_matches_server.sh` - taeglicher Server-Import (Cron)
- `update_matches_remote.py` - manuelles Remote-Update vom lokalen Rechner

## 11) Betriebs-Checks (Quick Reference)

### Stand der Spieltermine pruefen (Server)
```bash
ssh truenas_admin@192.168.178.94 "python3 - <<'PY'
import json
from pathlib import Path
p = Path('/mnt/apps/interclub-website/public/matches.json')
print(json.loads(p.read_text(encoding='utf-8')).get('updated_at'))
PY"
```

### Cronjob pruefen
```bash
ssh truenas_admin@192.168.178.94 "sudo crontab -l"
```

### Import manuell triggern
```bash
ssh truenas_admin@192.168.178.94 "sudo sh /mnt/apps/interclub-website/update_matches_server.sh"
```

## 12) Offene Betriebsannahmen
- `8090` bleibt oeffentlich hinter Cloudflare/nginx.
- `8091` bleibt nur intern im LAN erreichbar.
- TrueNAS kann Docker-One-Shot fuer den PDF-Import ausfuehren.
- SwissTennis-PDF ist weiterhin ohne Login abrufbar.
