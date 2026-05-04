import { fetchJson, normalizeMatchList, pad2, resultsArray } from "./utils.js";

export const RESULTS_YEARS = ["2026", "2025", "2024", "2023", "2022", "2021"];
export const RESULTS_CURRENT_YEAR = String(new Date().getFullYear());
export const RESULTS_CLUB_NAME = "Waidberg ZH";

let teamResultsCache = new Map();
let encountResultsCache = new Map();
let resultsTeamsCache = new Map();
let availableResultsTeams = [];
let activeResultsYear = RESULTS_YEARS.includes(RESULTS_CURRENT_YEAR) ? RESULTS_CURRENT_YEAR : RESULTS_YEARS[0];
let activeResultsTeamId = "";
let encountReturnView = "results";
let onReturnToMatches = () => {};

let resultsTeamSwitch;
let resultsYearButtons = [];
let resultsTitleEl;
let resultsSubtitleEl;
let resultsMatchesBody;
let resultsRankingBody;
let resultsEmptyEl;
let resultsOverviewEl;
let resultsDetailEl;
let resultsBackEl;
let encountTitleEl;
let encountSubtitleEl;
let encountBadgeEl;
let encountSinglesBody;
let encountDoublesBody;
let encountSinglesHomeHead;
let encountSinglesVisitHead;
let encountDoublesHomeHead;
let encountDoublesVisitHead;

export function initResults(options = {}) {
  onReturnToMatches = options.onReturnToMatches || onReturnToMatches;

  resultsTeamSwitch = document.getElementById("results-team-switch");
  resultsYearButtons = [...document.querySelectorAll("[data-results-year]")];
  resultsTitleEl = document.getElementById("results-title");
  resultsSubtitleEl = document.getElementById("results-subtitle");
  resultsMatchesBody = document.getElementById("results-matches-body");
  resultsRankingBody = document.getElementById("results-ranking-body");
  resultsEmptyEl = document.getElementById("results-empty");
  resultsOverviewEl = document.getElementById("results-overview");
  resultsDetailEl = document.getElementById("results-detail");
  resultsBackEl = document.getElementById("results-back");
  encountTitleEl = document.getElementById("encount-title");
  encountSubtitleEl = document.getElementById("encount-subtitle");
  encountBadgeEl = document.getElementById("encount-badge");
  encountSinglesBody = document.getElementById("encount-singles-body");
  encountDoublesBody = document.getElementById("encount-doubles-body");
  encountSinglesHomeHead = document.getElementById("encount-singles-home-head");
  encountSinglesVisitHead = document.getElementById("encount-singles-visit-head");
  encountDoublesHomeHead = document.getElementById("encount-doubles-home-head");
  encountDoublesVisitHead = document.getElementById("encount-doubles-visit-head");

  resultsYearButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.dataset.resultsYear === activeResultsYear) return;
      try {
        showResultsOverview();
        await initializeResultsView(button.dataset.resultsYear || activeResultsYear);
      } catch (error) {
        renderResultsError();
      }
    });
  });

  resultsBackEl.addEventListener("click", () => {
    showResultsOverview();
    if (encountReturnView === "matches") {
      onReturnToMatches();
    }
    encountReturnView = "results";
  });

  renderResultsYearSwitch();
  return initializeResultsView(activeResultsYear).catch(() => renderResultsError());
}

export function getActiveResultsYear() {
  return activeResultsYear;
}

export async function preloadCurrentYearTeams() {
  return fetchResultsTeams(RESULTS_CURRENT_YEAR);
}

export function currentYearResultsTeamByLabel(label) {
  const teams = resultsTeamsCache.get(RESULTS_CURRENT_YEAR) || [];
  const target = String(label || "").trim();
  return teams.find((team) => String(team.label || "").trim() === target) || null;
}

