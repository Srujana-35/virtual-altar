// Test each route file individually
const express = require('express');

console.log('=== Testing Route Files ===');

// Test function to check if a router can be created
function testRouter(routerModule, name) {
  try {
    console.log(`Testing ${name}...`);
    
    // Check if the router is valid
    if (!routerModule) {
      console.log(`✗ ${name}: No router module`);
      return false;
    }
    
    // Check if it has a router property (for auth) or is the router itself
    const router = routerModule.router || routerModule;
    
    if (!router || typeof router !== 'function') {
      console.log(`✗ ${name}: Invalid router type: ${typeof router}`);
      return false;
    }
    
    console.log(`✓ ${name}: Valid router`);
    return true;
  } catch (error) {
    console.log(`✗ ${name}: Error - ${error.message}`);
    return false;
  }
}

// Test each route file
try {
  console.log('Loading route files...');
  
  const authRoutes = require('./routes/auth');
  const wallRoutes = require('./routes/wall');
  const adminRoutes = require('./routes/admin');
  const premiumRoutes = require('./routes/premium');
  const featuresRoutes = require('./routes/features');
  
  console.log('Testing individual routers...');
  
  const results = [
    testRouter(authRoutes, 'auth'),
    testRouter(wallRoutes, 'wall'),
    testRouter(adminRoutes, 'admin'),
    testRouter(premiumRoutes, 'premium'),
    testRouter(featuresRoutes, 'features')
  ];
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n=== Results ===`);
  console.log(`✅ Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('✅ All route files are valid');
  } else {
    console.log('❌ Some route files have issues');
  }
  
} catch (error) {
  console.error('Error testing routes:', error);
}

console.log('=== Test Complete ==='); 