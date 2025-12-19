import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import "./StyleWeb/InventoryStatistics.css";
import { useAdminAuth } from "../contexts/AdminAuthContext";

export default function InventoryStatistics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { adminToken } = useAdminAuth();

  useEffect(() => {
    if (adminToken) {
      fetchData();
    }
  }, [adminToken]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/admin/statistics/inventory`, {
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

      {/* Tồn kho theo danh mục */}
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
    </div>
  );
}
