import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SaveProperties({ likeProperties = [], properties = [] }) {
  const galleryRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const adjustArrow = () => {
      const gallery = galleryRef.current;
      if (!gallery || gallery.children.length === 0) return;

      const firstCard = gallery.children[0];
      const lastCard = gallery.children[gallery.children.length - 1];
      const buttonHeight = 40;

      if (leftRef.current && rightRef.current) {
        leftRef.current.style.top =
          firstCard.offsetTop + firstCard.offsetHeight / 2 - buttonHeight / 2 + "px";
        rightRef.current.style.top =
          lastCard.offsetTop + lastCard.offsetHeight / 2 - buttonHeight / 2 + "px";
      }
    };

    adjustArrow();
    window.addEventListener("resize", adjustArrow);
    return () => window.removeEventListener("resize", adjustArrow);
  }, [likeProperties]);

  const savedList = likeProperties
    .map(id => properties.find(p => p.id === id))
    .filter(Boolean);

  if (savedList.length === 0) {
    return <p className="mb-5">Chưa có phòng nào được lưu.</p>;
  }

  return (
    <div className="gallery-wrapper mb-5 mt-3">
      <div className="gallery-container">
        <button
          ref={leftRef}
          className="arrow left"
          onClick={() => galleryRef.current.scrollBy({ left: -220, behavior: "smooth" })}
        >
          {"<"}
        </button>
        <div className="gallery" ref={galleryRef}>
          {savedList.map(property => (
            <div
              key={property.id}
              className="property-card"
              onClick={() => navigate(`/property-detail/${property.id}`)}
            >
              <img src={property.image} alt={property.name} />
              <div className="property-info">
                <h4>{property.name}</h4>
                <p>{property.price.toLocaleString()} VND / tháng</p>
              </div>
            </div>
          ))}
        </div>
        <button
          ref={rightRef}
          className="arrow right"
          onClick={() => galleryRef.current.scrollBy({ left: 220, behavior: "smooth" })}
        >
          {">"}
        </button>
      </div>
      <style>{`
        .gallery-wrapper {
          position: relative;
          width: 100%;
          padding: 0 20px;
        }
        .gallery-container {
          width: 100%;
          position: relative;
          overflow: visible;
        }
        .gallery {
          display: flex;
          gap: 15px;
          overflow-x: auto;
          scroll-behavior: smooth;
        }
        .gallery::-webkit-scrollbar { display: none; }
        .property-card {
          min-width: 220px;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
          cursor: pointer;
          position: relative;
        }
        .property-card img {
          width: 100%;
          height: 150px;
          object-fit: cover;
        }
        .property-info {
          position: absolute;
          bottom: 0;
          width: 100%;
          background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
          color: #fff;
          padding: 10px;
          box-sizing: border-box;
        }
        .property-info h4 {
          font-weight: bold;
          font-size: 14px;
          margin: 0 0 5px;
        }
        .property-info p {
          font-size: 12px;
          margin: 2px 0;
        }
        .arrow {
          position: absolute;
          width: 40px;
          height: 40px;
          background: rgba(0,0,0,0.5);
          color: white;
          border: none;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          border-radius: 50%;
        }
        .arrow:hover {
          background: rgba(0,0,0,0.7);
          scale: 1.1;
          transition: all 0.3s;
          }
        .arrow.left { left: -20px; }
        .arrow.right { right: -20px; }
      `}</style>
    </div>
  );
}
