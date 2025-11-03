import React, { useState } from "react";
import { BASE_URL } from "../config";

export default function ProductCard({ product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  // Gộp ảnh chính và ảnh phụ, loại null/undefined
  const allImages = [
    product.image,
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean);

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Hàm xử lý URL ảnh
  const getImageUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
  };

  return (
    <div className="product-card">
      <div className="image-wrapper">
        {allImages.length > 0 ? (
          <img
            src={getImageUrl(allImages[currentImageIndex])}
            alt={product.name}
            className="main-image"
          />
        ) : (
          <div className="no-image">Không có ảnh</div>
        )}

        {allImages.length > 1 && (
          <>
            <button className="nav left" onClick={handlePrev}>❮</button>
            <button className="nav right" onClick={handleNext}>❯</button>
          </>
        )}
      </div>
    </div>
  );
}
