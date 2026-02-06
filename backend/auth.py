"""Simple authentication helpers for Flask option."""


def verify_admin(username: str, password: str) -> bool:
    return username == "admin" and password == "albert@2026"
