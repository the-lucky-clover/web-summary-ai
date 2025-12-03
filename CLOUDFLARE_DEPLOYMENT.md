# Cloudflare Pages Deployment Guide

## 🚀 Deploy Web Summary AI to websummaryai.pages.dev

This guide will walk you through deploying the extension landing page to Cloudflare Pages.

---

## Prerequisites

1. **GitHub Account** (already done ✅)
2. **Cloudflare Account** (free tier works!)
3. Repository: `github.com/the-lucky-clover/web-summary-ai`

---

## Step 1: Connect to Cloudflare Pages

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Log in or create account

2. **Navigate to Pages**
   - In left sidebar: Click "Workers & Pages"
   - Click "Create application"
   - Select "Pages" tab
   - Click "Connect to Git"

3. **Connect GitHub**
   - Authorize Cloudflare to access GitHub
   - Select repository: `the-lucky-clover/web-summary-ai`

---

## Step 2: Configure Build Settings

### Project Name
```
websummaryai
```
*(This creates websummaryai.pages.dev)*

### Production Branch
```
main
```

### Build Configuration
- **Framework preset**: None
- **Build command**: *(leave empty)*
- **Build output directory**: `/dist`
- **Root directory**: *(leave as default)*

### Environment Variables
*(None needed for static site)*

---

## Step 3: Deploy!

1. Click **"Save and Deploy"**
2. Wait 1-2 minutes for first deployment
3. Your site will be live at: `https://websummaryai.pages.dev`

---

## Step 4: Verify Deployment

Visit your site and check:

✅ Landing page loads with gradient background  
✅ All 4 browser download buttons work  
✅ Files download correctly:
   - `web-summary-ai-chrome-v1.0.0.zip`
   - `web-summary-ai-firefox-v1.0.0.xpi`
   - `web-summary-ai-edge-v1.0.0.zip`
   - `web-summary-ai-safari-v1.0.0.zip`

---

## Automatic Updates

**Every push to `main` branch automatically deploys!**

```bash
# Make changes
git add .
git commit -m "Update extension"
git push origin main

# Cloudflare Pages automatically rebuilds and deploys
```

---

## Custom Domain (Optional)

To use a custom domain:

1. In Cloudflare Pages project settings
2. Click "Custom domains"
3. Add your domain (e.g., `download.websummaryai.com`)
4. Follow DNS setup instructions

---

## Troubleshooting

### Downloads not working?
- Check that files exist in `/dist` directory
- Verify `.gitignore` doesn't exclude `dist/`
- Ensure all `.zip` and `.xpi` files are committed

### Page not loading?
- Verify build directory is set to `/dist`
- Check `_redirects` file exists in `/dist`
- Review deployment logs in Cloudflare dashboard

### Need to rebuild?
- Go to Deployments tab
- Click "Retry deployment" on latest build
- Or push a new commit to trigger rebuild

---

## Build Directory Structure

```
dist/
├── index.html                          # Landing page
├── _redirects                          # Cloudflare routing
├── README.md                           # Distribution docs
├── web-summary-ai-chrome-v1.0.0.zip   # Chrome package
├── web-summary-ai-firefox-v1.0.0.xpi  # Firefox package
├── web-summary-ai-edge-v1.0.0.zip     # Edge package
└── web-summary-ai-safari-v1.0.0.zip   # Safari package
```

---

## Next Steps

1. **Deploy to Cloudflare Pages** ← Do this now!
2. **Test downloads** from live site
3. **Submit to browser stores**:
   - Chrome Web Store
   - Firefox Add-ons
   - Microsoft Edge Add-ons
   - Apple App Store (Safari)

---

## URLs After Deployment

- **Landing Page**: https://websummaryai.pages.dev
- **Chrome Download**: https://websummaryai.pages.dev/web-summary-ai-chrome-v1.0.0.zip
- **Firefox Download**: https://websummaryai.pages.dev/web-summary-ai-firefox-v1.0.0.xpi
- **Edge Download**: https://websummaryai.pages.dev/web-summary-ai-edge-v1.0.0.zip
- **Safari Download**: https://websummaryai.pages.dev/web-summary-ai-safari-v1.0.0.zip

---

## Success! 🎉

Your extension is now available for download from a beautiful landing page!

**Share your extension**: https://websummaryai.pages.dev
