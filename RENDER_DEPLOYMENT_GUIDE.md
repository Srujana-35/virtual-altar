# 🚀 Virtual Altar - Render.com Deployment Guide

## 📋 **Prerequisites**

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **Render.com Account**: Sign up at [render.com](https://render.com)
3. **MySQL Database**: You'll need a MySQL database (AWS RDS, PlanetScale, etc.)

## 🎯 **Deployment Strategy**

We're using a **combined deployment** where the backend serves both the API and React frontend. This eliminates routing issues and CORS problems.

## 🚀 **Step-by-Step Deployment**

### **Step 1: Prepare Your Database**

1. **Set up a MySQL database** (choose one):
   - **AWS RDS**: Create a MySQL instance
   - **PlanetScale**: Free MySQL database
   - **Railway**: Easy MySQL hosting
   - **Clever Cloud**: MySQL hosting

2. **Get your database credentials**:
   - Host URL
   - Username
   - Password
   - Database name

### **Step 2: Deploy to Render**

1. **Go to Render Dashboard**:
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Blueprint"

2. **Connect your repository**:
   - Connect your GitHub account
   - Select your `virtual-altar` repository
   - Render will detect the `render.yaml` file

3. **Configure the service**:
   - **Name**: `virtual-altar` (or your preferred name)
   - **Environment**: Node.js (auto-detected)
   - **Build Command**: `cd backend && npm install && cd ../my_app && npm install && npm run build && cd ../backend`
   - **Start Command**: `cd backend && npm start`

### **Step 3: Set Environment Variables**

In your Render service dashboard, go to **Environment** tab and add these variables:

#### **Required Variables (set these):**
```
DB_HOST=your-mysql-host-url
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
JWT_SECRET=your-very-strong-secret-key-here
FRONTEND_URL=https://your-app-name.onrender.com
CORS_ORIGIN=https://your-app-name.onrender.com
```

#### **Optional Variables (for email functionality):**
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
```

#### **Auto-set Variables (already configured):**
- `NODE_ENV=production`
- `PORT=10000`
- `DB_PORT=3306`
- `JWT_EXPIRES_IN=24h`
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`
- `UPLOAD_PATH=uploads`
- `MAX_FILE_SIZE=5242880`
- `MONTHLY_PRICE=20`
- `SIX_MONTHS_PRICE=100`
- `ANNUAL_PRICE=180`

### **Step 4: Deploy**

1. **Click "Create Blueprint Instance"**
2. **Wait for deployment** (5-10 minutes)
3. **Your app will be available at**: `https://your-app-name.onrender.com`

## 🧪 **Testing Your Deployment**

### **Test URLs:**
- **Homepage**: `https://your-app-name.onrender.com/`
- **Login**: `https://your-app-name.onrender.com/login`
- **Signup**: `https://your-app-name.onrender.com/signup`
- **API Test**: `https://your-app-name.onrender.com/api`
- **Database Test**: `https://your-app-name.onrender.com/test-db`

### **Test Page Refresh:**
1. Navigate to any page
2. Refresh the browser (F5)
3. Should stay on the same page ✅

## 🔧 **Troubleshooting**

### **Build Failures:**
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### **Database Connection Issues:**
- Verify database credentials
- Check if database allows external connections
- Ensure database is running and accessible

### **CORS Errors:**
- Verify `FRONTEND_URL` and `CORS_ORIGIN` are set correctly
- Make sure they match your Render URL exactly

### **File Upload Issues:**
- Render free tier doesn't persist uploads
- Consider using cloud storage (AWS S3) for production

## 📝 **Important Notes**

### **Free Tier Limitations:**
- Services spin down after 15 minutes of inactivity
- First request after inactivity may take 30-60 seconds
- File uploads are not persisted

### **Security:**
- Never commit sensitive data to your repository
- Use Render's environment variables for secrets
- Generate a strong JWT secret

### **Performance:**
- Free tier has limited resources
- Consider upgrading for production use
- Use CDN for static assets in production

## 🔄 **Updating Your App**

1. **Make changes to your code**
2. **Commit and push to GitHub**:
   ```bash
   git add .
   git commit -m "Update app"
   git push origin main
   ```
3. **Render will automatically redeploy** (takes 5-10 minutes)

## 📞 **Support**

If you encounter issues:
1. Check Render deployment logs
2. Verify environment variables
3. Test database connectivity
4. Check CORS configuration

## 🎉 **Success!**

Once deployed, your Virtual Altar app will be live at:
`https://your-app-name.onrender.com`

Your users can now:
- Create accounts
- Build virtual altars
- Share their creations
- Access premium features

---

**Need help?** Check the deployment logs in your Render dashboard for detailed error messages. 