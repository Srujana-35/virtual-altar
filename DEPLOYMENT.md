# Deploying Virtual Altar to Render.com

This guide will help you deploy your Virtual Altar application to Render.com.

## Prerequisites

1. A Render.com account
2. Your code pushed to a Git repository (GitHub, GitLab, etc.)
3. A MySQL database (you can use AWS RDS, PlanetScale, or any other MySQL provider)

## Deployment Steps

### Option 1: Blueprint Deployment (Recommended)

1. **Connect your repository to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" and select "Blueprint"
   - Connect your Git repository
   - Render will automatically detect the `render.yaml` file

2. **Configure Environment Variables:**
   After the blueprint is created, you'll need to set the following environment variables for the backend service:

   **Database Configuration:**
   - `DB_HOST` - Your MySQL database host
   - `DB_USER` - Database username
   - `DB_PASSWORD` - Database password
   - `DB_NAME` - Database name

   **Security:**
   - `JWT_SECRET` - A strong secret key for JWT tokens

   **Email Configuration (Optional):**
   - `EMAIL_USER` - Your Gmail address
   - `EMAIL_PASS` - Your Gmail app password

   **Frontend URL:**
   - `FRONTEND_URL` - Your frontend URL (e.g., https://virtual-altar-frontend.onrender.com)
   - `CORS_ORIGIN` - Your frontend URL

3. **Configure Frontend Environment Variables:**
   For the frontend service, set:
   - `REACT_APP_API_URL` - Your backend URL (e.g., https://virtual-altar-backend.onrender.com)
   - `REACT_APP_API_BASE_URL` - Your backend API URL (e.g., https://virtual-altar-backend.onrender.com/api)
   - `REACT_APP_FRONTEND_URL` - Your frontend URL

### Option 2: Manual Deployment

#### Deploy Backend First

1. **Create a new Web Service:**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your repository
   - Set the following:
     - **Name:** virtual-altar-backend
     - **Root Directory:** backend
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`

2. **Set Environment Variables:**
   Add all the environment variables listed in Option 1.

#### Deploy Frontend

1. **Create a new Static Site:**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your repository
   - Set the following:
     - **Name:** virtual-altar-frontend
     - **Root Directory:** my_app
     - **Build Command:** `npm install && npm run build`
     - **Publish Directory:** build

2. **Set Environment Variables:**
   Add the frontend environment variables listed in Option 1.

## Database Setup

1. **Create a MySQL database** (AWS RDS, PlanetScale, etc.)
2. **Run the database migrations** (you may need to create these)
3. **Update the database connection variables** in your backend service

## Important Notes

1. **Free Tier Limitations:**
   - Render free tier services spin down after 15 minutes of inactivity
   - First request after inactivity may take 30-60 seconds

2. **Environment Variables:**
   - Never commit sensitive information like database passwords
   - Use Render's environment variable feature to set these securely

3. **CORS Configuration:**
   - The backend is configured to allow requests from your frontend domain
   - Make sure to update the CORS origins if you change domains

4. **File Uploads:**
   - Render's free tier doesn't persist file uploads
   - Consider using a cloud storage service like AWS S3 for production

## Troubleshooting

1. **Build Failures:**
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in package.json

2. **Database Connection Issues:**
   - Verify database credentials
   - Check if your database allows external connections
   - Ensure the database is running

3. **CORS Errors:**
   - Verify the frontend URL is correctly set in backend environment variables
   - Check that the CORS configuration includes your frontend domain

## URLs After Deployment

- **Backend:** https://virtual-altar-backend.onrender.com
- **Frontend:** https://virtual-altar-frontend.onrender.com

Remember to update your frontend configuration to point to the deployed backend URL! 