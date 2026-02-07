function isAuthenticated() {
  return sessionStorage.getItem("adminAuth") === "true";
}

async function apiLogin(username, password) {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) throw new Error("Login failed");
  return response.json();
}

async function apiLogout() {
  await fetch("/api/logout", { method: "POST" });
}

async function apiGetPublications() {
  const response = await fetch("/api/publications", { credentials: "same-origin" });
  if (!response.ok) throw new Error("Failed to load publications");
  return response.json();
}

async function apiCreatePublication(payload) {
  const response = await fetch("/api/publications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Failed to save");
}

async function apiDeletePublication(id) {
  const response = await fetch(`/api/publications/${id}`, {
    method: "DELETE",
    credentials: "same-origin"
  });
  if (!response.ok) throw new Error("Failed to delete");
}

async function apiGetVisits() {
  const response = await fetch("/api/visits", { credentials: "same-origin" });
  if (!response.ok) throw new Error("Failed to load visits");
  return response.json();
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
        <td>${item.downloadLink ? "Enabled" : "Disabled"}</td>
        <td>
          <button class="btn btn-secondary" data-delete="${item.id}">Delete</button>
        </td>
      </tr>`
    )
    .join("");

  body.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.delete;
      await apiDeletePublication(id);
      const refreshed = await apiGetPublications();
      renderAdminTable(refreshed);
    });
  });
}

function renderVisitStats(data) {
  const total = document.querySelector("#total-visits");
  const list = document.querySelector("#visit-list");
  if (total) total.textContent = data.total || 0;
  if (list) {
    list.innerHTML = data.pages
      .map((page) => `<li>${page.path} <span>${page.count}</span></li>`)
      .join("");
  }
}

function initLogin() {
  const form = document.querySelector("#login-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = form.querySelector("#username").value.trim();
    const password = form.querySelector("#password").value.trim();

    try {
      await apiLogin(username, password);
      sessionStorage.setItem("adminAuth", "true");
      window.location.href = "dashboard.html";
    } catch (error) {
      const errorEl = document.querySelector("#login-error");
      if (errorEl) errorEl.textContent = "Invalid credentials.";
    }
  });
}

async function initDashboard() {
  if (!document.body.dataset.page || document.body.dataset.page !== "dashboard") return;

  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  const form = document.querySelector("#pub-form");
  const logoutButton = document.querySelector("#logout");

  const loadAll = async () => {
    const list = await apiGetPublications();
    renderAdminTable(list);
    const visits = await apiGetVisits();
    renderVisitStats(visits);
  };

  await loadAll();

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      sessionStorage.removeItem("adminAuth");
      await apiLogout();
      window.location.href = "login.html";
    });
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      id: `pub-${Date.now()}`,
      title: String(formData.get("title") || "").trim(),
      abstract: String(formData.get("abstract") || "").trim(),
      year: Number(formData.get("year") || new Date().getFullYear()),
      category: String(formData.get("category") || "General").trim(),
      featured: Boolean(formData.get("featured")),
      embedLink: String(formData.get("embedLink") || "").trim(),
      downloadLink: String(formData.get("downloadLink") || "").trim() || null
    };

    await apiCreatePublication(payload);
    form.reset();
    await loadAll();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initDashboard();
});
