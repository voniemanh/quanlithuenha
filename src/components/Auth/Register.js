import React, { useEffect } from "react";
import ModalWrapper from "../Modal/ModalWrapper";
import { useUser } from "../Context/UserContext";
import { useAlert } from "../Context/AlertContext";
import axios from "axios";
import { USERS_URL } from "../../config";
import { useForm } from "react-hook-form";

export default function Register({ show, handleClose }) {
  const { setCurrentUser } = useUser();
  const { showAlert } = useAlert();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      passwordConfirm: "",
      avatar: "",
    },
  });

  const avatarUrl = watch("avatar");

  const onSubmit = async (data) => {
    const { name, username, email, password, passwordConfirm, avatar } = data;

    if (password !== passwordConfirm) {
      showAlert("Passwords không khớp!", "error");
      return;
    }

    try {
      const newUser = { name, username, email, password, role: "user", avatar };
      const res = await axios.post(USERS_URL, newUser);
      setCurrentUser(res.data);
      handleClose();
      reset();
      showAlert("Đăng ký thành công!", "success");
    } catch (error) {
      console.error("Error registering user:", error);
      showAlert("Đăng ký không thành công!", "error");
    }
  };

  useEffect(() => {
    reset();
  }, [show, reset]);

  return (
    <ModalWrapper show={show} handleClose={handleClose} title="Register">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label>Name</label>
          <input
            className="form-control"
            {...register("name", { required: "Vui lòng nhập tên" })}
          />
          {errors.name && <span className="text-danger">{errors.name.message}</span>}
        </div>

        <div className="mb-3">
          <label>Username</label>
          <input
            className="form-control"
            {...register("username", { required: "Vui lòng nhập username" })}
          />
          {errors.username && <span className="text-danger">{errors.username.message}</span>}
        </div>

        <div className="mb-3">
          <label>Email</label>
          <input
            className="form-control"
            type="email"
            {...register("email", {
              required: "Vui lòng nhập email",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email không hợp lệ" },
            })}
          />
          {errors.email && <span className="text-danger">{errors.email.message}</span>}
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            className="form-control"
            type="password"
            {...register("password", {
              required: "Vui lòng nhập mật khẩu",
              minLength: { value: 3, message: "Mật khẩu ít nhất 3 ký tự" },
            })}
          />
          {errors.password && <span className="text-danger">{errors.password.message}</span>}
        </div>

        <div className="mb-3">
          <label>Confirm Password</label>
          <input
            className="form-control"
            type="password"
            {...register("passwordConfirm", { required: "Vui lòng nhập lại mật khẩu" })}
          />
          {errors.passwordConfirm && <span className="text-danger">{errors.passwordConfirm.message}</span>}
        </div>

        <div className="mb-3">
          <label>Avatar URL</label>
          <input
            className="form-control"
            type="url"
            {...register("avatar")}
            placeholder="https://example.com/avatar.jpg"
          />
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="avatar preview"
              className="mt-2 rounded-circle"
              width={80}
              height={80}
            />
          )}
        </div>

        <div className="button-row">
          <button type="submit" className="btn-black md me-2">
            Register
          </button>
          <button type="button" className="btn-outline-black md" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
