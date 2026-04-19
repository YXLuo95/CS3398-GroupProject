"""Strip Inkscape/Sodipodi metadata from SVG files (one-off helper).

Reads:  src/muscle-map-sources/Front_map.inkscape.svg, Back_map.inkscape.svg
Writes: src/frontend/src/assets/muscle-maps/Front_map.svg, Back_map.svg

After stripping, applies default Falcon UI colors for #0b1727 backgrounds:
  body_outline — soft white fill + stroke
  muscle zones — slate fill + light stroke (override per-zone in app for heat map)
"""
import re
from pathlib import Path

OUTLINE_STYLE = (
    "fill:rgba(255,255,255,0.08);stroke:rgba(255,255,255,0.22);stroke-width:1"
)
MUSCLE_STYLE = (
    "fill:rgba(148,163,184,0.18);stroke:rgba(255,255,255,0.14);stroke-width:1"
)
LEGACY_FILL_STROKE = 'style="fill:#000000;stroke:#800000"'
LEGACY_BODY_BACK = 'style="opacity:0.516;fill:#000000;stroke:#800000"'


def apply_muscle_map_theme(text: str) -> str:
    text = re.sub(
        r'<g\s*\n\s+id="layer1"\s*\n\s+style="opacity:0\.516">',
        "<g id=\"layer1\">",
        text,
        count=1,
    )
    text = re.sub(
        r'<g\s*\n\s+id="layer2"\s*\n\s+style="opacity:1">',
        "<g id=\"layer2\">",
        text,
        count=1,
    )
    text = text.replace(LEGACY_BODY_BACK, f'style="{OUTLINE_STYLE}"')
    text = re.sub(
        r'(<g id="layer1">\s*\n\s*<path\s*\n\s+style=")fill:#000000;stroke:#800000(")',
        rf"\1{OUTLINE_STYLE}\2",
        text,
        count=1,
    )
    text = text.replace(LEGACY_FILL_STROKE, f'style="{MUSCLE_STYLE}"')
    return text


def strip_svg(text: str) -> str:
    text = re.sub(r"<\?xml[^>]*\?>\s*", '<?xml version="1.0" encoding="UTF-8"?>\n', text, count=1)
    text = re.sub(r"<!-- Created with Inkscape[^>]*-->\s*\n?", "", text)
    text = re.sub(r"<sodipodi:namedview[\s\S]*?</sodipodi:namedview>\s*", "", text)
    text = re.sub(r"<sodipodi:namedview[\s\S]*?/>\s*", "", text)
    text = re.sub(r'<defs\s+id="defs1"\s*/>\s*', "", text)
    text = re.sub(
        r'\s+xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"', "", text
    )
    text = re.sub(
        r'\s+xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"',
        "",
        text,
    )
    text = re.sub(r'\s+xmlns:svg="http://www.w3.org/2000/svg"', "", text)
    text = re.sub(r'\s+sodipodi:docname="[^"]*"', "", text)
    text = re.sub(r'\s+inkscape:version="[^"]*"', "", text)
    text = re.sub(r'\s+id="svg1"', "", text)
    text = re.sub(r'\s+inkscape:[^=]+="[^"]*"', "", text)
    text = re.sub(r'\s+sodipodi:[^=]+="[^"]*"', "", text)
    text = re.sub(r'style="display:inline;opacity:', 'style="opacity:', text)
    text = re.sub(r'style="display:inline;fill:', 'style="fill:', text)
    text = re.sub(r'\s+style="display:inline"', "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return apply_muscle_map_theme(text)


def main() -> None:
    repo = Path(__file__).resolve().parent.parent
    src_dir = repo / "src" / "muscle-map-sources"
    dst_dir = repo / "src" / "frontend" / "src" / "assets" / "muscle-maps"
    dst_dir.mkdir(parents=True, exist_ok=True)
    for name in ("Front_map", "Back_map"):
        src = src_dir / f"{name}.inkscape.svg"
        dst = dst_dir / f"{name}.svg"
        out = strip_svg(src.read_text(encoding="utf-8"))
        dst.write_text(out.strip() + "\n", encoding="utf-8")
        print(f"{dst.relative_to(repo)}: {len(out)} bytes")


if __name__ == "__main__":
    main()
