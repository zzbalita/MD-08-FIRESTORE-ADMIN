import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import "./StyleWeb/Staff.css";

const STATUS_COLORS = {
  pending: "#f4b400",
  active: "#34a853",
  disabled: "#d93025",
};

export default function StaffList() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${BASE_URL}/api/admin/staff`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setStaff(res.data.staff || []);
    } catch (err) {
      console.error("Fetch staff error:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách nhân viên");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `${BASE_URL}/api/admin/staff/${id}/status`,
        { status },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      await fetchStaff();
      alert("Cập nhật trạng thái thành công");
    } catch (err) {
      alert(err.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản nhân viên này?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${BASE_URL}/api/admin/staff/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      await fetchStaff();
      alert("Đã xóa tài khoản nhân viên");
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa tài khoản");
    }
  };

  const renderStatusBadge = (status) => (
    <span
      className="staff-badge"
      style={{ backgroundColor: STATUS_COLORS[status] || "#666" }}
    >
      {status === "pending" && "Chờ duyệt"}
      {status === "active" && "Đang hoạt động"}
      {status === "disabled" && "Đã khóa"}
      {!["pending", "active", "disabled"].includes(status) && status}
    </span>
  );

  return (
    <div className="staff-container">
      <div className="staff-header">
        <div>
          <h2>Quản lý nhân viên</h2>
          <p>Admin duyệt, khóa hoặc xóa tài khoản nhân viên.</p>
        </div>
        <div className="staff-actions">
          <label>
            Lọc trạng thái:
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="active">Đang hoạt động</option>
              <option value="disabled">Đã khóa</option>
            </select>
          </label>
          <button onClick={fetchStaff}>Làm mới</button>
        </div>
      </div>

      {error && <div className="staff-error">{error}</div>}
      {loading ? (
        <div className="staff-loading">Đang tải...</div>
      ) : (
        <div className="staff-table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    Không có nhân viên nào.
                  </td>
                </tr>
              ) : (
                staff.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <button
                        className="link-button"
                        onClick={() => navigate(`/staff/${item._id}`)}
                      >
                        {item.name || "(Chưa có tên)"}
                      </button>
                    </td>
                    <td>{item.phone}</td>
                    <td>{item.email}</td>
                    <td>{renderStatusBadge(item.status)}</td>
                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="staff-actions-cell">
                      {item.status !== "active" && (
                        <button onClick={() => updateStatus(item._id, "active")}>
                          Duyệt
                        </button>
                      )}
                      {item.status !== "disabled" && (
                        <button
                          className="secondary"
                          onClick={() => updateStatus(item._id, "disabled")}
                        >
                          Khóa
                        </button>
                      )}
                      <Link to={`/staff/${item._id}`} className="secondary">
                        Xem chi tiết
                      </Link>
                      <button
                        className="danger"
                        onClick={() => handleDelete(item._id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

