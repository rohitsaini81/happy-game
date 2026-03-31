from flask import Flask, jsonify, render_template_string, request

from lib.satta_scraper import scrape_satta_data, scrape_satta_day_data


app = Flask(__name__)


HOME_PAGE_HTML = """
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Satta Scraper API</title>
    <style>
        :root {
            --bg: #f4f7fb;
            --panel: #ffffff;
            --text: #172033;
            --muted: #5d6a7e;
            --border: #d7deea;
            --accent: #0b6bcb;
            --code: #eef4fb;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: "Segoe UI", Arial, sans-serif;
            background: linear-gradient(180deg, #eef4fb 0%, var(--bg) 100%);
            color: var(--text);
        }

        .page {
            max-width: 980px;
            margin: 0 auto;
            padding: 32px 20px 48px;
        }

        .hero, .section {
            background: var(--panel);
            border: 1px solid var(--border);
            border-radius: 18px;
            padding: 24px;
            box-shadow: 0 16px 40px rgba(23, 32, 51, 0.06);
        }

        .hero {
            margin-bottom: 20px;
        }

        .section {
            margin-top: 20px;
        }

        h1, h2 {
            margin: 0 0 12px;
        }

        p, li {
            line-height: 1.6;
            color: var(--muted);
        }

        code {
            background: var(--code);
            padding: 2px 8px;
            border-radius: 8px;
            color: var(--text);
        }

        pre {
            background: var(--code);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 14px;
            overflow-x: auto;
            color: var(--text);
        }

        .endpoint {
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 16px;
            margin-top: 14px;
            background: #fbfdff;
        }

        .method {
            display: inline-block;
            min-width: 54px;
            text-align: center;
            font-weight: 700;
            font-size: 0.85rem;
            color: white;
            background: var(--accent);
            border-radius: 999px;
            padding: 6px 10px;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <main class="page">
        <section class="hero">
            <h1>Satta Scraper API</h1>
            <p>This Flask server exposes scraping endpoints for satta chart data.</p>
            <p>The server routes live in <code>app.py</code> and the scraping logic lives in <code>lib/satta_scraper.py</code>.</p>
        </section>

        <section class="section">
            <h2>Structure</h2>
            <ul>
                <li><code>app.py</code>: Flask app and HTTP routes.</li>
                <li><code>lib/satta_scraper.py</code>: fetches the configured website and parses the target HTML table.</li>
                <li><code>streamlit.py</code>: Streamlit UI file for the frontend layout.</li>
            </ul>
        </section>

        <section class="section">
            <h2>Endpoints</h2>
            <div class="endpoint">
                <p><span class="method">GET</span><code>/</code></p>
                <p>Returns this HTML documentation page describing the app structure and available routes.</p>
            </div>
            <div class="endpoint">
                <p><span class="method">GET</span><code>/scrape/satta/day</code></p>
                <p>Scrapes the configured URL and returns the Gali result board as structured JSON.</p>
                <p>Current source URL:</p>
                <pre>https://satta-king-fast.com/gali/satta-result-chart/gl</pre>
                <p>Lookup strategy:</p>
                <pre>Find the table containing the board title, board headers, and game-result rows.</pre>
                <p>Optional query flag:</p>
                <pre><a href="/scrape/satta/day?html=true">/scrape/satta/day?html=true</a></pre>
            </div>
            <div class="endpoint">
                <p><span class="method">POST</span><code>/scrape/satta/</code></p>
                <p>Accepts JSON with <code>satta_website</code> and scrapes that URL with the same parsing logic.</p>
                <pre>{"satta_website":"https://satta-king-fast.com/gali/satta-result-chart/gl"}</pre>
            </div>
        </section>

        <section class="section">
            <h2>Usage</h2>
            <p>Open the documentation page in a browser:</p>
            <pre>http://localhost:5000/</pre>
            <p>Call the scrape endpoint in a browser or with curl:</p>
            <pre>http://localhost:5000/scrape/satta/day</pre>
            <pre>curl http://localhost:5000/scrape/satta/day</pre>
            <p>Call the dynamic POST endpoint with JSON:</p>
            <pre>curl -X POST http://localhost:5000/scrape/satta/ -H "Content-Type: application/json" -d '{"satta_website":"https://satta-king-fast.com/gali/satta-result-chart/gl"}'</pre>
            <p>The JSON response includes <code>success</code>, <code>source_url</code>, <code>selector</code>, <code>title</code>, <code>board_headers</code>, <code>games</code>, and <code>html</code>.</p>
        </section>
    </main>
</body>
</html>
"""


