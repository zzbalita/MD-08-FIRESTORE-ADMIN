import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import "./StyleWeb/InventoryStatistics.css";
import { useAdminAuth } from "../contexts/AdminAuthContext";

export default function InventoryStatistics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { adminToken } = useAdminAuth();
  const [showProductList, setShowProductList] = useState(false);
  const [productList, setProductList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (adminToken) {
      fetchData();
    }
  }, [adminToken]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/admin/statistics/inventory`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("Lỗi tải thống kê tồn kho:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductList = async () => {
    try {
      setLoadingProducts(true);
      const res = await axios.get(`${BASE_URL}/api/admin/statistics/inventory/products`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setProductList(res.data.products || []);
      setShowProductList(true);
    } catch (err) {
      console.error("Lỗi tải danh sách sản phẩm:", err);
      alert("Không thể tải danh sách sản phẩm");
    } finally {
      setLoadingProducts(false);
    }
  };


  if (loading) return <p>Đang tải...</p>;
  if (!data) return <p>Không có dữ liệu tồn kho.</p>;

  return (
    <div className="inventory-page">
      <h2>📦 Thống kê tồn kho</h2>
      {/* Tổng quan */}
      <div className="stats-cards">
        <div className="card total-1 clickable" onClick={fetchProductList} style={{ cursor: "pointer" }}>
          <h4>Tổng số lượng tồn</h4>
          <p>{(data?.overview?.totalStock || 0).toLocaleString()} sản phẩm</p>
        </div>
        <div className="card total-2">
          <h4>Giá trị tồn (theo giá bán)</h4>
          <p>{(data?.overview?.totalValueSell || 0).toLocaleString()} ₫</p>
        </div>
        <div className="card total-3">
          <h4>Giá trị tồn (theo giá nhập)</h4>
          <p>{(data?.overview?.totalValueImport || 0).toLocaleString()} ₫</p>
        </div>
      </div>

      {/* Tồn kho theo danh mục */}
      <div className="section">
        <h3>📊 Tồn kho theo danh mục</h3>
        <table>
          <thead>
            <tr>
              <th>Danh mục</th>
              <th>Số lượng tồn</th>
              <th>Giá trị bán</th>
              <th>Giá trị nhập</th>
            </tr>
          </thead>
          <tbody>
            {data?.stockByCategory?.map((c, i) => (
              <tr key={i}>
                <td>{c?.category || "Không rõ"}</td>
                <td>{(c?.totalStock || 0).toLocaleString()}</td>
                <td>{(c?.totalValueSell || 0).toLocaleString()} ₫</td>
                <td>{(c?.totalValueImport || 0).toLocaleString()} ₫</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal hiển thị danh sách sản phẩm tồn kho */}
      {showProductList && (
        <div className="modal-overlay" onClick={() => setShowProductList(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📦 Danh sách sản phẩm tồn kho ({productList.length})</h3>
              <button className="close-btn" onClick={() => setShowProductList(false)}>×</button>
            </div>
            <div className="modal-body">
              {loadingProducts ? (
                <p>Đang tải...</p>
              ) : (
                <table className="stat-table">
                  <thead>
                    <tr>
                      <th>Hình ảnh</th>
                      <th>Tên sản phẩm</th>
                      <th>Danh mục</th>
                      <th>Thương hiệu</th>
                      <th>Giá bán</th>
                      <th>Số lượng tồn</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productList.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                          Không có sản phẩm nào
                        </td>
                      </tr>
                    ) : (
                      productList.map((product) => (
                        <tr key={product._id}>
                          <td>
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                style={{ width: "60px", height: "60px", objectFit: "cover" }}
                              />
                            ) : (
                              <span>Không có ảnh</span>
                            )}
                          </td>
                          <td>{product.name}</td>
                          <td>{product.category || "Không rõ"}</td>
                          <td>{product.brand || "Không rõ"}</td>
                          <td>{(product.price || 0).toLocaleString()} ₫</td>
                          <td style={{ fontWeight: "bold", color: product.totalStock > 0 ? "#28a745" : "#dc3545" }}>
                            {(product.totalStock || 0).toLocaleString()}
                          </td>
                          <td>
                            <span className={`status ${product.status === "Đang bán" ? "in-stock" : product.status === "Hết hàng" ? "out-of-stock" : "stopped"}`}>
                              {product.status || "Không rõ"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
