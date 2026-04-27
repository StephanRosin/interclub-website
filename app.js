const PLAN_DATA = {
  "Montag": [{"time":"08:00-09:00","courts":["","","","","",""]},{"time":"09:00-10:00","courts":["","","","","",""]},{"time":"10:00-11:00","courts":["","","","","",""]},{"time":"11:00-12:00","courts":["","","","","",""]},{"time":"12:00-13:00","courts":["","","","","",""]},{"time":"13:00-14:00","courts":["","","","","",""]},{"time":"14:00-15:00","courts":["","","","","","Tennisschule"]},{"time":"15:00-16:00","courts":["","","","","","Tennisschule"]},{"time":"16:00-17:00","courts":["","","","","Junioren","Tennisschule"]},{"time":"17:00-18:00","courts":["","","","","Junioren","Tennisschule"]},{"time":"18:00-19:00","courts":["12h","12h","12h","12h","TS (TCW)","Tennisschule"]},{"time":"19:00-20:00","courts":["1. Liga (Xenia)","1. Liga (Xenia)","55+ (P)","55+ (P)","TS (TCW)","Tennisschule"]},{"time":"20:00-21:00","courts":["2. Liga (Sophie)","2. Liga (Sophie)","45+ (M)","45+ (M)","TS (TCW)","Tennisschule"]},{"time":"21:00-22:00","courts":["12h","12h","45+ (M)","12h","TS (TCW)","Tennisschule"]}],
  "Dienstag": [{"time":"08:00-09:00","courts":["","","","","","Tennisschule"]},{"time":"09:00-10:00","courts":["Senioren-Treff","Senioren-Treff","Senioren-Treff","","","Tennisschule"]},{"time":"10:00-11:00","courts":["Senioren-Treff","Senioren-Treff","Senioren-Treff","","","Tennisschule"]},{"time":"11:00-12:00","courts":["Senioren-Treff","Senioren-Treff","Senioren-Treff","","","Tennisschule"]},{"time":"12:00-13:00","courts":["","","","","","Tennisschule"]},{"time":"13:00-14:00","courts":["","","","","","Tennisschule"]},{"time":"14:00-15:00","courts":["","","","","","Tennisschule"]},{"time":"15:00-16:00","courts":["","","","","","Tennisschule"]},{"time":"16:00-17:00","courts":["","","","","Junioren","Tennisschule"]},{"time":"17:00-18:00","courts":["","","","","Junioren","Tennisschule"]},{"time":"18:00-19:00","courts":["12h","12h","12h","12h","TS (TCW)","Tennisschule"]},{"time":"19:00-20:00","courts":["1. Liga (Alex)","1. Liga (Alex)","30+ (Florine)","30+ (Florine)","TS (TCW)","Tennisschule"]},{"time":"20:00-21:00","courts":["1. Liga (Alex)","2. Liga (Nico)","2. Liga (Nico)","12h","TS (TCW)","Tennisschule"]},{"time":"21:00-22:00","courts":["12h","2. Liga (Nico)","12h","12h","TS (TCW)","Tennisschule"]}],
  "Mittwoch": [{"time":"08:00-09:00","courts":["","","","","","Tennisschule"]},{"time":"09:00-10:00","courts":["","","","","","Tennisschule"]},{"time":"10:00-11:00","courts":["","","","","","Tennisschule"]},{"time":"11:00-12:00","courts":["","","","","","Tennisschule"]},{"time":"12:00-13:00","courts":["","","","","","Tennisschule"]},{"time":"13:00-14:00","courts":["JIC 1","JIC 1","Junioren- Treff","Junioren","Junioren","Junioren"]},{"time":"14:00-15:00","courts":["JIC 1","JIC 1 / Junioren-Treff","Junioren- Treff","Junioren","Junioren","Junioren"]},{"time":"15:00-16:00","courts":["JIC 1","JIC 1 / Junioren-Treff","Junioren- Treff","Junioren","Junioren","Junioren"]},{"time":"16:00-17:00","courts":["JIC 1","JIC 1 / Junioren-Treff","Junioren- Treff","Junioren","Junioren","Junioren"]},{"time":"17:00-18:00","courts":["JIC 1","JIC 1","","Junioren","Junioren","Junioren"]},{"time":"18:00-18:30","courts":["JIC 1","12h","NLC Simon","NLC Simon","TS (TCW)","Tennisschule"]},{"time":"18:30-19:00","courts":["JIC 1","12h","NLC Simon","NLC Simon","TS (TCW)","Tennisschule"]},{"time":"19:00-19:30","courts":["NLC (Jasmin)","NLC (Jasmin)","NLC Simon","NLC Simon","TS (TCW)","Tennisschule"]},{"time":"19:30-20:00","courts":["NLC (Jasmin)","NLC (Jasmin)","NLC 35+ (Sämi)","NLC 35+ (Sämi)","TS (TCW)","Tennisschule"]},{"time":"20:00-20:30","courts":["12h","12h","NLC 35+ (Sämi)","NLC 35+ (Sämi)","TS (TCW)","Tennisschule"]},{"time":"20:30-21:00","courts":["12h","12h","NLC 35+ (Sämi)","NLC 35+ (Sämi)","TS (TCW)","Tennisschule"]},{"time":"21:00-22:00","courts":["","12h","","","TS (TCW)","Tennisschule"]}],
  "Donnerstag": [{"time":"08:00-09:00","courts":["","","","","","Tennisschule"]},{"time":"09:00-10:00","courts":["","","","","","Tennisschule"]},{"time":"10:00-11:00","courts":["Pajassen ?","Pajassen ?","Pajassen ?","","","Tennisschule"]},{"time":"11:00-12:00","courts":["Pajassen ?","Pajassen ?","Pajassen ?","","","Tennisschule"]},{"time":"12:00-13:00","courts":["","","","","","Tennisschule"]},{"time":"13:00-14:00","courts":["","","","","","Tennisschule"]},{"time":"14:00-15:00","courts":["","","","","","Tennisschule"]},{"time":"15:00-16:00","courts":["","","","","","Tennisschule"]},{"time":"16:00-17:00","courts":["","","","Junioren","Junioren","Tennisschule"]},{"time":"17:00-18:00","courts":["","","","Junioren","Junioren","Tennisschule"]},{"time":"18:00-19:00","courts":["12h","12h","12h","12h","TS (TCW)","Tennisschule"]},{"time":"19:00-20:00","courts":["30+ (Martina)","30+ (Martina)","30+ (Isabel)","30+ (Isabel)","TS (TCW)","Tennisschule"]},{"time":"20:00-21:00","courts":["35+ (2L)","35+ (2L)","35+ (1L)","35+ (1L)","TS (TCW)","Tennisschule"]},{"time":"21:00-22:00","courts":["35+ (2L)","12h","35+ (1L)","12h","TS (TCW)","Tennisschule"]}],
  "Freitag": [{"time":"08:00-09:00","courts":["","","","","","Tennisschule"]},{"time":"09:00-10:00","courts":["","","","","","Tennisschule"]},{"time":"10:00-11:00","courts":["","","","","","Tennisschule"]},{"time":"11:00-12:00","courts":["","","","","","Tennisschule"]},{"time":"12:00-13:00","courts":["","","","","","Tennisschule"]},{"time":"13:00-14:00","courts":["","","","","","Tennisschule"]},{"time":"14:00-15:00","courts":["","","","","","Tennisschule"]},{"time":"15:00-16:00","courts":["","","","","","Tennisschule"]},{"time":"16:00-17:00","courts":["","","","","Junioren","Tennisschule"]},{"time":"17:00-18:00","courts":["","","","","Junioren","Tennisschule"]},{"time":"18:00-19:00","courts":["Freitagsdoppel","Freitagsdoppel","","","Tennisschule","Tennisschule"]},{"time":"19:00-20:00","courts":["Freitagsdoppel","Freitagsdoppel","","","Tennisschule","Tennisschule"]},{"time":"20:00-21:00","courts":["","","","","Tennisschule","Tennisschule"]},{"time":"21:00-22:00","courts":["","","","","Tennisschule","Tennisschule"]}]
};

