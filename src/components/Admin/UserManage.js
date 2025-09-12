import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import { USERS_URL } from "../../config";
import { useUser } from "../Context/UserContext";
import ModalWrapper from "../Modal/ModalWrapper";

export default function UserManage() {
  const { currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      username: "",
      password: "",
      role: "user",
      avatar: ""
    }
  });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(USERS_URL);
      setUsers(res.data);
    } catch {
      alert("Lỗi khi lấy danh sách người dùng!");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateUser = (data, editingUserId = null) => {
    if (users.some(u => u.username === data.username && u.id !== editingUserId)) {
      alert("Username đã tồn tại!");
      return false;
    }
    if (
      editingUserId === currentUser.id &&
      data.role === "user" &&
      users.find(u => u.id === editingUserId)?.role === "admin"
    ) {
      alert("Bạn không thể hạ quyền admin của chính mình!");
      return false;
    }
    return true;
  };

  const onSubmit = async (data) => {
    if (!validateUser(data)) return;
    try {
      await axios.post(USERS_URL, data);
      fetchUsers();
      setModalOpen(false);
      reset();
      setAvatarPreview("");
    } catch {
      alert("Lỗi khi thêm người dùng!");
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      alert("Bạn không thể xóa chính mình!");
      return;
    }
    if (window.confirm("Bạn có chắc muốn xóa user này?")) {
      try {
        await axios.delete(`${USERS_URL}/${id}`);
        setUsers(users.filter((u) => u.id !== id));
      } catch {
        alert("Lỗi khi xóa người dùng!");
      }
    }
  };

  const viewDetail = (id) => navigate(`/user-detail/${id}`);

  return (
    <div className="container mt-4">
      <button
        className="btn-outline-black mb-3"
        onClick={() => {
          reset({ name: "", username: "", password: "", role: "user", avatar: "" });
          setAvatarPreview("");
          setModalOpen(true);
        }}
      >
        + Thêm người dùng
      </button>

      <table className="table table-bordered table-hover">
        <thead className="table-secondary text-center">
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Username</th>
            <th>Role</th>
            <th>Avatar</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isEditing = user.id === editingId;
            return (
              <tr key={user.id} className="text-center align-middle">
                <td>{user.id}</td>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <select
                      className="form-select"
                      value={editData.role}
                      onChange={(e) => {
                        if (
                          user.id === currentUser.id &&
                          editData.role === "admin" &&
                          e.target.value !== "admin"
                        ) {
                          alert("Bạn không thể hạ quyền admin của chính mình!");
                          return;
                        }
                        setEditData({ ...editData, role: e.target.value });
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editData.avatar}
                      onChange={(e) => setEditData({ ...editData, avatar: e.target.value })}
                    />
                  ) : (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="rounded-circle"
                      width="50"
                      height="50"
                    />
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <>
                      <button
                        className="btn btn-outline-primary btn-sm me-1"
                        onClick={async () => {
                          if (!validateUser(editData, user.id)) return;
                          try {
                            await axios.put(`${USERS_URL}/${user.id}`, editData);
                            setEditingId(null);
                            fetchUsers();
                          } catch {
                            alert("Lỗi khi lưu!");
                          }
                        }}
                      >
                        Lưu
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setEditingId(null)}
                      >
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-outline-success btn-sm me-1"
                        onClick={() => viewDetail(user.id)}
                      >
                        Xem
                      </button>
                      <button
                        className="btn btn-outline-warning btn-sm me-1"
                        onClick={() => {
                          setEditingId(user.id);
                          setEditData(user);
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(user.id)}
                        disabled={user.id === currentUser.id}
                      >
                        Xóa
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ModalWrapper
        show={modalOpen}
        handleClose={() => setModalOpen(false)}
        title="Thêm người dùng"
      >
        <form id="userForm" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-2">
            <label className="form-label">Tên</label>
            <input type="text" className="form-control" {...register("name", { required: true })} />
          </div>
          <div className="mb-2">
            <label className="form-label">Username</label>
            <input type="text" className="form-control" {...register("username", { required: true })} />
          </div>
          <div className="mb-2">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" {...register("password", { required: true })} />
          </div>
          <div className="mb-2">
            <label className="form-label">Role</label>
            <select className="form-select" {...register("role")}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="form-label">Avatar URL</label>
            <input
              type="text"
              className="form-control"
              {...register("avatar")}
              onChange={(e) => setAvatarPreview(e.target.value)}
            />
            {avatarPreview && (
              <img src={avatarPreview} alt="Preview" className="rounded-circle mt-2" width="50" height="50" />
            )}
          </div>

          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setModalOpen(false)}>
              Hủy
            </button>
            <button type="submit" className="btn btn-outline-primary">
              Lưu
            </button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
}
