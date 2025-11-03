import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; //  để điều hướng
import "./StyleWeb/Register.css"; // 
import { BASE_URL } from "../config";

export default function Register() {
  const navigate = useNavigate(); // 
  const [form, setForm] = useState({
    phone: "",
    password: "",
    name: "",
    email: "",
    username: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/admin/register`, form);
      alert("Đăng ký thành công!");
      navigate("/login"); // điều hướng sau khi đăng ký
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi đăng ký");
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h2>Đăng ký tài khoản Admin</h2>

        <div className="input-group">
          <label>Số điện thoại</label>
          <input
            name="phone"
            placeholder="Nhập số điện thoại"
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            name="password"
            placeholder="Nhập mật khẩu"
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Họ tên</label>
          <input
            name="name"
            placeholder="Nhập họ tên"
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input
            name="email"
            placeholder="Nhập email"
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Tên đăng nhập</label>
          <input
            name="username"
            placeholder="Tên đăng nhập (tuỳ chọn)"
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="register-button">Đăng ký</button>

        <div className="register-link">
          <span>Bạn đã có tài khoản? </span>
          <button type="button" onClick={() => navigate("/login")}>Đăng nhập</button>
        </div>
      </form>
    </div>
  );
}