const LEGEND = [
  {"label":"Die IC-Trainings finden von MO-DO auf Plätzen 1, 2,3,4 statt (i.d.R. 19-22 Uhr)","text":""},
  {"label":"2 Slots Damen/55+ Herren & 3 Slots Herren a 1h pro Team/Abend, 4 Spielende pro Platz","text":""},
  {"label":"Unbenutzte Plätze werden durch Captains 24h freigegeben","text":""},
  {"label":"Keine zusätzlichen Buchungen durch IC Spielende am jeweiligen Trainingsabend (17-22 Uhr)","text":""},
  {"label":"12h","text":"Plätze durch IC-Captains 12h vorher buchbar (Mitte April - Mitte Juni)."}
];

const COMPARE_DATA = [
  { lk: "1", swiss: "N1", width: 100, ntrp: "7.0", color: "var(--compare-n1)" },
  { lk: "2", swiss: "N1", width: 95, ntrp: "6.5", color: "var(--compare-n1)" },
  { lk: "3", swiss: "N2", width: 90, ntrp: "6.0", color: "var(--compare-n2)" },
  { lk: "4", swiss: "N3", width: 85, ntrp: "5.5", color: "var(--compare-n3)" },
  { lk: "5", swiss: "N4 / R1", width: 80, ntrp: "5.5", color: "var(--compare-n4)" },
  { lk: "6", swiss: "R1", width: 75, ntrp: "5.0", color: "var(--compare-r1)" },
  { lk: "7", swiss: "R2", width: 70, ntrp: "5.0", color: "var(--compare-r2)" },
  { lk: "8", swiss: "R2", width: 65, ntrp: "4.5", color: "var(--compare-r2)" },
  { lk: "9", swiss: "R3", width: 60, ntrp: "4.5", color: "var(--compare-r3)" },
  { lk: "10", swiss: "R3", width: 56, ntrp: "4.5", color: "var(--compare-r3)" },
  { lk: "11", swiss: "R4", width: 52, ntrp: "4.0", color: "var(--compare-r4)" },
  { lk: "12", swiss: "R4", width: 48, ntrp: "4.0", color: "var(--compare-r4)" },
  { lk: "13", swiss: "R5", width: 44, ntrp: "4.0", color: "var(--compare-r5)" },
  { lk: "14", swiss: "R5", width: 40, ntrp: "3.5", color: "var(--compare-r5)" },
  { lk: "15", swiss: "R5 / R6", width: 36, ntrp: "3.5", color: "var(--compare-r5)" },
  { lk: "16", swiss: "R6", width: 33, ntrp: "3.5", color: "var(--compare-r6)" },
  { lk: "17", swiss: "R6", width: 30, ntrp: "3.0", color: "var(--compare-r6)" },
  { lk: "18", swiss: "R7", width: 27, ntrp: "3.0", color: "var(--compare-r7)" },
  { lk: "19", swiss: "R7", width: 24, ntrp: "3.0", color: "var(--compare-r7)" },
  { lk: "20", swiss: "R7 / R8", width: 21, ntrp: "2.5", color: "var(--compare-r7)" },
  { lk: "21", swiss: "R8", width: 18, ntrp: "2.5", color: "var(--compare-r8)" },
  { lk: "22", swiss: "R8", width: 15, ntrp: "2.5", color: "var(--compare-r8)" },
  { lk: "23", swiss: "R8 / R9", width: 12, ntrp: "2.5", color: "var(--compare-r8)" },
  { lk: "24", swiss: "R9", width: 9, ntrp: "2.0", color: "var(--compare-r9)" },
  { lk: "25", swiss: "R9", width: 6, ntrp: "2.0", color: "var(--compare-r9)" }
];

