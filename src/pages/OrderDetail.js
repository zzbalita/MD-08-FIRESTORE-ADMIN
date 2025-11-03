import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import { useAdminAuth } from '../../src/contexts/AdminAuthContext';
import './StyleWeb/OrderDetail.css';
import { StatisticsContext } from "../layouts/AdminLayout";
// Trạng thái đơn hàng (map cho hiển thị)
const statusMap = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    processing: 'Đang lấy hàng',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy đơn',
};

// Trạng thái hợp lệ tiếp theo
const getAvailableStatusOptions = (currentStatus) => {
    switch (currentStatus) {
        case 'pending':
            return ['confirmed', 'cancelled'];
        case 'confirmed':
            return ['processing', 'cancelled'];
        case 'processing':
            return ['shipping', 'cancelled'];
        case 'shipping':
            return ['delivered'];
        default:
            return []; // delivered, cancelled → không cho cập nhật nữa
    }
};

export default function OrderDetail() {
    const { id } = useParams();
    const { adminToken } = useAdminAuth();
    const { triggerRefreshStatistics } = useContext(StatisticsContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (adminToken) {
            fetchOrder();
        }
    }, [adminToken]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/api/orders/admin/orders`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            const foundOrder = res.data.find((o) => o._id === id);
            if (foundOrder) {
                setOrder(foundOrder);
                setNewStatus(''); // Bắt đầu với trạng thái rỗng
            } else {
                alert("Không tìm thấy đơn hàng.");
            }
        } catch (err) {
            console.error("Lỗi khi tải đơn hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!newStatus || newStatus === order.status) return;

        try {
            setUpdating(true);
            const res = await axios.put(
                `${BASE_URL}/api/orders/${id}/status`,
                { status: newStatus },
                {
                    headers: { Authorization: `Bearer ${adminToken}` },
                }
            );
            setOrder(res.data.order);
            alert("Cập nhật trạng thái thành công!");
            navigate('/orders');
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            alert("Cập nhật thất bại.");
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn huỷ đơn hàng này không?")) return;

        try {
            setUpdating(true);
            const res = await axios.put(
                `${BASE_URL}/api/orders/${id}/cancel`,
                {},
                {
                    headers: { Authorization: `Bearer ${adminToken}` },
                }
            );
            setOrder(res.data.order);
            triggerRefreshStatistics();
            alert("Huỷ đơn hàng thành công!");
            navigate('/orders');
        } catch (err) {
            console.error("Lỗi khi huỷ đơn hàng:", err);
            alert("Huỷ đơn hàng thất bại.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div>Đang tải chi tiết đơn hàng...</div>;
    if (!order) return <div>Không tìm thấy đơn hàng.</div>;

    const availableStatusOptions = getAvailableStatusOptions(order.status);

    return (
        <div className="order-detail-page">
            <h2>Chi tiết đơn hàng</h2>

            <table className="order-table">
                <tbody>
                    <tr>
                        <td><strong>Mã đơn</strong></td>
                        <td>{order.order_code || `#${order._id.slice(-6).toUpperCase()}`}</td>
                    </tr>
                    <tr>
                        <td><strong>Khách hàng</strong></td>
                        <td>{order.user_id?.full_name} ({order.user_id?.email})</td>
                    </tr>
                    <tr>
                        <td><strong>Ngày tạo</strong></td>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td><strong>Trạng thái</strong></td>
                        <td>{statusMap[order.status]}</td>
                    </tr>
                    <tr>
                        <td><strong>Phương thức thanh toán</strong></td>
                        <td>{order.payment_method === 'cash' ? 'Thanh toán khi nhận hàng' : order.payment_method}</td>
                    </tr>
                    <tr>
                        <td><strong>Phí vận chuyển</strong></td>
                        <td>{order.shipping_fee?.toLocaleString()} VND</td>
                    </tr>
                    <tr>
                        <td><strong>Tổng tiền</strong></td>
                        <td>{order.total_amount?.toLocaleString()} VND</td>
                    </tr>
                </tbody>
            </table>

            {order.address && (
                <>
                    <h4>Địa chỉ giao hàng</h4>
                    <table className="order-table">
                        <tbody>
                            <tr>
                                <td><strong>Người nhận</strong></td>
                                <td>{order.address.full_name}</td>
                            </tr>
                            <tr>
                                <td><strong>SĐT</strong></td>
                                <td>{order.address.phone_number}</td>
                            </tr>
                            <tr>
                                <td><strong>Địa chỉ</strong></td>
                                <td>
                                    {order.address.street}, {order.address.ward}, {order.address.district}, {order.address.province}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </>
            )}

            <h4>Sản phẩm</h4>
            <table className="order-table">
                <thead>
                    <tr>
                        <th>Tên sản phẩm</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items?.map((item, index) => (
                        <tr key={index}>
                            <td>{item.product_id?.name || 'Không có tên'}</td>
                            <td>{item.price.toLocaleString()} VND</td>
                            <td>{item.quantity}</td>
                            <td>{(item.price * item.quantity).toLocaleString()} VND</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {availableStatusOptions.length > 0 && (
                <div className="status-update-section">
                    <label>Thay đổi trạng thái:</label>
                    <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                    >
                        <option value="">-- Chọn trạng thái --</option>
                        {availableStatusOptions.map((status) => (
                            <option key={status} value={status}>
                                {statusMap[status]}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleUpdateStatus}
                        disabled={updating || !newStatus || newStatus === order.status}
                    >
                        {updating ? "Đang cập nhật..." : "Lưu"}
                    </button>

                    {availableStatusOptions.includes("cancelled") && (
                        <button
                            onClick={handleCancelOrder}
                            className="cancel-button"
                            disabled={updating}
                            style={{
                                marginLeft: "12px",
                                backgroundColor: "#ff4d4f",
                                color: "white",
                                border: "none",
                                padding: "8px 16px",
                                cursor: "pointer",
                            }}
                        >
                            {updating ? "Đang huỷ..." : "Huỷ đơn hàng"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
