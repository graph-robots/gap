/* GaP site — reveals, video management, graph explorer, self-learning scrubber */
(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ── scroll reveals ──────────────────────────────────────────────────── */
const revIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); revIO.unobserve(e.target); }
}), { threshold: 0.12 });
$$(".reveal").forEach(el => revIO.observe(el));

/* ── video autoplay / hover management ───────────────────────────────── */
const touch = matchMedia("(hover: none)").matches;
const vidIO = new IntersectionObserver(es => es.forEach(e => {
  const v = e.target;
  if (e.isIntersecting) v.play().catch(() => {});
  else v.pause();
}), { threshold: 0.3 });
$$("video[data-autoplay]").forEach(v => vidIO.observe(v));
$$(".bcard .bmedia video").forEach(v => {
  if (touch) { vidIO.observe(v); return; }
  const card = v.closest(".bcard");
  card.addEventListener("mouseenter", () => v.play().catch(() => {}));
  card.addEventListener("mouseleave", () => v.pause());
});

/* ── crate view tabs ─────────────────────────────────────────────────── */
const crateVid = $("#crate-video");
$$(".btab").forEach(b => b.addEventListener("click", () => {
  $$(".btab").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  crateVid.poster = b.dataset.p;
  crateVid.src = b.dataset.v;
  crateVid.play().catch(() => {});
}));

/* ── results tabs ────────────────────────────────────────────────────── */
$$(".rtab").forEach(b => b.addEventListener("click", () => {
  $$(".rtab").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  $$(".rpanel").forEach(p => p.hidden = p.id !== b.dataset.t);
}));

/* ── bibtex copy ─────────────────────────────────────────────────────── */
$("#bib-copy")?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("#bib-text").textContent);
    $("#bib-copy").textContent = "✓ copied";
    setTimeout(() => $("#bib-copy").textContent = "⧉ copy", 1600);
  } catch {}
});

/* ── prompt typing loop ──────────────────────────────────────────────── */
const PROMPT = "Pack all the grocery items into the basket.";
const typed = $("#ptyped");
if (typed && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let i = 0, dir = 1;
  const step = () => {
    typed.textContent = PROMPT.slice(0, i);
    if (dir > 0 && i >= PROMPT.length) { dir = 0; setTimeout(() => { dir = 1; i = 0; step(); }, 6000); return; }
    i += dir;
    setTimeout(step, 42 + Math.random() * 40);
  };
  step();
} else if (typed) typed.textContent = PROMPT;

/* ── graph explorer ──────────────────────────────────────────────────── */
const PAL = {
  tool:        ["#cfe3f7", "#2c6fb0"],
  script:      ["#d6efd6", "#3f8f47"],
  subgraph:    ["#e8e0f5", "#7a5bb0"],
  router:      ["#fde7c4", "#c8841a"],
  noop:        ["#ececec", "#9a9a9a"],
  end_success: ["#d6efd6", "#2f7d36"],
  end_failure: ["#f7d6d6", "#b03434"],
};
const EDGE = { ctrl: "#5a5a66", ok: "#2e7d32", fail: "#c0392b" };
const NS = "http://www.w3.org/2000/svg";
const mk = (t, at, parent) => {
  const el = document.createElementNS(NS, t);
  for (const k in at) el.setAttribute(k, at[k]);
  if (parent) parent.appendChild(el);
  return el;
};

