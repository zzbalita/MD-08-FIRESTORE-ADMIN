import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StyleWeb/Description.css";
import { BASE_URL } from "../config";

export default function DescriptionPage() {
  const [fields, setFields] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const fetchFields = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/description-fields`);
      setFields(res.data);
    } catch (err) {
      console.error("Lỗi khi tải mục mô tả", err);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      setMessage("Vui lòng nhập tên mục mô tả.");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/api/description-fields`, { name });
      setName("");
      setMessage("✅ Thêm thành công!");
      fetchFields();
    } catch (err) {
      setMessage("❌ Lỗi khi thêm mục mô tả");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/description-fields/${id}`, {
        name: editedName,
      });
      setEditingId(null);
      fetchFields();
    } catch (err) {
      alert("Không thể cập nhật");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xoá mục mô tả này?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/description-fields/${id}`);
      fetchFields();
    } catch (err) {
      alert("Không thể xoá mục mô tả");
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  return (
    <div className="description-container">
      <h2>Quản lý mục mô tả sản phẩm</h2>
      <div className="description-header">
        <input
          type="text"
          placeholder="Nhập tên mục mô tả mới (VD: Chất liệu)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="save-btn" onClick={handleAdd}>Thêm</button>
      </div>
      {message && <div className="message-box">{message}</div>}

      <table className="description-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên mục mô tả</th>
            <th>Slug</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={field._id}>
              <td>{index + 1}</td>
              <td>
                {editingId === field._id ? (
                  <input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                ) : (
                  field.name
                )}
              </td>
              <td>{field.slug}</td>
              <td>
                {editingId === field._id ? (
                  <>
                    <button className="save-btn" onClick={() => handleUpdate(field._id)}>Lưu</button>
                    <button className="cancel-btn" onClick={() => setEditingId(null)}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button className="edit-btn" onClick={() => {
                      setEditingId(field._id);
                      setEditedName(field.name);
                    }}>✏️</button>
                    <button className="delete-btn" onClick={() => handleDelete(field._id)}>🗑️</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
