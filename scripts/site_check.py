#!/usr/bin/env python3
"""Static checks before Net Elo GitHub Pages publication (no network required)."""
from __future__ import annotations
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
HTMLS = sorted(ROOT.glob("*.html"))
KNOWN_INDEXABLE = {
    "index.html", "aide-menagere.html", "vitres.html", "sap.html",
    "a-propos.html", "faq.html", "contact.html", "secteur-intervention.html",
}
failures = []

# Security invariants for this intentionally static GitHub Pages site.
for path in [*ROOT.rglob("*.php"), ROOT / "composer.json", ROOT / "composer.lock"]:
    if path.exists(): failures.append(f"Fichier serveur inattendu : {path.relative_to(ROOT)}")
if (ROOT / "vendor").exists(): failures.append("Dossier vendor inattendu sur un site statique")

dangerous_js = {
    r"\\beval\\s*\\(": "eval()",
    r"\\bnew\\s+Function\\s*\\(": "new Function()",
    r"document\\.write\\s*\\(": "document.write()",
    r"\\.innerHTML\\s*=": "affectation innerHTML",
}
for js_path in ROOT.glob("*.js"):
    source = js_path.read_text(encoding="utf-8")
    for pattern, label in dangerous_js.items():
        if re.search(pattern, source, re.I):
            failures.append(f"{js_path.name}: construction JavaScript interdite ({label})")

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.h1 = 0
        self.main = 0
        self.images = []
        self.ids = set()
        self.hrefs = []
        self.links = []
        self.robots = ""
        self.jsonld = []
        self._script = False
        self._buffer = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "h1": self.h1 += 1
        if tag == "main": self.main += 1
        if d.get("id"): self.ids.add(d["id"])
        if tag == "img": self.images.append(d)
        if tag == "a" and d.get("href"): self.hrefs.append(d["href"])
        if tag == "link": self.links.append(d)
        if tag == "meta" and d.get("name") == "robots": self.robots = d.get("content", "")
        if tag == "script" and d.get("type") == "application/ld+json":
            self._script = True
            self._buffer = []
    def handle_data(self, data):
        if self._script: self._buffer.append(data)
    def handle_endtag(self, tag):
        if tag == "script" and self._script:
            try: self.jsonld.append(json.loads("".join(self._buffer)))
            except Exception as exc: failures.append(f"JSON-LD invalide: {exc}")
            self._script = False

parsed = {}
for path in HTMLS:
    html = path.read_text(encoding="utf-8")
    page = Page()
    page.feed(html)
    parsed[path.name] = page
    if re.search(r"javascript\\s*:", html, re.I): failures.append(f"{path.name}: URL javascript: interdite")
    if re.search(r"\\son[a-z]+\\s*=", html, re.I): failures.append(f"{path.name}: gestionnaire événement inline interdit")
    if re.search(r"(?:src|href)=[\\\"\\\']http://", html, re.I): failures.append(f"{path.name}: ressource HTTP non chiffrée")
    if page.h1 != 1: failures.append(f"{path.name}: {page.h1} H1")
    if page.main != 1: failures.append(f"{path.name}: {page.main} main")
    if path.name != "404.html" and ("menu-toggle" not in page.ids or "site-navigation" not in page.ids):
        failures.append(f"{path.name}: navigation mobile manquante")
    for attrs in page.images:
        if not attrs.get("alt"): failures.append(f"{path.name}: image sans texte alternatif")
        if not attrs.get("width") or not attrs.get("height"):
            failures.append(f"{path.name}: image sans dimensions")
        src = attrs.get("src", "").split("?")[0]
        if src and not src.startswith(("http://","https://","data:")):
            if not (ROOT / src.lstrip("/")).is_file():
                failures.append(f"{path.name}: image inexistante {src}")
    for href in page.hrefs:
        parsed_url = urlsplit(href)
        if parsed_url.scheme or parsed_url.netloc: continue
        if href.startswith(("mailto:","tel:")): continue
        local_path = parsed_url.path.lstrip("/")
        target = "index.html" if local_path in ("", ".", "./") else local_path
        if not (ROOT / target).is_file(): failures.append(f"{path.name}: lien absent {href}")
        if parsed_url.fragment and target in parsed:
            if parsed_url.fragment not in parsed[target].ids:
                failures.append(f"{path.name}: ancre absente {href}")
    if path.name in KNOWN_INDEXABLE:
        expected = "https://net-elo.fr/" + ("" if path.name == "index.html" else path.name)
        if not any(x.get("rel") == "canonical" and x.get("href") == expected for x in page.links):
            failures.append(f"{path.name}: canonical absent ou erroné")
        if "noindex" in page.robots: failures.append(f"{path.name}: noindex inattendu")
    if path.name == "404.html" and "noindex" not in page.robots:
        failures.append("404.html doit être noindex")

sitemap = ET.parse(ROOT / "sitemap.xml").getroot()
ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
locations = [node.text for node in sitemap.findall(f".//{ns}loc")]
expected_locations = {
    "https://net-elo.fr/" + ("" if name == "index.html" else name)
    for name in KNOWN_INDEXABLE
}
if set(locations) != expected_locations:
    failures.append(f"Sitemap différent des 8 pages principales : {set(locations)^expected_locations}")
for file in ("hero-interieur.webp","hero-interieur-mobile.webp","logo-net-elo.webp",
             "logo-sap-credit.webp","illustration-aide-menagere.webp",
             "illustration-lavage-vitres.webp"):
    if not (ROOT / file).is_file(): failures.append(f"Image optimisée manquante : {file}")
try:
    data = json.loads((ROOT / "net-elo-structured-data.jsonld").read_text(encoding="utf-8"))
    if not data.get("@graph"): failures.append("Données structurées globales vides")
except Exception as exc:
    failures.append(f"Données structurées globales invalides : {exc}")

# Guard against reintroduction of retired prices and obsolete generators.
business_sources = [
    ROOT / "index.html", ROOT / "aide-menagere.html", ROOT / "vitres.html",
    ROOT / "faq.html", ROOT / "contact.html", ROOT / "secteur-intervention.html",
    ROOT / "llms.txt", ROOT / "net-elo-structured-data.jsonld",
]
joined = "\\n".join(p.read_text(encoding="utf-8") for p in business_sources if p.exists())
if re.search(r"28\\s*€|\\\"price\\\"\\s*:\\s*\\\"28\\\"", joined): failures.append("Ancien tarif 28 € détecté")
if re.search(r"(?:lavage de vitres|vitres)[^\\n]{0,100}(?:à partir de|dès)\\s*30\\s*€", joined, re.I): failures.append("Ancien tarif vitres 30 € détecté")
for retired in (
    ".github/workflows/integrate-structured-data.yml",
    ".github/workflows/prepare-site-assets.yml",
    ".github/workflows/seo-phase2.yml",
):
    if (ROOT / retired).exists(): failures.append(f"Workflow obsolète encore présent : {retired}")

if failures:
    print("\n".join("ERREUR — " + x for x in failures))
    sys.exit(1)
print(f"Site Net Elo validé : {len(HTMLS)} pages HTML, {len(locations)} URLs sitemap, ressources, liens et JSON-LD.")
