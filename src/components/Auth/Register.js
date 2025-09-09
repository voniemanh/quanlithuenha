import React, { useState, useEffect } from "react";
import { Button, Form, Image } from "react-bootstrap";
import ModalWrapper from "../Modal/ModalWrapper";
import { useUser } from "../Context/UserContext";
import axios from "axios";
import { USERS_URL } from "../../config";

export default function Register({ show, handleClose }) {
  const { currentUser, setCurrentUser } = useUser();
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    password: "",
    passwordConfirm: "",
    avatar: null,
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      alert("Passwords do not match!");
      return;
    }

    const newUser = {
      nickname: formData.nickname,
      email: formData.email,
      password: formData.password,
      avatar: preview, 
    };

    try {
      const res = await axios.post(USERS_URL, newUser);

      setCurrentUser(res.data);
      handleClose();
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Register failed!");
    }
  };

  useEffect(() => {
    if (!currentUser) {
      setFormData({
        nickname: "",
        email: "",
        password: "",
        passwordConfirm: "",
        avatar: null,
      });
      setPreview(null);
    }
  }, [currentUser]);

  return (
    <ModalWrapper show={show} handleClose={handleClose} title="Register">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nickname</Form.Label>
          <Form.Control
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Avatar</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={handleAvatarChange} />
          {preview && (
            <Image
              src={preview}
              alt="avatar preview"
              roundedCircle
              className="mt-2"
              width={80}
              height={80}
            />
          )}
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100">
          Register
        </Button>
      </Form>
    </ModalWrapper>
  );
}
