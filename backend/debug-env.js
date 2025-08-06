// Debug environment variables
require('dotenv').config();

console.log('=== Environment Variables Debug ===');

// Check all environment variables
const envVars = process.env;
let problematicVars = [];

for (const [key, value] of Object.entries(envVars)) {
  if (value) {
    // Check for URLs
    if (value.includes('http://') || value.includes('https://') || value.includes('git.new')) {
      problematicVars.push({ key, value, type: 'URL' });
    }
    // Check for special characters that might cause route issues
    if (value.includes('://') || value.includes('git.new')) {
      problematicVars.push({ key, value, type: 'SPECIAL_CHARS' });
    }
  }
}

if (problematicVars.length > 0) {
  console.log('⚠️  PROBLEMATIC ENVIRONMENT VARIABLES FOUND:');
  problematicVars.forEach(({ key, value, type }) => {
    console.log(`   ${key}: ${value} (${type})`);
  });
} else {
  console.log('✅ No problematic environment variables found');
}

// Show all environment variables (be careful with sensitive data)
console.log('\n=== All Environment Variables ===');
for (const [key, value] of Object.entries(envVars)) {
  if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) {
    console.log(`${key}: [HIDDEN]`);
  } else {
    console.log(`${key}: ${value}`);
  }
}

console.log('\n=== Debug Complete ==='); 