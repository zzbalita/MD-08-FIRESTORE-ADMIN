import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import "./StyleWeb/Staff.css";

const STATUS_LABELS = {
  pending: "Chờ duyệt",
  active: "Đang hoạt động",
  disabled: "Đã khóa",
};

export default function StaffDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${BASE_URL}/api/admin/staff/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setStaff(res.data.staff);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải thông tin nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [id]);

  const updateStatus = async (status) => {
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

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản nhân viên này?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${BASE_URL}/api/admin/staff/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      alert("Đã xóa tài khoản nhân viên");
      navigate("/staff");
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa tài khoản");
    }
  };

  if (loading) return <div className="staff-loading">Đang tải...</div>;
  if (error) return <div className="staff-error">{error}</div>;
  if (!staff) return <div className="staff-error">Không tìm thấy nhân viên</div>;

  return (
    <div className="staff-detail-container">
      <button className="back-btn" onClick={() => navigate("/staff")}>
        ← Quay lại danh sách
      </button>

      <div className="staff-detail-card">
        <h2>Thông tin nhân viên</h2>

        <div className="staff-info-row">
          <span className="label">Họ tên:</span>
          <span className="value">{staff.name}</span>
        </div>

        <div className="staff-info-row">
          <span className="label">Số điện thoại:</span>
          <span className="value">{staff.phone}</span>
        </div>

        <div className="staff-info-row">
          <span className="label">Email:</span>
          <span className="value">{staff.email}</span>
        </div>

        <div className="staff-info-row">
          <span className="label">Username:</span>
          <span className="value">{staff.username || "(Chưa có)"}</span>
        </div>

        <div className="staff-info-row">
          <span className="label">Trạng thái:</span>
          <span className={`status-badge status-${staff.status}`}>
            {STATUS_LABELS[staff.status] || staff.status}
          </span>
        </div>

        <div className="staff-info-row">
          <span className="label">Ngày đăng ký:</span>
          <span className="value">
            {staff.createdAt ? new Date(staff.createdAt).toLocaleString() : "N/A"}
          </span>
        </div>

        <div className="staff-actions-row">
          {staff.status !== "active" && (
            <button className="approve-btn" onClick={() => updateStatus("active")}>
              ✓ Duyệt tài khoản
            </button>
          )}
          {staff.status !== "disabled" && (
            <button className="disable-btn" onClick={() => updateStatus("disabled")}>
              🔒 Khóa tài khoản
            </button>
          )}
          <button className="danger" onClick={handleDelete}>
            🗑 Xóa tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}

