const db = require('./models/db');

const features = [
  // DECORATION FEATURES
  { name: 'basic_decorations', label: 'Basic Decorations', is_premium: true, is_free: true, description: 'Standard decorations (garlands, candles, fruits, table)', icon: '🎨' },
  { name: 'premium_decorations', label: 'Premium Decorations', is_premium: true, is_free: false, description: 'Categorized premium decorations (tables, candles, bouquets, etc.)', icon: '⭐' },
  { name: 'custom_decoration_upload', label: 'Custom Decoration Upload', is_premium: true, is_free: false, description: 'Upload your own decoration images', icon: '📤' },
  
  // BACKGROUND FEATURES
  { name: 'basic_backgrounds', label: 'Basic Backgrounds', is_premium: true, is_free: true, description: 'Standard background images (Modern Room, Floral Hearts, etc.)', icon: '🖼️' },
  { name: 'premium_backgrounds', label: 'Premium Backgrounds', is_premium: true, is_free: false, description: 'Exclusive background images (Bricky, Classic, Colorful, etc.)', icon: '🌟' },
  { name: 'custom_background_upload', label: 'Custom Background Upload', is_premium: true, is_free: false, description: 'Upload your own wallpaper/background', icon: '📤' },
  
  // IMAGE FEATURES
  { name: 'image_upload', label: 'Image Upload', is_premium: false, is_free: true, description: 'Upload and add images to the wall', icon: '📷' },
  { name: 'image_shape_toggle', label: 'Image Shape Toggle', is_premium: false, is_free: true, description: 'Toggle between square and circle shapes for images', icon: '🔄' },
  
  // WALL CUSTOMIZATION FEATURES
  { name: 'wall_color_customization', label: 'Wall Color Customization', is_premium: false, is_free: true, description: 'Change wall background color', icon: '🎨' },
  { name: 'wall_size_customization', label: 'Wall Size Customization', is_premium: false, is_free: true, description: 'Change wall height and width', icon: '📏' },
  { name: 'border_style_customization', label: 'Border Style Customization', is_premium: false, is_free: true, description: 'Change image border style (solid, dashed, double, none)', icon: '🖼️' },
  
  // SAVE/LOAD FEATURES
  { name: 'save_wall', label: 'Save Wall', is_premium: false, is_free: true, description: 'Save current wall design to database', icon: '💾' },
  { name: 'load_wall', label: 'Load Wall', is_premium: false, is_free: true, description: 'Load previously saved wall designs', icon: '📂' },
  
  // ACTION FEATURES
  { name: 'download_wall', label: 'Download Wall', is_premium: false, is_free: true, description: 'Download wall as PNG image', icon: '⬇️' },
  { name: 'clear_wall', label: 'Clear Wall', is_premium: false, is_free: true, description: 'Clear all images and decorations from wall', icon: '🗑️' },
  { name: 'remove_background', label: 'Remove Background', is_premium: false, is_free: true, description: 'Remove current wallpaper/background', icon: '❌' },
  
  // INTERACTION FEATURES
  { name: 'drag_drop', label: 'Drag and Drop', is_premium: false, is_free: true, description: 'Drag decorations from palette to wall', icon: '👆' },
  { name: 'resize_elements', label: 'Resize Elements', is_premium: false, is_free: true, description: 'Resize images and decorations on wall', icon: '📐' },
  { name: 'context_menu', label: 'Context Menu', is_premium: false, is_free: true, description: 'Right-click context menu for images and decorations', icon: '☰' },
  
  // SHARING FEATURES
  { name: 'public_sharing', label: 'Public Sharing', is_premium: false, is_free: true, description: 'Share walls publicly with anyone', icon: '🌐' },
  { name: 'private_sharing', label: 'Private Sharing', is_premium: true, is_free: false, description: 'Share walls privately with specific users', icon: '🔒' },
  
  // DRAFT LIMIT FEATURES
  { name: 'draft_saving', label: 'Draft Saving', is_premium: false, is_free: true, description: 'Save altar drafts to My Altars', icon: '📝' },
  { name: 'unlimited_drafts', label: 'Unlimited Drafts', is_premium: true, is_free: false, description: 'Save unlimited number of altar drafts', icon: '♾️' },
  { name: 'draft_limit_free', label: 'Free Draft Limit (3)', is_premium: false, is_free: true, description: 'Free users can save up to 3 drafts', icon: '3️⃣' }
];

async function setupFeatures() {
  try {
    console.log('🚀 Starting features setup...');
    
    // Create features table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS features (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(64) UNIQUE NOT NULL,
        label VARCHAR(128) NOT NULL,
        is_premium BOOLEAN DEFAULT FALSE,
        is_free BOOLEAN DEFAULT FALSE,
        description TEXT,
        icon VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Features table created successfully!');
    
    // Insert features
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const feature of features) {
      try {
        await db.execute(`
          INSERT IGNORE INTO features (name, label, is_premium, is_free, description, icon) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, [feature.name, feature.label, feature.is_premium, feature.is_free, feature.description, feature.icon]);
        
        // Check if row was actually inserted
        const [result] = await db.execute('SELECT ROW_COUNT() as count');
        if (result[0].count > 0) {
          insertedCount++;
          console.log(`✅ Inserted: ${feature.label}`);
        } else {
          skippedCount++;
          console.log(`⏭️  Skipped (already exists): ${feature.label}`);
        }
      } catch (error) {
        console.log(`❌ Error inserting ${feature.label}:`, error.message);
      }
    }
    
    console.log('\n📊 Setup Summary:');
    console.log(`✅ Inserted: ${insertedCount} features`);
    console.log(`⏭️  Skipped: ${skippedCount} features (already existed)`);
    console.log(`📋 Total: ${features.length} features processed`);
    
    // Verify setup by counting features
    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM features');
    console.log(`🎯 Total features in database: ${countResult[0].total}`);
    
    console.log('\n🎉 Features setup completed successfully!');
    console.log('💡 You can now run the server and use the feature management system.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up features:', error);
    process.exit(1);
  }
}

setupFeatures(); 