const COMPARE_LEGEND = [
  { label: "N1", color: "var(--compare-n1)" },
  { label: "N2", color: "var(--compare-n2)" },
  { label: "N3", color: "var(--compare-n3)" },
  { label: "N4", color: "var(--compare-n4)" },
  { label: "R1", color: "var(--compare-r1)" },
  { label: "R2", color: "var(--compare-r2)" },
  { label: "R3", color: "var(--compare-r3)" },
  { label: "R4", color: "var(--compare-r4)" },
  { label: "R5", color: "var(--compare-r5)" },
  { label: "R6", color: "var(--compare-r6)" },
  { label: "R7", color: "var(--compare-r7)" },
  { label: "R8", color: "var(--compare-r8)" },
  { label: "R9", color: "var(--compare-r9)" }
];
const RESULTS_YEARS = ["2026", "2025", "2024", "2023", "2022", "2021"];
const RESULTS_CURRENT_YEAR = String(new Date().getFullYear());
const RESULTS_CLUB_NAME = "Waidberg ZH";

let teamData = { damen: [], herren: [] };
let matchData = [];
let rankingChangeData = [];
let waidcupEvents = [];
let activeWaidcupEventId = "";
let matchStand = "22. März 2026";
let teamResultsCache = new Map();
let encountResultsCache = new Map();
let resultsTeamsCache = new Map();
let availableResultsTeams = [];
let activeResultsYear = RESULTS_YEARS.includes(RESULTS_CURRENT_YEAR) ? RESULTS_CURRENT_YEAR : RESULTS_YEARS[0];
let activeResultsTeamId = "";
let activeTeamSection = "damen";

const headerStandEl = document.getElementById("header-stand");
const viewButtons = [...document.querySelectorAll("[data-view]")];
const views = {
  teams: document.getElementById("view-teams"),
  training: document.getElementById("view-training"),
  matches: document.getElementById("view-matches"),
  results: document.getElementById("view-results"),
  ratings: document.getElementById("view-ratings"),
  waidcup: document.getElementById("view-waidcup"),
};

const teamsEl = document.getElementById("teams-grid");
const teamsEmptyEl = document.getElementById("teams-empty");
const cardTpl = document.getElementById("card-template");
const btnDamen = document.getElementById("btn-damen");
const btnHerren = document.getElementById("btn-herren");

const planBody = document.getElementById("plan-body");
const legendList = document.getElementById("legend-list");
const dayButtons = [...document.querySelectorAll("[data-day]")];

