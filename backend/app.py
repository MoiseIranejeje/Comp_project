"""Optional Flask backend for production-grade admin authentication and metadata management."""

from flask import Flask

from routes import api


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "change-me"
    app.register_blueprint(api)
    return app


if __name__ == "__main__":
    create_app().run(debug=True)
