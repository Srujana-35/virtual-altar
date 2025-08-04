
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import html2canvas from "html2canvas";
import { Rnd } from "react-rnd";
import "./Wall.css";
import ReactDOM from "react-dom";
import { useFeatures } from "../hooks/useFeatures";
import config from "../config/config";
import mylogo from '../assets/mylogo.jpg';


function Wall() {
  const [images, setImages] = useState([]);
  const [decorations, setDecorations] = useState([]);
  const [wallColor, setWallColor] = useState(config.defaultWallColor);
  const [borderStyle, setBorderStyle] = useState(config.defaultBorderStyle);
  const [wallpaper, setWallpaper] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // Context menu state
  const [wallHeight, setWallHeight] = useState(config.defaultWallHeight); // default height in px
  const [wallWidth, setWallWidth] = useState(config.defaultWallWidth); // default width in px
  const [uploading, setUploading] = useState(false); // New: uploading state
  const [decorationPalette, setDecorationPalette] = useState([
    { id: 'garland1', src: '/decorations/garland1.png' },
    { id: 'garland2', src: '/decorations/garland2.png' },
    { id: 'bouquet', src: '/decorations/bouquet.png' },
    { id: 'candles', src: '/decorations/candles.png' },
    { id: 'fruits', src: '/decorations/fruits.png' },
    { id: 'table', src: '/decorations/table.png' },
    {id:'garland3', src:'/decorations/garland3.png'},
  ]);
  const [currentWallId, setCurrentWallId] = useState(null);
  const { canUseFeature, isPremium, features } = useFeatures();

  // Debug logging
  useEffect(() => {
    console.log('Wall.js - Features loaded:', features);
    console.log('Wall.js - Can use premium backgrounds:', canUseFeature('premium_backgrounds'));
    console.log('Wall.js - Is premium:', isPremium);
  }, [features, canUseFeature, isPremium]);

  // Helper to convert file to base64 string (for wall images only)
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Return the full data URL (data:image/jpeg;base64,xxx)
        resolve(reader.result);
      };
      reader.onerror = error => reject(error);
    });
  };



  // Upload images and convert to base64
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    const baseOffset = 30; // pixels to offset each image
    setUploading(true);
    try {
      const uploadedImages = await Promise.all(files.map(async (file, idx) => {
        const base64Data = await fileToBase64(file);
        console.log('Converted file to base64:', file.name); // Debug
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Offset each image by its index and the current number of images
        const offset = (images.length + idx) * baseOffset;
        return {
          id: uniqueId,
          src: base64Data, // Store as base64 data URL
          shape: "square",
          width: 120,
          height: 120,
          x: 50 + offset,
          y: 50 + offset
        };
      }));
      console.log('Final uploaded images:', uploadedImages); // Debug
      setImages([...images, ...uploadedImages]);
    } catch (err) {
      alert('Failed to upload one or more images.');
    } finally {
      setUploading(false);
    }
  };

  // Upload wallpaper and convert to base64
  const handleWallpaperUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      try {
        const base64Data = await fileToBase64(file);
        setWallpaper(base64Data); // Store as base64 data URL
      } catch (err) {
        alert('Failed to upload wallpaper.');
      } finally {
        setUploading(false);
      }
    }
  };

  // Upload user decoration and convert to base64
  const handleDecorationUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const base64Data = await fileToBase64(file);
      setDecorationPalette(prev => [
        ...prev,
        { id: `user-${Date.now()}`, src: base64Data, name: file.name }
      ]);
    } catch (err) {
      alert('Failed to upload decoration.');
    } finally {
      setUploading(false);
    }
  };

  const handleDropOnWall = (src, e) => {
    const wall = document.getElementById("wall");
    const wallRect = wall.getBoundingClientRect();
    const x = e.clientX - wallRect.left;
    const y = e.clientY - wallRect.top;
    const newDecoration = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      src: src, // Store only the filename or relative path
      width: 100,
      height: 100,
      x,
      y
    };
    setDecorations(prev => [...prev, newDecoration]);
  };
  const updateDecoration = (id, data) => {
    setDecorations(decorations.map(dec => dec.id === id ? { ...dec, ...data } : dec));
  };

  const updateImage = (id, data) => {
    setImages(images.map(img => img.id === id ? { ...img, ...data } : img));
  };
  
  const handleDeleteDecoration = (id) => {
    setDecorations(decorations.filter(dec => dec.id !== id));
  };

  const handleDeleteImage = (id) => {
    setImages(images.filter(img => img.id !== id));
    setContextMenu(null);
  };

  // In handleToggleShape, always set width=height for circle
  const handleToggleShape = (img) => {
    const newShape = img.shape === "circle" ? "square" : "circle";
    let newWidth = img.width;
    let newHeight = img.height;
    if (newShape === "circle") {
      newWidth = newHeight = Math.max(img.width, img.height);
    }
    updateImage(img.id, {
      shape: newShape,
      width: newWidth,
      height: newHeight
    });
    setContextMenu(null);
  };

  // Always use server URL for images/wallpaper
  // Handle image URLs - support base64 data URLs and regular URLs
  const makeImageUrl = (src) => {
    console.log('makeImageUrl called with src:', src); // Debug
    if (!src) return null;
    // If it's already a data URL or starts with /, return as is
    if (src.startsWith('data:') || src.startsWith('/')) return src;
    // For any other case, return as is (no uploads directory needed)
    return src;
  };

  const wallStyle = {
    backgroundColor: wallColor,
    backgroundImage: wallpaper ? `url(${wallpaper})` : "none", // wallpaper is already base64 data URL
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: wallHeight + "px",
    width: wallWidth + "px"
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  // Load latest wall from backend (moved to button)
  const handleLoadWall = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      // 1. Get list of walls (most recent first)
      const listRes = await fetch(`${config.apiBaseUrl}/wall/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const listData = await listRes.json();
      if (!listRes.ok || !listData.walls || listData.walls.length === 0) {
        alert('No saved wall found!');
        return;
      }
      const latestWallId = listData.walls[0].id;
      // 2. Load the latest wall
      const wallRes = await fetch(`${config.apiBaseUrl}/wall/load/${latestWallId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const wallData = await wallRes.json();
      if (!wallRes.ok || !wallData.wall) {
        alert('Failed to load wall!');
        return;
      }
          const {
      images = [],
      decorations = [],
      wallColor = '#f4f4f4',
      borderStyle = 'solid',
      wallpaper = null,
      wallHeight = 600,
      wallWidth = 900
    } = wallData.wall.wallData || {};
    
    // Show wall name in alert
    const wallName = wallData.wall.name || 'Untitled Wall';
    alert(`Loaded wall: ${wallName}`);
    
    console.log('Loading wall data:', wallData.wall.wallData); // Debug
    
    // Keep original src values, let makeImageUrl handle them during render
      const fixedImages = (images || []).map(img => ({
        ...img,
      src: img.src
      }));
      const fixedDecorations = (decorations || []).map(dec => ({
        ...dec,
      src: dec.src
      }));
    
      setImages(fixedImages);
      setDecorations(fixedDecorations);
      setWallColor(wallColor);
      setBorderStyle(borderStyle);
    setWallpaper(wallpaper);
      setWallHeight(wallHeight);
      setWallWidth(wallWidth);
      setCurrentWallId(latestWallId); // Set currentWallId on load
    
    console.log('Loaded images:', fixedImages); // Debug
    console.log('Loaded decorations:', fixedDecorations); // Debug
    } catch (err) {
      alert('Error loading wall: ' + err.message);
    }
  };

  // Define default backgrounds with src and name
  const defaultBackgrounds = [
    { src: "/backgrounds/bg3.jpg", name: "Modern Room" },
    { src: "/backgrounds/flowerbg.jpg", name: "Floral Hearts" },
    {src:"/backgrounds/homebg2.jpg", name:"Blue Sky"},
    {src:"/backgrounds/homebg3.jpg", name:"Green Leaves"},
    {src:"/backgrounds/homebg4.jpg", name:"Plain White"},
    
  ];

  // Add after defaultBackgrounds
  const premiumBackgrounds = [
    { src: "/backgrounds/bricky.jpg", name: "Bricky" },
    { src: "/backgrounds/classic.jpg", name: "Classic" },
    {src:"/backgrounds/colorful.jpg", name:"Colorful"},
    {src:"/backgrounds/flowers.jpg", name:"FLowers"},
    {src:"/backgrounds/modernized.jpg", name:"Modernized"},
    {src:"/backgrounds/official.jpg", name:"Official"},
    // Add more as needed
  ];

  // Update premiumDecorations with category field
  const premiumDecorations = [
    { id: "table1", src: "/decorations/table1.png", category: "tables" },
    { id: "table2", src: "/decorations/table2.png", category: "tables" },
    { id: "table3", src: "/decorations/table3.png", category: "tables" },
    { id: "candle2", src: "/decorations/candle2.png", category: "candles" },
    { id: "candle3", src: "/decorations/candle3.png", category: "candles" },
    { id: "candle4", src: "/decorations/candle4.png", category: "candles" },
    { id: "candle5", src: "/decorations/candle5.png", category: "candles" },
    { id: "bouquet1", src: "/decorations/bouquet1.png", category: "bouquets" },
    { id: "bouquet2", src: "/decorations/bouquet2.png", category: "bouquets" },
    { id: "bouquet3", src: "/decorations/bouquet3.png", category: "bouquets" },
    { id: "fruits1", src: "/decorations/fruits1.png", category: "fruits" },
    { id: "fruits2", src: "/decorations/fruits2.png", category: "fruits" },
    { id: "garland3", src: "/decorations/garland3.png", category: "garlands" },
    { id: "garland4", src: "/decorations/garland4.png", category: "garlands" },
    { id: "garland5", src: "/decorations/garland5.png", category: "garlands" },
    { id: "garland6", src: "/decorations/garland6.png", category: "garlands" },
    { id: "wallgarland", src: "/decorations/wallgarland.png", category: "wallgarlands" },
    { id: "wallgarland1", src: "/decorations/wallgarland1.png", category: "wallgarlands" },
    { id: "wallgarland2", src: "/decorations/wallgarland2.png", category: "wallgarlands" },
    { id: "frame1", src: "/decorations/frame1.png", category: "frames" },
    { id: "frame2", src: "/decorations/frame2.png", category: "frames" },
    { id: "frame3", src: "/decorations/frame3.png", category: "frames" },
    // Add more as needed
  ];

  const premiumCategories = [
    { key: "tables", label: "Tables" },
    { key: "candles", label: "Candles" },
    { key: "bouquets", label: "Bouquets" },
    { key: "fruits", label: "Fruits" },
    { key: "garlands", label: "Garlands" },
    { key: "wallgarlands", label: "Wall Garlands" },
    { key: "frames", label: "Frames" },
  ];

  const [selectedPremiumCategory, setSelectedPremiumCategory] = useState("tables");

  // Handler for submit button
  const handleSubmitWall = async () => {
    const wallName = prompt('Enter a name for your wall:', 'My Virtual Wall');
    if (!wallName) return; // User cancelled
    
    const wallState = {
      images,
      decorations,
      wallColor,
      borderStyle,
      wallpaper,
      wallHeight,
      wallWidth
    };
    
    try {
      const token = localStorage.getItem('token');
      
      let response, data;
      if (currentWallId) {
        // Update existing wall
        response = await fetch(`${config.apiBaseUrl}/wall/update/${currentWallId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ wallData: wallState, wallName })
        });
        data = await response.json();
        if (response.ok) {
          alert(`Wall "${data.name}" updated successfully!`);
        } else {
          alert('Error updating wall: ' + (data.error || 'Unknown error'));
        }
      } else {
        // Create new wall
        response = await fetch(`${config.apiBaseUrl}/wall/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
          body: JSON.stringify({ wallData: wallState, wallName })
      });
        data = await response.json();
      if (response.ok) {
        alert(`Wall "${data.name}" saved successfully!`);
      } else {
        alert('Error saving wall: ' + (data.error || 'Unknown error'));
        }
      }
    } catch (err) {
      alert('Error saving wall: ' + err.message);
    }
  };

  useEffect(() => {
    // Restore wall if restoreWallData is present
    const restoreData = localStorage.getItem('restoreWallData');
    const restoreId = localStorage.getItem('restoreWallId');
    if (restoreData) {
      try {
        const wallData = JSON.parse(restoreData);
        console.log('Restoring wall data:', wallData); // Debug
        
        // Use the same makeImageUrl function as the rest of the component
        const fixedImages = (wallData.images || []).map(img => ({
          ...img,
          src: img.src // Keep the original src, let makeImageUrl handle it during render
        }));
        const fixedDecorations = (wallData.decorations || []).map(dec => ({
          ...dec,
          src: dec.src // Keep the original src, let makeImageUrl handle it during render
        }));
        
        setImages(fixedImages);
        setDecorations(fixedDecorations);
        setWallColor(wallData.wallColor || '#f4f4f4');
        setBorderStyle(wallData.borderStyle || 'solid');
        setWallpaper(wallData.wallpaper); // Keep original, let makeImageUrl handle it
        setWallHeight(wallData.wallHeight || 600);
        setWallWidth(wallData.wallWidth || 900);
        if (restoreId) setCurrentWallId(restoreId);
        
        console.log('Restored images:', fixedImages); // Debug
        console.log('Restored decorations:', fixedDecorations); // Debug
      } catch (err) {
        console.error('Error restoring wall:', err);
      }
      localStorage.removeItem('restoreWallData');
      localStorage.removeItem('restoreWallId');
    }
  }, []);

  // Features are now managed by the useFeatures hook
  // No need for separate premium status fetch

  // At the top of the Wall function, get the user's profile photo from localStorage (if available)
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const profilePhoto = userInfo.profile_photo || null;

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <img src={mylogo} alt="MiAltar Logo" className="logo-image" />
              <div className="logo-text-container">
                <span className="logo-text">MiAltar</span>
                <span className="logo-subtitle">Virtual Memorial</span>
              </div>
            </div>
            <nav className="nav">
              <Link to="/" className="nav-link">Home</Link>
              <button
                onClick={() => window.location.href = '/profile'}
                className="profile-button-homepage"
                title="Profile"
                aria-label="Profile"
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="profile-photo-homepage"
                  />
                ) : (
                  <span className="profile-placeholder-homepage">👤</span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>
      {/* Decoration Palette full width below header */}
      <div className="horizontal-palette-section horizontal-palette-fullwidth">
        <h4 className="section-title">Decoration Palette</h4>
        <div className="horizontal-palette-scroll">
          {decorationPalette.map(dec => (
            <img
              key={dec.id}
              src={makeImageUrl(dec.src)}
              alt=""
              className="horizontal-palette-thumb"
              draggable={canUseFeature('drag_drop')}
              onDragStart={canUseFeature('drag_drop') ? (e) => {
                e.dataTransfer.setData("text/plain", dec.src);
              } : undefined}
            />
          ))}
          {/* Choose your own decoration - dynamic feature check */}
          {canUseFeature('custom_decoration_upload') ? (
            <div className="horizontal-palette-upload">
              <label htmlFor="decoration-upload" className="decoration-upload-label">
                Add your own decoration:
              </label>
              <input
                id="decoration-upload"
                type="file"
                accept="image/*"
                onChange={handleDecorationUpload}
                disabled={uploading}
                className="decoration-upload-input"
              />
            </div>
          ) : (
            <div className="horizontal-palette-upload" style={{ color: "#888", fontStyle: "italic" }}>
              Add your own decoration: <span style={{ color: "#bfa700" }}>Premium only</span>
            </div>
          )}
        </div>
      </div>
      {/* Premium Decorations Section */}
      {canUseFeature('premium_decorations') && (
        <div className="horizontal-palette-section horizontal-palette-fullwidth">
          <h4 className="section-title">Premium Decorations</h4>
          <div className="premium-category-buttons" style={{ marginBottom: '8px' }}>
            {premiumCategories.map(cat => (
              <button
                key={cat.key}
                className={selectedPremiumCategory === cat.key ? "active" : ""}
                style={{ marginRight: '6px', padding: '4px 10px', borderRadius: '6px', border: selectedPremiumCategory === cat.key ? '2px solid #bfa700' : '1px solid #ccc', background: selectedPremiumCategory === cat.key ? '#fffbe6' : '#fff', cursor: 'pointer', fontWeight: selectedPremiumCategory === cat.key ? 'bold' : 'normal' }}
                onClick={() => setSelectedPremiumCategory(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="horizontal-palette-scroll">
            {premiumDecorations
              .filter(dec => dec.category === selectedPremiumCategory)
              .map(dec => (
                <img
                  key={dec.id}
                  src={dec.src}
                  alt=""
                  className="horizontal-palette-thumb"
                  draggable={canUseFeature('drag_drop')}
                  onDragStart={canUseFeature('drag_drop') ? e => {
                    e.dataTransfer.setData("text/plain", dec.src);
                  } : undefined}
                />
              ))}
          </div>
        </div>
      )}
      <div className="wall-main-layout">
        <div className="wall-sidebar-vertical">
          <h4 className="section-title">Background Layouts</h4>
          <div className="vertical-bg-list">
            {defaultBackgrounds.map((bg, idx) => (
              <div key={bg.src} className="vertical-bg-item">
                <img
                  src={bg.src}
                  alt={bg.name}
                  className="vertical-bg-thumb"
                  onClick={() => setWallpaper(bg.src)}
                  style={{ cursor: "pointer" }}
                />
                <span className="vertical-bg-label">{bg.name}</span>
              </div>
            ))}
            {/* Premium Backgrounds */}
            {canUseFeature('premium_backgrounds') && (
              <>
                <div className="vertical-bg-premium-label">Premium Backgrounds</div>
                {premiumBackgrounds.map((bg, idx) => (
                  <div key={bg.src} className="vertical-bg-item premium-bg-item">
                    <img
                      src={bg.src}
                      alt={bg.name}
                      className="vertical-bg-thumb"
                      onClick={() => setWallpaper(bg.src)}
                      style={{ cursor: "pointer", border: "2px solid gold" }}
                    />
                    <span className="vertical-bg-label">{bg.name}</span>
                  </div>
                ))}
              </>
            )}
            {/* Choose your own wallpaper - dynamic feature check */}
            {canUseFeature('custom_background_upload') ? (
              <label className="vertical-bg-upload">Choose your own Wallpaper:
                <input type="file" accept="image/*" onChange={handleWallpaperUpload} disabled={uploading} />
              </label>
            ) : (
              <div className="vertical-bg-upload vertical-bg-premium-label" style={{ color: "#888", fontStyle: "italic" }}>
                Choose your own Wallpaper: <br />
                <span style={{ color: "#bfa700" }}>Premium only</span>
              </div>
            )}
          </div>
        </div>
        <div className="wall-center-content">
          {/* Wall area */}
          <div
            className="wall"
            id="wall"
            style={wallStyle}
            onDragOver={canUseFeature('drag_drop') ? (e) => e.preventDefault() : undefined}
            onDrop={canUseFeature('drag_drop') ? (e) => {
              const src = e.dataTransfer.getData("text/plain");
              if (src) handleDropOnWall(src, e);
            } : undefined}
          >
            {images.map((img) => (
              <Rnd
                key={img.id}
                size={{ width: img.width, height: img.height }}
                position={{ x: img.x, y: img.y }}
                bounds="#wall"
                onDragStop={(e, d) => updateImage(img.id, { x: d.x, y: d.y })}
                onResizeStop={(e, direction, ref, delta, position) => {
                  let newWidth = parseInt(ref.style.width, 10);
                  let newHeight = parseInt(ref.style.height, 10);
                  // If shape is circle, keep width and height equal
                  if (img.shape === "circle") {
                    newWidth = newHeight = Math.max(newWidth, newHeight);
                  }
                  updateImage(img.id, {
                    width: newWidth,
                    height: newHeight,
                    ...position
                  });
                }}
                style={{
                  zIndex: 10,
                  border: `4px ${borderStyle} black`,
                  borderRadius: img.shape === "circle" ? "50%" : "10px",
                  overflow: "visible"
                }}
                onContextMenu={canUseFeature('context_menu') ? (e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, image: img, type: "image" });
                } : undefined}
              >
                <img
                  src={makeImageUrl(img.src)}
                  alt="Uploaded"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: img.shape === "circle" ? "50%" : "10px",
                    objectFit: "cover",
                    background: "#fff",
                    display: "block"
                  }}
                  crossOrigin="anonymous"
                  draggable={false}
                />
              </Rnd>
            ))}
            {decorations.map((img) => (
              <Rnd
                key={img.id}
                size={{ width: img.width, height: img.height }}
                position={{ x: img.x, y: img.y }}
                bounds="#wall"
                onDragStop={(e, d) => updateDecoration(img.id, { x: d.x, y: d.y })}
                onResizeStop={(e, direction, ref, delta, position) => {
                  updateDecoration(img.id, {
                    width: parseInt(ref.style.width, 10),
                    height: parseInt(ref.style.height, 10),
                    ...position
                  });
                }}
                style={{ zIndex: 20 }}
                onContextMenu={canUseFeature('context_menu') ? (e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, decoration: img, type: "decoration" });
                } : undefined}
              >
                <img
                  src={makeImageUrl(img.src)} // Always use makeImageUrl here
                  alt="decoration"
                  style={{ width: "100%", height: "100%" }}
                  draggable={false}
                />
              </Rnd>
            ))}

            {/* Context Menu */}
            {contextMenu && canUseFeature('context_menu') && ReactDOM.createPortal(
  <div
    style={{
      position: "fixed",
      top: contextMenu.y,
      left: contextMenu.x,
      background: "white",
      border: "1px solid #ccc",
      borderRadius: "6px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      zIndex: 9999,
      padding: "6px",
      display: "flex",
      flexDirection: "column",
      gap: "4px"
    }}
    onClick={(e) => e.stopPropagation()}
  >
    {contextMenu.type === "image" && (
      <>
        {canUseFeature('image_shape_toggle') ? (
          <button
            style={{ cursor: "pointer" }}
            onClick={() => handleToggleShape(contextMenu.image)}
          >
            Toggle Shape ({contextMenu.image.shape === "circle" ? "Square" : "Circle"})
          </button>
        ) : (
          <button
            style={{ cursor: "not-allowed", opacity: 0.5 }}
            disabled
            title="Shape toggle feature is not available"
          >
            🔒 Toggle Shape (Premium Only)
          </button>
        )}
        <button
          style={{ cursor: "pointer", color: "red" }}
          onClick={() => handleDeleteImage(contextMenu.image.id)}
        >
          Delete Image 🗑
        </button>
      </>
    )}
    {contextMenu.type === "decoration" && (
      <button
        style={{ cursor: "pointer", color: "red" }}
        onClick={() => handleDeleteDecoration(contextMenu.decoration.id)}
      >
        Delete Decoration 🗑
      </button>
    )}
  </div>,
  document.body
)}
          </div>
          {/* Settings section below wall: all three groups as siblings */}
          <div className="wall-settings-section">
            <div className="wall-settings-group">
              <div className="wall-settings-group-title">Image Settings</div>
              {canUseFeature('image_upload') ? (
                <label className="inline-label">Image Upload:
                  <input type="file" multiple onChange={handleUpload} disabled={uploading} />
                </label>
              ) : (
                <label className="inline-label" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  🔒 Image Upload (Premium Only)
                </label>
              )}
              {canUseFeature('border_style_customization') ? (
                <label>Border Style:
                  <select value={borderStyle} onChange={e => setBorderStyle(e.target.value)}>
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="double">Double</option>
                    <option value="none">None</option>
                  </select>
                </label>
              ) : (
                <label style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  🔒 Border Style (Premium Only)
                </label>
              )}
            </div>
            <div className="wall-settings-group">
              <div className="wall-settings-group-title">Wall Settings</div>
              <label>Wall Color:
                <input type="color" value={wallColor} onChange={e => setWallColor(e.target.value)} />
              </label>
              {canUseFeature('wall_size_customization') ? (
                <>
                  <label>Wall Height (px):
                    <input type="number" min="100" max="2000" value={wallHeight} onChange={e => setWallHeight(Number(e.target.value))} />
                  </label>
                  <label>Wall Width (px):
                    <input type="number" min="100" max="2000" value={wallWidth} onChange={e => setWallWidth(Number(e.target.value))} />
                  </label>
                </>
              ) : (
                <>
                  <label style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                    🔒 Wall Height (Premium Only)
                  </label>
                  <label style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                    🔒 Wall Width (Premium Only)
                  </label>
                </>
              )}
            </div>
            <div className="wall-settings-group">
              <div className="wall-settings-group-title">Actions</div>
              <div className="button-grid">
                {canUseFeature('download_wall') ? (
                  <button type="button" className="download-button" onClick={() => {
                    const wall = document.getElementById("wall");
                    if (!wall) return;
                    const images = wall.querySelectorAll('img');
                    Promise.all(Array.from(images).map(img => {
                      if (img.complete) return Promise.resolve();
                      return new Promise(resolve => {
                        img.onload = img.onerror = resolve;
                      });
                    })).then(() => {
                      html2canvas(wall, { useCORS: true }).then(canvas => {
                        const dataURL = canvas.toDataURL("image/png");
                        const link = document.createElement("a");
                        link.href = dataURL;
                        link.download = "my-virtual-wall.png";
                        link.click();
                      });
                    });
                  }}>
                    ⬇ Download
                  </button>
                ) : (
                  <button type="button" className="download-button" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Download feature is not available">
                    🔒 Download (Premium Only)
                  </button>
                )}
                {canUseFeature('clear_wall') ? (
                  <button type="button" className="clear-wall-button" onClick={() => { setImages([]); setDecorations([]); }}>
                    🗑 Clear
                  </button>
                ) : (
                  <button type="button" className="clear-wall-button" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Clear feature is not available">
                    🔒 Clear
                  </button>
                )}
                {canUseFeature('remove_background') ? (
                  <button type="button" className="remove-wallpaper-button" onClick={() => setWallpaper(null)}>
                    🗑 Remove BG
                  </button>
                ) : (
                  <button type="button" className="remove-wallpaper-button" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Remove background feature is not available">
                    🔒 Remove BG
                  </button>
                )}
                {canUseFeature('save_wall') ? (
                  <button type="button" className="submit-wall-button" onClick={handleSubmitWall}>
                    ✅ Save
                  </button>
                ) : (
                  <button type="button" className="submit-wall-button" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Save feature is not available">
                    🔒 Save
                  </button>
                )}
                {canUseFeature('load_wall') ? (
                  <button type="button" className="load-wall-button" onClick={handleLoadWall}>
                    🔄 Load Wall
                  </button>
                ) : (
                  <button type="button" className="load-wall-button" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Load wall feature is not available">
                    🔒 Load Wall
                  </button>
                )}
              </div>
            </div>
            {uploading && <div style={{color: '#1976d2', margin: '8px 0'}}>Uploading...</div>}
          </div>
        </div>
      </div>
    </>
  );
}

export default Wall;