async function buildGraph() {
  const holder = $("#graph-svg-holder");
  if (!holder) return;
  const g = await (await fetch("assets/data/packing_graph.json")).json();
  const svg = mk("svg", { viewBox: `0 0 ${g.w} ${g.h}`, role: "img" }, holder);

  const defs = mk("defs", {}, svg);
  for (const [id, col] of [["ah-ctrl", EDGE.ctrl], ["ah-ok", EDGE.ok], ["ah-fail", EDGE.fail]]) {
    const m = mk("marker", { id, viewBox: "0 0 10 10", refX: 8.4, refY: 5,
      markerWidth: 7.5, markerHeight: 7.5, orient: "auto-start-reverse" }, defs);
    mk("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: col }, m);
  }

  const items = [];   // [order, element]
  for (const ln of g.lanes) {
    const grp = mk("g", { class: "gv" }, svg);
    mk("rect", { class: "g-lane", x: ln.x, y: ln.y, width: ln.w, height: ln.h, rx: 14 }, grp);
    const t = mk("text", { class: "g-lane-t", x: ln.x + 14, y: ln.y + 24 }, grp);
    t.textContent = ln.title;
    items.push([ln.order, grp]);
  }

  const trim = (x1, y1, x2, y2, hw, hh) => {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
    const tx = Math.abs(dx) > 0.01 ? (hw + 5) / (Math.abs(dx) / L) : 1e9;
    const ty = Math.abs(dy) > 0.01 ? (hh + 5) / (Math.abs(dy) / L) : 1e9;
    const t = Math.min(tx, ty);
    return [x1 + dx / L * t, y1 + dy / L * t];
  };

  for (const e of g.edges) {
    let el;
    if (e.kind === "ctrl") {
      const [sx, sy] = trim(e.x1, e.y1, e.x2, e.y2, g.nodeW / 2, g.nodeH / 2);
      const [ex, ey] = trim(e.x2, e.y2, e.x1, e.y1, g.nodeW / 2, g.nodeH / 2);
      el = mk("path", { class: "g-edge gv", d: `M ${sx} ${sy} L ${ex} ${ey}`,
        stroke: EDGE.ctrl, "stroke-width": 2.2, "marker-end": "url(#ah-ctrl)" }, svg);
    } else {
      el = mk("path", { class: "g-edge gv",
        d: `M ${e.x1} ${e.y1} Q ${e.cx} ${e.cy} ${e.x2} ${e.y2}`,
        stroke: EDGE[e.kind], "stroke-width": 2.6,
        "marker-end": `url(#ah-${e.kind})` }, svg);
      if (e.label) { el.dataset.label = e.label; el.dataset.kind = e.kind; }
    }
    items.push([e.order, el]);
  }

  const tip = $("#graph-tip");
  for (const n of g.nodes) {
    const [fill, stroke] = PAL[n.type] || PAL.tool;
    const grp = mk("g", { class: "g-node gv" }, svg);
    mk("rect", { x: n.x - g.nodeW / 2, y: n.y - g.nodeH / 2, width: g.nodeW,
      height: g.nodeH, rx: 9, fill, stroke }, grp);
    const nm = mk("text", { class: "nm", x: n.x, y: n.y + (n.sub ? -3 : 5) }, grp);
    nm.textContent = n.label;
    if (n.sub) {
      const sb = mk("text", { class: "sb", x: n.x, y: n.y + 16 }, grp);
      const short = n.sub.split("/").pop();
      sb.textContent = `(${short.length > 24 ? short.slice(0, 23) + "…" : short})`;
    }
    grp.addEventListener("mousemove", ev => {
      tip.hidden = false;
      tip.innerHTML = `<b>${n.label}</b><br>${n.type.replace("_", " · ")}${n.sub ? `<br><span style="opacity:.75">${n.sub}</span>` : ""}`;
      tip.style.left = Math.min(ev.clientX + 16, innerWidth - 330) + "px";
      tip.style.top = (ev.clientY + 18) + "px";
    });
    grp.addEventListener("mouseleave", () => tip.hidden = true);
    items.push([n.order, grp]);
  }

  // edge label tooltips (macro routes)
  $$("path[data-label]", svg).forEach(p => {
    p.addEventListener("mousemove", ev => {
      tip.hidden = false;
      const col = p.dataset.kind === "fail" ? "#e08a7c" : "#9fd4a2";
      tip.innerHTML = `<b style="color:${col}">${p.dataset.label}</b><br>${p.dataset.kind === "fail" ? "failure route" : "success route"}`;
      tip.style.left = Math.min(ev.clientX + 16, innerWidth - 330) + "px";
      tip.style.top = (ev.clientY + 18) + "px";
    });
    p.addEventListener("mouseleave", () => tip.hidden = true);
  });

  items.sort((a, b) => a[0] - b[0]);
  let played = false;
  const play = () => {
    items.forEach(([, el]) => el.classList.remove("on"));
    items.forEach(([, el], i) => setTimeout(() => el.classList.add("on"), 120 + i * 55));
  };
  const gio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !played) { played = true; play(); gio.disconnect(); }
  }), { threshold: 0.25 });
  gio.observe($("#graph-artifact"));
  $("#graph-replay")?.addEventListener("click", play);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach(([, el]) => el.classList.add("on"));
    played = true;
  }
}
buildGraph().catch(console.error);

