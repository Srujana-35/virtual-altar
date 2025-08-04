import React from "react";
import "./Wall.css";
import config from '../config/config';

// Helper to resolve image URLs (local or server)
const makeImageUrl = (src) => {
  if (!src) return null;
  if (src.startsWith("blob:") || src.startsWith("/") || src.startsWith("data:")) return src;
  return src; // No uploads directory needed
};

export default function WallPreview({ wallData, style, className }) {
  if (!wallData) return <div>No data</div>;
  const {
    images = [],
    decorations = [],
    wallColor = "#f4f4f4",
    borderStyle = "solid",
    wallpaper = null,
    wallHeight = 600,
    wallWidth = 900
  } = wallData;

  const wallStyle = {
    backgroundColor: wallColor,
    backgroundImage: wallpaper ? `url(${makeImageUrl(wallpaper)})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: `4px ${borderStyle} #888` ,
    height: wallHeight,
    width: wallWidth,
    margin: "0 auto",
    position: "relative",
    overflow: "hidden",
    ...style
  };

  return (
    <div className={className ? className : undefined}>
      <div className="wall" style={wallStyle}>
        {/* Images */}
        {images.map((img) =>
          img.shape === "circle" ? (
            <div
              key={img.id}
              style={{
                position: "absolute",
                left: img.x,
                top: img.y,
                width: img.width,
                height: img.height,
                borderRadius: "50%",
                overflow: "hidden",
                border: borderStyle !== "none" ? `4px ${borderStyle} black` : "none",
                pointerEvents: "none",
                background: "#fff"
              }}
            >
              <img
                src={makeImageUrl(img.src)}
                alt="altar-img"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block"
                }}
                crossOrigin="anonymous"
                draggable={false}
              />
            </div>
          ) : (
            <img
              key={img.id}
              src={makeImageUrl(img.src)}
              alt="altar-img"
              style={{
                position: "absolute",
                left: img.x,
                top: img.y,
                width: img.width,
                height: img.height,
                border: borderStyle !== "none" ? `4px ${borderStyle} black` : "none",
                borderRadius: "10px",
                objectFit: "cover",
                pointerEvents: "none"
              }}
              crossOrigin="anonymous"
              draggable={false}
            />
          )
        )}
        {/* Decorations */}
        {decorations.map((dec) => (
          <img
            key={dec.id}
            src={makeImageUrl(dec.src)}
            alt="decoration"
            style={{
              position: "absolute",
              left: dec.x,
              top: dec.y,
              width: dec.width,
              height: dec.height,
              pointerEvents: "none"
            }}
            crossOrigin="anonymous"
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
} 