import { initTeams, refreshTeamGroupButtons } from "./modules/teams.js";
import { initTraining } from "./modules/training.js";
import { initMatches } from "./modules/matches.js";
import { initResults, loadEncountResults, preloadCurrentYearTeams } from "./modules/results.js";
import { getActiveRatingsView, initRatings, setActiveRatingsView, showRatingsView } from "./modules/ratings.js";
import { initWaidcup } from "./modules/waidcup.js";

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

function setHeaderStand(value) {
  headerStandEl.textContent = value ? `Stand ${value}` : "Stand 22. März 2026";
}

function activeViewFromHash() {
  const key = window.location.hash.replace("#", "").trim();
  if (key === "changes" || key === "compare") {
    setActiveRatingsView(key);
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
    showRatingsView(getActiveRatingsView());
  }
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

window.addEventListener("hashchange", () => showView(activeViewFromHash(), false));

initResults({
  onReturnToMatches: () => showView("matches"),
})
  .then(() => refreshTeamGroupButtons())
  .catch(() => {});

initTeams({
  onShowResults: () => showView("results"),
});

initTraining();

initMatches({
  onSetHeaderStand: setHeaderStand,
  onOpenEncount: (encountId, year) => {
    showView("results");
    loadEncountResults(encountId, year, "matches");
  },
});

initRatings(getActiveRatingsView());
initWaidcup();

preloadCurrentYearTeams()
  .then(() => refreshTeamGroupButtons())
  .catch(() => {});

showView(activeViewFromHash(), false);
