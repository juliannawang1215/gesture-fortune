<div align="center">
  <img width="1200" height="475" alt="Gesture Fortune 预览" src="./public/bg-tree.png" />
</div>

# Gesture Fortune

**中文** · [English](./README.md)

Gesture Fortune 是一个偏“仪式感”的移动端小体验：通过**摇一摇/动作**抽取签文，然后把愿望系在祈福树的丝带上。也支持可选的 **3D 沉浸模式**（Gaussian Splatting），让用户进入更强的氛围感场景。

## 立即体验
- **线上地址**：`https://gesture-fortune.vercel.app`

## 你会体验到什么
- **摇动抽签**：用身体动作触发，而不是点击按钮。
- **沉静阅读**：短时间也能读完的简洁界面。
- **系上祈愿**：把愿望作为丝带留在祈福树上。
- **沉浸模式（可选）**：加载真实场景的 splat 资源，增强“在场感”。

## 截图

<div align="center">
  <img width="900" alt="祈福树" src="./public/bg-tree.png" />
  <br />
  <img width="900" alt="仪式背景" src="./public/bg.png" />
</div>

## 隐私与配置说明
- `VITE_` 前缀的环境变量会被打包进前端代码，**访问网站的任何人都能看到**。这里只能放**公开资源**（例如 `.ply/.splat` 的直链），不要放密钥。

## 本地运行

**前置条件：** Node.js 18+

### 1) 安装依赖
```bash
npm install
```

### 2) 配置环境变量
新建 `.env.local`（已在 `.gitignore` 中忽略）。

#### 3D 资源（推荐）
要求是**可直接下载**的 `.ply` 或 `.splat` 直链（不是网页地址）。加载器会先做一次 `HEAD` 请求，因此资源端需要允许 CORS。

```bash
VITE_SPLAT_TEMPLE_URL="https://huggingface.co/datasets/juliannawang/3d_GS_file/resolve/main/splat/bg.ply"
VITE_SPLAT_URL="https://huggingface.co/datasets/juliannawang/3d_GS_file/resolve/main/splat/bg-tree.ply"
```

### 3) 启动开发环境
```bash
npm run dev
```

### 4) 构建
```bash
npm run build
```

## 部署（Vercel）
本仓库推荐使用 Git 工作流：
- **Pull Request → 自动 Preview**
- **`main` → 自动 Production（策略 A）**

### Vercel 配置清单
1. 在 Vercel 中 Import 该 GitHub 仓库
2. 确认自动识别为 **Vite**：
   - Build command：`npm run build`
   - Output directory：`dist`
3. 在 Vercel 中添加环境变量（**Production** 和 **Preview** 都要加）：
   - `VITE_SPLAT_URL`
   - `VITE_SPLAT_TEMPLE_URL`

## CI
GitHub Actions 会在以下情况进行最小构建校验：
- 每个 Pull Request
- 每次推送到 `main`

流程：`npm ci` → `npm run build`（见 `.github/workflows/ci.yml`）。

