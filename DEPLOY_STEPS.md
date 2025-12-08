# Deploy ZenFocus to Render - Simple Steps

## ✅ CODE IS READY - Just Follow These Steps!

---

## STEP 1: Push Code to GitHub (5 minutes)

### 1.1 Create GitHub Repository
- Go to https://github.com/new
- Repository name: `ZenFocus_MERN`
- Make it Public or Private
- Click "Create repository"

### 1.2 Push Your Code
```powershell
# Run these commands in your project folder
git remote add origin https://github.com/YOUR_USERNAME/ZenFocus_MERN.git
git branch -M main
git push -u origin main
```
Replace `YOUR_USERNAME` with your GitHub username.

---

## STEP 2: Deploy on Render (10 minutes)

### 2.1 Sign Up for Render
- Go to https://render.com
- Sign up with your GitHub account (easiest)

### 2.2 Deploy Using Blueprint
1. Click **"New"** → **"Blueprint"**
2. **Connect GitHub** (authorize if needed)
3. **Select repository**: Choose `ZenFocus_MERN`
4. Render will detect your `render.yaml` file
5. You'll see **2 services ready to deploy**:
   - `zenfocus-backend` (Web Service)
   - `zenfocus-frontend` (Static Site)

### 2.3 Add Environment Variables for Backend
Before clicking Apply, set these for the backend service:
- Click **Edit** on `zenfocus-backend`
- Add Environment Variables:
  - `MONGO_URI` = `mongodb+srv://shivamgarade05:t5oQ8ojM7f0yxE7c@cluster0.dhc1lej.mongodb.net/zenfocus`
  - `PORT` = `5000`
  - `FRONTEND_URL` = (leave empty for now)

### 2.4 Deploy!
- Click **"Apply"**
- Wait 5-10 minutes for both services to build

---

## STEP 3: Connect Frontend & Backend (2 minutes)

After deployment completes:

### 3.1 Get Your URLs
Render will give you two URLs like:
- **Backend**: `https://zenfocus-backend-xxxx.onrender.com`
- **Frontend**: `https://zenfocus-frontend-xxxx.onrender.com`

### 3.2 Update Frontend to Use Backend
On your computer, edit this file:
**File**: `frontend/.env.production`

Change line 4 to your actual backend URL:
```
VITE_API_URL=https://zenfocus-backend-xxxx.onrender.com/api
```
(Replace `xxxx` with your actual backend URL)

Then push to GitHub:
```powershell
git add frontend/.env.production
git commit -m "Update production API URL"
git push origin main
```

Frontend will auto-redeploy (2-3 minutes).

### 3.3 Update Backend to Allow Frontend
- Go to Render Dashboard
- Click on `zenfocus-backend` service
- Go to **Environment** tab
- Edit `FRONTEND_URL` variable
- Set it to: `https://zenfocus-frontend-xxxx.onrender.com`
- Click **Save Changes**

Backend will auto-redeploy (2-3 minutes).

---

## STEP 4: Test Your Live App! 🎉

1. Open your frontend URL: `https://zenfocus-frontend-xxxx.onrender.com`
2. Test these features:
   - ✅ App loads without errors
   - ✅ Create a task
   - ✅ View tasks in Calendar
   - ✅ Use Pomodoro timer
   - ✅ Test Kanban board
   - ✅ Refresh page - data should persist

---

## ⚠️ IMPORTANT NOTES

### Free Tier Sleep Mode
- Render free tier services sleep after 15 minutes of no activity
- First request takes ~30 seconds to wake up
- This is normal! Not a bug.

### Auto-Deploy Enabled
- Every time you push to GitHub, your app automatically redeploys
- No manual work needed after initial setup!

---

## 🆘 TROUBLESHOOTING

### "Failed to load data from server"
- Check if backend URL in `frontend/.env.production` is correct
- Make sure it ends with `/api`

### CORS Error in Browser Console
- Make sure `FRONTEND_URL` in backend matches your exact frontend URL
- Should NOT end with a slash

### Backend Won't Connect to MongoDB
- Verify `MONGO_URI` is correct in Render dashboard
- Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

---

## 📝 SUMMARY

**Total Time**: About 20 minutes
**Cost**: $0 (Free tier)
**What You Need**: 
- ✅ GitHub account
- ✅ Render account
- ✅ Code already prepared (done!)

**Start with STEP 1!** 🚀
