function trackVisit() {
  fetch("/api/visits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: window.location.pathname })
  }).catch(() => {});
}

window.addEventListener("DOMContentLoaded", trackVisit);
