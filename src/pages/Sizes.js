import React, { useState, useEffect } from "react";
import "./StyleWeb/Category.css";
import axios from "axios";
import { BASE_URL } from "../config";

export default function SizePage() {
  const [sizes, setSizes] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const fetchSizes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/sizes`);
      setSizes(res.data);
    } catch (err) {
      setMessage("Không thể tải kích thước");
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      setMessage("⚠️ Vui lòng nhập tên kích thước.");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/api/sizes`, { name });
      setName("");
      setMessage("✅ Thêm kích thước thành công!");
      fetchSizes();
    } catch (err) {
      setMessage(err.response?.data?.message || "Lỗi khi thêm kích thước");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xoá kích thước này?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}/api/sizes/${id}`);
      fetchSizes();
    } catch (err) {
      alert("Không thể xoá kích thước!");
    }
  };

  const handleUpdate = async (id) => {
    if (!editedName.trim()) {
      setMessage("Tên kích thước không được để trống.");
      return;
    }

    try {
      await axios.put(`${BASE_URL}/api/sizes/${id}`, { name: editedName });
      setEditingId(null);
      setMessage("✅ Cập nhật thành công!");
      fetchSizes();
    } catch (err) {
      setMessage("❌ Không thể cập nhật kích thước.");
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  return (
    <div className="category-container">
      <h2>Quản lý kích thước sản phẩm</h2>

      <div className="category-header">
        <input
          type="text"
          placeholder="Nhập tên kích thước mới"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="save-btn" onClick={handleAdd}>Thêm</button>
      </div>

      {message && <div className="message-box">{message}</div>}

      <table className="category-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên kích thước</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((size, index) => (
            <tr key={size._id} className={index % 2 === 0 ? "even-row" : ""}>
              <td>{index + 1}</td>
              <td>
                {editingId === size._id ? (
                  <input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                ) : (
                  size.name
                )}
              </td>
              <td>
                {editingId === size._id ? (
                  <>
                    <button className="save-btn" onClick={() => handleUpdate(size._id)}>Lưu</button>
                    <button className="cancel-btn" onClick={() => setEditingId(null)}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button className="edit-btn" onClick={() => {
                      setEditingId(size._id);
                      setEditedName(size.name);
                    }}>✏️</button>
                    <button className="delete-btn" onClick={() => handleDelete(size._id)}>🗑️</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled>Trang 1/1</button>
        <button className="next-btn" disabled>Trang sau</button>
      </div>
    </div>
  );
}
