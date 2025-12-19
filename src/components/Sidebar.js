import { NavLink } from "react-router-dom";
import {
  FaChartPie, FaBoxOpen, FaTags, FaClipboardList, FaUsers, FaCogs,
  FaShoppingBag, FaTextHeight, FaAlignLeft, FaChevronDown, FaChevronRight,
  FaComments, FaUserTie
} from "react-icons/fa";
import { useState } from "react";
import "./Sidebar.css";
import { useAdminAuth, isAdmin, isStaff } from "../contexts/AdminAuthContext";

export default function Sidebar() {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { adminInfo } = useAdminAuth();
  const userIsAdmin = isAdmin(adminInfo);
  const userIsStaff = isStaff(adminInfo);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
      window.location.href = "/login";
    }
  };

  return (
    <div className="sidebar">
      <h2 className="logo">FIRESTORE ADMIN</h2>

      <nav className="nav-links">
        {/* Menu cha: Bảng điều khiển - Only show for Admin */}
        {userIsAdmin && (
          <>
            <div
              className="menu-parent"
              onClick={() => setIsDashboardOpen(!isDashboardOpen)}
            >
              <FaChartPie className="icon" />
              <span style={{ flex: 1 }}>Bảng điều khiển</span>
              {isDashboardOpen ? (
                <FaChevronDown className="arrow-icon" />
              ) : (
                <FaChevronRight className="arrow-icon" />
              )}
            </div>

            {isDashboardOpen && (
              <div className="submenu">
                <NavLink to="/statistics/products">Thống kê sản phẩm</NavLink>
                <NavLink to="/statistics/inventory">Thống kê tồn kho</NavLink>
                <NavLink to="/statistics/orders">Doanh thu & Đơn hàng</NavLink>
              </div>
            )}
          </>
        )}

        {/* Các menu khác */}
        <NavLink to="/products"><FaBoxOpen className="icon" /> Sản phẩm</NavLink>
        
        {/* Taxonomy menus - Admin only */}
        {userIsAdmin && (
          <>
            <NavLink to="/categories"><FaTags className="icon" /> Danh mục</NavLink>
            <NavLink to="/descriptions"><FaAlignLeft className="icon" /> Mô tả</NavLink>
            <NavLink to="/brands"><FaShoppingBag className="icon" /> Thương hiệu</NavLink>
            <NavLink to="/sizes"><FaTextHeight className="icon" /> Kích cỡ</NavLink>
          </>
        )}
        
        <NavLink to="/orders"><FaClipboardList className="icon" /> Đơn hàng</NavLink>
        <NavLink to="/customers"><FaUsers className="icon" /> Khách hàng</NavLink>
        <NavLink to="/chat"><FaComments className="icon" /> Chăm sóc khách hàng</NavLink>
        
        {/* Staff management - Admin only */}
        {userIsAdmin && (
          <NavLink to="/staff"><FaUserTie className="icon" /> Nhân viên</NavLink>
        )}

        {/* Menu cha: Cài đặt */}
        <div
          className="menu-parent"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        >
          <FaCogs className="icon" />
          <span style={{ flex: 1 }}>Cài đặt</span>
          {isSettingsOpen ? (
            <FaChevronDown className="arrow-icon" />
          ) : (
            <FaChevronRight className="arrow-icon" />
          )}
        </div>

        {isSettingsOpen && (
          <div className="submenu">
            <NavLink to="/change-password">Đổi mật khẩu</NavLink>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#e63946",
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Đăng xuất
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