/* ── self-learning scrubber ──────────────────────────────────────────── */
async function buildScrubber() {
  const slider = $("#sl-slider");
  if (!slider) return;
  const data = await (await fetch("assets/data/selflearn.json")).json();
  const iters = data.iters;
  const mini = $("#sl-mini"), zoom = $("#sl-zoom"), note = $("#sl-note"),
        chips = $("#sl-chips"), iterChip = $("#sl-iter"), curve = $("#sl-curve");

  const W = 460, H = 210, L = 38, R = 12, T = 14, B = 30;
  const X = i => L + (W - L - R) * i / (iters.length - 1);
  const Y = v => H - B - (H - T - B) * v / 100;
  // static axes
  for (const p of [0, 25, 50, 75, 100]) {
    mk("line", { x1: L, y1: Y(p), x2: W - R, y2: Y(p), stroke: "#e4e6ea", "stroke-width": 1 }, curve);
    const t = mk("text", { x: L - 7, y: Y(p) + 4, "text-anchor": "end",
      "font-size": 10, fill: "#9aa0a8", "font-family": "IBM Plex Mono, monospace" }, curve);
    t.textContent = p;
  }
  iters.forEach((_, i) => {
    const t = mk("text", { x: X(i), y: H - 10, "text-anchor": "middle",
      "font-size": 10, fill: "#9aa0a8", "font-family": "IBM Plex Mono, monospace" }, curve);
    t.textContent = i;
  });
  const mcPath = mk("polyline", { fill: "none", stroke: "#2e7d32", "stroke-width": 3, "stroke-linejoin": "round" }, curve);
  const srPath = mk("polyline", { fill: "none", stroke: "#2e6db4", "stroke-width": 3, "stroke-linejoin": "round" }, curve);
  const dotsG = mk("g", {}, curve);

  const pad2 = n => String(n).padStart(2, "0");
  const update = k => {
    const it = iters[k];
    mini.src = `assets/img/minimaps/mini_${pad2(k)}.png`;
    iterChip.textContent = `iteration ${k} / ${iters.length - 1}`;
    chips.innerHTML = it.changed.length
      ? `<span class="mono" style="color:#8a9099;font-size:12.5px;width:100%">agents patched:</span>` +
        it.changed.slice(0, 4).map(c => `<span class="pchip">${c}</span>`).join("")
      : "";
    if (it.zoom) {
      zoom.src = `assets/img/minimaps/zoom_${pad2(k)}_${it.zoom}.png`;
      zoom.hidden = false;
      note.textContent = "zoom: patched subgraph";
    } else {
      zoom.hidden = true;
      note.textContent = k === 0 ? "initial graph — synthesized from the task prompt"
                                 : "no patch this round — rehearse again";
    }
    mcPath.setAttribute("points", iters.slice(0, k + 1).map((e, i) => `${X(i)},${Y(e.mc)}`).join(" "));
    srPath.setAttribute("points", iters.slice(0, k + 1).map((e, i) => `${X(i)},${Y(e.sr)}`).join(" "));
    dotsG.innerHTML = "";
    iters.slice(0, k + 1).forEach((e, i) => {
      mk("circle", { cx: X(i), cy: Y(e.mc), r: 4, fill: "#2e7d32" }, dotsG);
      mk("circle", { cx: X(i), cy: Y(e.sr), r: 4, fill: "#2e6db4" }, dotsG);
    });
  };
  slider.addEventListener("input", () => { stop(); update(+slider.value); });
  update(0);

  let timer = null;
  const playBtn = $("#sl-play");
  const stop = () => { if (timer) { clearInterval(timer); timer = null; playBtn.textContent = "▶ play"; } };
  playBtn.addEventListener("click", () => {
    if (timer) { stop(); return; }
    playBtn.textContent = "⏸ pause";
    if (+slider.value >= iters.length - 1) slider.value = 0;
    update(+slider.value);
    timer = setInterval(() => {
      const k = +slider.value + 1;
      if (k >= iters.length) { stop(); return; }
      slider.value = k;
      update(k);
    }, 900);
  });
  // auto-play once when scrolled into view
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { if (!timer) playBtn.click(); sio.disconnect(); }
  }), { threshold: 0.35 });
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) sio.observe($("#scrubber"));
}
buildScrubber().catch(console.error);
})();