const matchesBody = document.getElementById("matches-body");
const roundButtons = [...document.querySelectorAll("[data-round]")];
const changesBody = document.getElementById("changes-body");
const changesEmptyEl = document.getElementById("changes-empty");
const resultsTeamSwitch = document.getElementById("results-team-switch");
const resultsYearButtons = [...document.querySelectorAll("[data-results-year]")];
const resultsTitleEl = document.getElementById("results-title");
const resultsSubtitleEl = document.getElementById("results-subtitle");
const resultsMatchesBody = document.getElementById("results-matches-body");
const resultsRankingBody = document.getElementById("results-ranking-body");
const resultsEmptyEl = document.getElementById("results-empty");
const resultsOverviewEl = document.getElementById("results-overview");
const resultsDetailEl = document.getElementById("results-detail");
const resultsBackEl = document.getElementById("results-back");
const encountTitleEl = document.getElementById("encount-title");
const encountSubtitleEl = document.getElementById("encount-subtitle");
const encountBadgeEl = document.getElementById("encount-badge");
const encountSinglesBody = document.getElementById("encount-singles-body");
const encountDoublesBody = document.getElementById("encount-doubles-body");
const encountSinglesHomeHead = document.getElementById("encount-singles-home-head");
const encountSinglesVisitHead = document.getElementById("encount-singles-visit-head");
const encountDoublesHomeHead = document.getElementById("encount-doubles-home-head");
const encountDoublesVisitHead = document.getElementById("encount-doubles-visit-head");
const compareBody = document.getElementById("compare-body");
const compareLegend = document.getElementById("compare-legend");
const waidcupUpdatedEl = document.getElementById("waidcup-updated");
const waidcupEventTabsEl = document.getElementById("waidcup-event-tabs");
const waidcupBodyEl = document.getElementById("waidcup-body");
const waidcupEmptyEl = document.getElementById("waidcup-empty");
const ratingViewButtons = [...document.querySelectorAll("[data-ratings-view]")];
const ratingSubviews = {
  changes: document.getElementById("ratings-changes"),
  compare: document.getElementById("ratings-compare"),
};
let activeRatingsView = "changes";

function setHeaderStand(value) {
  headerStandEl.textContent = value ? `Stand ${value}` : "Stand 22. März 2026";
}

function normalizeLeagueLabel(value) {
  return String(value || "")
    .trim()
    .replace(/^(\d)\.\s*Liga$/i, "$1L");
}

function buildResultsLabelFromTeam(team) {
  const gender = String(team?.gender || "").trim();
  const category = String(team?.category || "").trim();
  const liga = normalizeLeagueLabel(team?.liga);
  const prefix = category && category !== "Aktiv" ? `${category} ` : "";
  return `${prefix}${liga} ${gender}`.trim();
}

function currentYearResultsTeamByLabel(label) {
  const teams = resultsTeamsCache.get(RESULTS_CURRENT_YEAR) || [];
  const target = String(label || "").trim();
  return teams.find((team) => String(team.label || "").trim() === target) || null;
}

function activeViewFromHash() {
  const key = window.location.hash.replace("#", "").trim();
  if (key === "changes" || key === "compare") {
    activeRatingsView = key;
    return "ratings";
  }
  return views[key] ? key : "teams";
}

