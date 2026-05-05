import { fetchJson } from "./utils.js";

let waidcupEvents = [];
let activeWaidcupEventId = "";
let waidcupUpdatedEl;
let waidcupEventTabsEl;
let waidcupBodyEl;
let waidcupEmptyEl;

function clearElement(element) {
  element.replaceChildren();
}

function appendTableMessage(body, message, colSpan = 3) {
  clearElement(body);
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  td.colSpan = colSpan;
  td.textContent = message;
  tr.appendChild(td);
  body.appendChild(tr);
}

function safeExternalUrl(rawValue) {
  const raw = String(rawValue || "").trim();
  if (!raw) return null;

  try {
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(normalized);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (!["mytennis.ch", "www.mytennis.ch"].includes(url.hostname.toLowerCase())) return null;
    return url;
  } catch {
    return null;
  }
}

export function initWaidcup() {
  waidcupUpdatedEl = document.getElementById("waidcup-updated");
  waidcupEventTabsEl = document.getElementById("waidcup-event-tabs");
  waidcupBodyEl = document.getElementById("waidcup-body");
  waidcupEmptyEl = document.getElementById("waidcup-empty");

  waidcupEventTabsEl.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-waidcup-event-id]");
    if (!button) return;
    activeWaidcupEventId = button.dataset.waidcupEventId || "";
    renderWaidcup();
  });

  return loadWaidcupRegistrations().catch(() => {
    clearElement(waidcupBodyEl);
    clearElement(waidcupEventTabsEl);
    waidcupUpdatedEl.textContent = "Fehler beim Laden der Waidcup-Anmeldungen.";
    waidcupEmptyEl.style.display = "block";
    waidcupEmptyEl.textContent = "Waidcup-Anmeldungen konnten nicht geladen werden.";
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

  const safeUrl = safeExternalUrl(rawUrl);
  if (safeUrl) {
    const link = document.createElement("a");
    link.className = "waidcup-player-link";
    link.href = safeUrl.toString();
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
    clearElement(waidcupEventTabsEl);
    return;
  }

  if (!events.some((event) => String(event.event_id) === String(activeWaidcupEventId))) {
    activeWaidcupEventId = String(events[0].event_id);
  }

  clearElement(waidcupEventTabsEl);
  events.forEach((event) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.waidcupEventId = String(event.event_id);
    button.textContent = event.event_name || "Konkurrenz";
    if (String(event.event_id) === String(activeWaidcupEventId)) {
      button.classList.add("active");
    }
    waidcupEventTabsEl.appendChild(button);
  });
}

export function renderWaidcup() {
  const events = Array.isArray(waidcupEvents) ? waidcupEvents : [];
  renderWaidcupEventTabs();
  if (!events.length) {
    waidcupUpdatedEl.textContent = "Keine Anmeldungen gefunden.";
    appendTableMessage(waidcupBodyEl, "Keine Anmeldungen vorhanden.");
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
    appendTableMessage(waidcupBodyEl, "Keine Eventdaten gefunden.");
    return;
  }

  const players = Array.isArray(activeEvent.players) ? activeEvent.players : [];
  if (!players.length) {
    appendTableMessage(waidcupBodyEl, "Noch keine Anmeldungen vorhanden.");
    return;
  }

  clearElement(waidcupBodyEl);
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
