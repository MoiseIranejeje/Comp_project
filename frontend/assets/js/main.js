const DATA_PATH = "../data/publications.json";
const FALLBACK_DATA_PATH = "data/publications.json";

const appState = {
  publications: []
};

async function loadPublications() {
  const localData = localStorage.getItem("publicationsData");
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (error) {
      console.warn("Could not parse local publications data", error);
    }
  }

  const paths = [DATA_PATH, FALLBACK_DATA_PATH];
  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Failed loading ${path}`);
    }
  }

  return [];
}

function publicationCard(publication) {
  return `
    <article class="card reveal">
      <h3>${publication.title}</h3>
      <p class="meta">${publication.category} · ${publication.year}</p>
      <p class="muted">${publication.abstract}</p>
      <div style="margin-top:14px;">
        <a class="btn btn-secondary" href="reader.html?id=${publication.id}">Read online</a>
      </div>
    </article>
  `;
}

function renderFeatured() {
  const featured = appState.publications.filter((p) => p.featured).slice(0, 3);
  const target = document.querySelector("#featured-list");
  if (!target) return;

  if (!featured.length) {
    target.innerHTML = '<p class="muted">Featured work will appear here soon.</p>';
    return;
  }

  target.innerHTML = featured.map(publicationCard).join("");
}

function renderAllPublications() {
  const target = document.querySelector("#publication-list");
  if (!target) return;

  if (!appState.publications.length) {
    target.innerHTML = '<p class="muted">No publications available yet.</p>';
    return;
  }

  target.innerHTML = appState.publications.map(publicationCard).join("");
}

async function initMain() {
  appState.publications = await loadPublications();
  renderFeatured();
  renderAllPublications();
  window.dispatchEvent(new Event("contentRendered"));
}

initMain();
