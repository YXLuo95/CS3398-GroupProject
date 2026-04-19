import { useEffect, useMemo, useRef } from "react";

import frontSvgRaw from "../assets/muscle-maps/Front_map.svg?raw";
import backSvgRaw from "../assets/muscle-maps/Back_map.svg?raw";
import { expandGroupIntensities, expandPrimarySecondaryIntensities } from "../data/muscleGroups";

const DEFAULT_FILL = "rgba(148,163,184,0.18)";
const DEFAULT_STROKE = "rgba(255,255,255,0.14)";
const OUTLINE_ID = "body_outline";

/**
 * @param {number} t 0–1
 */
function heatFill(t) {
  if (t <= 0) return DEFAULT_FILL;
  const a = 0.22 + t * 0.72;
  return `rgba(52,152,219,${a.toFixed(3)})`;
}

/**
 * @param {number} t 0–1
 */
function heatStroke(t) {
  if (t <= 0) return DEFAULT_STROKE;
  const a = 0.18 + t * 0.45;
  return `rgba(127,200,227,${a.toFixed(3)})`;
}

/**
 * @param {SVGSVGElement} svg
 * @param {Record<string, number>} intensities 0–1 per path id (SVG element id)
 */
function paintZones(svg, intensities) {
  const layer2 = svg.querySelector("#layer2");
  if (!layer2) return;

  const paths = layer2.querySelectorAll("path[id]");
  paths.forEach((path) => {
    const id = path.getAttribute("id");
    if (!id || id === OUTLINE_ID) return;
    const t = intensities[id];
    if (t == null || t <= 0) {
      path.style.fill = DEFAULT_FILL;
      path.style.stroke = DEFAULT_STROKE;
      path.style.strokeWidth = "1";
      return;
    }
    path.style.fill = heatFill(Math.min(1, Math.max(0, t)));
    path.style.stroke = heatStroke(Math.min(1, Math.max(0, t)));
    path.style.strokeWidth = "1";
  });
}

/**
 * @param {{ side: 'front' | 'back', zoneIntensities: Record<string, number>, className?: string, style?: React.CSSProperties, svgMaxHeight?: string, maxWidth?: string }} props
 */
function MuscleMapSingle({
  side,
  zoneIntensities,
  className = "",
  style = {},
  svgMaxHeight = "520px",
  maxWidth = "360px",
}) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const host = wrapRef.current;
    if (!host) return;
    const raw = side === "back" ? backSvgRaw : frontSvgRaw;
    host.innerHTML = raw;
    const svg = host.querySelector("svg");
    svgRef.current = svg;
    if (svg) {
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.style.maxHeight = svgMaxHeight;
      svg.style.display = "block";
      svg.style.margin = "0 auto";
    }
  }, [side, svgMaxHeight]);

  useEffect(() => {
    const svg = svgRef.current;
    if (svg) paintZones(svg, zoneIntensities);
  }, [side, zoneIntensities]);

  return (
    <div className={className} style={{ width: "100%", maxWidth, margin: "0 auto", ...style }}>
      <div ref={wrapRef} style={{ width: "100%" }} aria-hidden />
    </div>
  );
}

/**
 * @param {{
 *   bothSides?: boolean,
 *   side?: 'front' | 'back',
 *   groupIntensities?: Record<string, number>,
 *   primaryMuscles?: string[],
 *   secondaryMuscles?: string[],
 *   intensities?: Record<string, number>,
 *   className?: string,
 *   style?: React.CSSProperties,
 *   svgMaxHeight?: string,
 *   compact?: boolean,
 *   summary?: boolean,
 * }} props
 *
 * Prefer `primaryMuscles` / `secondaryMuscles` (DB enum; primary → 1, secondary → 0.5 per group), then
 * `groupIntensities` (per muscle group weights). When both are empty, `intensities` is per-SVG-zone ids.
 */
export default function MuscleHeatMap({
  bothSides = false,
  side = "front",
  groupIntensities,
  primaryMuscles,
  secondaryMuscles,
  intensities = {},
  className = "",
  style = {},
  svgMaxHeight,
  compact = false,
  summary = false,
}) {
  const zoneIntensities = useMemo(() => {
    const hasPs =
      (primaryMuscles?.length ?? 0) > 0 || (secondaryMuscles?.length ?? 0) > 0;
    if (hasPs) {
      return expandPrimarySecondaryIntensities({ primaryMuscles, secondaryMuscles });
    }
    const g = groupIntensities && Object.keys(groupIntensities).length > 0 ? groupIntensities : null;
    if (g) return expandGroupIntensities(g);
    return intensities;
  }, [
    groupIntensities,
    intensities,
    (primaryMuscles ?? []).join("|"),
    (secondaryMuscles ?? []).join("|"),
  ]);

  const mh = svgMaxHeight ?? (compact ? "200px" : summary ? "340px" : "520px");
  const singleMw = compact ? "200px" : summary ? "300px" : "360px";

  if (bothSides) {
    const figFlex = compact ? "1 1 42%" : summary ? "1 1 0" : "1 1 260px";
    const figMax = compact ? "min(48%, 200px)" : summary ? "min(calc(50% - 2px), 340px)" : "380px";
    const capDisplay = compact ? "none" : undefined;
    const pairGap = compact ? "6px" : summary ? "4px" : "clamp(12px, 4vw, 28px)";
    const capStyle = summary
      ? { marginTop: "6px", fontSize: "0.72rem", color: "#94a3b8", letterSpacing: "0.03em", display: capDisplay }
      : { marginTop: "10px", fontSize: "0.8rem", color: "#94a3b8", letterSpacing: "0.04em", display: capDisplay };
    return (
      <div
        className={className}
        style={{
          display: "flex",
          flexWrap: summary ? "nowrap" : "wrap",
          gap: pairGap,
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          maxWidth: summary ? "100%" : undefined,
          margin: summary ? 0 : undefined,
          ...style,
        }}
      >
        <figure style={{ margin: 0, flex: figFlex, maxWidth: figMax, minWidth: 0, textAlign: "center" }}>
          <MuscleMapSingle
            side="front"
            zoneIntensities={zoneIntensities}
            svgMaxHeight={mh}
            maxWidth={singleMw}
          />
          <figcaption style={capStyle}>
            Front
          </figcaption>
        </figure>
        <figure style={{ margin: 0, flex: figFlex, maxWidth: figMax, minWidth: 0, textAlign: "center" }}>
          <MuscleMapSingle
            side="back"
            zoneIntensities={zoneIntensities}
            svgMaxHeight={mh}
            maxWidth={singleMw}
          />
          <figcaption style={capStyle}>
            Back
          </figcaption>
        </figure>
      </div>
    );
  }

  return (
    <MuscleMapSingle
      side={side}
      zoneIntensities={zoneIntensities}
      className={className}
      style={style}
      svgMaxHeight={mh}
      maxWidth={singleMw}
    />
  );
}
