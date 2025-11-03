import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StyleWeb/Brand.css";
import { BASE_URL } from "../config";

export default function BrandPage() {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/brands`); 
      setBrands(res.data);
    } catch (err) {
      setMessage("❌ Không thể tải thương hiệu.");
    }
  };

  const handleAddOrUpdate = async () => {
    if (!name.trim()) {
      setMessage("⚠️ Vui lòng nhập tên thương hiệu.");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/api/brands/${editingId}`, { name });
        setMessage("✅ Cập nhật thành công!");
      } else {
        await axios.post(`${BASE_URL}/api/brands`, { name });
        setMessage("✅ Thêm thương hiệu thành công!");
      }

      setName("");
      setEditingId(null);
      fetchBrands();
    } catch (err) {
      setMessage("❌ Lỗi khi xử lý thương hiệu.");
      console.error(err);
    }
  };

  const handleEdit = (brand) => {
    setName(brand.name);
    setEditingId(brand._id);
    setMessage("");
  };

  const handleCancelEdit = () => {
    setName("");
    setEditingId(null);
    setMessage("");
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Bạn có chắc muốn xóa thương hiệu này?");
    if (!confirm) return;

    try {
      await axios.delete(`${BASE_URL}/api/brands/${id}`);
      setMessage("🗑️ Đã xoá thương hiệu.");
      fetchBrands();
    } catch (err) {
      setMessage("❌ Không thể xoá thương hiệu.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return (
    <div className="brand-container">
      <h2>Quản lý thương hiệu sản phẩm</h2>

      <div className="brand-header">
        <input
          type="text"
          placeholder="Nhập tên thương hiệu"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="save-btn" onClick={handleAddOrUpdate}>
          {editingId ? "Lưu" : "Thêm"}
        </button>
        {editingId && (
          <button className="cancel-btn" onClick={handleCancelEdit}>Hủy</button>
        )}
      </div>

      {message && <div className="message-box">{message}</div>}

      <table className="brand-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên thương hiệu</th>
            <th>Slug</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand, index) => (
            <tr key={brand._id} className={index % 2 === 0 ? "even-row" : ""}>
              <td>{index + 1}</td>
              <td>{brand.name}</td>
              <td>{brand.slug}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(brand)}>✏️</button>
                <button className="delete-btn" onClick={() => handleDelete(brand._id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
