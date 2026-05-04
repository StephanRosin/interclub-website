import { fetchJson } from "./utils.js";

const FALLBACK_PLAN_DATA = {
  "Montag": [
    {"time":"18:00-19:00","courts":["12h","12h","12h","12h"]},
    {"time":"19:00-20:00","courts":["Damen Aktiv 1. Liga","Damen Aktiv 1. Liga","Herren 55+ 3. Liga","Herren 55+ 3. Liga"]},
    {"time":"20:00-21:00","courts":["Damen Aktiv 2. Liga","Damen Aktiv 2. Liga","Herren 45+ 2. Liga","Herren 45+ 2. Liga"]},
    {"time":"21:00-22:00","courts":["12h","12h","Herren 45+ 2. Liga","12h"]}
  ],
  "Dienstag": [
    {"time":"18:00-19:00","courts":["12h","12h","12h","12h"]},
    {"time":"19:00-20:00","courts":["Herren Aktiv 1. Liga","Herren Aktiv 1. Liga","Damen 30+ 1. Liga","Damen 30+ 1. Liga"]},
    {"time":"20:00-21:00","courts":["Herren Aktiv 1. Liga","Herren Aktiv 2. Liga","Herren Aktiv 2. Liga","12h"]},
    {"time":"21:00-22:00","courts":["12h","Herren Aktiv 2. Liga","12h","12h"]}
  ],
  "Mittwoch": [
    {"time":"18:00-18:30","courts":["JIC 1","12h","Herren Aktiv NLC","Herren Aktiv NLC"]},
    {"time":"18:30-19:00","courts":["JIC 1","12h","Herren Aktiv NLC","Herren Aktiv NLC"]},
    {"time":"19:00-19:30","courts":["Damen Aktiv NLC","Damen Aktiv NLC","Herren Aktiv NLC","Herren Aktiv NLC"]},
    {"time":"19:30-20:00","courts":["Damen Aktiv NLC","Damen Aktiv NLC","Herren 35+ NLC","Herren 35+ NLC"]},
    {"time":"20:00-20:30","courts":["12h","12h","Herren 35+ NLC","Herren 35+ NLC"]},
    {"time":"20:30-21:00","courts":["12h","12h","Herren 35+ NLC","Herren 35+ NLC"]},
    {"time":"21:00-22:00","courts":["","12h","",""]}
  ],
  "Donnerstag": [
    {"time":"18:00-19:00","courts":["12h","12h","12h","12h"]},
    {"time":"19:00-20:00","courts":["Damen 30+ NLC","Damen 30+ NLC","Damen 30+ 3. Liga","Damen 30+ 3. Liga"]},
    {"time":"20:00-21:00","courts":["Herren 35+ 2. Liga","Herren 35+ 2. Liga","Herren 35+ 1. Liga","Herren 35+ 1. Liga"]},
    {"time":"21:00-22:00","courts":["Herren 35+ 2. Liga","12h","Herren 35+ 1. Liga","12h"]}
  ],
  "Freitag": [
    {"time":"18:00-19:00","courts":["Freitagsdoppel","Freitagsdoppel","",""]},
    {"time":"19:00-20:00","courts":["Freitagsdoppel","Freitagsdoppel","",""]}
  ]
};

const LEGEND = [
  {"label":"Die IC-Trainings finden von MO-DO auf Plätzen 1, 2,3,4 statt (i.d.R. 19-22 Uhr)","text":""},
  {"label":"2 Slots Damen/55+ Herren & 3 Slots Herren a 1h pro Team/Abend, 4 Spielende pro Platz","text":""},
  {"label":"Unbenutzte Plätze werden durch Captains 24h freigegeben","text":""},
  {"label":"Keine zusätzlichen Buchungen durch IC Spielende am jeweiligen Trainingsabend (17-22 Uhr)","text":""},
  {"label":"12h","text":"Plätze durch IC-Captains 12h vorher buchbar (Mitte April - Mitte Juni)."}
];

let trainingPlanData = FALLBACK_PLAN_DATA;
let activeTrainingDay = "Montag";
let planBody;
let legendList;
let dayButtons = [];

export function initTraining() {
  planBody = document.getElementById("plan-body");
  legendList = document.getElementById("legend-list");
  dayButtons = [...document.querySelectorAll("[data-day]")];

  dayButtons.forEach((btn) => {
    btn.addEventListener("click", () => renderTrainingDay(btn.dataset.day));
  });

  renderLegend();
  renderTrainingDay(activeTrainingDay);
  return loadTrainingPlan().catch(() => renderTrainingDay(activeTrainingDay));
}

export async function loadTrainingPlan() {
  const payload = await fetchJson("/api/training-slots");
  trainingPlanData = payload.days && typeof payload.days === "object" ? payload.days : FALLBACK_PLAN_DATA;
  renderTrainingDay(activeTrainingDay);
}

export function renderTrainingDay(day) {
  activeTrainingDay = day;
  const rows = (trainingPlanData[day] || []).filter((row) => {
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

    row.courts.slice(0, 4).forEach((court) => {
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

export function renderLegend() {
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
