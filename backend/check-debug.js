// Check for DEBUG_URL and other problematic environment variables
console.log('=== Checking for DEBUG_URL and problematic variables ===');

// Check all environment variables
const envVars = process.env;
let foundDebugUrl = false;
let problematicVars = [];

for (const [key, value] of Object.entries(envVars)) {
  if (value) {
    // Check for DEBUG_URL specifically
    if (key === 'DEBUG_URL' || key.includes('DEBUG')) {
      console.log(`🔍 Found DEBUG variable: ${key} = ${value}`);
      foundDebugUrl = true;
    }
    
    // Check for URLs
    if (value.includes('http://') || value.includes('https://') || value.includes('git.new')) {
      problematicVars.push({ key, value });
    }
  }
}

if (foundDebugUrl) {
  console.log('⚠️  DEBUG_URL found - this might be causing the issue!');
} else {
  console.log('✅ No DEBUG_URL found');
}

if (problematicVars.length > 0) {
  console.log('⚠️  Problematic variables found:');
  problematicVars.forEach(({ key, value }) => {
    console.log(`   ${key}: ${value}`);
  });
} else {
  console.log('✅ No problematic variables found');
}

console.log('=== Check complete ==='); 