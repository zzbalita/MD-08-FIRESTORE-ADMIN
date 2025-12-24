import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { BASE_URL } from "../config";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { StatisticsContext } from "../layouts/AdminLayout";
import "./StyleWeb/OrderStatistics.css";

export default function OrderStatistics() {
  const { adminToken } = useAdminAuth();
  const { refreshKey } = useContext(StatisticsContext);
  const [summary, setSummary] = useState({});
  const [chartData, setChartData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [filters, setFilters] = useState({
    period: "day", // day | month
    from: "",
    to: "",
  });
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState("line"); // "line" hoặc "bar"

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        groupBy: filters.period,
        from: filters.from,
        to: filters.to,
      }).toString();
      const res = await axios.get(`${BASE_URL}/api/admin/statistics/orders?${query}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setSummary(res.data.summary);
      setChartData(res.data.trend);
      setTopCustomers(res.data.topCustomers);
    } catch (err) {
      console.error("Lỗi khi lấy thống kê đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [filters, refreshKey]);

  return (
    <div className="statistics-container">
      <h2>📦 Thống kê đơn hàng</h2>

      {/* Card thống kê */}
      <div className="stat-cards">
        <div className="card total-orders">
          <h4>Tổng đơn</h4>
          <p>{summary.totalOrders || 0}</p>
        </div>
        <div className="card total-revenue">
          <h4>Tổng doanh thu</h4>
          <p>{(summary.totalRevenue || 0).toLocaleString()} đ</p>
        </div>
        <div className="card total-cost">
          <h4>Tổng giá vốn</h4>
          <p>{(summary.totalCost || 0).toLocaleString()} đ</p>
        </div>
        <div className="card total-profit">
          <h4>Tổng lợi nhuận</h4>
          <p>{(summary.totalProfit || 0).toLocaleString()} đ</p>
        </div>
        <div className="card delivered-orders">
          <h4>Đơn đã giao</h4>
          <p>{summary.deliveredOrders || 0}</p>
        </div>
        <div className="card cancelled-orders">
          <h4>Đơn hủy</h4>
          <p>{summary.cancelledOrders || 0}</p>
        </div>
      </div>

      {/* Doanh thu & lợi nhuận hôm nay */}
      <div className="stat-cards today-cards">
        <div className="card today-revenue">
          <h4>Doanh thu hôm nay</h4>
          <p>{(summary.todayRevenue || 0).toLocaleString()} đ</p>
        </div>
        <div className="card today-profit">
          <h4>Lợi nhuận hôm nay</h4>
          <p>{(summary.todayProfit || 0).toLocaleString()} đ</p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="filters">
        <select
          value={filters.period}
          onChange={(e) => setFilters({ ...filters, period: e.target.value })}
        >
          <option value="day">Theo ngày</option>
          <option value="month">Theo tháng</option>
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

        <button onClick={() => setChartType(chartType === "line" ? "bar" : "line")}>
          Đổi - {chartType === "line" ? "Biểu đồ cột 📊" : "Biểu đồ đường 📈"}
        </button>
      </div>

      {/* Biểu đồ */}
      <div className="chart-container">
        {loading ? (
          <p>Đang tải biểu đồ...</p>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            {chartType === "line" ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#8884d8" name="Số đơn" />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Doanh thu" />
                <Line type="monotone" dataKey="profit" stroke="#ff7300" name="Lợi nhuận" />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#8884d8" name="Số đơn" />
                <Bar dataKey="revenue" fill="#82ca9d" name="Doanh thu" />
                <Bar dataKey="profit" fill="#ff7300" name="Lợi nhuận" />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <p>Không có dữ liệu để hiển thị</p>
        )}
      </div>

      {/* Top khách hàng */}
      <div className="top-customers">
        <h3>🏆 Top khách hàng</h3>
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Tổng chi tiêu</th>
              <th>Số đơn</th>
            </tr>
          </thead>
          <tbody>
            {topCustomers.length > 0 ? (
              topCustomers.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.totalSpent?.toLocaleString()} đ</td>
                  <td>{c.totalOrders}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
