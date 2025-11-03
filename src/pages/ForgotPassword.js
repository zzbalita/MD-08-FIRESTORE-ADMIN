import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import "./StyleWeb/Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    try {
      await axios.post(`${BASE_URL}/api/admin/send-otp`, { email });
      alert("✅ Mã OTP đã được gửi tới email!");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "❌ Gửi OTP thất bại");
    }
  };

  const handleResetPassword = async () => {
    try {
      await axios.post(`${BASE_URL}/api/admin/reset-password`, {
        email,
        code: otp,
        newPassword,
      });
      alert("✅ Mật khẩu đã được đặt lại, hãy đăng nhập lại!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Đặt lại mật khẩu thất bại");
    }
  };

  return (
    <div className="login-container">
      <form
        className="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          step === 1 ? handleSendOTP() : handleResetPassword();
        }}
      >
        <h2>Quên mật khẩu</h2>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Nhập email tài khoản"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {step === 2 && (
          <>
            <div className="input-group">
              <label>Mã OTP</label>
              <input
                type="text"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <button type="submit" className="login-button">
          {step === 1 ? "Gửi mã xác nhận" : "Đặt lại mật khẩu"}
        </button>

        <div className="login-link">
          <span>Đã nhớ mật khẩu? </span>
          <button type="button" onClick={() => navigate("/login")}>
            Đăng nhập
          </button>
        </div>
      </form>
    </div>
  );
}
