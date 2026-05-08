<div align="center">
  <img width="49%" alt="Cyber Fortune Sticks (ZH)" src="./docs/hero/hero-zh.png" />
  <img width="49%" alt="Cyber Fortune Sticks (EN)" src="./docs/hero/hero-en.png" />
</div>

# Gesture Fortune

[中文](./README.zh-CN.md) · **English**

Gesture Fortune is a ritual for drawing a fortune with a physical gesture—then leaving a wish on a ribbon tree. It also includes an optional **immersive 3D scene** (Gaussian Splatting) for a “step into the temple” moment.

## Try it
- **Live**: `https://gesture-fortune.vercel.app`

## What you’ll experience
- **Shake to draw**: an intentional, tactile interaction instead of a button tap.
- **Read and reflect**: a calm, minimal UI designed for short attention spans.
- **Tie a wish**: leave your wish as a ribbon on the tree.
- **Immersive mode (optional)**: load a real-world splat scene for presence + atmosphere.

## Notes on privacy
- The immersive 3D scene URLs are public assets. Anything prefixed with `VITE_` is shipped to the browser and is visible to users.
- Do not place secrets in `VITE_` variables.

## Local development

**Prerequisites:** Node.js 18+

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment variables
Create `.env.local` (it is gitignored).

#### Immersive 3D assets (recommended)
These must be **direct** `.ply` or `.splat` URLs (not a webpage URL). The viewer performs a `HEAD` request first, so the host should allow CORS.

```bash
VITE_SPLAT_TEMPLE_URL="https://huggingface.co/datasets/juliannawang/3d_GS_file/resolve/main/splat/bg.ply"
VITE_SPLAT_URL="https://huggingface.co/datasets/juliannawang/3d_GS_file/resolve/main/splat/bg-tree.ply"
```

> Note: `VITE_` variables are embedded into the client bundle and are visible to anyone visiting the site. Only store **public** URLs here.

### 3) Run dev server
```bash
npm run dev
```

### 4) Production build
```bash
npm run build
```

## Deploy (Vercel)
This repo is set up for a Git-based workflow:
- **Pull Requests → Preview deployments**
- **`main` → Production deployment** (Strategy A)

### Vercel setup checklist
1. Import this GitHub repository in Vercel.
2. Confirm it auto-detects **Vite**:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variables in Vercel (both **Production** and **Preview**):
   - `VITE_SPLAT_URL`
   - `VITE_SPLAT_TEMPLE_URL`

## Tech (for contributors)
- **Vite + React + TypeScript**
- **Firebase** (rules/config included)
- **Gaussian Splat Viewer**: `@mkkellogg/gaussian-splats-3d`

## CI
GitHub Actions runs a minimal build gate on:
- every Pull Request
- every push to `main`

Workflow: `npm ci` → `npm run build` (`.github/workflows/ci.yml`).
