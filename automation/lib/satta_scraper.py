from __future__ import annotations

from typing import Any

import requests
from bs4 import BeautifulSoup, Tag


SATTA_DAY_URL = "https://satta-king-fast.com/gali/satta-result-chart/gl"
SATTA_DAY_SELECTOR = "table containing the Gali result board"


def _clean_text(value: str) -> str:
    return " ".join(value.split())


def _find_target_table(soup: BeautifulSoup) -> Tag:
    for table in soup.select("table"):
        board_title = table.select_one("tr.board-title h1")
        board_head = table.select_one("tr.board-head")
        game_rows = table.select("tr.game-result")
        highlighted_row = table.select_one("tr.game-result.highlight#GL")

        if not board_title or not board_head or not game_rows:
            continue

        title_text = _clean_text(board_title.get_text(" ", strip=True))
        if "Gali Satta Result" not in title_text:
            continue

        if highlighted_row is not None:
            return table

    raise ValueError("Target Gali result table not found in page HTML")


def _parse_game_row(row: Tag) -> dict[str, Any]:
    details_cell = row.select_one("td.game-details")
    yesterday_cell = row.select_one("td.yesterday-number")
    today_cell = row.select_one("td.today-number")
    link = row.select_one("h3.game-link a")

    if details_cell is None or yesterday_cell is None or today_cell is None:
        raise ValueError("Unexpected game row structure in target table")

    return {
        "id": row.get("id"),
        "highlighted": "highlight" in (row.get("class") or []),
        "game_name": _clean_text((details_cell.select_one("h3.game-name") or details_cell).get_text(" ", strip=True)),
        "game_time": _clean_text((details_cell.select_one("h3.game-time") or details_cell).get_text(" ", strip=True)),
        "record_chart_url": link.get("href") if link else None,
        "yesterday_result": _clean_text(yesterday_cell.get_text(" ", strip=True)),
        "today_result": _clean_text(today_cell.get_text(" ", strip=True)),
    }


def scrape_satta_data(satta_website: str) -> dict[str, Any]:
    response = requests.get(
        satta_website,
        timeout=30,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            )
        },
    )
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    table = _find_target_table(soup)

    board_title = table.select_one("tr.board-title h1")
    board_head = table.select_one("tr.board-head")
    board_head_cells = board_head.select("th h2") if board_head else []
    game_rows = table.select("tr.game-result")

    games = [_parse_game_row(row) for row in game_rows]

    return {
        "source_url": satta_website,
        "selector": SATTA_DAY_SELECTOR,
        "title": _clean_text(board_title.get_text(" ", strip=True)) if board_title else None,
        "board_headers": [_clean_text(cell.get_text(" ", strip=True)) for cell in board_head_cells],
        "games": games,
        "html": str(table),
    }


def scrape_satta_day_data() -> dict[str, Any]:
    return scrape_satta_data(SATTA_DAY_URL)