function formatTeamResultDate(encount) {
  const dt = encount?.enDate || {};
  const pt = encount?.enPlannedTime || {};
  const day = Number(dt.day);
  const month = Number(dt.month);
  const hour = Number(pt.hour);
  const minute = Number(pt.minute);
  if (!Number.isFinite(day) || !Number.isFinite(month)) return "–";
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return `${pad2(day)}.${pad2(month + 1)}`;
  return `${pad2(day)}.${pad2(month + 1)} – ${hour}:${pad2(minute)}`;
}

function teamNameFromPoolRow(item) {
  return item?.icTeam?.IcTeam?.mitglied?.Mitglied?.icName ?? "–";
}

function teamNameFromEncounter(encount, side) {
  if (side === "home") {
    return encount?.icTeamHomeTeam?.IcTeam?.mitglied?.Mitglied?.icName ?? "–";
  }
  return encount?.icTeamVisitTeam?.IcTeam?.mitglied?.Mitglied?.icName ?? "–";
}

function renderResultTeamName(container, name) {
  if (name === RESULTS_CLUB_NAME) {
    const strong = document.createElement("strong");
    strong.className = "club-name";
    strong.textContent = name;
    container.appendChild(strong);
    return;
  }
  container.appendChild(document.createTextNode(name));
}

function renderResultsTeamSelect() {
  resultsTeamSwitch.innerHTML = "";
  if (!availableResultsTeams.length) return;

  ["Damen", "Herren"].forEach((groupName) => {
    const teams = availableResultsTeams.filter((team) => team.gender === groupName);
    if (!teams.length) return;

    const section = document.createElement("div");
    section.className = "results-team-group";

    const label = document.createElement("div");
    label.className = "results-team-group-label";
    label.textContent = groupName;

    const row = document.createElement("div");
    row.className = "results-team-row";

    teams.forEach((team) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = team.label || team.liga || `Team ${team.teamId}`;
      button.classList.toggle("active", String(team.teamId) === String(activeResultsTeamId));
      button.addEventListener("click", async () => {
        if (String(team.teamId) === String(activeResultsTeamId)) return;
        activeResultsTeamId = String(team.teamId);
        renderResultsTeamSelect();
        try {
          showResultsOverview();
          await loadTeamResults(activeResultsTeamId, activeResultsYear);
        } catch (error) {
          renderResultsError();
        }
      });
      row.appendChild(button);
    });

    section.append(label, row);
    resultsTeamSwitch.appendChild(section);
  });
}

