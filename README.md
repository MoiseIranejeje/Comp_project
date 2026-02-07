# Academic Publication Platform — Byiringiro Albert

A fast, minimal academic website and controlled-access publication reader for:

**Byiringiro Albert, M.Ed., B.Ed.**  
Educationist · Researcher · Consultant  
Kigali, Rwanda

## Highlights

- Beautiful, calm, minimal UI with serif/sans pairing.
- Semantic, mobile-first HTML + custom CSS + vanilla JavaScript.
- Smooth IntersectionObserver scroll reveals using only `transform` + `opacity`.
- Public reader access without account creation.
- Admin-only login for metadata management.
- Reader protections: no direct download button, disabled right-click/print/save shortcuts, and persistent watermark overlay.
- Lightweight architecture with static-first operation and optional Flask backend stubs.

## Structure

```text
project-root/
├── frontend/
│   ├── index.html
│   ├── about.html
│   ├── publications.html
│   ├── reader.html
│   └── assets/
│       ├── css/main.css
│       ├── js/main.js
│       ├── js/animations.js
│       ├── js/reader.js
│       └── js/admin.js
├── admin/
│   ├── login.html
│   └── dashboard.html
├── data/
│   └── publications.json
└── backend/
    ├── app.py
    ├── models.py
    ├── auth.py
    └── routes.py
```

## Run Locally (Production-Ready Backend)

```bash
cd /workspace/Comp_project
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 backend/app.py
```

Then open:

- Frontend: `http://localhost:5000/frontend/index.html`
- Admin login: `http://localhost:5000/admin/login.html`

## Admin Credentials (demo)

- Username: `admin`
- Password: `albert@2026`

> For production, move authentication and metadata operations to the Flask backend and secure secrets using environment variables.

## Notes

- The Flask backend provides admin authentication, publication CRUD, download controls, and visit analytics.
- `data/publications.json` is still used as a static fallback when the API is unavailable.
- Reader mode expects embed-friendly links (e.g., Google Drive `/preview` URLs) and optional download links.
