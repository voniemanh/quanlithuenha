import React, { useEffect, useState } from "react";
import { useUser } from "../Context/UserContext";
import axios from "axios";
import { USERS_URL, PROPERTIES_URL, CONTRACTS_URL } from "../../config";
import { useNavigate } from "react-router-dom";

export default function UserDetail() {
  const { currentUser, setCurrentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    avatar: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(USERS_URL).then(res => setUsers(res.data));
    axios.get(PROPERTIES_URL).then(res => setProperties(res.data));
    axios.get(CONTRACTS_URL).then(res => setContracts(res.data));
  }, []);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        username: currentUser.username,
        password: currentUser.password,
        avatar: currentUser.avatar || ""
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    const updatedData = {
      ...formData,
      role: currentUser.role
    };

    axios.put(`${USERS_URL}/${currentUser.id}`, updatedData)
      .then(res => {
        setCurrentUser(res.data);
        setEditing(false);
        alert("Cập nhật thành công!");
      })
      .catch(err => alert("Lỗi khi cập nhật!"));
  };

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc muốn xoá tài khoản này?")) {
      axios.delete(`${USERS_URL}/${currentUser.id}`)
        .then(() => {
          setCurrentUser(null);
          alert("Xoá thành công!");
          navigate("/"); 
        })
        .catch(err => alert("Lỗi khi xoá!"));
    }
  };

  const userContracts = contracts.filter(c => c.userId === currentUser.id);

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : "Không xác định";
  };

  if (!currentUser) return <p>Không có user nào được chọn.</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Thông tin cá nhân</h2>
      <div className="card mb-4">
        <div className="card-body">
          {editing ? (
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Họ và tên</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Avatar URL</label>
                <input
                  type="text"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-12 mt-3">
                <button className="btn btn-primary me-2" onClick={handleSave}>Lưu</button>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Huỷ</button>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-md-6 mb-2">
                <strong>Họ và tên:</strong> {currentUser.name}
              </div>
              <div className="col-md-6 mb-2">
                <strong>Username:</strong> {currentUser.username}
              </div>
              <div className="col-md-6 mb-2">
                {currentUser.avatar && (
                  <img src={currentUser.avatar} alt="avatar" className="img-thumbnail ms-2" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />
                )}
              </div>
              <div className="col-12 mt-3">
                <button className="btn btn-outline-primary me-2" onClick={() => setEditing(true)}>Sửa thông tin</button>
                {currentUser.role !== "admin" && (
                  <button className="btn btn-outline-danger" onClick={handleDelete}>Xoá tài khoản</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chỉ hiển thị hợp đồng nếu user không phải admin */}
      {currentUser.role !== "admin" && (
        <>
          <h2 className="mb-3">Danh sách hợp đồng</h2>
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Mã hợp đồng</th>
                <th>Phòng</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {userContracts.map(contract => (
                <tr key={contract.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/contract-detail/${contract.id}`)}>
                  <td>{contract.id}</td>
                  <td>{getPropertyName(contract.propertyId)}</td>
                  <td>{contract.startDate}</td>
                  <td>{contract.endDate}</td>
                  <td>{contract.status}</td>
                  <td>{contract.totalPrice.toLocaleString()} VND</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