function showView(viewKey, updateHash = true) {
  Object.entries(views).forEach(([key, el]) => {
    el.classList.toggle("active", key === viewKey);
  });
  viewButtons.forEach((button) => {
    const active = button.dataset.view === viewKey;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  if (updateHash) {
    const targetHash = `#${viewKey}`;
    if (window.location.hash !== targetHash) {
      history.replaceState(null, "", targetHash);
    }
  }
  if (viewKey === "ratings") {
    showRatingsView(activeRatingsView);
  }
}

function showRatingsView(viewKey) {
  activeRatingsView = ratingSubviews[viewKey] ? viewKey : "changes";
  Object.entries(ratingSubviews).forEach(([key, el]) => {
    const active = key === activeRatingsView;
    el.classList.toggle("active", active);
    el.hidden = !active;
  });
  ratingViewButtons.forEach((button) => {
    const active = button.dataset.ratingsView === activeRatingsView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function captainLabel(status) {
  if (status === 1) return "Capt.";
  if (status === 2) return "Capt. Stv.";
  return "";
}

function sortedPlayers(players) {
  const rank = { 1: 0, 2: 1, 0: 2 };
  const rankingOrder = (value) => {
    const s = String(value || "").trim().toUpperCase();
    if (!s) return [9, 999];
    if (/^N\d+$/.test(s)) return [0, Number(s.slice(1))];
    if (/^R\d+$/.test(s)) return [1, Number(s.slice(1))];
    return [8, 999];
  };
  return [...(players || [])].sort((a, b) => {
    const ra = rank[a.captain_status] ?? 9;
    const rb = rank[b.captain_status] ?? 9;
    if (ra !== rb) return ra - rb;
    const [ka1, ka2] = rankingOrder(a.klassierung);
    const [kb1, kb2] = rankingOrder(b.klassierung);
    if (ka1 !== kb1) return ka1 - kb1;
    if (ka2 !== kb2) return ka2 - kb2;
    return String(a.name || "").localeCompare(String(b.name || ""), "de", { sensitivity: "base" });
  });
}

function renderPlayer(player) {
  const li = document.createElement("li");
  const nameEl = document.createElement("span");
  nameEl.className = "player-link";
  const rankEl = document.createElement("span");
  rankEl.className = "player-rank";
  const status = Number(player.captain_status || 0);
  const name = String(player.name || "").trim();
  const klassierung = String(player.klassierung || "").trim().toUpperCase();
  const rawUrl = String(player.myTennisID || "").trim();
  const label = captainLabel(status);

  if (label) {
    const strong = document.createElement("strong");
    strong.textContent = `${name} (${label})`;
    nameEl.appendChild(strong);
  } else {
    nameEl.textContent = name;
  }
  rankEl.textContent = klassierung;

  nameEl.addEventListener("click", () => {
    if (!rawUrl) return;
    const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });

  li.append(nameEl, rankEl);
  return li;
}

function renderTeams(key) {
  activeTeamSection = key;
  teamsEl.innerHTML = "";
  const list = teamData[key] || [];

  list.forEach((team) => {
    const node = cardTpl.content.firstElementChild.cloneNode(true);
    const titleEl = node.querySelector(".card-title");
    const groupButton = node.querySelector(".team-group-link");
    const resultsMeta = currentYearResultsTeamByLabel(buildResultsLabelFromTeam(team));
    titleEl.textContent = team.title;
    if (resultsMeta) {
      groupButton.hidden = false;
      groupButton.textContent = resultsMeta.group ? `Gruppe ${resultsMeta.group}` : "Resultate";
      groupButton.title = "Zu Gruppenspielen und Rangliste";
      groupButton.addEventListener("click", async () => {
        showResultsOverview();
        showView("results");
        try {
          await initializeResultsView(RESULTS_CURRENT_YEAR, { teamId: String(resultsMeta.teamId) });
        } catch (error) {
          renderResultsError();
        }
      });
    }
    node.querySelector(".meta-teamziel").textContent = `Teamziel: ${team.teamziel || "-"}`;
    node.querySelector(".meta-training").textContent = `Trainingstag: ${team.trainingstag || "-"}`;

    const ul = node.querySelector(".players");
    sortedPlayers(team.players || []).forEach((player) => ul.appendChild(renderPlayer(player)));
    teamsEl.appendChild(node);
  });

  teamsEmptyEl.style.display = list.length ? "none" : "block";
  btnDamen.classList.toggle("active", key === "damen");
  btnHerren.classList.toggle("active", key === "herren");
  btnDamen.setAttribute("aria-selected", String(key === "damen"));
  btnHerren.setAttribute("aria-selected", String(key === "herren"));
}

function renderTrainingDay(day) {
  const rows = (PLAN_DATA[day] || []).filter((row) => {
    const start = Number(String(row.time || "").slice(0, 2));
    return Number.isFinite(start) && start >= 18 && start < 22;
  });
  planBody.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    const tdTime = document.createElement("td");
    tdTime.className = "time";
    tdTime.textContent = row.time;
    tr.appendChild(tdTime);

    row.courts.forEach((court) => {
      const td = document.createElement("td");
      if (court) {
        td.textContent = court;
      } else {
        td.className = "muted";
        td.textContent = "-";
      }
      tr.appendChild(td);
    });

    planBody.appendChild(tr);
  });

  dayButtons.forEach((btn) => {
    const active = btn.dataset.day === day;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", String(active));
  });
}

function renderLegend() {
  legendList.innerHTML = "";
  LEGEND.forEach((entry) => {
    const li = document.createElement("li");
    if (entry.text) {
      li.innerHTML = `<strong>${entry.label}:</strong> ${entry.text}`;
    } else {
      li.textContent = entry.label;
    }
    legendList.appendChild(li);
  });
}

function renderClubCell(value) {
  const cell = document.createElement("td");
  if (value === "Waidberg ZH") {
    const strong = document.createElement("strong");
    strong.className = "club-name";
    strong.textContent = value;
    cell.appendChild(strong);
  } else {
    cell.textContent = value;
  }
  return cell;
}

function renderMatches(activeRound = "1") {
  let lastDate = "";
  matchesBody.innerHTML = "";
  const list = matchData.filter((match) => match.runde === activeRound);

  list.forEach((match) => {
    const tr = document.createElement("tr");
    const dateCell = document.createElement("td");
    dateCell.className = "col-date";
    if (match.date !== lastDate) {
      const span = document.createElement("span");
      span.className = "date-label";
      span.textContent = match.date;
      dateCell.appendChild(span);
      lastDate = match.date;
    } else {
      dateCell.className = "col-date muted";
      dateCell.textContent = " ";
    }

    const timeCell = document.createElement("td");
    timeCell.className = "col-time";
    timeCell.textContent = match.time || "-";

    const ligaCell = document.createElement("td");
    ligaCell.textContent = match.liga;

    tr.append(dateCell, timeCell, ligaCell, renderClubCell(match.home), renderClubCell(match.away));
    matchesBody.appendChild(tr);
  });

  roundButtons.forEach((button) => {
    const active = button.dataset.round === activeRound;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function rankingOrder(value) {
  const s = String(value || "").trim().toUpperCase();
  if (!s) return [9, 999];
  if (/^N\d+$/.test(s)) return [0, Number(s.slice(1))];
  if (/^R\d+$/.test(s)) return [1, Number(s.slice(1))];
  return [8, 999];
}

function compareRankings(oldValue, newValue) {
  const [oldGroup, oldNum] = rankingOrder(oldValue);
  const [newGroup, newNum] = rankingOrder(newValue);
  if (newGroup < oldGroup) return "up";
  if (newGroup > oldGroup) return "down";
  if (newNum < oldNum) return "up";
  if (newNum > oldNum) return "down";
  return "flat";
}

function formatChangeDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "-";
  const date = new Date(raw.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return raw.split(" ")[0] || raw;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function renderRankingChanges() {
  changesBody.innerHTML = "";
  const list = rankingChangeData || [];

  list.forEach((item) => {
    const tr = document.createElement("tr");
    const playerCell = document.createElement("td");
    const oldCell = document.createElement("td");
    const newCell = document.createElement("td");
    const dateCell = document.createElement("td");
    const state = compareRankings(item.old_klassierung, item.new_klassierung);

    const wrap = document.createElement("div");
    wrap.className = "change-player";

    const arrow = document.createElement("span");
    arrow.className = `change-arrow ${state}`;
    arrow.textContent = state === "up" ? "↑" : state === "down" ? "↓" : "•";

    if (item.myTennisID) {
      const link = document.createElement("a");
      link.className = "change-link";
      link.href = item.myTennisID;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.player_name;
      wrap.append(arrow, link);
    } else {
      const name = document.createElement("span");
      name.textContent = item.player_name;
      wrap.append(arrow, name);
    }

    oldCell.textContent = item.old_klassierung || "-";
    newCell.textContent = item.new_klassierung || "-";
    dateCell.textContent = formatChangeDate(item.changed_at);
    playerCell.appendChild(wrap);
    tr.append(playerCell, newCell, oldCell, dateCell);
    changesBody.appendChild(tr);
  });

  changesEmptyEl.style.display = list.length ? "none" : "block";
}

function resultsArray(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function pad2(value) {
  return String(value ?? "").padStart(2, "0");
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

async function fetchResultsTeams(year) {
  const cacheKey = String(year);
  if (resultsTeamsCache.has(cacheKey)) {
    return resultsTeamsCache.get(cacheKey);
  }
  const payload = await fetchJson(`/api/ic/teams?year=${encodeURIComponent(cacheKey)}`);
  const items = Array.isArray(payload.items) ? payload.items : [];
  resultsTeamsCache.set(cacheKey, items);
  return items;
}

async function initializeResultsView(year, preferred = {}) {
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

function renderResultsError(message = "Fehler beim Laden der Resultate.") {
  resultsTitleEl.textContent = "Ergebnisse";
  resultsSubtitleEl.textContent = message;
  resultsSubtitleEl.hidden = false;
  resultsMatchesBody.innerHTML = '<tr><td colspan="4">Fehler beim Laden der Resultate.</td></tr>';
  resultsRankingBody.innerHTML = '<tr><td colspan="4">Fehler beim Laden der Rangliste.</td></tr>';
  resultsEmptyEl.style.display = "none";
  resultsOverviewEl.hidden = false;
  resultsDetailEl.hidden = true;
}

function showResultsOverview() {
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

function normalizeMatchList(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
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

function renderEncountError(message = "Fehler beim Laden der Begegnung.") {
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

async function loadTeamResults(teamId, year) {
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

async function loadEncountResults(encountId, year = "") {
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

function renderComparison() {
  compareBody.innerHTML = "";
  compareLegend.innerHTML = "";

  COMPARE_DATA.forEach((item) => {
    const tr = document.createElement("tr");
    if (item.highlight) tr.classList.add("compare-highlight");

    const lkCell = document.createElement("td");
    lkCell.className = "compare-lk";
    lkCell.textContent = item.lk;

    const swissCell = document.createElement("td");
    swissCell.className = "compare-swiss";
    swissCell.textContent = item.swiss;
    swissCell.style.color = item.color;

    const barCell = document.createElement("td");
    barCell.className = "compare-bar-cell";
    const track = document.createElement("div");
    track.className = "compare-bar-track";
    const fill = document.createElement("div");
    fill.className = "compare-bar-fill";
    fill.style.width = `${item.width}%`;
    fill.style.background = item.color;
    track.appendChild(fill);
    barCell.appendChild(track);

    const ntrpCell = document.createElement("td");
    ntrpCell.className = "compare-ntrp";
    ntrpCell.textContent = item.ntrp;

    tr.append(lkCell, swissCell, barCell, ntrpCell);
    compareBody.appendChild(tr);
  });

  COMPARE_LEGEND.forEach((item) => {
    const el = document.createElement("div");
    el.className = "compare-legend-item";

    const dot = document.createElement("span");
    dot.className = "compare-legend-dot";
    dot.style.background = item.color;

    const label = document.createElement("span");
    label.textContent = item.label;

    el.append(dot, label);
    compareLegend.appendChild(el);
  });
}

function formatWaidcupUpdatedAt(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function waidcupEventGroup(name) {
  const label = String(name || "").trim().toUpperCase();
  if (label.startsWith("WS") || label.startsWith("WD") || label.startsWith("DD")) return 0;
  if (label.startsWith("MS") || label.startsWith("MD") || label.startsWith("HD")) return 1;
  if (label.startsWith("DM") || label.startsWith("XD") || label.includes("MIX")) return 2;
  return 9;
}

function buildWaidcupPlayerLine(player, suffix = "") {
  const name = String(player[`player_name${suffix}`] || "").trim();
  const ranking = String(player[`ranking${suffix}`] || "").trim().toUpperCase();
  const rawUrl = String(player[`player_url${suffix}`] || "").trim();
  if (!name) return null;

  const line = document.createElement("div");
  line.className = "waidcup-entry-line";

  if (rawUrl) {
    const link = document.createElement("a");
    link.className = "waidcup-player-link";
    link.href = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = name;
    line.appendChild(link);
  } else {
    const span = document.createElement("span");
    span.textContent = name;
    line.appendChild(span);
  }

  if (ranking) {
    const rank = document.createElement("span");
    rank.className = "waidcup-rank";
    rank.textContent = ranking;
    line.appendChild(rank);
  }

  return line;
}

function renderWaidcupEventTabs() {
  const events = Array.isArray(waidcupEvents) ? waidcupEvents : [];
  if (!events.length) {
    activeWaidcupEventId = "";
    waidcupEventTabsEl.innerHTML = "";
    return;
  }

  if (!events.some((event) => String(event.event_id) === String(activeWaidcupEventId))) {
    activeWaidcupEventId = String(events[0].event_id);
  }

  waidcupEventTabsEl.innerHTML = events
    .map((event) => {
      const activeClass = String(event.event_id) === String(activeWaidcupEventId) ? "active" : "";
      return `<button type="button" class="${activeClass}" data-waidcup-event-id="${String(event.event_id)}">${event.event_name || "Konkurrenz"}</button>`;
    })
    .join("");
}

function renderWaidcup() {
  const events = Array.isArray(waidcupEvents) ? waidcupEvents : [];
  renderWaidcupEventTabs();
  if (!events.length) {
    waidcupUpdatedEl.textContent = "Keine Anmeldungen gefunden.";
    waidcupBodyEl.innerHTML = '<tr><td colspan="3">Keine Anmeldungen vorhanden.</td></tr>';
    waidcupEmptyEl.style.display = "block";
    return;
  }

  const latest = events
    .map((event) => formatWaidcupUpdatedAt(event.updated_at))
    .find(Boolean);
  waidcupUpdatedEl.textContent = latest ? `Zuletzt aktualisiert: ${latest}` : "Anmeldungen aus der Waidcup-Datenbank";
  waidcupEmptyEl.style.display = "none";
  const activeEvent = events.find((event) => String(event.event_id) === String(activeWaidcupEventId));
  if (!activeEvent) {
    waidcupBodyEl.innerHTML = '<tr><td colspan="3">Keine Eventdaten gefunden.</td></tr>';
    return;
  }

  const players = Array.isArray(activeEvent.players) ? activeEvent.players : [];
  if (!players.length) {
    waidcupBodyEl.innerHTML = '<tr><td colspan="3">Noch keine Anmeldungen vorhanden.</td></tr>';
    return;
  }

  waidcupBodyEl.innerHTML = "";
  players.forEach((player) => {
    const tr = document.createElement("tr");

    const nameCell = document.createElement("td");
    const names = document.createElement("div");
    names.className = "waidcup-entry-main";
    const line1 = buildWaidcupPlayerLine(player);
    const line2 = buildWaidcupPlayerLine(player, "_2");
    if (line1) names.appendChild(line1);
    if (line2) names.appendChild(line2);
    nameCell.appendChild(names);

    const rankCell = document.createElement("td");
    const rankWrap = document.createElement("div");
    rankWrap.className = "waidcup-entry-main";
    const rank1 = String(player.ranking || "").trim().toUpperCase();
    const rank2 = String(player.ranking_2 || "").trim().toUpperCase();
    if (rank1) {
      const line = document.createElement("div");
      line.className = "waidcup-rank-line";
      line.textContent = rank1;
      rankWrap.appendChild(line);
    }
    if (rank2) {
      const line = document.createElement("div");
      line.className = "waidcup-rank-line";
      line.textContent = rank2;
      rankWrap.appendChild(line);
    }
    rankCell.appendChild(rankWrap);

    const dateCell = document.createElement("td");
    dateCell.className = "waidcup-entry-meta";
    dateCell.textContent = player.registered_on || "–";

    tr.append(nameCell, rankCell, dateCell);
    waidcupBodyEl.appendChild(tr);
  });
}

async function loadTeams() {
  teamData = await fetchJson("/api/teams");
  renderTeams("damen");
}

async function loadMatches() {
  const payload = await fetchJson("./matches.json");
  matchData = Array.isArray(payload.matches) ? payload.matches : [];
  matchStand = payload.updated_at || matchStand;
  setHeaderStand(matchStand);
  renderMatches("1");
}

async function loadRankingChanges() {
  const payload = await fetchJson("/api/ranking-changes");
  rankingChangeData = Array.isArray(payload.items) ? payload.items : [];
  renderRankingChanges();
}

async function loadWaidcupRegistrations() {
  const payload = await fetchJson("/api/waidcup-registrations");
  waidcupEvents = (Array.isArray(payload.events) ? payload.events : [])
    .map((event, index) => ({ ...event, _sortIndex: index }))
    .sort((a, b) => {
      const groupDiff = waidcupEventGroup(a.event_name) - waidcupEventGroup(b.event_name);
      if (groupDiff !== 0) return groupDiff;
      return Number(a._sortIndex) - Number(b._sortIndex);
    })
    .map(({ _sortIndex, ...event }) => event);
  renderWaidcup();
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    const preview = text.slice(0, 200).replace(/\s+/g, " ").trim();
    console.error(`JSON parse failed for ${url}`, {
      status: response.status,
      contentType: response.headers.get("content-type") || "",
      preview,
    });
    throw err;
  }
}

btnDamen.addEventListener("click", () => renderTeams("damen"));
btnHerren.addEventListener("click", () => renderTeams("herren"));

dayButtons.forEach((btn) => {
  btn.addEventListener("click", () => renderTrainingDay(btn.dataset.day));
});

roundButtons.forEach((button) => {
  button.addEventListener("click", () => renderMatches(button.dataset.round));
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

ratingViewButtons.forEach((button) => {
  button.addEventListener("click", () => showRatingsView(button.dataset.ratingsView));
});

waidcupEventTabsEl.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-waidcup-event-id]");
  if (!button) return;
  activeWaidcupEventId = button.dataset.waidcupEventId || "";
  renderWaidcup();
});

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
});

window.addEventListener("hashchange", () => showView(activeViewFromHash(), false));

renderLegend();
renderComparison();
renderTrainingDay("Montag");
showView(activeViewFromHash(), false);
renderResultsYearSwitch();

loadTeams().catch(() => {
  teamsEl.innerHTML = "";
  teamsEmptyEl.style.display = "block";
  teamsEmptyEl.textContent = "Fehler beim Laden der Teamdaten aus der Datenbank.";
});

loadMatches().catch(() => {
  matchesBody.innerHTML = '<tr><td colspan="5">Fehler beim Laden der Spieltermine.</td></tr>';
});

fetchResultsTeams(RESULTS_CURRENT_YEAR)
  .then((teams) => {
    resultsTeamsCache.set(RESULTS_CURRENT_YEAR, teams);
    renderTeams(activeTeamSection);
  })
  .catch(() => {});

initializeResultsView(activeResultsYear).catch(() => renderResultsError());

loadRankingChanges().catch(() => {
  changesBody.innerHTML = '<tr><td colspan="4">Fehler beim Laden der Klassierungsänderungen.</td></tr>';
  changesEmptyEl.style.display = "none";
});

loadWaidcupRegistrations().catch(() => {
  waidcupBodyEl.innerHTML = "";
  waidcupEventTabsEl.innerHTML = "";
  waidcupUpdatedEl.textContent = "Fehler beim Laden der Waidcup-Anmeldungen.";
  waidcupEmptyEl.style.display = "block";
  waidcupEmptyEl.textContent = "Waidcup-Anmeldungen konnten nicht geladen werden.";
});
