require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'virtual_wall_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_email_password'
  },
  
  // Frontend Configuration - Use environment variable or detect current domain
  frontendUrl: process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://virtual-altar-app.onrender.com' : 'http://localhost:5000'),
  
  // File Upload Configuration
  upload: {
    path: process.env.UPLOAD_PATH || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880
  },
  
  // CORS Configuration - Allow all origins for single deployment
  cors: {
    origin: process.env.CORS_ORIGIN || true, // Allow specific origin or all origins
    credentials: true
  },
  
  // Premium Plan Configuration
  premium: {
    monthlyPrice: parseInt(process.env.MONTHLY_PRICE) || 20,
    sixMonthsPrice: parseInt(process.env.SIX_MONTHS_PRICE) || 100,
    annualPrice: parseInt(process.env.ANNUAL_PRICE) || 180
  }
};

module.exports = config; 