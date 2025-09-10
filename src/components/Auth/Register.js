import React, { useState, useEffect } from "react";
import ModalWrapper from "../Modal/ModalWrapper";
import { useUser } from "../Context/UserContext";
import axios from "axios";
import { USERS_URL } from "../../config";

export default function Register({ show, handleClose }) {
  const { currentUser, setCurrentUser } = useUser();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    avatar: null,
  });
  const [preview, setPreview] = useState(null);

  const resetForm = () => {
    setFormData({
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

    if (name === "avatar" && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRegister = async () => {
    const { username, email, password, passwordConfirm } = formData;

    if (password !== passwordConfirm) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const newUser = { username, email, password, role: "user", avatar: preview };
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

  const { username, email, password, passwordConfirm } = formData;

  return (
    <ModalWrapper show={show} handleClose={handleClose} title="Register">
      <div>
        {[
          { label: "Username", type: "text", name: "username", value: username },
          { label: "Email", type: "email", name: "email", value: email },
          { label: "Password", type: "password", name: "password", value: password },
          { label: "Confirm Password", type: "password", name: "passwordConfirm", value: passwordConfirm },
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
