# ✅ Virtual Altar - Deployment Checklist

## 📋 **Pre-Deployment Checklist**

### **Database Setup**
- [ ] MySQL database created (AWS RDS, PlanetScale, etc.)
- [ ] Database credentials obtained
- [ ] Database allows external connections
- [ ] Database is running and accessible

### **Code Preparation**
- [ ] All code committed to GitHub
- [ ] `render.yaml` file created ✅
- [ ] No hardcoded secrets in code
- [ ] Environment variables configured

### **Render.com Setup**
- [ ] Render.com account created
- [ ] GitHub repository connected
- [ ] Blueprint deployment configured
- [ ] Environment variables set

## 🔧 **Required Environment Variables**

### **Database (Required)**
- [ ] `DB_HOST` - Your MySQL host URL
- [ ] `DB_USER` - Database username
- [ ] `DB_PASSWORD` - Database password
- [ ] `DB_NAME` - Database name

### **Security (Required)**
- [ ] `JWT_SECRET` - Strong secret key
- [ ] `FRONTEND_URL` - Your Render URL
- [ ] `CORS_ORIGIN` - Your Render URL

### **Email (Optional)**
- [ ] `EMAIL_USER` - Gmail address
- [ ] `EMAIL_PASS` - Gmail app password

## 🚀 **Deployment Steps**

### **Step 1: Database**
- [ ] Create MySQL database
- [ ] Get connection details
- [ ] Test connection locally

### **Step 2: Render Deployment**
- [ ] Go to Render Dashboard
- [ ] Create new Blueprint
- [ ] Connect GitHub repository
- [ ] Set environment variables
- [ ] Deploy

### **Step 3: Testing**
- [ ] Test homepage: `https://your-app.onrender.com/`
- [ ] Test login: `https://your-app.onrender.com/login`
- [ ] Test signup: `https://your-app.onrender.com/signup`
- [ ] Test API: `https://your-app.onrender.com/api`
- [ ] Test database: `https://your-app.onrender.com/test-db`
- [ ] Test page refresh on all pages

## 🧪 **Post-Deployment Tests**

### **User Functionality**
- [ ] User registration works
- [ ] User login works
- [ ] Password reset works (if email configured)
- [ ] Profile page loads
- [ ] Settings page works

### **Altar Functionality**
- [ ] Create new altar
- [ ] Add decorations
- [ ] Save altar
- [ ] Load saved altars
- [ ] Share altar (if implemented)

### **Admin Functionality**
- [ ] Admin login works
- [ ] User management works
- [ ] Feature management works
- [ ] Premium management works

### **Premium Features**
- [ ] Premium signup works
- [ ] Premium features accessible
- [ ] Payment integration (if implemented)

## 🔧 **Troubleshooting**

### **Common Issues**
- [ ] Build failures - Check logs
- [ ] Database connection - Verify credentials
- [ ] CORS errors - Check FRONTEND_URL
- [ ] File uploads - Consider cloud storage
- [ ] Page refresh issues - Should work with combined deployment

### **Performance**
- [ ] First load time acceptable
- [ ] Images load properly
- [ ] No console errors
- [ ] Mobile responsiveness

## 📝 **Final Checklist**

- [ ] App is live and accessible
- [ ] All core features work
- [ ] Database is connected
- [ ] Environment variables set correctly
- [ ] No sensitive data exposed
- [ ] SSL certificate working (automatic on Render)
- [ ] Custom domain configured (if needed)

## 🎉 **Success!**

Your Virtual Altar app is now live at:
`https://your-app-name.onrender.com`

### **Next Steps**
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Set up custom domain (optional)
- [ ] Plan for scaling

---

**Need help?** Check the deployment logs in your Render dashboard for detailed error messages. 