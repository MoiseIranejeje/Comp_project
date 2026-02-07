"""Flask backend for admin auth, publication management, and visit analytics."""

from __future__ import annotations

import os
import sqlite3
from pathlib import Path
from typing import Any, Dict

from flask import Flask, g, jsonify, redirect, request, session

DATABASE = Path(__file__).resolve().parent / "database.db"


SCHEMA = """
CREATE TABLE IF NOT EXISTS publications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  embed_link TEXT NOT NULL,
  download_link TEXT DEFAULT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visits (
  path TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);
"""


def create_app() -> Flask:
    app = Flask(__name__, static_folder="../", static_url_path="/")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "change-me")

    @app.before_request
    def ensure_db():
        if "db" not in g:
            g.db = sqlite3.connect(DATABASE)
            g.db.row_factory = sqlite3.Row
            g.db.executescript(SCHEMA)

    @app.teardown_request
    def close_db(exc):
        db = g.pop("db", None)
        if db is not None:
            db.close()

    def require_auth() -> bool:
        return session.get("is_admin") is True

    def publication_from_row(row: sqlite3.Row) -> Dict[str, Any]:
        return {
            "id": row["id"],
            "title": row["title"],
            "abstract": row["abstract"],
            "year": row["year"],
            "category": row["category"],
            "featured": bool(row["featured"]),
            "embedLink": row["embed_link"],
            "downloadLink": row["download_link"],
        }

    @app.get("/")
    def root():
        return redirect("/frontend/index.html")

    @app.post("/api/login")
    def login():
        payload = request.get_json(silent=True) or {}
        username = payload.get("username", "")
        password = payload.get("password", "")
        admin_user = os.getenv("ADMIN_USER", "admin")
        admin_pass = os.getenv("ADMIN_PASS", "albert@2026")
        if username == admin_user and password == admin_pass:
            session["is_admin"] = True
            return jsonify({"ok": True})
        return jsonify({"ok": False, "message": "Invalid credentials"}), 401

    @app.post("/api/logout")
    def logout():
        session.clear()
        return jsonify({"ok": True})

    @app.get("/api/publications")
    def list_publications():
        rows = g.db.execute("SELECT * FROM publications ORDER BY created_at DESC").fetchall()
        return jsonify([publication_from_row(row) for row in rows])

    @app.post("/api/publications")
    def create_publication():
        if not require_auth():
            return jsonify({"message": "Unauthorized"}), 401
        payload = request.get_json(silent=True) or {}
        g.db.execute(
            """
            INSERT INTO publications (id, title, abstract, year, category, featured, embed_link, download_link)
            VALUES (:id, :title, :abstract, :year, :category, :featured, :embed_link, :download_link)
            """,
            {
                "id": payload.get("id"),
                "title": payload.get("title"),
                "abstract": payload.get("abstract"),
                "year": int(payload.get("year")),
                "category": payload.get("category"),
                "featured": int(bool(payload.get("featured"))),
                "embed_link": payload.get("embedLink"),
                "download_link": payload.get("downloadLink"),
            },
        )
        g.db.commit()
        return jsonify({"ok": True})

    @app.put("/api/publications/<pub_id>")
    def update_publication(pub_id: str):
        if not require_auth():
            return jsonify({"message": "Unauthorized"}), 401
        payload = request.get_json(silent=True) or {}
        g.db.execute(
            """
            UPDATE publications
            SET title=:title, abstract=:abstract, year=:year, category=:category,
                featured=:featured, embed_link=:embed_link, download_link=:download_link
            WHERE id=:id
            """,
            {
                "id": pub_id,
                "title": payload.get("title"),
                "abstract": payload.get("abstract"),
                "year": int(payload.get("year")),
                "category": payload.get("category"),
                "featured": int(bool(payload.get("featured"))),
                "embed_link": payload.get("embedLink"),
                "download_link": payload.get("downloadLink"),
            },
        )
        g.db.commit()
        return jsonify({"ok": True})

    @app.delete("/api/publications/<pub_id>")
    def delete_publication(pub_id: str):
        if not require_auth():
            return jsonify({"message": "Unauthorized"}), 401
        g.db.execute("DELETE FROM publications WHERE id = ?", (pub_id,))
        g.db.commit()
        return jsonify({"ok": True})

    @app.get("/api/publications/<pub_id>/download")
    def download_publication(pub_id: str):
        row = g.db.execute("SELECT download_link FROM publications WHERE id = ?", (pub_id,)).fetchone()
        if not row or not row["download_link"]:
            return jsonify({"message": "Download not available"}), 404
        return redirect(row["download_link"])

    @app.post("/api/visits")
    def track_visit():
        payload = request.get_json(silent=True) or {}
        path = payload.get("path", "/")
        g.db.execute(
            "INSERT INTO visits (path, count) VALUES (?, 1) ON CONFLICT(path) DO UPDATE SET count=count+1",
            (path,),
        )
        g.db.commit()
        row = g.db.execute("SELECT count FROM visits WHERE path = ?", (path,)).fetchone()
        return jsonify({"path": path, "count": row["count"] if row else 1})

    @app.get("/api/visits")
    def list_visits():
        if not require_auth():
            return jsonify({"message": "Unauthorized"}), 401
        rows = g.db.execute("SELECT path, count FROM visits ORDER BY count DESC").fetchall()
        total = sum(row["count"] for row in rows)
        return jsonify({
            "total": total,
            "pages": [{"path": row["path"], "count": row["count"]} for row in rows],
        })

    return app


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    create_app().run(host="0.0.0.0", port=port, debug=False)
