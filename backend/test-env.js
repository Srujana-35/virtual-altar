// Test environment variables
require('dotenv').config();

console.log('=== Environment Variables Test ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

// Check for any environment variables that might contain URLs
const envVars = process.env;
for (const [key, value] of Object.entries(envVars)) {
  if (value && (value.includes('http://') || value.includes('https://') || value.includes('git.new'))) {
    console.log(`⚠️  WARNING: Environment variable ${key} contains URL: ${value}`);
  }
}

console.log('=== Test Complete ==='); 