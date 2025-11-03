import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./StyleWeb/ProductDetail.css";
import { BASE_URL } from "../config";
import { useLocation } from "react-router-dom";



export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/products/${id}`);
                setProduct(res.data);
            } catch (err) {
                console.error("Lỗi khi tải chi tiết sản phẩm:", err);
            }
        };

        fetchProduct();

        // Nếu có flag reload, xóa nó khỏi history sau khi dùng
        if (location.state?.reload) {
            window.history.replaceState({}, document.title);
        }
    }, [id, location.state?.reload]); // dùng location.state?.reload là tốt nhất



    if (!product) return <div>Đang tải...</div>;

    return (
        <div className="product-detail-container">
            <button onClick={() => navigate("/products")} className="btn-back">Quay lại</button>

            <h2 style={{ marginLeft: "300px" }}>Chi tiết sản phẩm</h2>

            <h3><p><strong>Tên sản phẩm: </strong> {product.name}</p></h3>

            {/* Ảnh đại diện */}
            <h3><strong>Ảnh đại diện:</strong></h3>
            {product.image && (
                <img
                    src={
                        product.image.startsWith("http") || product.image.startsWith("blob:")
                            ? product.image
                            : `${BASE_URL}${product.image}`
                    }
                    alt="Ảnh đại diện"
                    className="main-image"
                    style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "8px",
                        marginBottom: "10px"
                    }}
                />
            )}

            {/* Ảnh bổ sung */}
            {product.images?.length > 0 && (
                <>
                    <h3><strong>Ảnh bổ sung:</strong></h3>
                    <div className="image-list">
                        {product.images
                            .filter((img) => img !== product.image) // tránh trùng ảnh chính
                            .map((img, idx) => (
                                <img
                                    key={idx}
                                    src={
                                        img.startsWith("http") || img.startsWith("blob:")
                                            ? img
                                            : `${BASE_URL}${img}`
                                    }
                                    alt={`img-${idx}`}
                                    className="sub-image"
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        objectFit: "cover",
                                        marginRight: "10px",
                                        borderRadius: "4px",
                                        marginBottom: "10px"

                                    }}
                                />
                            ))}
                    </div>
                </>
            )}
            <h3><strong>Thông tin sản phẩm:</strong></h3>
            <table className="product-table">
                <thead>
                    <tr>
                        <th>Giá nhập</th>
                        <th>Giá bán</th>
                        <th>Thương hiệu</th>
                        <th>Danh mục</th>
                        <th>Trạng thái</th>
                        <th>Tổng số lượng</th>
                        <th>Nổi bật</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{product.import_price?.toLocaleString()}₫</td>
                        <td>{product.price?.toLocaleString()}₫</td>
                        <td>{product.brand}</td>
                        <td>{product.category}</td>
                        <td>{product.status}</td>
                        <td>{product.quantity}</td>
                        <td>{product.is_featured ? "✔️ Có" : "❗Không"}</td>
                    </tr>
                </tbody>
            </table>


            <h3><strong>Mô tả sản phẩm:</strong></h3>
            <ul>
                {product.description?.map((d, idx) => (
                    <li key={idx}><strong>{d.field}:</strong> {d.value}</li>
                ))}
            </ul>

            <h3><strong>Biến thể (Màu + Size + SL):</strong></h3>
            <table className="variation-table">
                <thead>
                    <tr>
                        <th>Màu</th>
                        <th>S</th>
                        <th>M</th>
                        <th>L</th>
                        <th>XL</th>
                    </tr>
                </thead>
                <tbody>
                    {(() => {
                        const grouped = {};
                        product.variations?.forEach(v => {
                            if (!grouped[v.color]) grouped[v.color] = {};
                            grouped[v.color][v.size] = v.quantity;
                        });
                        return Object.entries(grouped).map(([color, sizes], idx) => (
                            <tr key={idx}>
                                <td>{color}</td>
                                {["S", "M", "L", "XL"].map(size => (
                                    <td key={size}>{sizes[size] || 0}</td>
                                ))}
                            </tr>
                        ));
                    })()}
                </tbody>
            </table>
        </div>
    );
}
