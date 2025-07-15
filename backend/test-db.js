const db = require('./models/db');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    const [rows] = await db.execute('SELECT 1 as test');
    console.log('✅ Database connected successfully!');
    
    // Check if walls table exists and has the name column
    const [tables] = await db.execute("SHOW TABLES LIKE 'walls'");
    if (tables.length === 0) {
      console.log('❌ Walls table does not exist!');
      return;
    }
    console.log('✅ Walls table exists');
    
    // Check table structure
    const [columns] = await db.execute("DESCRIBE walls");
    console.log('📋 Table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Check if name column exists
    const nameColumn = columns.find(col => col.Field === 'name');
    if (!nameColumn) {
      console.log('❌ Name column does not exist!');
      console.log('💡 You need to add the name column to the walls table');
      return;
    }
    console.log('✅ Name column exists');
    
    // Check existing data
    const [walls] = await db.execute('SELECT id, user_id, name, created_at FROM walls LIMIT 5');
    console.log('📊 Sample walls data:');
    walls.forEach(wall => {
      console.log(`  - ID: ${wall.id}, User: ${wall.user_id}, Name: "${wall.name}", Created: ${wall.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testDatabase(); 