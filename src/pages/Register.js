import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StyleWeb/Register.css";
import { BASE_URL } from "../config";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    username: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.phone || form.phone.trim() === "") {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(form.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!form.password || form.password.trim() === "") {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (form.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!form.confirmPassword || form.confirmPassword.trim() === "") {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (!form.name || form.name.trim() === "") {
      newErrors.name = "Vui lòng nhập họ tên";
    }

    if (!form.email || form.email.trim() === "") {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const registerData = {
        phone: form.phone.trim(),
        password: form.password,
        name: form.name.trim(),
        email: form.email.trim(),
        username: form.username.trim() || undefined,
      };

      await axios.post(`${BASE_URL}/api/admin/register`, registerData);
      alert("✅ Đăng ký thành công! Vui lòng chờ admin phê duyệt trước khi đăng nhập.");
      navigate("/login");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Lỗi đăng ký. Vui lòng thử lại.";
      alert(errorMessage);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h2>Đăng ký tài khoản Nhân viên</h2>
        <p style={{ textAlign: "center", color: "#666", fontSize: "14px", marginBottom: "20px" }}>
          Tạo tài khoản nhân viên để quản lý hệ thống. Admin sẽ duyệt yêu cầu trước khi bạn có thể đăng nhập.
        </p>

        <div className="input-group">
          <label>Số điện thoại <span style={{ color: "red" }}>*</span></label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            placeholder="Nhập số điện thoại (10-11 số)"
            onChange={handleChange}
            className={errors.phone ? "input-error" : ""}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <div className="input-group">
          <label>Họ tên <span style={{ color: "red" }}>*</span></label>
          <input
            type="text"
            name="name"
            value={form.name}
            placeholder="Nhập họ tên đầy đủ"
            onChange={handleChange}
            className={errors.name ? "input-error" : ""}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="input-group">
          <label>Email <span style={{ color: "red" }}>*</span></label>
          <input
            type="email"
            name="email"
            value={form.email}
            placeholder="Nhập địa chỉ email"
            onChange={handleChange}
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="input-group">
          <label>Tên đăng nhập</label>
          <input
            type="text"
            name="username"
            value={form.username}
            placeholder="Tên đăng nhập (tùy chọn)"
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Mật khẩu <span style={{ color: "red" }}>*</span></label>
          <input
            type="password"
            name="password"
            value={form.password}
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
            onChange={handleChange}
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="input-group">
          <label>Xác nhận mật khẩu <span style={{ color: "red" }}>*</span></label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            placeholder="Nhập lại mật khẩu"
            onChange={handleChange}
            className={errors.confirmPassword ? "input-error" : ""}
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        <button 
          type="submit" 
          className="register-button"
          disabled={loading}
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        <div className="register-link">
          <span>Bạn đã có tài khoản? </span>
          <button type="button" onClick={() => navigate("/login")}>
            Đăng nhập
          </button>
        </div>
      </form>
    </div>
  );
}
