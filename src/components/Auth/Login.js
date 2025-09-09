import React, { useState } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import ModalWrapper from "../Modal/ModalWrapper";
import { useUser } from "../Context/UserContext";
import axios from "axios";
import {USERS_URL} from "../../config";

export default function Login({ show, handleClose }) {
  const { setCurrentUser } = useUser();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
    try {
      const res = await axios.get(`${USERS_URL}`);
      const user = res.data.find(
        u => u.username === form.username && u.password === form.password
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

  return (
    <ModalWrapper show={show} handleClose={handleClose} title="Login">
      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter username"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Login
        </Button>
      </Form>
    </ModalWrapper>
  );
}
