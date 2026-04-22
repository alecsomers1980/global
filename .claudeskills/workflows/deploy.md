---
description: Deploy the RVR Inc website to Vercel production
---

# Deploy to Vercel Production

GitHub auto-deploy is unreliable for this project. Use the Vercel CLI instead.

// turbo-all

1. Stage and commit any uncommitted changes:
```
git add .
```
```
git commit -m "deploy: <description>"
```

2. Push to GitHub for version history:
```
git push origin main
```

3. Deploy directly to Vercel production:
```
npx -y vercel deploy --prod --yes
```

The deploy URL will be printed when complete. Production alias: https://rvrinc.vercel.app
