<div align="center">
<img width="1200" height="475" alt="Gesture Fortune preview" src="./public/bg-tree.png" />
</div>

# Gesture Fortune

A poetic, gesture-driven fortune ritual: shake (or move) your device to draw a fortune, then tie wishes to a ribbon tree. Includes an optional immersive 3D scene powered by Gaussian Splatting.

## Tech stack
- **Vite + React + TypeScript**
- **Firebase** (rules/config included in repo)
- **Gaussian Splat Viewer**: `@mkkellogg/gaussian-splats-3d` (optional immersive mode)

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

## Deploy (Vercel, Strategy A)
This repo is intended to use a Git-based workflow:
- **Pull Requests → Preview deployments**
- **`main` → Production deployment**

### Vercel setup checklist
1. Import this GitHub repository in Vercel.
2. Confirm it auto-detects **Vite**:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variables in Vercel (both **Production** and **Preview**):
   - `VITE_SPLAT_URL`
   - `VITE_SPLAT_TEMPLE_URL`

## CI
GitHub Actions runs a minimal build gate on:
- every Pull Request
- every push to `main`

Workflow: `npm ci` → `npm run build` (`.github/workflows/ci.yml`).
