# Deployment Checklist for Virtual Altar

## ✅ Frontend Status
- **URL:** https://virtual-altar-frontend.onrender.com
- **Status:** ✅ Deployed and Live

## 🔧 Backend Deployment Required

### Step 1: Deploy Backend to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Configure the service:
   - **Name:** virtual-altar-backend
   - **Root Directory:** backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### Step 2: Set Backend Environment Variables
In your backend service settings, add these environment variables:

**Required Variables:**
```
DB_HOST=your-mysql-database-host
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
JWT_SECRET=your-strong-secret-key
FRONTEND_URL=https://virtual-altar-frontend.onrender.com
CORS_ORIGIN=https://virtual-altar-frontend.onrender.com
```

**Optional Variables:**
```
EMAIL_USER=your-gmail-address
EMAIL_PASS=your-gmail-app-password
```

### Step 3: Update Frontend Environment Variables
In your frontend service settings, update these variables:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com/api
REACT_APP_FRONTEND_URL=https://virtual-altar-frontend.onrender.com
```

## 🗄️ Database Setup

### Option 1: AWS RDS (Recommended)
1. Create a MySQL RDS instance
2. Configure security groups to allow connections
3. Note down the endpoint, username, and password

### Option 2: PlanetScale (Free Tier)
1. Sign up at [PlanetScale](https://planetscale.com)
2. Create a new database
3. Get the connection string

### Option 3: Railway
1. Go to [Railway](https://railway.app)
2. Create a new MySQL database
3. Get the connection details

## 🔍 Testing Your Deployment

### Test Backend Connection
Visit: `https://your-backend-url.onrender.com/`
Should show: `{"message":"Virtual Wall Backend is running!"}`

### Test Database Connection
Visit: `https://your-backend-url.onrender.com/test-db`
Should show: `{"message":"Database connection successful!","test":1}`

### Test Frontend-Backend Communication
1. Open https://virtual-altar-frontend.onrender.com
2. Try to register/login
3. Check browser console for any CORS errors

## 🚨 Common Issues & Solutions

### 1. CORS Errors
- Ensure `CORS_ORIGIN` is set to `https://virtual-altar-frontend.onrender.com`
- Check that the frontend URL is in the allowedOrigins array

### 2. Database Connection Failed
- Verify database credentials
- Check if database allows external connections
- Ensure database is running

### 3. Frontend Can't Connect to Backend
- Verify `REACT_APP_API_URL` is correct
- Check that backend is running
- Test backend URL directly

### 4. Build Failures
- Check Render build logs
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

## 📋 Final Checklist

- [ ] Backend deployed to Render
- [ ] Database created and configured
- [ ] Environment variables set
- [ ] Frontend environment variables updated
- [ ] Backend responds to health check
- [ ] Database connection test passes
- [ ] Frontend can communicate with backend
- [ ] User registration/login works
- [ ] File uploads work (if applicable)

## 🆘 Need Help?

1. Check Render deployment logs
2. Test backend endpoints directly
3. Verify environment variables are set correctly
4. Check database connection from backend logs

Your frontend is already live at https://virtual-altar-frontend.onrender.com - now you just need to get the backend deployed and connected! 