import React, { useEffect, useState } from "react";
import { useUser } from "../Context/UserContext";
import { useAlert } from "../Context/AlertContext";
import axios from "axios";
import { USERS_URL, PROPERTIES_URL, CONTRACTS_URL } from "../../config";
import { useNavigate, useParams } from "react-router-dom";

export default function UserDetail() {
  const { id } = useParams(); 
  const { currentUser, setCurrentUser } = useUser();
  const { showAlert, showConfirm } = useAlert();
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
        axios.get(CONTRACTS_URL)
      ]);
      setProperties(propertiesRes.data);
      setContracts(contractsRes.data);
      if (currentUser.role === "admin" || currentUser.id === id) {
        const userRes = await axios.get(`${USERS_URL}/${id}`);
        setUser(userRes.data);
        setEditData(userRes.data);
      } else {
        showAlert("Bạn không có quyền xem thông tin này", "warning");
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
        showAlert("Cập nhật thành công!", "success");
      })
      .catch(() => showAlert("Lỗi khi cập nhật!", "error"));
  };

  const handleDelete = async () => {
    const confirm = await showConfirm("Bạn có chắc muốn xoá tài khoản này?");
    if (confirm) {
      axios.delete(`${USERS_URL}/${user.id}`)
        .then(() => {
          if (currentUser.id === user.id) setCurrentUser(null);
          showAlert("Xoá thành công!", "success");
          navigate("/");
        })
        .catch(() => showAlert("Lỗi khi xoá!", "error"));
    }
  };

  if (!user) return <p>Đang tải...</p>;

  const userContracts = contracts.filter(c => c.userId === user.id);
  const getPropertyName = (propertyId) => properties.find(p => p.id === propertyId)?.name || "Không xác định";

  const savedList = user.likeProperties
  ?.map(id => properties.find(p => p.id === id))
  .filter(Boolean) || [];

  return (
    <div className="container mt-4 fade-in">
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
                    style={{ width: 70, height: 70, borderRadius: "50%" }}
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
            <button className="btn-outline-pink me-2 mt-3" onClick={() => setEditing(true)}>Sửa thông tin</button>
            {user.role !== "admin" && (
              <button className="btn btn-outline-danger" onClick={handleDelete}>Xoá tài khoản</button>
            )}
          </>
        )}
      </div>
      <div>
        <h2 className="mb-3 mt-5">Danh sách hợp đồng</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="table table-hover table-bordered mt-2">
            <thead className="align-top text-center table-secondary">
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
                  <td>{c.payment.toLocaleString()} VND</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <h2 className="mb-3 mt-5">List phòng đã lưu</h2>
      <div className="saved-properties-scroll mb-5 mt-3">
        {savedList.length > 0 ? (
          <>
            <button
              className="scroll-btn left"
              onClick={() => {
                document.querySelector(".saved-properties-scroll-inner").scrollBy({ left: -220, behavior: "smooth" });
              }}
            >
              {'<'}
            </button>
            <div className="saved-properties-scroll-inner">
              {user.likeProperties.map((propertyId) => {
                const property = properties.find(p => p.id === propertyId);
                if (!property) return null;
                return (
                  <div key={property.id} className="property-card" onClick={() => navigate(`/property-detail/${property.id}`)}>
                    <div className="property-img-wrapper">
                      <img src={property.image} alt={property.name} />
                      <div className="property-info">
                        <p className="property-name">{property.name}</p>
                        <p className="property-price">{property.price.toLocaleString()} VND / tháng</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              className="scroll-btn right"
              onClick={() => {
                document.querySelector(".saved-properties-scroll-inner").scrollBy({ left: 220, behavior: "smooth" });
              }}
            >
              {'>'}
            </button>
          </>
        ) : (
          <p>Chưa có phòng nào được lưu.</p>
        )}
      </div>
      <button className="btn-outline-black" onClick={() => navigate(-1)}>← Back</button>
      <style>
        {`
        .saved-properties-scroll {
          position: relative;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          overflow: visible;
        }

        .saved-properties-scroll-inner {
          display: flex;
          overflow-x: auto;
          white-space: nowrap;
          scroll-behavior: smooth;
          scrollbar-width: none; 
          -ms-overflow-style: none;
        }

        .saved-properties-scroll-inner::-webkit-scrollbar {
          display: none; 
        }

        .property-card {
          margin-right: 15px;
          flex: 0 0 200px; 
        }
        .property-card:last-child {
          margin-right: 0!important;
        }
        .property-img-wrapper {
          position: relative;
        }

        .property-img-wrapper img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }

        .property-info {
          position: absolute;
          bottom: 0;
          width: 100%;
          background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
          color: #fff;
          padding: 10px;
          box-sizing: border-box;
        }

        .property-name {
          font-weight: bold;
          font-size: 14px;
        }

        .property-price {
          font-size: 12px;
        }
        .scroll-btn {
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          border: none;
          background-color:  rgba(0,0,0,0.6);
          font-size: 20px;
          cursor: pointer;
          z-index: 10;
          color: white;
          flex: 0 0 auto;
          opacity: 0.7;
        }
        .scroll-btn:hover {
          background-color: rgba(0,0,0,0.8);
          transform: scale(1.1);
          transition: all 0.3s ease-in-out;
        }

        .scroll-btn.left {
          left: 0;
          margin-right: 10px;
        }

        .scroll-btn.right {
          right: 0;
          margin-left: 10px;
        }
      `}
    </style>

    </div>
  );
}