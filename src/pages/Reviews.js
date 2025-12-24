import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import "./StyleWeb/Reviews.css";

export default function Reviews() {
  const { adminToken } = useAdminAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [pagination.page, filterRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
      });
      if (filterRating) params.append("rating", filterRating);

      const res = await axios.get(`${BASE_URL}/api/comments/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setReviews(res.data.items);
      setSummary(res.data.summary);
      setPagination(prev => ({
        ...prev,
        totalPages: res.data.pagination.totalPages,
        totalItems: res.data.pagination.totalItems,
      }));
    } catch (err) {
      console.error("Lỗi tải đánh giá:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/comments/admin/${commentId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      fetchReviews();
    } catch (err) {
      console.error("Lỗi xóa đánh giá:", err);
      alert("Không thể xóa đánh giá");
    }
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="reviews-container">
      <h2>⭐ Quản lý đánh giá</h2>

      {/* Thống kê tổng quan */}
      <div className="reviews-summary">
        <div className="summary-card total">
          <h4>Tổng đánh giá</h4>
          <p>{summary.totalReviews || 0}</p>
        </div>
        <div className="summary-card avg">
          <h4>Điểm trung bình</h4>
          <p>{(summary.avgRating || 0).toFixed(1)} ⭐</p>
        </div>
        <div className="summary-card star5">
          <h4>5 sao</h4>
          <p>{summary.rating5 || 0}</p>
        </div>
        <div className="summary-card star4">
          <h4>4 sao</h4>
          <p>{summary.rating4 || 0}</p>
        </div>
        <div className="summary-card star3">
          <h4>3 sao</h4>
          <p>{summary.rating3 || 0}</p>
        </div>
        <div className="summary-card star2">
          <h4>2 sao</h4>
          <p>{summary.rating2 || 0}</p>
        </div>
        <div className="summary-card star1">
          <h4>1 sao</h4>
          <p>{summary.rating1 || 0}</p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="reviews-filter">
        <label>Lọc theo số sao:</label>
        <select value={filterRating} onChange={(e) => {
          setFilterRating(e.target.value);
          setPagination(prev => ({ ...prev, page: 1 }));
        }}>
          <option value="">Tất cả</option>
          <option value="5">5 sao</option>
          <option value="4">4 sao</option>
          <option value="3">3 sao</option>
          <option value="2">2 sao</option>
          <option value="1">1 sao</option>
        </select>
      </div>

      {/* Danh sách đánh giá */}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Khách hàng</th>
                <th>Đánh giá</th>
                <th>Nội dung</th>
                <th>Ngày</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <tr key={review._id}>
                    <td className="product-cell">
                      <img
                        src={review.product_id?.image || "https://via.placeholder.com/50"}
                        alt={review.product_id?.name}
                      />
                      <span>{review.product_id?.name || "Sản phẩm đã xóa"}</span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <strong>{review.user_id?.full_name || "Ẩn danh"}</strong>
                        <small>{review.user_id?.email}</small>
                      </div>
                    </td>
                    <td className="rating-cell">
                      <span className={`stars rating-${review.rating}`}>
                        {renderStars(review.rating)}
                      </span>
                    </td>
                    <td className="content-cell">{review.content || <em>Không có nội dung</em>}</td>
                    <td>{formatDate(review.createdAt)}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(review._id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    Không có đánh giá nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Phân trang */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                ← Trước
              </button>
              <span>
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

