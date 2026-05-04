import { fetchJson } from "./utils.js";

let matchData = [];
let matchesYear = String(new Date().getFullYear());
let matchStand = "22. März 2026";
let activeRound = "1";
let onSetHeaderStand = () => {};
let onOpenEncount = () => {};

let matchesBody;
let roundButtons = [];

export function initMatches(options = {}) {
  onSetHeaderStand = options.onSetHeaderStand || onSetHeaderStand;
  onOpenEncount = options.onOpenEncount || onOpenEncount;
  matchesBody = document.getElementById("matches-body");
  roundButtons = [...document.querySelectorAll("[data-round]")];

  roundButtons.forEach((button) => {
    button.addEventListener("click", () => renderMatches(button.dataset.round));
  });

  return loadMatches().catch(() => {
    matchesBody.innerHTML = '<tr><td colspan="6">Fehler beim Laden der Spieltermine.</td></tr>';
  });
}

export async function loadMatches() {
  const payload = await fetchJson("./matches.json");
  matchData = Array.isArray(payload.matches) ? payload.matches : [];
  matchesYear = String(payload.year || matchesYear);
  matchStand = payload.updated_at || matchStand;
  onSetHeaderStand(matchStand);
  renderMatches(activeRound);
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

function showMatchEncount(match) {
  const encountId = Number(match?.encountId || 0);
  if (!encountId) return;
  const year = String(match?.year || matchesYear || new Date().getFullYear());
  onOpenEncount(encountId, year);
}

export function renderMatches(round = "1") {
  activeRound = round;
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

    const resultCell = document.createElement("td");
    resultCell.className = "results-right";
    if (Number(match.encountId) > 0 && Number(match.validated) === 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "results-result-button";
      button.title = "Begegnung öffnen";
      const resultValue = document.createElement("span");
      resultValue.className = "results-result-value";
      resultValue.textContent = match.result || "–:–";
      const resultHint = document.createElement("span");
      resultHint.className = "results-result-hint";
      resultHint.textContent = "Details";
      button.append(resultValue, resultHint);
      button.addEventListener("click", () => showMatchEncount(match));
      resultCell.appendChild(button);
    } else {
      const muted = document.createElement("span");
      muted.className = "results-muted";
      muted.textContent = match.result || "–:–";
      resultCell.appendChild(muted);
    }

    tr.append(dateCell, timeCell, ligaCell, renderClubCell(match.home), renderClubCell(match.away), resultCell);
    matchesBody.appendChild(tr);
  });

  roundButtons.forEach((button) => {
    const active = button.dataset.round === activeRound;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
}
