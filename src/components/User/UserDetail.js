import React, { useEffect, useState } from "react";
import { useUser } from "../Context/UserContext";
import axios from "axios";
import { USERS_URL, PROPERTIES_URL, CONTRACTS_URL } from "../../config";
import { useNavigate, useParams } from "react-router-dom";

export default function UserDetail() {
  const { id } = useParams(); 
  const { currentUser, setCurrentUser } = useUser();
  const [user, setUser] = useState(null);
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
    if (!currentUser) {
      navigate("/");
      return;
    }

    axios.get(PROPERTIES_URL).then(res => setProperties(res.data));
    axios.get(CONTRACTS_URL).then(res => setContracts(res.data));

    if (currentUser.role === "admin" || currentUser.id === id) {
      axios.get(`${USERS_URL}/${id}`).then(res => {
        setUser(res.data);
        setFormData({
          name: res.data.name,
          username: res.data.username,
          password: res.data.password,
          avatar: res.data.avatar || ""
        });
      });
    } else {
      alert("Bạn không có quyền xem thông tin này");
      navigate("/");
    }
  }, [currentUser, id, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    const updatedData = {
      ...formData,
      role: user.role
    };

    axios.put(`${USERS_URL}/${user.id}`, updatedData)
      .then(res => {
        if (currentUser.id === user.id) setCurrentUser(res.data);
        setUser(res.data);
        setEditing(false);
        alert("Cập nhật thành công!");
      })
      .catch(() => alert("Lỗi khi cập nhật!"));
  };

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc muốn xoá tài khoản này?")) {
      axios.delete(`${USERS_URL}/${user.id}`)
        .then(() => {
          if (currentUser.id === user.id) setCurrentUser(null);
          alert("Xoá thành công!");
          navigate("/"); 
        })
        .catch(() => alert("Lỗi khi xoá!"));
    }
  };

  if (!user) return <p>Đang tải...</p>;

  const userContracts = contracts.filter(c => c.userId === user.id);
  const getPropertyName = (propertyId) => properties.find(p => p.id === propertyId)?.name || "Không xác định";

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Thông tin cá nhân</h2>
      <div className="card mb-4">
        <div className="card-body">
          {editing ? (
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Họ và tên</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control"/>
              </div>
              <div className="col-md-6">
                <label className="form-label">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className="form-control"/>
              </div>
              <div className="col-md-6">
                <label className="form-label">Mật khẩu</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control"/>
              </div>
              <div className="col-md-6">
                <label className="form-label">Avatar URL</label>
                <input type="text" name="avatar" value={formData.avatar} onChange={handleChange} className="form-control"/>
              </div>
              <div className="col-12 mt-3">
                <button className="btn btn-outline-primary me-2" onClick={handleSave}>Lưu</button>
                <button className="btn btn-outline-secondary" onClick={() => setEditing(false)}>Huỷ</button>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-md-6 mb-2"><strong>Họ và tên:</strong> {user.name}</div>
              <div className="col-md-6 mb-2"><strong>Username:</strong> {user.username}</div>
              <div className="col-md-6 mb-2">
                {user.avatar && <img src={user.avatar} alt="avatar" className="img-thumbnail ms-2" style={{ width: "100px", height: "100px", borderRadius: "50%" }}/>}
              </div>
              <div className="col-12 mt-3">
                <button className="btn btn-outline-primary me-2" onClick={() => setEditing(true)}>Sửa thông tin</button>
                {user.role !== "admin" && <button className="btn btn-outline-danger" onClick={handleDelete}>Xoá tài khoản</button>}
              </div>
            </div>
          )}
        </div>
      </div>

      {user.role !== "admin" && (
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
                  <td>{contract.monthlyPayment.toLocaleString()} VND</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Quay lại</button>
    </div>
  );
}
