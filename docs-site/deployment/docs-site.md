# Deploy docs.heygrimoire.xyz

This site is built with VitePress from `docs-site/`.

![Deploy docs](/banners/grimoire-docs-deploy-docs-banner.png)

## Build

```bash
cd docs-site
npm install
npm run build
```

Output: `.vitepress/dist/`

## Vercel

1. Root directory: `docs-site`
2. Build command: `npm run build`
3. Output directory: `.vitepress/dist`

## Custom domain

Add `docs.heygrimoire.xyz` in your host's domain settings.

Example DNS:

```
CNAME docs.heygrimoire.xyz → cname.vercel-dns.com
```

## Cloudflare Pages

- Root: `docs-site`
- Build: `npm run build`
- Output: `.vitepress/dist`

## Local preview

```bash
npm run dev      # development
npm run preview  # after build
```

## Assets

`public/hero-logo.png`, `public/logo-nav.png`
