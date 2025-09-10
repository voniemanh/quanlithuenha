import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { USERS_URL, PROPERTIES_URL, CONTRACTS_URL } from "../../config";
import ModalWrapper from "../../components/Modal/ModalWrapper";

export default function AdminManage() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editing, setEditing] = useState({});
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(USERS_URL).then(res => setUsers(res.data));
    axios.get(PROPERTIES_URL).then(res => setProperties(res.data));
    axios.get(CONTRACTS_URL).then(res => setContracts(res.data));
  }, []);

  const openModal = (type) => {
    setModalType(type);
    setFormData({});
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (id, field, value, type) => {
    if (field === "amenitiesList" && typeof value === "string") {
      value = value.split(",").map(a => a.trim());
    }
    if (type === "users") setUsers(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u));
    if (type === "properties") setProperties(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    if (type === "contracts") setContracts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    setEditing({ ...editing, [id]: true });
  };

  const saveChange = async (item, type) => {
    const dataToSend = {};
    Object.entries(item).forEach(([key, value]) => {
      dataToSend[key] = value === "" ? null : value;
    });

    if (type === "users") {
      await axios.put(`${USERS_URL}/${item.id}`, dataToSend);
      setEditing({ ...editing, [item.id]: false });
    }
    if (type === "properties") {
      await axios.put(`${PROPERTIES_URL}/${item.id}`, dataToSend);
      setEditing({ ...editing, [item.id]: false });
    }
    if (type === "contracts") {
      await axios.put(`${CONTRACTS_URL}/${item.id}`, dataToSend);
      setEditing({ ...editing, [item.id]: false });
    }
  };

  const deleteItem = async (id, type) => {
    if (!window.confirm("Bạn có chắc muốn xoá không?")) return;

    if (type === "users") {
      const userToDelete = users.find(u => u.id === id);
      if (userToDelete.role === "admin") {
        alert("Không thể xoá admin!");
        return; 
      }
      await axios.delete(`${USERS_URL}/${id}`);
      setUsers(users.filter(u => u.id !== id));
    }

    if (type === "properties") {
      await axios.delete(`${PROPERTIES_URL}/${id}`);
      setProperties(properties.filter(p => p.id !== id));
    }

    if (type === "contracts") {
      await axios.delete(`${CONTRACTS_URL}/${id}`);
      setContracts(contracts.filter(c => c.id !== id));
    }
  };


  const addNew = async () => {
    const dataToSend = {};
    Object.entries(formData).forEach(([key, value]) => {
      dataToSend[key] = value === "" ? null : value;
    });

    if (modalType === "users") {
      const res = await axios.post(USERS_URL, dataToSend);
      setUsers([...users, res.data]);
    }
    if (modalType === "properties") {
      const res = await axios.post(PROPERTIES_URL, dataToSend);
      setProperties([...properties, res.data]);
    }
    if (modalType === "contracts") {
      const res = await axios.post(CONTRACTS_URL, dataToSend);
      setContracts([...contracts, res.data]);
    }
    closeModal();
  };

  const viewDetail = (id, type) => {
    if (type === "users") navigate(`/user-detail/${id}`);
    if (type === "properties") navigate(`/property-detail/${id}`);
    if (type === "contracts") navigate(`/contract-detail/${id}`);
  };

  const renderTable = (items, type) => (
    <table className="table table-bordered table-hover">
      <thead className="table-light">
        <tr>
          {Object.keys(items[0] || {}).map(k => <th key={k}>{k}</th>)}
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            {Object.entries(item).map(([k, v]) => (
              <td key={k}>
                {editing[item.id] ? (
                  <input
                    value={Array.isArray(v) ? v.join(", ") : v || ""}
                    onChange={e => handleChange(item.id, k, e.target.value, type)}
                    className="form-control form-control-sm"
                  />
                ) : (
                  Array.isArray(v) ? v.join(", ") : v?.toString()
                )}
              </td>
            ))}
            <td className="text-nowrap">
              <button onClick={() => viewDetail(item.id, type)} className="btn btn-outline-secondary btn-sm me-2">Xem</button>
              {editing[item.id] ? (
                <button onClick={() => saveChange(item, type)} className="btn btn-success btn-sm me-2">Lưu</button>
              ) : (
                <button onClick={() => setEditing({ ...editing, [item.id]: true })} className="btn btn-outline-primary btn-sm me-2">Sửa</button>
              )}
              <button onClick={() => deleteItem(item.id, type)} className="btn btn-outline-danger btn-sm">Xoá</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container py-4">
      <style>
        {`
          .nav-tabs .nav-link {
            color: #555;
            transition: 0.2s;
          }
          .nav-tabs .nav-link:hover {
            background-color: #f6c9d0ff;
            color: #000;
          }
          .nav-tabs .nav-link.active {
            background-color: #ff385c;
            color: #fff;
            border-color: #ff385c #ff385c #fff;
          }
        `}
      </style>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>Users</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === "properties" ? "active" : ""}`} onClick={() => setTab("properties")}>Properties</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === "contracts" ? "active" : ""}`} onClick={() => setTab("contracts")}>Contracts</button>
        </li>
      </ul>

      <div className="mb-3">
        <button onClick={() => openModal(tab)} className="btn btn-outline-success">+ Thêm mới</button>
      </div>

      {tab === "users" && renderTable(users, "users")}
      {tab === "properties" && renderTable(properties, "properties")}
      {tab === "contracts" && renderTable(contracts, "contracts")}

      <ModalWrapper show={modalOpen} handleClose={closeModal} title={`Thêm ${modalType}`}>
        {(() => {
          let fields = [];
          if (modalType === "users") fields = ["name", "username", "password", "role", "avatar"];
          if (modalType === "properties") fields = ["name", "description", "address", "price", "status", "createdBy", "image", "amenitiesList"];
          if (modalType === "contracts") fields = ["userId", "propertyId", "startDate", "endDate", "guests", "totalPrice", "status", "monthlyPayment", "paidAt"];
          return fields.map(key => (
            <div className="mb-2" key={key}>
              <input
                type="text"
                className="form-control"
                placeholder={key}
                value={formData[key] || ""}
                onChange={e => {
                  let value = e.target.value;
                  if (key === "amenitiesList") {
                    value = value.split(",").map(a => a.trim());
                  }
                  setFormData({ ...formData, [key]: value });
                }}
              />
            </div>
          ));
        })()}
        <button onClick={addNew} className="btn btn-primary">Lưu</button>
      </ModalWrapper>
    </div>
  );
}
