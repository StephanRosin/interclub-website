import { fetchJson, rankingOrder } from "./utils.js";

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

const COMPARE_LEGEND = ["N1","N2","N3","N4","R1","R2","R3","R4","R5","R6","R7","R8","R9"]
  .map((label) => ({ label, color: `var(--compare-${label.toLowerCase()})` }));

let rankingChangeData = [];
let activeRatingsView = "changes";
let changesBody;
let changesEmptyEl;
let compareBody;
let compareLegend;
let ratingViewButtons = [];
let ratingSubviews = {};

export function initRatings(initialView = "changes") {
  activeRatingsView = initialView;
  changesBody = document.getElementById("changes-body");
  changesEmptyEl = document.getElementById("changes-empty");
  compareBody = document.getElementById("compare-body");
  compareLegend = document.getElementById("compare-legend");
  ratingViewButtons = [...document.querySelectorAll("[data-ratings-view]")];
  ratingSubviews = {
    changes: document.getElementById("ratings-changes"),
    compare: document.getElementById("ratings-compare"),
  };

  ratingViewButtons.forEach((button) => {
    button.addEventListener("click", () => showRatingsView(button.dataset.ratingsView));
  });

  renderComparison();
  showRatingsView(activeRatingsView);
  return loadRankingChanges().catch(() => {
    changesBody.innerHTML = '<tr><td colspan="4">Fehler beim Laden der Klassierungsänderungen.</td></tr>';
    changesEmptyEl.style.display = "none";
  });
}

export function getActiveRatingsView() {
  return activeRatingsView;
}

export function setActiveRatingsView(viewKey) {
  activeRatingsView = ratingSubviews[viewKey] ? viewKey : "changes";
}

export function showRatingsView(viewKey) {
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

async function loadRankingChanges() {
  const payload = await fetchJson("/api/ranking-changes");
  rankingChangeData = Array.isArray(payload.items) ? payload.items : [];
  renderRankingChanges();
}

export function renderRankingChanges() {
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

export function renderComparison() {
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