SCRAPE_RESULT_HTML = """
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ data.title or "Satta Result" }}</title>
    <style>
        :root {
            --bg: #eef3f8;
            --panel: #ffffff;
            --text: #172033;
            --muted: #53657d;
            --border: #c8d3e1;
            --accent: #0b6bcb;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: "Segoe UI", Arial, sans-serif;
            background: linear-gradient(180deg, #f6f9fc 0%, var(--bg) 100%);
            color: var(--text);
        }

        .page {
            max-width: 1240px;
            margin: 0 auto;
            padding: 28px 18px 40px;
        }

        .panel {
            background: var(--panel);
            border: 1px solid var(--border);
            border-radius: 18px;
            padding: 24px;
            box-shadow: 0 14px 36px rgba(23, 32, 51, 0.06);
        }

        h1 {
            margin: 0 0 12px;
            font-size: 2rem;
        }

        .subhead {
            color: var(--muted);
            margin-bottom: 18px;
            font-size: 1rem;
        }

        .source {
            margin-bottom: 20px;
            color: var(--muted);
        }

        .source a {
            color: var(--accent);
            text-decoration: none;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            overflow: hidden;
            border-radius: 14px;
            border: 1px solid var(--border);
        }

        thead th {
            background: #eaf2fb;
            color: var(--text);
            text-align: left;
            font-size: 0.95rem;
            padding: 14px 12px;
            border-bottom: 1px solid var(--border);
        }

        tbody td {
            padding: 14px 12px;
            border-bottom: 1px solid #e5ebf3;
            vertical-align: top;
            font-size: 0.95rem;
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        tbody tr.highlight td {
            background: #f7fbff;
        }

        .pill {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 0.82rem;
            font-weight: 700;
            background: #edf5ff;
            color: var(--accent);
        }
    </style>
</head>
<body>
    <main class="page">
        <section class="panel">
            <h1>{{ data.title }}</h1>
            <div class="subhead">{{ " | ".join(data.board_headers) }}</div>
            <div class="source">Source: <a href="{{ data.source_url }}" target="_blank" rel="noopener noreferrer">{{ data.source_url }}</a></div>

            <table>
                <thead>
                    <tr>
                        <th>game_name</th>
                        <th>game_time</th>
                        <th>highlighted</th>
                        <th>id</th>
                        <th>record_chart_url</th>
                        <th>today_result</th>
                        <th>yesterday_result</th>
                    </tr>
                </thead>
                <tbody>
                    {% for game in data.games %}
                    <tr class="{{ 'highlight' if game.highlighted else '' }}">
                        <td>{{ game.game_name }}</td>
                        <td>{{ game.game_time }}</td>
                        <td>
                            {% if game.highlighted %}
                            <span class="pill">true</span>
                            {% else %}
                            false
                            {% endif %}
                        </td>
                        <td>{{ game.id }}</td>
                        <td>
                            {% if game.record_chart_url %}
                            <a href="{{ game.record_chart_url }}" target="_blank" rel="noopener noreferrer">{{ game.record_chart_url }}</a>
                            {% endif %}
                        </td>
                        <td>{{ game.today_result }}</td>
                        <td>{{ game.yesterday_result }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </section>
    </main>
</body>
</html>
"""


def _serialize_scrape_result(data):
    return {
        "success": True,
        "source_url": data["source_url"],
        "selector": data["selector"],
        "title": data["title"],
        "board_headers": data["board_headers"],
        "games": data["games"],
        "html": data["html"],
    }


def _wants_html_response() -> bool:
    return request.args.get("html", "").strip().lower() in {"1", "true", "yes", "on"}


@app.get("/")
def home():
    return render_template_string(HOME_PAGE_HTML)


@app.get("/scrape/satta/day")
def scrape_satta_day():
    try:
        data = scrape_satta_day_data()
        if _wants_html_response():
            return render_template_string(SCRAPE_RESULT_HTML, data=data)
        return jsonify(_serialize_scrape_result(data))
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@app.post("/scrape/satta/")
def scrape_satta():
    payload = request.get_json(silent=True) or {}
    satta_website = (payload.get("satta_website") or "").strip()
    if not satta_website:
        return jsonify({"success": False, "error": "Missing required field: satta_website"}), 400

    try:
        data = scrape_satta_data(satta_website)
        return jsonify(_serialize_scrape_result(data))
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
