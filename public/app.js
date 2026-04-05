const PLAN_DATA = {
  "Montag": [{"time":"08:00-09:00","courts":["","","","","",""]},{"time":"09:00-10:00","courts":["","","","","",""]},{"time":"10:00-11:00","courts":["","","","","",""]},{"time":"11:00-12:00","courts":["","","","","",""]},{"time":"12:00-13:00","courts":["","","","","",""]},{"time":"13:00-14:00","courts":["","","","","",""]},{"time":"14:00-15:00","courts":["","","","","","Tennisschule"]},{"time":"15:00-16:00","courts":["","","","","","Tennisschule"]},{"time":"16:00-17:00","courts":["","","","","Junioren","Tennisschule"]},{"time":"17:00-18:00","courts":["","","","","Junioren","Tennisschule"]},{"time":"18:00-19:00","courts":["12h","12h","12h","12h","TS (TCW)","Tennisschule"]},{"time":"19:00-20:00","courts":["1. Liga (Xenia)","1. Liga (Xenia)","55+ (P)","55+ (P)","TS (TCW)","Tennisschule"]},{"time":"20:00-21:00","courts":["2. Liga (Sophie)","2. Liga (Sophie)","45+ (M)","45+ (M)","TS (TCW)","Tennisschule"]},{"time":"21:00-22:00","courts":["12h","12h","45+ (M)","12h","TS (TCW)","Tennisschule"]}],
  "Dienstag": [{"time":"08:00-09:00","courts":["","","","","","Tennisschule"]},{"time":"09:00-10:00","courts":["Senioren-Treff","Senioren-Treff","Senioren-Treff","","","Tennisschule"]},{"time":"10:00-11:00","courts":["Senioren-Treff","Senioren-Treff","Senioren-Treff","","","Tennisschule"]},{"time":"11:00-12:00","courts":["Senioren-Treff","Senioren-Treff","Senioren-Treff","","","Tennisschule"]},{"time":"12:00-13:00","courts":["","","","","","Tennisschule"]},{"time":"13:00-14:00","courts":["","","","","","Tennisschule"]},{"time":"14:00-15:00","courts":["","","","","","Tennisschule"]},{"time":"15:00-16:00","courts":["","","","","","Tennisschule"]},{"time":"16:00-17:00","courts":["","","","","Junioren","Tennisschule"]},{"time":"17:00-18:00","courts":["","","","","Junioren","Tennisschule"]},{"time":"18:00-19:00","courts":["12h","12h","12h","12h","TS (TCW)","Tennisschule"]},{"time":"19:00-20:00","courts":["1. Liga (Alex)","1. Liga (Alex)","30+ (Florine)","30+ (Florine)","TS (TCW)","Tennisschule"]},{"time":"20:00-21:00","courts":["1. Liga (Alex)","2. Liga (Nico)","2. Liga (Nico)","12h","TS (TCW)","Tennisschule"]},{"time":"21:00-22:00","courts":["12h","2. Liga (Nico)","12h","12h","TS (TCW)","Tennisschule"]}],
  "Mittwoch": [{"time":"08:00-09:00","courts":["","","","","","Tennisschule"]},{"time":"09:00-10:00","courts":["","","","","","Tennisschule"]},{"time":"10:00-11:00","courts":["","","","","","Tennisschule"]},{"time":"11:00-12:00","courts":["","","","","","Tennisschule"]},{"time":"12:00-13:00","courts":["","","","","","Tennisschule"]},{"time":"13:00-14:00","courts":["JIC 1","JIC 1","Junioren- Treff","Junioren","Junioren","Junioren"]},{"time":"14:00-15:00","courts":["JIC 1","JIC 1 / Junioren-Treff","Junioren- Treff","Junioren","Junioren","Junioren"]},{"time":"15:00-16:00","courts":["JIC 1","JIC 1 / Junioren-Treff","Junioren- Treff","Junioren","Junioren","Junioren"]},{"time":"16:00-17:00","courts":["JIC 1","JIC 1 / Junioren-Treff","Junioren- Treff","Junioren","Junioren","Junioren"]},{"time":"17:00-18:00","courts":["JIC 1","JIC 1","","Junioren","Junioren","Junioren"]},{"time":"18:00-19:00","courts":["JIC 1","12h","12h","12h","TS (TCW)","Tennisschule"]},{"time":"19:00-20:00","courts":["NLC (Jasmin)","NLC (Jasmin)","NLC 35+ (Sämi)","NLC 35+ (Sämi)","TS (TCW)","Tennisschule"]},{"time":"20:00-21:00","courts":["12h","12h","NLC Simon","NLC 35+ (Sämi)","TS (TCW)","Tennisschule"]},{"time":"21:00-22:00","courts":["","12h","NLC Simon","NLC Simon","TS (TCW)","Tennisschule"]}],
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

let teamData = { damen: [], herren: [] };
let matchData = [];
let rankingChangeData = [];
let matchStand = "22. März 2026";

const headerStandEl = document.getElementById("header-stand");
const viewButtons = [...document.querySelectorAll("[data-view]")];
const views = {
  teams: document.getElementById("view-teams"),
  training: document.getElementById("view-training"),
  matches: document.getElementById("view-matches"),
  changes: document.getElementById("view-changes"),
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

function setHeaderStand(value) {
  headerStandEl.textContent = value ? `Stand ${value}` : "Stand 22. März 2026";
}

function activeViewFromHash() {
  const key = window.location.hash.replace("#", "").trim();
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
  teamsEl.innerHTML = "";
  const list = teamData[key] || [];

  list.forEach((team) => {
    const node = cardTpl.content.firstElementChild.cloneNode(true);
    node.querySelector(".card-title").textContent = team.title;
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
    tr.append(playerCell, oldCell, newCell, dateCell);
    changesBody.appendChild(tr);
  });

  changesEmptyEl.style.display = list.length ? "none" : "block";
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

window.addEventListener("hashchange", () => showView(activeViewFromHash(), false));

renderLegend();
renderTrainingDay("Montag");
showView(activeViewFromHash(), false);

loadTeams().catch(() => {
  teamsEl.innerHTML = "";
  teamsEmptyEl.style.display = "block";
  teamsEmptyEl.textContent = "Fehler beim Laden der Teamdaten aus der Datenbank.";
});

loadMatches().catch(() => {
  matchesBody.innerHTML = '<tr><td colspan="5">Fehler beim Laden der Spieltermine.</td></tr>';
});

loadRankingChanges().catch(() => {
  changesBody.innerHTML = '<tr><td colspan="4">Fehler beim Laden der Klassierungsänderungen.</td></tr>';
  changesEmptyEl.style.display = "none";
});
