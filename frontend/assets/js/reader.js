const params = new URLSearchParams(window.location.search);
const publicationId = params.get("id");

async function fetchPublicationsForReader() {
  try {
    const response = await fetch("/api/publications", { credentials: "same-origin" });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length) return data;
    }
  } catch (error) {
    console.warn("API unavailable, falling back to static data.");
  }

  const cached = localStorage.getItem("publicationsData");
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (error) {
      console.warn("Reader cache parse failure", error);
    }
  }

  const response = await fetch("../data/publications.json");
  if (!response.ok) return [];
  return response.json();
}

function disableCommonSaveShortcuts() {
  const blocked = ["s", "p"];
  document.addEventListener("contextmenu", (event) => event.preventDefault());

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && blocked.includes(event.key.toLowerCase())) {
      event.preventDefault();
    }
  });
}

function renderMissing(container) {
  container.innerHTML = `
    <section class="section">
      <p class="muted">The requested publication could not be found.</p>
      <a href="publications.html" class="btn btn-secondary">Back to publications</a>
    </section>
  `;
}

function trackVisit() {
  fetch("/api/visits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: window.location.pathname + window.location.search })
  }).catch(() => {});
}

async function initReader() {
  disableCommonSaveShortcuts();

  const publications = await fetchPublicationsForReader();
  const publication = publications.find((item) => item.id === publicationId);
  const target = document.querySelector("#reader-content");
  if (!target) return;

  if (!publication) {
    renderMissing(target);
    return;
  }

  target.innerHTML = `
    <section class="section reveal">
      <h1>${publication.title}</h1>
      <p class="meta">${publication.category} · ${publication.year}</p>
      <p class="muted">${publication.abstract}</p>
      ${publication.downloadLink ? `<a class="btn btn-primary" href="/api/publications/${publication.id}/download">Download</a>` : ""}
    </section>
    <section class="viewer-card reveal">
      <iframe
        title="${publication.title}"
        class="viewer-frame"
        src="${publication.embedLink}"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="fullscreen"
      ></iframe>
      <div class="watermark" aria-hidden="true"></div>
    </section>
  `;

  window.dispatchEvent(new Event("contentRendered"));
  trackVisit();
}

initReader();
