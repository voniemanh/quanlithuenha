import React, { useState, useEffect } from "react";
import ModalWrapper from "../Modal/ModalWrapper";
import { useUser } from "../Context/UserContext";
import axios from "axios";
import { USERS_URL } from "../../config";

export default function Register({ show, handleClose }) {
  const { currentUser, setCurrentUser } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    avatar: null,
  });
  const [preview, setPreview] = useState(null);

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      passwordConfirm: "",
      avatar: null,
    });
    setPreview(null);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "avatar" && files?.length > 0) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, avatar: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRegister = async () => {
    const { name, username, email, password, passwordConfirm } = formData;

    if (password !== passwordConfirm) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const newUser = { name, username, email, password, role: "user", avatar: preview };
      const res = await axios.post(USERS_URL, newUser);

      setCurrentUser(res.data);
      handleClose();
      resetForm();
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Register failed!");
    }
  };

  useEffect(() => {
    if (!currentUser) resetForm();
  }, [currentUser]);

  return (
    <ModalWrapper show={show} handleClose={handleClose} title="Register">
      <div>
        {[
          { label: "Name", type: "text", name: "name", value: formData.name },
          { label: "Username", type: "text", name: "username", value: formData.username },
          { label: "Email", type: "email", name: "email", value: formData.email },
          { label: "Password", type: "password", name: "password", value: formData.password },
          { label: "Confirm Password", type: "password", name: "passwordConfirm", value: formData.passwordConfirm },
        ].map(({ label, type, name, value }) => (
          <div className="mb-3" key={name}>
            <label>{label}</label>
            <input
              type={type}
              name={name}
              value={value}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
        ))}

        <div className="mb-3">
          <label>Avatar</label>
          <input type="file" name="avatar" accept="image/*" onChange={handleChange} className="form-control" />
          {preview && <img src={preview} alt="avatar preview" className="mt-2 rounded-circle" width={80} height={80} />}
        </div>

        <button onClick={handleRegister} className="btn btn-primary w-100">
          Register
        </button>
      </div>
    </ModalWrapper>
  );
}
