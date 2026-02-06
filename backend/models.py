"""SQLite models placeholder for publication metadata."""

from dataclasses import dataclass


@dataclass
class Publication:
    id: str
    title: str
    abstract: str
    year: int
    category: str
    embed_link: str
    featured: bool = False
