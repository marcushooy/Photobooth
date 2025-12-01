---
description: Deploy the Photobooth application to Vercel
---

# Deploy Photobooth to Vercel

This workflow guides you through deploying the Photobooth application to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed globally

## Steps

### 1. Initialize Git Repository (if not already done)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Install Vercel CLI

// turbo
```bash
npm install -g vercel
```

### 3. Build the Application Locally (Optional - to verify)

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### 4. Deploy to Vercel

```bash
vercel
```

Follow the interactive prompts:
- Set up and deploy: **Yes**
- Which scope: Select your account
- Link to existing project: **No** (for first deployment)
- Project name: **photobooth** (or your preferred name)
- In which directory is your code located: **./** (press Enter)
- Want to override settings: **No** (Vercel auto-detects Vite)

### 5. Deploy to Production

After the initial deployment, deploy to production:

```bash
vercel --prod
```

## Alternative: Deploy via GitHub

1. Push your code to GitHub:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Vercel will auto-detect the Vite configuration
5. Click "Deploy"

## Environment Variables

If your application requires environment variables:

1. Go to your project settings on Vercel dashboard
2. Navigate to "Environment Variables"
3. Add any required variables (e.g., API keys)
4. Redeploy for changes to take effect

## Custom Domain (Optional)

1. Go to your project settings on Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Continuous Deployment

Once connected to GitHub, Vercel automatically deploys:
- **Production**: Every push to the `main` branch
- **Preview**: Every push to other branches and pull requests

## Useful Commands

- `vercel` - Deploy to preview
- `vercel --prod` - Deploy to production
- `vercel ls` - List all deployments
- `vercel rm <deployment-url>` - Remove a deployment
- `vercel logs <deployment-url>` - View deployment logs
