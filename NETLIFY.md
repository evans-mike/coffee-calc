# Netlify Deployment Guide

This guide explains how to deploy Coffee Calc to Netlify.

## Quick Setup via Netlify UI

### Step 1: Connect Repository
1. Log in to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider (GitHub, GitLab, or Bitbucket)
4. Select the `coffee-calc` repository

### Step 2: Configure Build Settings

In the **"Build and deploy"** section, configure the following:

**Build command:**
```bash
npm install && npm run build
```

**Publish directory:**
```
.
```
(Use a single dot to publish from the root directory)

**Node version:**
```
18
```
(or `20`, `22` - specify the Node.js version you want to use)

### Step 3: Deploy

1. Click "Deploy site"
2. Netlify will:
   - Install dependencies (`npm install`)
   - Run the build command (`npm run build` - compiles TypeScript to JavaScript)
   - Deploy the site

## Build Settings Summary

| Setting | Value |
|---------|-------|
| **Build command** | `npm install && npm run build` |
| **Publish directory** | `.` (root directory) |
| **Node version** | `18` (or `20`, `22`) |
| **Base directory** | (leave empty) |

## What Happens During Build

1. **Install dependencies**: `npm install` installs TypeScript
2. **Compile TypeScript**: `npm run build` compiles `main.ts` → `main.js`
3. **Deploy**: All files (HTML, CSS, compiled JS) are deployed as a static site

## Automatic Deployments

Once connected to Git:
- **Automatic deploys**: Every push to your default branch triggers a new build
- **Deploy previews**: Pull requests get preview deployments
- **Branch deploys**: You can configure branch-specific deployments

## Using netlify.toml (Recommended)

For a cleaner setup, you can use the included `netlify.toml` configuration file. This file:
- Stores build settings in your repository
- Makes deployment consistent across team members
- Allows for additional Netlify features (redirects, headers, etc.)

If `netlify.toml` exists, Netlify will automatically use those settings instead of the UI settings.

## Environment Variables

This project doesn't require any environment variables. All dependencies are loaded via CDN:
- LZ-String: `https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js`
- Font Awesome: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css`

## Custom Domain

After deployment:
1. Go to Site settings → Domain management
2. Add your custom domain
3. Follow Netlify's DNS configuration instructions

## Troubleshooting

**Build fails with "TypeScript not found":**
- Ensure `package.json` includes TypeScript in `devDependencies`
- The build command runs `npm install` first, so this should be resolved automatically

**Site loads but shows blank page:**
- Check that `main.js` is being generated in the build logs
- Verify `index.html` references `main.js` (not `main.ts`)

**Build succeeds but JavaScript doesn't work:**
- Check browser console for errors
- Verify CDN links are loading (LZ-String, Font Awesome)
- Ensure `main.js` exists in the deployed files

**Node version issues:**
- Specify Node version in Netlify UI: `18`, `20`, or `22`
- Or use `netlify.toml` with the `NODE_VERSION` environment variable

## Continuous Deployment

Once set up, Netlify will:
- ✅ Build on every push to your default branch
- ✅ Create preview deployments for pull requests
- ✅ Show build logs and deployment status
- ✅ Provide deploy notifications (optional)

---

*For more information, see [Netlify's documentation](https://docs.netlify.com/)*
