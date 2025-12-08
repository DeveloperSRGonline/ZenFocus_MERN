# ZenFocus Deployment Guide

## Deploying to Render

This guide will walk you through deploying your ZenFocus MERN application to Render.

### Prerequisites

- [ ] GitHub account (to connect your repository)
- [ ] Render account (sign up at https://render.com)
- [ ] MongoDB Atlas database (already set up ✓)
- [ ] Your code pushed to GitHub

---

## Step 1: Push Your Code to GitHub

If you haven't already, push your code to GitHub:

```powershell
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

> **Important**: Make sure `.env` is in your `.gitignore` file so database credentials are not committed!

---

## Step 2: Deploy Backend API

### Option A: Using render.yaml (Recommended)

1. Go to https://dashboard.render.com
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Click **"Apply"**

### Option B: Manual Setup

1. Go to https://dashboard.render.com
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `zenfocus-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Add Environment Variables**:
   - Click **"Advanced"** → **"Add Environment Variable"**
   - Add the following:
     ```
     MONGO_URI=mongodb+srv://shivamgarade05:t5oQ8ojM7f0yxE7c@cluster0.dhc1lej.mongodb.net/zenfocus
     PORT=5000
     FRONTEND_URL=https://YOUR-FRONTEND-URL.onrender.com
     ```
   - (Replace `YOUR-FRONTEND-URL` after deploying frontend)

6. Click **"Create Web Service"**

7. **Wait for deployment** (5-10 minutes)

8. **Copy your backend URL**: `https://zenfocus-backend.onrender.com`

---

## Step 3: Update Frontend Environment

1. Open `frontend/.env.production`
2. Replace the placeholder with your actual backend URL:
   ```
   VITE_API_URL=https://zenfocus-backend.onrender.com/api
   ```
3. Commit and push:
   ```powershell
   git add frontend/.env.production
   git commit -m "Update production API URL"
   git push origin main
   ```

---

## Step 4: Deploy Frontend

### Option A: Using render.yaml

If you used Blueprint in Step 2, your frontend should deploy automatically!

### Option B: Manual Setup

1. Go to https://dashboard.render.com
2. Click **"New"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `zenfocus-frontend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

5. Click **"Create Static Site"**

6. **Wait for deployment** (5-10 minutes)

7. **Your app is live!** 🎉

---

## Step 5: Update Backend CORS

1. Go back to your backend service in Render dashboard
2. Edit **Environment Variables**
3. Update `FRONTEND_URL` with your actual frontend URL:
   ```
   FRONTEND_URL=https://zenfocus-frontend.onrender.com
   ```
4. Click **"Save Changes"**
5. Backend will automatically redeploy

---

## Verification Checklist

Once both services are deployed:

- [ ] Frontend loads without errors
- [ ] Open browser console (F12) - no CORS errors
- [ ] Test creating a task
- [ ] Test viewing tasks in Calendar
- [ ] Test Kanban board drag & drop
- [ ] Test Pomodoro timer
- [ ] Test Brain Dump feature
- [ ] Test Ideas Vault
- [ ] Refresh page - data persists (MongoDB working)
- [ ] Test on mobile device

---

## Troubleshooting

### CORS Errors
- **Symptom**: Console shows "CORS policy blocked"
- **Fix**: Verify `FRONTEND_URL` in backend environment variables matches your exact frontend URL
- **Fix**: Redeploy backend after changing environment variables

### "Failed to load data from server"
- **Symptom**: Toast notification shows error on app load
- **Fix**: Check backend logs in Render dashboard
- **Fix**: Verify `VITE_API_URL` in `.env.production` is correct
- **Fix**: Verify MongoDB connection string is correct

### Backend Not Connecting to MongoDB
- **Symptom**: Backend logs show MongoDB connection error
- **Fix**: Verify `MONGO_URI` environment variable is set correctly
- **Fix**: Check MongoDB Atlas to ensure your IP is whitelisted (use 0.0.0.0/0 for all IPs)
- **Fix**: Verify database credentials are correct

### Frontend Shows Blank Page
- **Symptom**: White screen, no errors
- **Fix**: Check browser console for JavaScript errors
- **Fix**: Verify build completed successfully in Render logs
- **Fix**: Check that publish directory is set to `dist`

### Free Tier Sleep Mode
- **Note**: Render free tier services sleep after 15 minutes of inactivity
- **Impact**: First request after sleep takes ~30 seconds to wake up
- **Solution**: Upgrade to paid tier OR use a service like UptimeRobot to ping your app

---

## Updating Your App

Whenever you make changes to your code:

1. Commit and push to GitHub:
   ```powershell
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. Render will automatically detect changes and redeploy! 🚀

3. **Auto-deploy**: Enabled by default for both services

---

## Important Notes

### Environment Variables to Set in Render

**Backend**:
- `MONGO_URI` - Your MongoDB Atlas connection string
- `PORT` - 5000 (or any port)
- `FRONTEND_URL` - Your deployed frontend URL

**Frontend**:
- No environment variables needed in Render dashboard
- Uses `.env.production` file in your repository

### Security Best Practices

1. ✅ `.env` is in `.gitignore`
2. ✅ MongoDB credentials stored as environment variables
3. ✅ CORS restricted to your frontend domain
4. ⚠️ Consider rotating MongoDB password periodically
5. ⚠️ Enable MongoDB Atlas IP whitelisting for extra security

---

## URLs Reference

After deployment, save these URLs:

- **Frontend**: `https://zenfocus-frontend.onrender.com`
- **Backend**: `https://zenfocus-backend.onrender.com`
- **API Endpoint**: `https://zenfocus-backend.onrender.com/api`

---

## Support

If you encounter issues:
1. Check Render service logs (Dashboard → Your Service → Logs)
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

🎉 **Congratulations! Your ZenFocus app is now live!**
