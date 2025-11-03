import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import "./StyleWeb/InventoryStatistics.css";
import { useAdminAuth } from "../../src/contexts/AdminAuthContext";

export default function InventoryStatistics() {
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const { adminToken } = useAdminAuth();
  const [brandFilter, setBrandFilter] = useState("");
  const [minStock, setMinStock] = useState("");
  const [maxStock, setMaxStock] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [brands, setBrands] = useState([]);


  useEffect(() => {
    fetchCategories();
  }, []);
  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (adminToken) {
      fetchData();
    }
  }, [selectedCategory, adminToken]);

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/brands`); // giả sử API trả mảng { _id, name }
      setBrands(res.data);
    } catch (err) {
      console.error("Lỗi tải thương hiệu:", err);
    }
  };

  // Lấy danh sách categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = selectedCategory
        ? `${BASE_URL}/api/admin/statistics/inventory?category=${encodeURIComponent(
          selectedCategory
        )}`
        : `${BASE_URL}/api/admin/statistics/inventory`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      setData(res.data);
    } catch (err) {
      console.error("Lỗi tải thống kê tồn kho:", err);
    } finally {
      setLoading(false);
    }
  };
  const applyFilter = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (selectedCategory) query.append("category", selectedCategory);
      if (brandFilter) query.append("brand", brandFilter);
      if (minStock) query.append("minStock", minStock);
      if (maxStock) query.append("maxStock", maxStock);
      if (minPrice) query.append("minPrice", minPrice);
      if (maxPrice) query.append("maxPrice", maxPrice);

      const res = await axios.get(`${BASE_URL}/api/admin/statistics/inventory?${query.toString()}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("Lỗi tải thống kê tồn kho:", err);
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <p>Đang tải...</p>;
  if (!data) return <p>Không có dữ liệu tồn kho.</p>;

  return (
    <div className="inventory-page">
      <h2>📦 Thống kê tồn kho</h2>
      {/* Tổng quan */}
      <div className="stats-cards">
        <div className="card total-1">
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
      {/* Bộ lọc danh mục */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Danh mục:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Tất cả</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Thương hiệu:</label>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="">Tất cả</option>
            {brands.map((b) => (
              <option key={b._id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Tồn kho:</label>
          <input
            type="number"
            placeholder="Min"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            value={maxStock}
            onChange={(e) => setMaxStock(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Giá:</label>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        <button className="filter-button" onClick={applyFilter}>Lọc</button>
      </div>


      {/* Nếu chưa chọn category → hiển thị theo danh mục */}
      {!selectedCategory && (
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
      )}

      {/* Nếu đã chọn category → hiển thị theo sản phẩm */}
      {selectedCategory && (
        <div className="section">
          <h3>📊 Tồn kho theo sản phẩm</h3>
          <table>
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Thương hiệu</th>
                <th>Số lượng tồn</th>
                <th>Giá trị bán</th>
                <th>Giá trị nhập</th>
              </tr>
            </thead>
            <tbody>
              {data?.products?.map((p, i) => (
                <tr key={i}>
                  <td>
                    <img
                      src={p.image || "https://via.placeholder.com/80"}
                      alt={p.name}
                      style={{ width: 80, height: 80, objectFit: "cover" }}
                    />
                  </td>
                  <td>{p?.name || "Không rõ"}</td>
                  <td>{p?.brand || "Không rõ"}</td>
                  <td>{(p?.totalStock || 0).toLocaleString()}</td>
                  <td>{(p?.inventoryValueSell || 0).toLocaleString()} ₫</td>
                  <td>{(p?.inventoryValueImport || 0).toLocaleString()} ₫</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}
    </div>
  );
}