function renderResultsYearSwitch() {
  resultsYearButtons.forEach((button) => {
    const active = button.dataset.resultsYear === activeResultsYear;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function renderResultsNoTeams(message = "Keine Teams gefunden.") {
  activeResultsTeamId = "";
  availableResultsTeams = [];
  renderResultsTeamSelect();
  resultsTitleEl.textContent = "Ergebnisse";
  resultsSubtitleEl.textContent = message;
  resultsSubtitleEl.hidden = false;
  resultsMatchesBody.innerHTML = '<tr><td colspan="4">Keine Teams gefunden.</td></tr>';
  resultsRankingBody.innerHTML = '<tr><td colspan="4">Keine Teams gefunden.</td></tr>';
  resultsEmptyEl.style.display = "none";
  showResultsOverview();
}

function findResultsTeam(list, { teamId = "", label = "" } = {}) {
  const normalizedTeamId = String(teamId || "").trim();
  if (normalizedTeamId) {
    const byId = list.find((item) => String(item.teamId) === normalizedTeamId);
    if (byId) return byId;
  }

  const normalizedLabel = String(label || "").trim();
  if (!normalizedLabel) return null;
  return list.find((item) => String(item.label || "").trim() === normalizedLabel) || null;
}

export async function fetchResultsTeams(year) {
  const cacheKey = String(year);
  if (resultsTeamsCache.has(cacheKey)) {
    return resultsTeamsCache.get(cacheKey);
  }
  const payload = await fetchJson(`/api/ic/teams?year=${encodeURIComponent(cacheKey)}`);
  const items = Array.isArray(payload.items) ? payload.items : [];
  resultsTeamsCache.set(cacheKey, items);
  return items;
}

export async function initializeResultsView(year, preferred = {}) {
  activeResultsYear = RESULTS_YEARS.includes(String(year)) ? String(year) : activeResultsYear;
  renderResultsYearSwitch();
  resultsTeamSwitch.innerHTML = "";
  const teams = await fetchResultsTeams(activeResultsYear);
  availableResultsTeams = teams;

  if (!teams.length) {
    renderResultsNoTeams("Keine Teams gefunden.");
    return;
  }

  const selectedTeam = findResultsTeam(teams, preferred)
    || findResultsTeam(teams, { teamId: activeResultsTeamId })
    || teams[0];

  activeResultsTeamId = String(selectedTeam.teamId);
  renderResultsTeamSelect();
  await loadTeamResults(activeResultsTeamId, activeResultsYear);
}

export function renderResultsError(message = "Fehler beim Laden der Resultate.") {
  resultsTitleEl.textContent = "Ergebnisse";
  resultsSubtitleEl.textContent = message;
  resultsSubtitleEl.hidden = false;
  resultsMatchesBody.innerHTML = '<tr><td colspan="4">Fehler beim Laden der Resultate.</td></tr>';
  resultsRankingBody.innerHTML = '<tr><td colspan="4">Fehler beim Laden der Rangliste.</td></tr>';
  resultsEmptyEl.style.display = "none";
  resultsOverviewEl.hidden = false;
  resultsDetailEl.hidden = true;
}

export function showResultsOverview() {
  resultsOverviewEl.hidden = false;
  resultsDetailEl.hidden = true;
}

function showResultsDetail() {
  resultsOverviewEl.hidden = true;
  resultsDetailEl.hidden = false;
}

function renderTeamResults(payload) {
  const root = payload?.I2cm || {};
  const title = root?.IcLigue?.lgName ? `${root.IcLigue.lgName} – Gruppe ${root?.IcPool?.poolName2 ?? "–"}` : "Ergebnisse";
  const matches = resultsArray(root?.IcEncount).sort((a, b) => {
    const roundA = Number(a?.nbRound ?? 999);
    const roundB = Number(b?.nbRound ?? 999);
    if (roundA !== roundB) return roundA - roundB;
    const dayA = Number(a?.enDate?.day ?? 99);
    const dayB = Number(b?.enDate?.day ?? 99);
    return dayA - dayB;
  });
  const ranking = resultsArray(root?.IcPool?.icTeamPoolSet?.IcTeamPool).sort((a, b) => {
    const rankA = Number(a?.poolRank ?? 999);
    const rankB = Number(b?.poolRank ?? 999);
    return rankA - rankB;
  });

  resultsTitleEl.textContent = title;
  resultsSubtitleEl.textContent = "";
  resultsSubtitleEl.hidden = true;
  resultsMatchesBody.innerHTML = "";
  resultsRankingBody.innerHTML = "";
  showResultsOverview();

  matches.forEach((encount) => {
    const tr = document.createElement("tr");
    const heim = teamNameFromEncounter(encount, "home");
    const gast = teamNameFromEncounter(encount, "visit");
    const own = heim === RESULTS_CLUB_NAME || gast === RESULTS_CLUB_NAME;
    if (own) tr.classList.add("results-own");

    const roundCell = document.createElement("td");
    roundCell.className = "results-muted";
    roundCell.textContent = encount?.nbRound ?? "–";

    const dateCell = document.createElement("td");
    dateCell.className = "results-muted";
    dateCell.textContent = formatTeamResultDate(encount);

    const matchCell = document.createElement("td");
    renderResultTeamName(matchCell, heim);
    matchCell.appendChild(document.createTextNode(" – "));
    renderResultTeamName(matchCell, gast);

    const resultCell = document.createElement("td");
    resultCell.className = "results-right";
    if (String(encount?.validated) === "1") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "results-result-button";
      button.title = "Begegnung öffnen";
      const resultValue = document.createElement("span");
      resultValue.className = "results-result-value";
      resultValue.textContent = `${encount?.homeTmWonMatch ?? "–"}:${encount?.visitTmWonMatch ?? "–"}`;
      const resultHint = document.createElement("span");
      resultHint.className = "results-result-hint";
      resultHint.textContent = "Details";
      button.append(resultValue, resultHint);
      button.addEventListener("click", () => {
        encountReturnView = "results";
        loadEncountResults(encount?.encountId, activeResultsYear).catch(() => renderEncountError());
      });
      resultCell.appendChild(button);
    } else {
      const muted = document.createElement("span");
      muted.className = "results-muted";
      muted.textContent = "–:–";
      resultCell.appendChild(muted);
    }

    tr.append(roundCell, dateCell, matchCell, resultCell);
    resultsMatchesBody.appendChild(tr);
  });

  ranking.forEach((item, index) => {
    const tr = document.createElement("tr");
    const name = teamNameFromPoolRow(item);
    if (name === RESULTS_CLUB_NAME) tr.classList.add("results-own");

    const rankCell = document.createElement("td");
    rankCell.className = "results-strong";
    rankCell.textContent = item?.poolRank ?? index + 1;

    const nameCell = document.createElement("td");
    if (name === RESULTS_CLUB_NAME) {
      const strong = document.createElement("strong");
      strong.className = "club-name";
      strong.textContent = name;
      nameCell.appendChild(strong);
    } else {
      nameCell.textContent = name;
    }

    const placeCell = document.createElement("td");
    placeCell.className = "results-muted results-right";
    placeCell.textContent = Number.isFinite(Number(item?.nbMatch)) ? String(Number(item.nbMatch)) : "0";

    const setCell = document.createElement("td");
    setCell.className = "results-muted results-right";
    setCell.textContent = `${item?.nbWonSet ?? 0}-${item?.nbLostSet ?? 0}`;

    tr.append(rankCell, nameCell, placeCell, setCell);
    resultsRankingBody.appendChild(tr);
  });

  resultsEmptyEl.style.display = matches.length || ranking.length ? "none" : "block";
}

function formatEncountDate(value) {
  const day = Number(value?.day);
  const month = Number(value?.month);
  const year = Number(value?.year);
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return "–";
  return `${day}.${month + 1}.${year}`;
}

function formatPlayerLabel(player) {
  if (!player) return { name: "–", klass: "" };
  const klass = String(player?.class || "").trim();
  return {
    name: player?.name ?? "–",
    klass,
  };
}

function formatSingleSide(side) {
  const player = formatPlayerLabel(side?.Player);
  return {
    name: player.klass ? `${player.name} (${player.klass})` : player.name,
    klass: "",
  };
}

function formatDoubleSide(side) {
  const players = normalizeMatchList(side?.Player).map(formatPlayerLabel);
  return {
    name: players.map((p) => (p.klass ? `${p.name} (${p.klass})` : p.name)).join(" / ") || "–",
    klass: "",
  };
}

function formatScorePart(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? String(n) : null;
}

function formatMatchScore(home, visit) {
  if (Number(home?.wo) === 1 || Number(visit?.wo) === 1) return "w.o.";
  const rawParts = [
    [formatScorePart(home?.sg1), formatScorePart(visit?.sg1)],
    [formatScorePart(home?.sg2), formatScorePart(visit?.sg2)],
    [formatScorePart(home?.sg3), formatScorePart(visit?.sg3)],
  ].filter(([a, b]) => a !== null && b !== null);
  const hasPlayedGames = rawParts.some(([a, b]) => Number(a) > 0 || Number(b) > 0);
  if (!hasPlayedGames) return "–";
  const parts = rawParts.map(([a, b]) => `${a}:${b}`);
  return parts.join(" ") || "–";
}

function isHomeWinner(home, visit) {
  if (formatMatchScore(home, visit) === "–") return null;
  if (Number(home?.wo) === 1) return true;
  if (Number(visit?.wo) === 1) return false;
  const sets = [
    [Number(home?.sg1), Number(visit?.sg1)],
    [Number(home?.sg2), Number(visit?.sg2)],
    [Number(home?.sg3), Number(visit?.sg3)],
  ];
  let wonSets = 0;
  sets.forEach(([h, v]) => {
    if (Number.isFinite(h) && Number.isFinite(v) && h >= 0 && v >= 0 && h > v) {
      wonSets += 1;
    }
  });
  return wonSets >= 2;
}

function buildPlayerCell(data, winner) {
  const cell = document.createElement("td");
  const wrap = document.createElement("span");
  wrap.className = `encount-player ${winner === null ? "neutral" : winner ? "winner" : "loser"}`;
  const name = document.createElement("span");
  name.textContent = data.name;
  wrap.appendChild(name);
  if (data.klass) {
    const klass = document.createElement("span");
    klass.className = "encount-class";
    klass.textContent = `(${data.klass})`;
    wrap.appendChild(klass);
  }
  cell.appendChild(wrap);
  return cell;
}

function renderEncountRows(body, matches, sideFormatter) {
  body.innerHTML = "";
  if (!matches.length) {
    body.innerHTML = '<tr><td colspan="4">Noch keine Resultate vorhanden.</td></tr>';
    return;
  }
  matches.forEach((match) => {
    const tr = document.createElement("tr");
    const homeScore = match?.Scores?.Home || {};
    const visitScore = match?.Scores?.Visit || {};
    const scoreText = formatMatchScore(homeScore, visitScore);
    const homeWon = isHomeWinner(homeScore, visitScore);
    const home = sideFormatter(match?.Players?.Home || {});
    const visit = sideFormatter(match?.Players?.Visit || {});

    const nrCell = document.createElement("td");
    nrCell.className = "results-muted";
    nrCell.textContent = match?.name ?? "–";

    const scoreCell = document.createElement("td");
    scoreCell.className = `encount-score ${scoreText === "w.o." ? "walkover" : ""}`;
    scoreCell.textContent = scoreText;

    tr.append(
      nrCell,
      buildPlayerCell(home, homeWon),
      buildPlayerCell(visit, !homeWon),
      scoreCell,
    );
    body.appendChild(tr);
  });
}

export function renderEncountError(message = "Fehler beim Laden der Begegnung.") {
  showResultsDetail();
  encountTitleEl.textContent = "Begegnung";
  encountSubtitleEl.textContent = message;
  encountBadgeEl.href = "#";
  encountBadgeEl.title = "";
  encountBadgeEl.textContent = "–:–";
  encountBadgeEl.className = "encount-badge";
  encountSinglesHomeHead.textContent = "Heim";
  encountSinglesVisitHead.textContent = "Gast";
  encountDoublesHomeHead.textContent = "Heim";
  encountDoublesVisitHead.textContent = "Gast";
  encountSinglesBody.innerHTML = '<tr><td colspan="4">Fehler beim Laden der Einzelresultate.</td></tr>';
  encountDoublesBody.innerHTML = '<tr><td colspan="4">Fehler beim Laden der Doppelresultate.</td></tr>';
}

function renderEncountResults(payload) {
  const encount = payload?.I2cm?.EncountResults?.Encount || {};
  const info = encount?.EncountInfo || {};
  const homeTeam = info?.Home?.Team?.name ?? "–";
  const visitTeam = info?.Visit?.Team?.name ?? "–";
  const homeMatches = info?.Home?.EncountResult?.matches ?? "–";
  const visitMatches = info?.Visit?.EncountResult?.matches ?? "–";
  const groupNb = info?.groupNb ?? "–";
  const ligue = info?.Ligue?.lgDEName || info?.Ligue?.lgShortName || "–";
  const date = formatEncountDate(info?.Played?.Date);
  const encountId = info?.encountId ?? encount?.encountId ?? "";
  const homeClubNb = Number(info?.Home?.Team?.clubNb);
  const visitClubNb = Number(info?.Visit?.Team?.clubNb);

  showResultsDetail();
  encountTitleEl.textContent = `${homeTeam} – ${visitTeam}`;
  encountSubtitleEl.textContent = `${date} · ${ligue} · Gruppe ${groupNb}`;
  if (encountId) {
    encountBadgeEl.href = `https://www.mytennis.ch/de/interclub/begegnungsergebnisse?encounterId=${encodeURIComponent(encountId)}&year=${encodeURIComponent(activeResultsYear)}`;
    encountBadgeEl.title = "Bei Swisstennis öffnen";
  } else {
    encountBadgeEl.href = "#";
    encountBadgeEl.title = "";
  }
  encountBadgeEl.textContent = `${homeMatches}:${visitMatches}`;
  encountBadgeEl.className = "encount-badge";
  encountSinglesHomeHead.textContent = homeTeam;
  encountSinglesVisitHead.textContent = visitTeam;
  encountDoublesHomeHead.textContent = homeTeam;
  encountDoublesVisitHead.textContent = visitTeam;
  if (Number(homeMatches) > Number(visitMatches)) {
    encountBadgeEl.classList.add(homeClubNb === 1298 ? "home-win" : "visit-win");
  } else if (Number(visitMatches) > Number(homeMatches)) {
    encountBadgeEl.classList.add(homeClubNb === 1298 ? "visit-win" : "home-win");
  }

  renderEncountRows(encountSinglesBody, normalizeMatchList(encount?.Singles?.Match), formatSingleSide);
  renderEncountRows(encountDoublesBody, normalizeMatchList(encount?.Doubles?.Match), formatDoubleSide);
}

export async function loadTeamResults(teamId, year) {
  const normalizedTeamId = String(teamId || "").trim();
  const normalizedYear = String(year || activeResultsYear || RESULTS_CURRENT_YEAR);
  const cacheKey = `${normalizedTeamId}:${normalizedYear}`;
  if (teamResultsCache.has(cacheKey)) {
    renderTeamResults(teamResultsCache.get(cacheKey));
    return;
  }
  const teamMeta = availableResultsTeams.find((team) => String(team.teamId) === normalizedTeamId);
  resultsTitleEl.textContent = teamMeta?.label || "Ergebnisse";
  resultsSubtitleEl.textContent = "Lädt…";
  resultsSubtitleEl.hidden = false;
  resultsMatchesBody.innerHTML = '<tr><td colspan="4">Lädt…</td></tr>';
  resultsRankingBody.innerHTML = '<tr><td colspan="4">Lädt…</td></tr>';
  resultsEmptyEl.style.display = "none";
  const payload = await fetchJson(`/api/ic/team/${encodeURIComponent(normalizedTeamId)}?year=${encodeURIComponent(normalizedYear)}`);
  teamResultsCache.set(cacheKey, payload);
  renderTeamResults(payload);
}

export async function loadEncountResults(encountId, year = "", returnView = "results") {
  encountReturnView = returnView;
  const key = `${encountId}:${year || ""}`;
  if (encountResultsCache.has(key)) {
    renderEncountResults(encountResultsCache.get(key));
    return;
  }
  showResultsDetail();
  encountTitleEl.textContent = "Begegnung";
  encountSubtitleEl.textContent = "Lädt…";
  encountBadgeEl.textContent = "–:–";
  encountBadgeEl.className = "encount-badge";
  encountSinglesBody.innerHTML = '<tr><td colspan="4">Lädt…</td></tr>';
  encountDoublesBody.innerHTML = '<tr><td colspan="4">Lädt…</td></tr>';
  const suffix = year ? `?year=${encodeURIComponent(year)}` : "";
  const payload = await fetchJson(`/api/ic/encount/${encountId}${suffix}`);
  encountResultsCache.set(key, payload);
  renderEncountResults(payload);
}
