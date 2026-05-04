import { buildResultsLabelFromTeam, fetchJson, rankingOrder } from "./utils.js";
import { RESULTS_CURRENT_YEAR, currentYearResultsTeamByLabel, initializeResultsView, renderResultsError, showResultsOverview } from "./results.js";

let teamData = { damen: [], herren: [] };
let activeTeamSection = "damen";
let onShowResults = () => {};

let teamsEl;
let teamsEmptyEl;
let cardTpl;
let btnDamen;
let btnHerren;

export function initTeams(options = {}) {
  onShowResults = options.onShowResults || onShowResults;
  teamsEl = document.getElementById("teams-grid");
  teamsEmptyEl = document.getElementById("teams-empty");
  cardTpl = document.getElementById("card-template");
  btnDamen = document.getElementById("btn-damen");
  btnHerren = document.getElementById("btn-herren");

  btnDamen.addEventListener("click", () => renderTeams("damen"));
  btnHerren.addEventListener("click", () => renderTeams("herren"));

  return loadTeams().catch(() => {
    teamsEl.innerHTML = "";
    teamsEmptyEl.style.display = "block";
    teamsEmptyEl.textContent = "Fehler beim Laden der Teamdaten aus der Datenbank.";
  });
}

export async function loadTeams() {
  teamData = await fetchJson("/api/teams");
  renderTeams("damen");
}

export function refreshTeamGroupButtons() {
  renderTeams(activeTeamSection);
}

function captainLabel(status) {
  if (status === 1) return "Capt.";
  if (status === 2) return "Capt. Stv.";
  return "";
}

function sortedPlayers(players) {
  const rank = { 1: 0, 2: 1, 0: 2 };
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

export function renderTeams(key) {
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
        onShowResults();
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
