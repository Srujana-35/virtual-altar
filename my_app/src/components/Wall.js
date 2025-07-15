
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import html2canvas from "html2canvas";
import { Rnd } from "react-rnd";
import "./Wall.css";


function Wall() {
  const [images, setImages] = useState([]);
  const [decorations, setDecorations] = useState([]);
  const [wallColor, setWallColor] = useState("#f4f4f4");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [wallpaper, setWallpaper] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // Context menu state
  const [wallHeight, setWallHeight] = useState(600); // default height in px
  const [wallWidth, setWallWidth] = useState(900); // default width in px
  

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const baseOffset = 30; // pixels to offset each image
    const newImages = files.map((file, idx) => {
      const imageURL = URL.createObjectURL(file);
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      // Offset each image by its index and the current number of images
      const offset = (images.length + idx) * baseOffset;
      return {
        id: uniqueId,
        src: imageURL,
        shape: "square",
        width: 120,
        height: 120,
        x: 50 + offset,
        y: 50 + offset
      };
    });
    setImages([...images, ...newImages]);
  };

  const handleWallpaperUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setWallpaper(imageURL);
    }
  };

  const decorationPalette = [
    "/decorations/garland1.png",
    "/decorations/garland2.png",
    "/decorations/bouquet.png",
    "/decorations/candles.png",
    "/decorations/fruits.png",
    "/decorations/table.png",
    "/decorations/frames.png"
  ];

  const handleDropOnWall = (src, e) => {
    const wall = document.getElementById("wall");
    const wallRect = wall.getBoundingClientRect();
    const x = e.clientX - wallRect.left;
    const y = e.clientY - wallRect.top;
    const newDecoration = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      src: src,
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

  const handleToggleShape = (img) => {
    const newShape = img.shape === "circle" ? "square" : "circle";
    updateImage(img.id, {
      shape: newShape,
      ...(newShape === "circle"
        ? { width: Math.min(img.width, img.height), height: Math.min(img.width, img.height) }
        : {})
    });
    setContextMenu(null);
  };

  const wallStyle = {
    backgroundColor: wallColor,
    backgroundImage: wallpaper ? `url(${wallpaper})` : "none",
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
      const listRes = await fetch('http://localhost:5000/api/wall/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const listData = await listRes.json();
      if (!listRes.ok || !listData.walls || listData.walls.length === 0) {
        alert('No saved wall found!');
        return;
      }
      const latestWallId = listData.walls[0].id;
      // 2. Load the latest wall
      const wallRes = await fetch(`http://localhost:5000/api/wall/load/${latestWallId}`, {
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
      // Convert image srcs to valid URLs if needed
      const makeImageUrl = (src) => {
        if (!src) return src;
        if (src.startsWith('blob:') || src.startsWith('/') || src.startsWith('data:')) return src;
        // Assume it's a filename from backend uploads
        return `http://localhost:5000/uploads/${src}`;
      };
      const fixedImages = (images || []).map(img => ({
        ...img,
        src: makeImageUrl(img.src)
      }));
      const fixedDecorations = (decorations || []).map(dec => ({
        ...dec,
        src: makeImageUrl(dec.src)
      }));
      const fixedWallpaper = makeImageUrl(wallpaper);
      setImages(fixedImages);
      setDecorations(fixedDecorations);
      setWallColor(wallColor);
      setBorderStyle(borderStyle);
      setWallpaper(fixedWallpaper);
      setWallHeight(wallHeight);
      setWallWidth(wallWidth);
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
      
      const requestBody = { wallData: wallState, wallName };
      
      const response = await fetch('http://localhost:5000/api/wall/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      
      if (response.ok) {
        alert(`Wall "${data.name}" saved successfully!`);
      } else {
        alert('Error saving wall: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error saving wall: ' + err.message);
    }
  };

  useEffect(() => {
    // Restore wall if restoreWallData is present
    const restoreData = localStorage.getItem('restoreWallData');
    if (restoreData) {
      try {
        const wallData = JSON.parse(restoreData);
        const makeImageUrl = (src) => {
          if (!src) return src;
          if (src.startsWith('blob:') || src.startsWith('/') || src.startsWith('data:')) return src;
          return `http://localhost:5000/uploads/${src}`;
        };
        const fixedImages = (wallData.images || []).map(img => ({
          ...img,
          src: makeImageUrl(img.src)
        }));
        const fixedDecorations = (wallData.decorations || []).map(dec => ({
          ...dec,
          src: makeImageUrl(dec.src)
        }));
        const fixedWallpaper = makeImageUrl(wallData.wallpaper);
        setImages(fixedImages);
        setDecorations(fixedDecorations);
        setWallColor(wallData.wallColor || '#f4f4f4');
        setBorderStyle(wallData.borderStyle || 'solid');
        setWallpaper(fixedWallpaper);
        setWallHeight(wallData.wallHeight || 600);
        setWallWidth(wallData.wallWidth || 900);
      } catch (err) {
        // ignore
      }
      localStorage.removeItem('restoreWallData');
    }
  }, []);

  return (
    <div className="wall-page-container">
      {/* Profile Button in top right */}
      <Link
        to="/profile"
        className="profile-button"
        style={{
          position: "absolute",
          top: 20,
          right: 30,
          zIndex: 10000,
          background: "#1976d2",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "6px",
          textDecoration: "none",
          fontSize: "0.9rem",
          fontWeight: "600",
          transition: "background 0.2s"
        }}
        onMouseEnter={(e) => e.target.style.background = "#125ea2"}
        onMouseLeave={(e) => e.target.style.background = "#1976d2"}
      >
        👤 Profile
      </Link>
     
      <div className="sidebar">
        {/* Default Backgrounds Section */}
        <div className="default-backgrounds-section">
          <h4 className="default-bg-title"> Background Layouts</h4>
          <div className="default-bg-grid">
            {defaultBackgrounds.map((bg, idx) => (
              <div key={bg.src} className="default-bg-item">
                <img
                  src={bg.src}
                  alt={bg.name}
                  className="default-bg-thumb"
                  onClick={() => setWallpaper(bg.src)}
                  style={{ cursor: "pointer" }}
                />
                <span className="default-bg-label">{bg.name}</span>
                
              </div>
              
            ))}
            <label>choose your own Wallpaper:
              <input type="file" accept="image/*" onChange={handleWallpaperUpload} />
            </label>
          </div>
        </div>
        {/* Wall Settings Section */}
        <div className="controls wide-controls" id="controls">
          <form onSubmit={e => e.preventDefault()} className="controls-form">
            <label className="inline-label">Image Upload:
              <input type="file" multiple onChange={handleUpload} />
            </label>
            <label>Wall Color:
              <input type="color" value={wallColor} onChange={e => setWallColor(e.target.value)} />
            </label>
            <label>Border Style:
              <select value={borderStyle} onChange={e => setBorderStyle(e.target.value)}>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="double">Double</option>
                <option value="none">None</option>
              </select>
            </label>
            
            <label>Wall Height (px):
              <input type="number" min="100" max="2000" value={wallHeight} onChange={e => setWallHeight(Number(e.target.value))} />
            </label>
            <label>Wall Width (px):
              <input type="number" min="100" max="2000" value={wallWidth} onChange={e => setWallWidth(Number(e.target.value))} />
            </label>
            
            {/* Button Grid - Two buttons per row */}
            <div className="button-grid">
              <button type="button" className="download-button" onClick={() => {
                const wall = document.getElementById("wall");
                if (!wall) return;
                html2canvas(wall).then(canvas => {
                  const dataURL = canvas.toDataURL("image/png");
                  const link = document.createElement("a");
                  link.href = dataURL;
                  link.download = "my-virtual-wall.png";
                  link.click();
                  
                  // Save downloaded image to localStorage for profile page
                  const downloadedImage = {
                    id: Date.now().toString(),
                    src: dataURL,
                    downloadDate: new Date().toISOString(),
                    name: "my-virtual-wall.png"
                  };
                  
                  const existingImages = JSON.parse(localStorage.getItem('downloadedImages') || '[]');
                  existingImages.push(downloadedImage);
                  localStorage.setItem('downloadedImages', JSON.stringify(existingImages));
                });
              }}>
                ⬇ Download
              </button>
              <button type="button" className="clear-wall-button" onClick={() => { setImages([]); setDecorations([]); }}>
                🗑 Clear
              </button>
              <button type="button" className="remove-wallpaper-button" onClick={() => setWallpaper(null)}>
                🗑 Remove BG
              </button>
              <button type="button" className="submit-wall-button" onClick={handleSubmitWall}>
                ✅ Save
              </button>
              <button type="button" className="load-wall-button" onClick={handleLoadWall}>
                🔄 Load Wall
              </button>
            </div>
          </form>
        </div>
        {/* Decoration Palette below wall settings */}
        <div className="decoration-palette-below">
          <h4>Decoration Palette</h4>
          <div className="palette-grid">
            {decorationPalette.map((src, index) => (
              <img
                key={index}
                src={src}
                alt="decoration"
                className="palette-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", src);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Wall stays in the same position */}
      <div
        className="wall"
        id="wall"
        style={wallStyle}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const src = e.dataTransfer.getData("text/plain");
          if (src) handleDropOnWall(src, e);
        }}
      >
        {images.map((img) => (
          <Rnd
            key={img.id}
            size={{ width: img.width, height: img.height }}
            position={{ x: img.x, y: img.y }}
            bounds="#wall"
            onDragStop={(e, d) => updateImage(img.id, { x: d.x, y: d.y })}
            onResizeStop={(e, direction, ref, delta, position) => {
              updateImage(img.id, {
                width: parseInt(ref.style.width, 10),
                height: parseInt(ref.style.height, 10),
                ...position
              });
            }}
            style={{
              zIndex: 10,
              border: `4px ${borderStyle} black`,
              borderRadius: img.shape === "circle" ? "50%" : "10px",
              overflow: img.shape === "circle" ? "hidden" : "visible"
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, image: img, type: "image" });
            }}
          >
            <img
              src={img.src}
              alt="Uploaded"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: img.shape === "circle" ? "50%" : "10px",
                objectFit: "cover"
              }}
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
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, decoration: img, type: "decoration" });
            }}
          >
            <img
              src={img.src}
              alt="decoration"
              style={{ width: "100%", height: "100%" }}
              draggable={false}
            />
          </Rnd>
        ))}

        {/* Context Menu */}
        {contextMenu && (
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
                <button
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggleShape(contextMenu.image)}
                >
                  Toggle Shape ({contextMenu.image.shape === "circle" ? "Square" : "Circle"})
                </button>
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
          </div>
        )}
      </div>
    </div>
  );
}

export default Wall;

