const ADMIN_USER = "admin";
const ADMIN_PASS = "albert@2026";

function isAuthenticated() {
  return sessionStorage.getItem("adminAuth") === "true";
}

function initLogin() {
  const form = document.querySelector("#login-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = form.querySelector("#username").value.trim();
    const password = form.querySelector("#password").value.trim();

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem("adminAuth", "true");
      window.location.href = "dashboard.html";
      return;
    }

    const errorEl = document.querySelector("#login-error");
    if (errorEl) errorEl.textContent = "Invalid credentials.";
  });
}

function getPublications() {
  const localData = localStorage.getItem("publicationsData");
  if (!localData) return [];
  try {
    return JSON.parse(localData);
  } catch (error) {
    return [];
  }
}

function savePublications(data) {
  localStorage.setItem("publicationsData", JSON.stringify(data));
}

function renderAdminTable(items) {
  const body = document.querySelector("#pub-table-body");
  if (!body) return;
  body.innerHTML = items
    .map(
      (item) => `
      <tr>
        <td>${item.title}</td>
        <td>${item.year}</td>
        <td>${item.category}</td>
        <td>
          <button class="btn btn-secondary" data-delete="${item.id}">Delete</button>
        </td>
      </tr>`
    )
    .join("");

  body.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.delete;
      const filtered = getPublications().filter((item) => item.id !== id);
      savePublications(filtered);
      renderAdminTable(filtered);
    });
  });
}

function initDashboard() {
  if (!document.body.dataset.page || document.body.dataset.page !== "dashboard") return;

  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  const form = document.querySelector("#pub-form");
  const list = getPublications();
  renderAdminTable(list);

  const logoutButton = document.querySelector("#logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      sessionStorage.removeItem("adminAuth");
      window.location.href = "login.html";
    });
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const newPublication = {
      id: `pub-${Date.now()}`,
      title: String(formData.get("title") || "").trim(),
      abstract: String(formData.get("abstract") || "").trim(),
      year: Number(formData.get("year") || new Date().getFullYear()),
      category: String(formData.get("category") || "General").trim(),
      featured: Boolean(formData.get("featured")),
      embedLink: String(formData.get("embedLink") || "").trim()
    };

    const updated = [newPublication, ...getPublications()];
    savePublications(updated);
    renderAdminTable(updated);
    form.reset();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initDashboard();
});
