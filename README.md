# GaP — Graph-as-Policy · project website

The project page for **GaP: A Graph-as-Policy Multi-Agent Self-Learning Harness
for Variational Automation (VA) Tasks**, served at
**https://graph-robots.github.io/gap/**.

Static site — no build step. `index.html` + `assets/` is everything.

## Deploy (GitHub Pages)

```bash
git remote add origin git@github.com:graph-robots/gap.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Source: Deploy from a branch →
`main` / `(root)`** . The `.nojekyll` file is already in place so `assets/`
paths serve as-is.

## What's inside

| Piece | Source of truth |
|---|---|
| `assets/video/splash.mp4` | the launch video (`gap_video_v6.mp4`) |
| `assets/data/packing_graph.json` | exported from `examples/grocery_packing/packing_graph/workflow.json` via the repo's `gap.viz` layout — drives the interactive graph explorer |
| `assets/data/selflearn.json` + `assets/img/minimaps/` | per-iteration graph renders + real metrics from the popcorn self-learning reproduction run (12 iterations) — drives the iteration scrubber |
| `assets/img/pipeline.png`, `architecture.png`, `self_learning_popcorn.png` | paper figures |
| results tables in `index.html` | numbers from the paper (same as the review page) |

## Updating

- **arXiv link**: in `index.html`, turn the disabled `#paper-btn` into a live
  link: `<a class="btn btn-primary" href="https://arxiv.org/abs/XXXX.XXXXX"
  target="_blank" rel="noopener">📄 Paper (arXiv)</a>`.
- **Graph explorer**: re-export with
  `python export_graph_json.py <workflow.json> assets/data/packing_graph.json`
  (script lives with the launch-video pipeline; uses `gap.viz.render` layout).
- **Videos**: drop-in replace files in `assets/video/` (H.264 yuv420p,
  `-movflags +faststart`, no audio).

Design: "engineering blueprint" theme matching the launch video — Archivo +
IBM Plex, node-palette accents, white artifact cards on near-black.
