import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import { useAdminAuth } from '../../src/contexts/AdminAuthContext';
import './StyleWeb/OrderList.css';
import { Link } from 'react-router-dom';


const statusMap = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang lấy hàng',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã huỷ',
};



export default function OrderList() {
  const { adminToken } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    console.log("🔐 Token:", adminToken);
    if (adminToken) {
      fetchOrders();
    }
  }, [statusFilter, sortOrder, adminToken]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/orders/admin/orders`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        params: {
          status: statusFilter,
          sort: sortOrder,
        },
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-page">
      <h1>Đơn hàng</h1>

      {!adminToken ? (
        <div className="text-red-500 mt-4">Bạn chưa đăng nhập.</div>
      ) : (
        <>
          {/* Bộ lọc */}
          <div className="order-filters">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="processing">Đang lấy hàng</option>
              <option value="shipping">Đang giao hàng</option>
              <option value="delivered">Đã giao hàng</option>
              <option value="cancelled">Đã huỷ</option>
            </select>

            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>
            <button onClick={fetchOrders}>Làm mới</button>
          </div>

          {/* Bảng đơn hàng */}
          <div className="overflow-x-auto">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th>Thanh toán</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">Đang tải đơn hàng...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-500">
                      Không có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id}>
                      <td className="text-blue-500 font-medium hover:underline cursor-pointer">
                        {order.order_code || `#${order._id.slice(-6).toUpperCase()}`}
                      </td>
                      <td>{order.user_id?.full_name || 'Ẩn danh'}</td>
                      <td>{order.total_amount?.toLocaleString()} VND</td>
                      <td>
                        <span className={`status-label status-${order.status}`}>
                          {statusMap[order.status] || 'Không rõ'}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                        <span className={`payment-tag ${order.payment_method === 'vnpay' ? 'online' : 'cod'}`}>
                          {order.payment_method === 'vnpay' ? 'ONLINE' : 'COD'}
                        </span>
                      </td>
                      <td>
                        <Link to={`/admin/orders/${order._id}`} className="order-action-btn">
                          Chi tiết
                        </Link>

                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
