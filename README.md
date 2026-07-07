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
| `assets/img/pipeline.png`, `architecture.png`, `self_learning_popcorn.png` | paper figures |
| results tables in `index.html` | numbers from the paper (same as the review page) |

## Updating

- **arXiv link**: live — `#paper-btn` and the BibTeX block point at
  <https://arxiv.org/abs/2607.05369>.
- **Graph explorer**: re-export with
  `python export_graph_json.py <workflow.json> assets/data/packing_graph.json`
  (script lives with the launch-video pipeline; uses `gap.viz.render` layout).
- **Videos**: drop-in replace files in `assets/video/` (H.264 yuv420p,
  `-movflags +faststart`, no audio).

Design: light "engineering document" theme — Archivo + IBM Plex, node-palette
accents, white artifact cards; the prompt terminal is the one dark accent.
