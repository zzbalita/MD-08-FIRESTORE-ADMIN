import React, { useState, useEffect } from "react";
import "./StyleWeb/Category.css";
import axios from "axios";
import { BASE_URL } from "../config";

export default function CategoryPage() {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editedName, setEditedName] = useState("");


    // Fetch danh sách danh mục
    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/categories`);
            setCategories(res.data);
        } catch (err) {
            console.error("Lỗi khi lấy danh mục:", err);
            setMessage("Không thể tải danh mục");
        }
    };

    // Thêm danh mục mới
    const handleAdd = async () => {
        if (!name.trim()) {
            setMessage("⚠️ Vui lòng nhập tên danh mục.");
            return;
        }

        try {
            await axios.post(`${BASE_URL}/api/categories`, { name });
            setName("");
            setMessage("✅ Thêm danh mục thành công!");
            fetchCategories();
        } catch (err) {
            setMessage(err.response?.data?.message || "Lỗi khi thêm danh mục");
        }
    };
    //Xóa
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xoá danh mục này?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`${BASE_URL}/api/categories/${id}`);
            fetchCategories(); // Refresh lại danh sách
        } catch (err) {
            alert("Không thể xoá danh mục!");
            console.error(err);
        }
    };
    //Sửa
    const handleUpdate = async (id) => {
        if (!editedName.trim()) return;

        try {
            await axios.put(`${BASE_URL}/api/categories/${id}`, {
                name: editedName,
            });
            setEditingId(null); // Thoát chế độ chỉnh sửa
            fetchCategories();  // Tải lại danh sách
        } catch (err) {
            alert("Không thể cập nhật danh mục");
            console.error(err);
        }
    };



    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="category-container">
            <h2>Quản lý danh mục loại sản phẩm</h2>

            <div className="category-header">
                <input
                    type="text"
                    placeholder="Nhập tên danh mục mới"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button className="save-btn" onClick={handleAdd}>
                    Thêm
                </button>
            </div>

            {message && <div className="message-box">{message}</div>}

            <table className="category-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên danh mục</th>
                        <th>Slug</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((cat, index) => (
                        <tr key={cat._id} className={index % 2 === 0 ? "even-row" : ""}>
                            <td>{index + 1}</td>
                            <td>
                                {editingId === cat._id ? (
                                    <input
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                    />
                                ) : (
                                    cat.name
                                )}
                            </td>
                            <td>{cat.slug}</td>
                            <td>
                                {editingId === cat._id ? (
                                    <>
                                        <button className="save-btn" onClick={() => handleUpdate(cat._id)}>Lưu</button>
                                        <button className="cancel-btn" onClick={() => setEditingId(null)}>Hủy</button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="edit-btn"
                                            onClick={() => {
                                                setEditingId(cat._id);
                                                setEditedName(cat.name);
                                            }}
                                        >✏️</button>
                                        <button className="delete-btn" onClick={() => handleDelete(cat._id)}>🗑️</button>
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
