# Virtual Altar - Configuration Guide

This project has been updated to remove all hardcoded values and use environment variables for configuration.

## 🚀 Quick Start

### Backend Setup

1. **Copy the example environment file:**
   ```bash
   cd backend
   cp config.env.example .env
   ```

2. **Edit the `.env` file with your configuration:**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=virtual_wall_db
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET=your_secure_jwt_secret_here
   JWT_EXPIRES_IN=24h

   # Email Configuration (for password reset and notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password

   # Frontend URL (for password reset links and sharing)
   FRONTEND_URL=http://localhost:3000

   # File Upload Configuration
   UPLOAD_PATH=uploads
   MAX_FILE_SIZE=5242880

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000

   # Premium Plan Configuration
   MONTHLY_PRICE=20
   SIX_MONTHS_PRICE=100
   ANNUAL_PRICE=180
   ```

3. **Install dependencies and start the server:**
   ```bash
   npm install
   npm start
   ```

### Frontend Setup

1. **Copy the example environment file:**
   ```bash
   cd my_app
   cp config.env.example .env
   ```

2. **Edit the `.env` file with your configuration:**
   ```env
   # API Configuration
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_API_BASE_URL=http://localhost:5000/api

   # Frontend Configuration
   REACT_APP_FRONTEND_URL=http://localhost:3000

   # Feature Flags
   REACT_APP_ENABLE_PREMIUM=true
   REACT_APP_ENABLE_SHARING=true
   REACT_APP_ENABLE_UPLOADS=true

   # Default Values
   REACT_APP_DEFAULT_WALL_HEIGHT=600
   REACT_APP_DEFAULT_WALL_WIDTH=900
   REACT_APP_DEFAULT_WALL_COLOR=#f4f4f4
   REACT_APP_DEFAULT_BORDER_STYLE=solid

   # Premium Plan Configuration
   REACT_APP_MONTHLY_PRICE=20
   REACT_APP_SIX_MONTHS_PRICE=100
   REACT_APP_ANNUAL_PRICE=180
   ```

3. **Install dependencies and start the development server:**
   ```bash
   npm install
   npm start
   ```

## 🔧 Configuration Details

### Backend Configuration

The backend uses a centralized configuration system located in `backend/config/config.js`. This file loads environment variables and provides default values.

**Key Configuration Sections:**

- **Server**: Port, environment mode
- **Database**: MySQL connection settings
- **JWT**: Secret key and expiration time
- **Email**: SMTP settings for notifications
- **File Upload**: Upload path and file size limits
- **CORS**: Allowed origins
- **Premium**: Plan pricing

### Frontend Configuration

The frontend uses a centralized configuration system located in `my_app/src/config/config.js`. This file loads environment variables and provides default values.

**Key Configuration Sections:**

- **API**: Base URLs for API calls
- **Features**: Feature flags for enabling/disabling functionality
- **Defaults**: Default values for wall dimensions and styling
- **Premium**: Plan pricing for the UI

## 🔒 Security Notes

1. **JWT Secret**: Use a strong, unique secret for JWT tokens
2. **Database Password**: Use a secure password for your database
3. **Email Credentials**: Use app-specific passwords for email services
4. **Environment Files**: Never commit `.env` files to version control

## 🌍 Environment-Specific Configurations

### Development
- Use `localhost` for all URLs
- Set `NODE_ENV=development`
- Enable all feature flags

### Production
- Use your domain for URLs
- Set `NODE_ENV=production`
- Use strong secrets and passwords
- Configure proper CORS origins
- Set up SSL certificates

### Staging
- Use staging domain for URLs
- Set `NODE_ENV=staging`
- Use different database credentials

## 📁 File Structure

```
virtual-altar/
├── backend/
│   ├── config/
│   │   └── config.js          # Backend configuration
│   ├── routes/
│   │   ├── auth.js           # Updated to use config
│   │   ├── wall.js           # Updated to use config
│   │   └── admin.js          # Updated to use config
│   ├── models/
│   │   └── db.js             # Updated to use config
│   ├── server.js             # Updated to use config
│   ├── .env                  # Environment variables
│   └── config.env.example    # Example environment file
└── my_app/
    ├── src/
    │   ├── config/
    │   │   └── config.js     # Frontend configuration
    │   ├── components/       # Updated to use config
    │   ├── pages/           # Updated to use config
    │   └── hooks/           # Updated to use config
    ├── .env                 # Environment variables
    └── config.env.example   # Example environment file
```

## 🔄 Migration from Hardcoded Values

All hardcoded values have been replaced with configuration variables:

- **API URLs**: Now use `config.apiBaseUrl`
- **File URLs**: Now use `config.apiUrl`
- **Database Settings**: Now use `config.database`
- **JWT Settings**: Now use `config.jwt`
- **Email Settings**: Now use `config.email`
- **Premium Pricing**: Now use `config.premium`

## 🚨 Important Notes

1. **Environment Variables**: All sensitive data is now stored in environment variables
2. **Configuration Files**: Centralized configuration makes it easy to manage settings
3. **Default Values**: Sensible defaults are provided for all configuration options
4. **Type Safety**: Configuration values are properly typed and validated
5. **Flexibility**: Easy to switch between different environments (dev/staging/prod)

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check your database credentials in `.env`
   - Ensure MySQL is running
   - Verify database exists

2. **API Calls Failing**
   - Check `REACT_APP_API_URL` in frontend `.env`
   - Ensure backend is running on the correct port
   - Check CORS configuration

3. **Email Not Working**
   - Verify SMTP settings in backend `.env`
   - Use app-specific passwords for Gmail
   - Check firewall settings

4. **File Uploads Failing**
   - Ensure upload directory exists
   - Check file size limits
   - Verify permissions

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed logs for configuration loading and API calls. 