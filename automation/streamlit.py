import streamlit as st
import requests


st.set_page_config(page_title="Content Scraper", layout="wide")

st.markdown(
    """
    <style>
        :root {
            --app-bg: #eef3f8;
            --panel-bg: #ffffff;
            --panel-border: #b8c7da;
            --text-strong: #162337;
            --text-muted: #42546b;
            --accent: #0b6bcb;
        }

        .stApp {
            background: var(--app-bg);
            color: var(--text-strong);
        }

        .block-container {
            max-width: 100%;
            padding-top: 1.25rem;
            padding-left: 2rem;
            padding-right: 2rem;
            padding-bottom: 1.5rem;
        }

        .top-row {
            position: sticky;
            top: 0;
            z-index: 10;
            background: var(--app-bg);
            padding-bottom: 0.75rem;
        }

        .content-shell {
            min-height: calc(100vh - 150px);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .content-box {
            width: min(96vw, 1400px);
            min-height: 78vh;
            border: 2px solid var(--panel-border);
            border-radius: 18px;
            background: var(--panel-bg);
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
            padding: 2rem;
            color: var(--text-strong);
            font-size: 1.05rem;
        }

        .stTextInput label,
        .stSubheader,
        .stCaption,
        .stMarkdown,
        .stText,
        .stAlert {
            color: var(--text-strong);
        }

        .stTextInput input {
            background: #ffffff;
            color: var(--text-strong);
            border: 1px solid var(--panel-border);
        }

        .stTextInput input::placeholder {
            color: #75859b;
        }

        .stButton button {
            background: var(--accent);
            color: #ffffff;
            border: 1px solid var(--accent);
            font-weight: 600;
        }

        .stButton button:hover {
            background: #0958a7;
            border-color: #0958a7;
            color: #ffffff;
        }

        div[data-testid="stDataFrame"] {
            border: 1px solid var(--panel-border);
            border-radius: 12px;
            overflow: hidden;
        }

        div[data-testid="stDataFrame"] * {
            color: var(--text-strong);
        }

        .status-text {
            color: var(--text-muted);
            font-size: 1.05rem;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

if "content_url" not in st.session_state:
    st.session_state.content_url = "https://satta-king-fast.com/gali/satta-result-chart/gl"
if "scrape_result" not in st.session_state:
    st.session_state.scrape_result = None
if "status_text" not in st.session_state:
    st.session_state.status_text = "Content area"

st.markdown('<div class="top-row">', unsafe_allow_html=True)
col_input, col_button = st.columns([8.8, 1.2], vertical_alignment="bottom")

with col_input:
    content_url = st.text_input(
        "Content Input URL",
        value=st.session_state.content_url,
        placeholder="Enter content URL...",
        label_visibility="visible",
    )

with col_button:
    scrape_clicked = st.button("Scrape", use_container_width=True)

st.markdown("</div>", unsafe_allow_html=True)

st.session_state.content_url = content_url

if scrape_clicked:
    if not content_url:
        st.session_state.status_text = "No URL entered"
        st.session_state.scrape_result = None
    else:
        try:
            response = requests.post(
                "http://127.0.0.1:5000/scrape/satta/",
                json={"satta_website": content_url},
                timeout=60,
            )
            result = response.json()
            if response.ok and result.get("success"):
                st.session_state.scrape_result = result
                st.session_state.status_text = f"Scrape completed for: {content_url}"
            else:
                st.session_state.scrape_result = None
                st.session_state.status_text = result.get("error", "Scrape request failed")
        except Exception as exc:
            st.session_state.scrape_result = None
            st.session_state.status_text = f"Request failed: {exc}"

st.markdown('<div class="content-shell"><div class="content-box">', unsafe_allow_html=True)
result = st.session_state.scrape_result
if result:
    st.subheader(result.get("title") or "Scrape Result")
    headers = result.get("board_headers") or []
    if headers:
        st.caption(" | ".join(headers))
    st.write(f"Source: {result.get('source_url', '')}")
    st.dataframe(result.get("games", []), use_container_width=True)
else:
    st.markdown(f'<p class="status-text">{st.session_state.status_text}</p>', unsafe_allow_html=True)
st.markdown("</div></div>", unsafe_allow_html=True)
