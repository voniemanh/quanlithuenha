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
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

 useEffect(() => {
  if (!currentUser) {
    navigate("/");
    return;
  }
  const fetchData = async () => {
    try {
      const [propertiesRes, contractsRes] = await Promise.all([
        axios.get(PROPERTIES_URL),
      ]);
      setProperties(propertiesRes.data);
      setContracts(contractsRes.data);
      if (currentUser.role === "admin" || currentUser.id === id) {
        const userRes = await axios.get(`${USERS_URL}/${id}`);
        setUser(userRes.data);
        setEditData(userRes.data);
      } else {
        alert("Bạn không có quyền xem thông tin này");
        navigate("/");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

    fetchData();
  }, [currentUser, id, navigate]);

  const handleSave = () => {
    axios.put(`${USERS_URL}/${user.id}`, { ...editData, role: user.role })
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
      <table className="table-custom">
        <tbody>
          <tr>
            <th>Họ và tên:</th>
            <td>
              {editing ? (
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
          </tr>
          <tr>
            <th>Username:</th>
            <td>
              {editing ? (
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
          </tr>
          <tr>
            <th>Mật khẩu:</th>
            <td>
              {editing ? (
                <input
                  type="password"
                  className="form-control"
                  value={editData.password}
                  onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                />
              ) : (
                "********"
              )}
            </td>
          </tr>
          <tr>
            <th>Avatar</th>
            <td>
              {editing ? (
                <input
                  type="text"
                  className="form-control"
                  value={editData.avatar}
                  onChange={(e) => setEditData({ ...editData, avatar: e.target.value })}
                />
              ) : (
                user.avatar && (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="img-thumbnail"
                    style={{ width: 100, height: 100, borderRadius: "50%" }}
                  />
                )
              )}
            </td>
          </tr>
        </tbody>
      </table>
      <div className="mb-4">
        {editing ? (
          <>
            <button className="btn btn-outline-primary me-2" onClick={handleSave}>Lưu</button>
            <button className="btn btn-outline-secondary" onClick={() => { setEditing(false); setEditData(user); }}>Huỷ</button>
          </>
        ) : (
          <>
            <button className="btn btn-outline-primary me-2" onClick={() => setEditing(true)}>Sửa thông tin</button>
            {user.role !== "admin" && (
              <button className="btn btn-outline-danger" onClick={handleDelete}>Xoá tài khoản</button>
            )}
          </>
        )}
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
              {userContracts.map(c => (
                <tr
                  key={c.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/contract-detail/${c.id}`)}
                >
                  <td>{c.id}</td>
                  <td>{getPropertyName(c.propertyId)}</td>
                  <td>{c.startDate}</td>
                  <td>{c.endDate}</td>
                  <td>{c.status}</td>
                  <td>{c.monthlyPayment.toLocaleString()} VND</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Quay lại</button>
      <style>{`
        .table-custom th,
        .table-custom td {
          border: none !important;
          padding: 4px 8px;
          vertical-align: baseline;
        }

        .table-custom th {
          padding-right: 15px;
          white-space: nowrap;
        }

        .table-custom td {
          padding-left: 0;
        }
        table {
        margin-bottom: 10px;}
      `}</style>
    </div>
  );
}
