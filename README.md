# Interclub Website (TC Waidberg)

## Inhalt
- `index.html` enthält die gesamte Website mit den Bereichen Teams, Trainingsplan und Spieltermine.
- `app.js` steuert die Navigation zwischen den Bereichen und enthält die Daten für den Trainingsplan.
- `ClubResult.pdf` ist die Quelldatei für die Spieltermine.
- `matches.json` enthält die importierten Spieltermine aus dem PDF.
- `import_clubresult.py` erzeugt `matches.json` aus `ClubResult.pdf`.
- `update_matches_remote.py` importiert die PDF lokal und lädt PDF + JSON auf TrueNAS hoch.

## Deployment auf TrueNAS (statische Website)
1. Den gesamten Ordner `interclub-website` auf deinen TrueNAS-Webpfad kopieren.
2. Sicherstellen, dass `index.html` als Startdatei verwendet wird.
3. Falls du einen Reverse-Proxy (z.B. Nginx Proxy Manager) nutzt: auf den Ordnerpfad routen.
4. Optional: HTTPS-Zertifikat aktivieren.

## Datenpflege
- Teams: über die Datenbank / Admin UI.
- Trainingsplan: in `app.js` in `const PLAN_DATA` und `const LEGEND`.
- Spieltermine:
  1. Neue PDF in `~/Downloads/ClubResult.pdf` ablegen
  2. `python3 /home/stephan/interclub-website/update_matches_remote.py ~/Downloads/ClubResult.pdf`
  3. Danach sind `ClubResult.pdf` und `matches.json` auf TrueNAS aktualisiert und `index.html#matches` zeigt den neuen Stand
