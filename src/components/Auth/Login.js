import React, { useState, useEffect } from "react";
import { Alert } from "react-bootstrap";
import ModalWrapper from "../Modal/ModalWrapper";
import { useUser } from "../Context/UserContext";
import axios from "axios";
import { USERS_URL } from "../../config";

export default function Login({ show, handleClose }) {
  const { currentUser, setCurrentUser } = useUser();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    const { username, password } = form;

    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ các trường!");
      return;
    }

    try {
      const res = await axios.get(USERS_URL);
      const user = res.data.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        setCurrentUser(user);
        setError("");
        handleClose();
      } else {
        setError("Sai tài khoản hoặc mật khẩu!");
      }
    } catch {
      setError("Lỗi server!");
    }
  };

  useEffect(() => {
    if (!currentUser) {
      setForm({ username: "", password: "" });
      setError("");
    }
  }, [currentUser]);

  return (
    <ModalWrapper show={show} handleClose={handleClose} title="Login">
      <div className="d-flex flex-column gap-3">
        {error && <Alert variant="danger">{error}</Alert>}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="form-control"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="form-control"
        />
        <div className="d-flex gap-2 mt-2">
          <button className="btn-black btn-sm" onClick={handleLogin}>
            Login
          </button>
          <button className="btn-outline-black btn-sm" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
