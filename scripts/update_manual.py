#!/usr/bin/env python3
"""Find the newest VEX IQ Robotics Competition game manual on manuals.vex.com
and save it as rule-sized text chunks in manual/manual.json for the AI judge.

Run by .github/workflows/update-manual.yml every day. Exits 0 without touching
manual.json if the site can't be reached, so the last good copy is kept.
"""
import datetime as dt
import hashlib
import json
import os
import re
import sys
import time

import requests
from bs4 import BeautifulSoup, NavigableString, Tag

BASE = "https://manuals.vex.com"
OUT = os.path.join(os.path.dirname(__file__), "..", "manual", "manual.json")
UA = "WinterBotsManualBot/1.0 (+https://github.com/henrythebaby1-ops/winterbots-vex-iq-interviewer)"
RULE_ID = re.compile(r"^(sg|g|gg|s|r|rsc|t|rs|vur|sc)\d+[a-z]?$", re.I)
MAX_CHUNK = 1800

session = requests.Session()
session.headers.update({"User-Agent": UA, "Accept": "text/html,application/xhtml+xml"})


def get(url):
    for attempt in range(3):
        r = session.get(url, timeout=30)
        if r.status_code == 200:
            return r.text
        if r.status_code in (403, 404):
            break
        time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"{url} -> HTTP {r.status_code}")


def vkey(v):
    return tuple(int(x) for x in v.split("."))


def discover():
    html = get(BASE + "/")
    found = {}
    for slug, ver in re.findall(r'href="/iq/([a-z0-9-]+)/v(\d+(?:\.\d+)*)/', html):
        if slug not in found or vkey(ver) > vkey(found[slug]):
            found[slug] = ver
    if not found:
        raise RuntimeError("No VEX IQ manual link found on manuals.vex.com")
    # Normally only the current season's IQ game is listed; take the newest version.
    slug, ver = max(found.items(), key=lambda kv: vkey(kv[1]))
    season = re.search(r"(20\d\d)\s*[–-]\s*(20\d\d)", BeautifulSoup(html, "html.parser").get_text(" "))
    return slug, ver, f"{season.group(1)}-{season.group(2)}" if season else ""


def clean(text):
    text = text.replace(" ", " ")
    text = re.sub(r"Section titled “[^”]*”", "", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n", text)
    return text.strip()


def block_text(el):
    if isinstance(el, NavigableString):
        return str(el)
    for junk in el.select("svg, .sr-only, .sl-anchor-link, script, style, button"):
        junk.decompose()
    for img in el.find_all("img"):
        alt = img.get("alt", "").strip()
        img.replace_with(f"[image: {alt}]" if alt else "")
    for li in el.find_all("li"):
        li.insert(0, "• ")
    for row in el.find_all("tr"):
        cells = [c.get_text(" ", strip=True) for c in row.find_all(["td", "th"])]
        row.replace_with(" | ".join(cells) + "\n")
    return el.get_text("\n")


def parse_section(slug, ver, sec):
    url = f"{BASE}/iq/{slug}/v{ver}/{sec}/"
    soup = BeautifulSoup(get(url), "html.parser")
    h1 = soup.find("h1")
    sec_title = clean(h1.get_text(" ")) if h1 else sec
    title_tag = soup.find("title")
    root = soup.select_one(".sl-markdown-content") or soup.find("main")
    if root is None:
        return sec_title, [], (title_tag.get_text() if title_tag else "")
    containers = soup.select(".sl-markdown-content") or [root]

    chunks, cur = [], None

    def flush():
        if cur and clean(cur["text"]):
            body = clean(cur["text"])
            # split long chunks on line boundaries
            parts, buf = [], ""
            for line in body.split("\n"):
                if len(buf) + len(line) > MAX_CHUNK and buf:
                    parts.append(buf)
                    buf = ""
                buf += line + "\n"
            if buf.strip():
                parts.append(buf)
            for i, p in enumerate(parts):
                chunks.append({
                    "sec": sec_title, "title": cur["title"] + (f" (part {i + 1})" if len(parts) > 1 else ""),
                    "rule": cur["rule"], "text": p.strip(), "url": url + (f"#{cur['anchor']}" if cur["anchor"] else ""),
                })

    def start(title, anchor="", rule=""):
        nonlocal cur
        flush()
        cur = {"title": title, "anchor": anchor, "rule": rule, "text": ""}

    start(sec_title)
    heading = sec_title
    for container in containers:
        for el in container.children:
            if not isinstance(el, Tag):
                continue
            h = el if el.name in ("h2", "h3", "h4") else el.find(["h2", "h3", "h4"]) if "sl-heading-wrapper" in (el.get("class") or []) else None
            if h is not None:
                heading = clean(h.get_text(" "))
                start(heading, h.get("id", ""))
                continue
            anchor = el.find("a", id=RULE_ID) if el.name == "p" else None
            if anchor is not None and not clean(el.get_text(" ")):
                rid = anchor["id"].upper()
                start(f"{heading} — <{rid}>", anchor["id"], rid)
                continue
            cur["text"] += block_text(el) + "\n"
    flush()
    return sec_title, chunks, (title_tag.get_text() if title_tag else "")


def main():
    try:
        slug, ver, season = discover()
        game_html = get(f"{BASE}/iq/{slug}/v{ver}/game/")
        secs = []
        for s in re.findall(rf'href="/iq/{re.escape(slug)}/v{re.escape(ver)}/([a-z0-9-]+)/"', game_html):
            if s not in secs:
                secs.append(s)
        if "game" not in secs:
            secs.insert(0, "game")
        order = ["game", "introduction", "robot", "skills", "event", "definitions"]
        secs.sort(key=lambda s: order.index(s) if s in order else len(order))

        sections, chunks, game_name = [], [], ""
        for s in secs:
            title, ch, page_title = parse_section(slug, ver, s)
            m = re.search(r"VEX IQ (.+?) v\d", page_title)
            if m and not game_name:
                game_name = m.group(1).strip()
            sections.append({"slug": s, "title": title, "url": f"{BASE}/iq/{slug}/v{ver}/{s}/"})
            chunks.extend(ch)
            time.sleep(1)  # be polite
        if len(chunks) < 20:
            raise RuntimeError(f"Only {len(chunks)} chunks parsed — page layout may have changed")
    except Exception as e:  # keep the last good copy
        print(f"::warning::Manual update skipped: {e}")
        return 0

    for i, c in enumerate(chunks):
        c["id"] = i
    digest = hashlib.sha256(json.dumps(chunks, sort_keys=True).encode()).hexdigest()[:16]
    old = {}
    if os.path.exists(OUT):
        with open(OUT) as f:
            old = json.load(f)
    if old.get("hash") == digest:
        print(f"No change: {game_name} v{ver}")
        return 0

    data = {
        "program": "VEX IQ Robotics Competition",
        "game": game_name or slug.replace("-", " ").title(),
        "slug": slug, "version": ver, "season": season,
        "source": f"{BASE}/iq/{slug}/v{ver}/game/",
        "fetchedAt": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "hash": digest,
        "notice": "Text of the official VEX IQ Robotics Competition game manual, © VEX Robotics, Inc. Always check the official manual and Q&A at manuals.vex.com.",
        "sections": sections,
        "chunks": chunks,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Saved {data['game']} v{ver} ({season}): {len(sections)} sections, {len(chunks)} chunks")
    return 0


if __name__ == "__main__":
    sys.exit(main())
