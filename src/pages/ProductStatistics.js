import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./StyleWeb/ProductStatistics.css";
import { BASE_URL } from "../config";
import { useAdminAuth } from '../../src/contexts/AdminAuthContext';
import { StatisticsContext } from "../layouts/AdminLayout";

export default function ProductStatistics() {
    const { adminToken } = useAdminAuth();
    const { refreshKey } = useContext(StatisticsContext);
    const [summary, setSummary] = useState({});
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({
        sortBy: "sold",
        order: "desc",
        status: "",
        from: "",
        to: "",
        limit: 10
    });
    const [loading, setLoading] = useState(false);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const query = new URLSearchParams(filters).toString();
            const res = await axios.get(`${BASE_URL}/api/admin/statistics/products?${query}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            setSummary(res.data.summary);
            setProducts(res.data.topProducts);
        } catch (err) {
            console.error("Lỗi khi lấy thống kê:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [filters, refreshKey]);
    return (
        <div className="statistics-container">
            <h2>📊 Thống kê sản phẩm</h2>
            {/* Card thống kê */}
            <div className="stat-cards">
                <div className="card total-products">
                    <h4>Tổng sản phẩm</h4>
                    <p>{summary.totalProducts || 0}</p>
                </div>
                <div className="card total-stock">
                    <h4>Tổng tồn kho</h4>
                    <p>{summary.totalStock || 0}</p>
                </div>
                <div className="card low-stock">
                    <h4>Sản phẩm sắp hết hàng</h4>
                    <p>{summary.lowStockCount || 0}</p>
                </div>
                <div className="card out-of-stock">
                    <h4>Sản phẩm hết hàng</h4>
                    <p>{summary.outOfStockCount || 0}</p>
                </div>

            </div>

            <div className="filters">
                <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                >
                    <option value="sold">Bán chạy</option>
                    <option value="revenue">Doanh thu</option>
                    <option value="stock">Tồn kho</option>
                    <option value="name">Tên</option>
                </select>

                <select
                    value={filters.order}
                    onChange={(e) => setFilters({ ...filters, order: e.target.value })}
                >
                    <option value="desc">Giảm dần</option>
                    <option value="asc">Tăng dần</option>
                </select>

                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Đang bán">Đang bán</option>
                    <option value="Ngừng bán">Ngừng bán</option>
                    <option value="Hết hàng">Hết hàng</option>

                </select>

                <input
                    type="date"
                    value={filters.from}
                    onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                />
                <input
                    type="date"
                    value={filters.to}
                    onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                />

                <select
                    value={filters.limit}
                    onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
                >
                    <option value="5">5 sản phẩm</option>
                    <option value="10">10 sản phẩm</option>
                    <option value="20">20 sản phẩm</option>
                </select>
            </div>

            {/* Bảng sản phẩm */}
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <table className="stat-table">
                    <thead>
                        <tr>
                            <th>Ảnh</th>
                            <th>Tên</th>
                            <th>Danh mục</th>
                            <th>Trạng thái</th>
                            <th>Đã bán</th>
                            <th>Giá bán sản phẩm</th>
                            <th>Tồn kho</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((p) => (
                                <tr key={p._id}>
                                    <td>
                                        <img src={p.image} alt={p.name} width="50" />
                                    </td>
                                    <td>{p.name}</td>
                                    <td>{p.category}</td>
                                    <td>{p.status}</td>
                                    <td>{p.totalSold}</td>
                                    <td>{p.totalRevenue?.toLocaleString()} đ</td>
                                    <td>{p.stock}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center" }}>Không có dữ liệu</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
