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

  const propertyAmenitiesOptions = [
    "Wifi", "TV", "Điều hòa", "Máy giặt", "Tủ lạnh", "Bàn làm việc",
    "Bathtub", "Luggage dropoff allowed", "Security camera",
    "Paid dryer", "Washer", "Air conditioning"
  ];
  const propertyStatusOptions = ["available", "rented"];
  const contractStatusOptions = ["pending", "confirmed", "canceled", "paid", "ended"];

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
    const updater = (prev) => prev.map(item => item.id === id ? { ...item, [field]: value } : item);
    if (type === "users") setUsers(updater);
    if (type === "properties") setProperties(updater);
    if (type === "contracts") setContracts(updater);
    setEditing(prev => ({ ...prev, [id]: true }));
  };

  const saveChange = async (item, type) => {
    const dataToSend = { ...item };
    if (type === "properties") dataToSend.createdBy = "admin";

    const url = type === "users" ? USERS_URL : type === "properties" ? PROPERTIES_URL : CONTRACTS_URL;
    await axios.put(`${url}/${item.id}`, dataToSend);

    if (type === "contracts") {
      // update property status
      const property = properties.find(p => p.id === item.propertyId);
      if (property) {
        const newStatus = dataToSend.status === "paid" ? "rented" : "available";
        await axios.put(`${PROPERTIES_URL}/${property.id}`, { ...property, status: newStatus });
        setProperties(prev => prev.map(p => p.id === property.id ? { ...p, status: newStatus } : p));
      }
    }

    setEditing(prev => ({ ...prev, [item.id]: false }));
  };

  const deleteItem = async (id, type) => {
    if (!window.confirm("Bạn có chắc muốn xoá không?")) return;

    if (type === "users") {
      const userToDelete = users.find(u => u.id === id);
      if (userToDelete.role === "admin") return alert("Không thể xoá admin!");
    }

    const url = type === "users" ? USERS_URL : type === "properties" ? PROPERTIES_URL : CONTRACTS_URL;
    await axios.delete(`${url}/${id}`);

    if (type === "users") setUsers(prev => prev.filter(u => u.id !== id));
    if (type === "properties") setProperties(prev => prev.filter(p => p.id !== id));
    if (type === "contracts") setContracts(prev => prev.filter(c => c.id !== id));
  };

  const addNew = async () => {
    const dataToSend = { ...formData };
    if (modalType === "properties") dataToSend.createdBy = "admin";

    Object.entries(dataToSend).forEach(([k, v]) => { if (v === "") dataToSend[k] = null });

    const url = modalType === "users" ? USERS_URL : modalType === "properties" ? PROPERTIES_URL : CONTRACTS_URL;
    const res = await axios.post(url, dataToSend);

    if (modalType === "users") setUsers(prev => [...prev, res.data]);
    if (modalType === "properties") setProperties(prev => [...prev, res.data]);
    if (modalType === "contracts") {
      setContracts(prev => [...prev, res.data]);
      if (dataToSend.status === "paid") {
        const property = properties.find(p => p.id === dataToSend.propertyId);
        if (property) {
          await axios.put(`${PROPERTIES_URL}/${property.id}`, { ...property, status: "rented" });
          setProperties(prev => prev.map(p => p.id === property.id ? { ...p, status: "rented" } : p));
        }
      }
    }
    closeModal();
  };

  const viewDetail = (id, type) => {
    const paths = {
      users: "user-detail",
      properties: "property-detail",
      contracts: "contract-detail",
    };
    navigate(`/${paths[type]}/${id}`);
  };

  const renderCell = (item, k, v, type) => {
    if (!editing[item.id]) return Array.isArray(v) ? v.join(", ") : v?.toString();

    // mapping options for select inputs
    if (type === "properties") {
      if (k === "amenitiesList") {
        return (
          <select multiple className="form-select form-select-sm" value={Array.isArray(v) ? v : []}
            onChange={e => handleChange(item.id, k, Array.from(e.target.selectedOptions).map(o => o.value), type)}>
            {propertyAmenitiesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      }
      if (k === "status") {
        return (
          <select className="form-select form-select-sm" value={v || propertyStatusOptions[0]}
            onChange={e => handleChange(item.id, k, e.target.value, type)}>
            {propertyStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      }
      if (k === "price") {
        return (
          <div className="input-group">
            <input type="number" className="form-control form-control-sm" value={v || 0}
              onChange={e => handleChange(item.id, k, parseInt(e.target.value), type)} />
            <span className="input-group-text">đ</span>
          </div>
        );
      }
    }

    if (type === "contracts") {
      if (k === "userId") {
        return (
          <select className="form-select form-select-sm" value={v || ""}
            onChange={e => handleChange(item.id, k, e.target.value, type)}>
            <option value="">Chọn user</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        );
      }
      if (k === "propertyId") {
        return (
          <select className="form-select form-select-sm" value={v || ""}
            onChange={e => handleChange(item.id, k, e.target.value, type)}>
            <option value="">Chọn property</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        );
      }
      if (k === "status") {
        return (
          <select className="form-select form-select-sm" value={v || "pending"}
            onChange={e => handleChange(item.id, k, e.target.value, type)}>
            {contractStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      }
      if (["startDate", "endDate", "paidAt"].includes(k)) {
        return <input type="date" className="form-control form-control-sm" value={v?.split("T")[0] || ""}
          onChange={e => handleChange(item.id, k, e.target.value, type)} />;
      }
      if (["guests", "totalPrice", "monthlyPayment"].includes(k)) {
        return <input type="number" className="form-control form-control-sm" value={v || 0}
          onChange={e => handleChange(item.id, k, parseInt(e.target.value), type)} />;
      }
    }

    if (type === "users") {
      if (k === "avatar") {
        return <input type="file" className="form-control form-control-sm"
          onChange={e => setUsers(prev => prev.map(u => u.id === item.id ? { ...u, [k]: e.target.files[0] || null } : u))} />;
      }
    }

    return <input type="text" className="form-control form-control-sm" value={v || ""}
      onChange={e => handleChange(item.id, k, e.target.value, type)} />;
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
            {Object.entries(item).map(([k, v]) => <td key={k}>{renderCell(item, k, v, type)}</td>)}
            <td className="text-nowrap">
              <button onClick={() => viewDetail(item.id, type)} className="btn btn-outline-secondary btn-sm me-2">Xem</button>
              {editing[item.id] ? (
                <button onClick={() => saveChange(item, type)} className="btn btn-success btn-sm me-2">Lưu</button>
              ) : (
                <button onClick={() => setEditing(prev => ({ ...prev, [item.id]: true }))} className="btn btn-outline-primary btn-sm me-2">Sửa</button>
              )}
              <button onClick={() => deleteItem(item.id, type)} className="btn btn-outline-danger btn-sm">Xoá</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderModalFields = () => {
    let fields = [];
    if (modalType === "users") fields = ["name", "username", "password", "role", "avatar"];
    if (modalType === "properties") fields = ["name", "description", "address", "price", "status", "image", "amenitiesList"];
    if (modalType === "contracts") fields = ["userId", "propertyId", "startDate", "endDate", "guests", "totalPrice", "monthlyPayment", "paidAt", "status"];

    return fields.map(key => {
      const value = formData[key] || (key === "amenitiesList" ? [] : "");
      const onChange = (val) => setFormData(prev => ({ ...prev, [key]: val }));

      if (modalType === "users" && key === "avatar") {
        return <div className="mb-2" key={key}><input type="file" className="form-control" onChange={e => onChange(e.target.files[0] || null)} /></div>;
      }

      if (modalType === "properties" && key === "amenitiesList") {
        return <div className="mb-2" key={key}>
          <select multiple className="form-select" value={value} onChange={e => onChange(Array.from(e.target.selectedOptions).map(o => o.value))}>
            {propertyAmenitiesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>;
      }

      if (modalType === "properties" && key === "status") {
        return <div className="mb-2" key={key}>
          <select className="form-select" value={value} onChange={e => onChange(e.target.value)}>
            {propertyStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>;
      }

      if (modalType === "properties" && key === "price") {
        return <div className="mb-2 input-group" key={key}>
          <input type="number" className="form-control" value={value} onChange={e => onChange(parseInt(e.target.value))} />
          <span className="input-group-text">đ</span>
        </div>;
      }

      if (modalType === "contracts") {
        if (key === "userId") {
          return <div className="mb-2" key={key}>
            <select className="form-select" value={value} onChange={e => onChange(e.target.value)}>
              <option value="">Chọn user</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>;
        }
        if (key === "propertyId") {
          return <div className="mb-2" key={key}>
            <select className="form-select" value={value} onChange={e => onChange(e.target.value)}>
              <option value="">Chọn property</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>;
        }
        if (key === "status") {
          return <div className="mb-2" key={key}>
            <select className="form-select" value={value} onChange={e => onChange(e.target.value)}>
              {contractStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>;
        }
        if (["startDate", "endDate", "paidAt"].includes(key)) {
          return <div className="mb-2" key={key}>
            <input type="date" className="form-control" value={value} onChange={e => onChange(e.target.value)} />
          </div>;
        }
        if (["guests", "totalPrice", "monthlyPayment"].includes(key)) {
          return <div className="mb-2" key={key}>
            <input type="number" className="form-control" value={value} onChange={e => onChange(parseInt(e.target.value))} />
          </div>;
        }
      }

      if (modalType === "properties" && key === "image") {
        return <div className="mb-2" key={key}><input type="file" className="form-control" onChange={e => onChange(e.target.files[0] || null)} /></div>;
      }

      return <div className="mb-2" key={key}>
        <input type="text" className="form-control" placeholder={key} value={value} onChange={e => onChange(e.target.value)} />
      </div>;
    });
  };

  return (
    <div className="container py-4">
      <style>{`
        .nav-tabs .nav-link { color:#555; transition:0.2s; }
        .nav-tabs .nav-link:hover { background-color:#f6c9d0ff; color:#000; }
        .nav-tabs .nav-link.active { background-color:#ff385c; color:#fff; border-color:#ff385c #ff385c #fff; }
      `}</style>

      <ul className="nav nav-tabs mb-3">
        {["users","properties","contracts"].map(t => (
          <li className="nav-item" key={t}>
            <button className={`nav-link ${tab===t?"active":""}`} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
          </li>
        ))}
      </ul>

      <div className="mb-3">
        <button onClick={()=>openModal(tab)} className="btn btn-outline-success">+ Thêm mới</button>
      </div>

      {tab==="users" && renderTable(users,"users")}
      {tab==="properties" && renderTable(properties,"properties")}
      {tab==="contracts" && renderTable(contracts,"contracts")}

      <ModalWrapper show={modalOpen} handleClose={closeModal} title={`Thêm ${modalType}`}>
        {renderModalFields()}
        <button onClick={addNew} className="btn btn-primary">Lưu</button>
      </ModalWrapper>
    </div>
  );
}
