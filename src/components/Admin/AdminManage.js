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
  const contractStatusOptions = ["pending","confirmed","canceled","paid","ended"];

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
    const dataToSend = { ...item };
    if (type === "properties") dataToSend.createdBy = "admin";

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
      const property = properties.find(p => p.id === item.propertyId);
      if(property){
        const newStatus = dataToSend.status === "paid" ? "rented" : "available";
        await axios.put(`${PROPERTIES_URL}/${property.id}`, { ...property, status: newStatus });
        setProperties(prev => prev.map(p => p.id === property.id ? { ...p, status: newStatus } : p));
      }
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
    const dataToSend = { ...formData };
    if (modalType === "properties") dataToSend.createdBy = "admin";

    Object.entries(dataToSend).forEach(([k,v]) => { if(v === "") dataToSend[k]=null });

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
      // Update property status nếu paid
      if(dataToSend.status === "paid"){
        const property = properties.find(p=>p.id===dataToSend.propertyId);
        if(property){
          await axios.put(`${PROPERTIES_URL}/${property.id}`, {...property,status:"rented"});
          setProperties(prev=>prev.map(p=>p.id===property.id?{...p,status:"rented"}:p));
        }
      }
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
            {Object.entries(item).map(([k,v]) => (
              <td key={k}>
                {editing[item.id] ? (
                  type === "contracts" ? (
                    k === "userId" ? (
                      <select className="form-select form-select-sm" value={v||""} onChange={e=>handleChange(item.id,k,e.target.value,type)}>
                        <option value="">Chọn user</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    ) : k === "propertyId" ? (
                      <select className="form-select form-select-sm" value={v||""} onChange={e=>handleChange(item.id,k,e.target.value,type)}>
                        <option value="">Chọn property</option>
                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    ) : k === "status" ? (
                      <select className="form-select form-select-sm" value={v||"pending"} onChange={e=>handleChange(item.id,k,e.target.value,type)}>
                        {contractStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : k==="startDate"||k==="endDate"||k==="paidAt" ? (
                      <input type="date" className="form-control form-control-sm" value={v?.split("T")[0]||""} onChange={e=>handleChange(item.id,k,e.target.value,type)} />
                    ) : ["guests","totalPrice","monthlyPayment"].includes(k) ? (
                      <input type="number" className="form-control form-control-sm" value={v||0} onChange={e=>handleChange(item.id,k,parseInt(e.target.value),type)} />
                    ) : (
                      <input type="text" className="form-control form-control-sm" value={v||""} onChange={e=>handleChange(item.id,k,e.target.value,type)} />
                    )
                  ) : type==="users" ? (
                    <input type={k==="avatar"?"file":"text"} className="form-control form-control-sm" value={k==="avatar"?undefined:v||""} onChange={e=>{
                      if(k==="avatar") setUsers(prev=>prev.map(u=>u.id===item.id?{...u,[k]:e.target.files[0]||null}:u))
                      else handleChange(item.id,k,e.target.value,type)
                    }} />
                  ) : type==="properties" ? (
                    k==="amenitiesList" ? (
                      <select multiple className="form-select form-select-sm" value={v||[]} onChange={e=>{
                        const selected = Array.from(e.target.selectedOptions).map(o=>o.value);
                        handleChange(item.id,k,selected,type);
                      }}>
                        {propertyAmenitiesOptions.map(opt=><option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : k==="status" ? (
                      <select className="form-select form-select-sm" value={v||propertyStatusOptions[0]} onChange={e=>handleChange(item.id,k,e.target.value,type)}>
                        {propertyStatusOptions.map(opt=><option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : k==="price" ? (
                      <div className="input-group">
                        <input type="number" className="form-control form-control-sm" value={v||0} onChange={e=>handleChange(item.id,k,parseInt(e.target.value),type)} />
                        <span className="input-group-text">đ</span>
                      </div>
                    ) : (
                      <input type="text" className="form-control form-control-sm" value={v||""} onChange={e=>handleChange(item.id,k,e.target.value,type)} />
                    )
                  ) : (
                    Array.isArray(v)?v.join(", "):v?.toString()
                  )
                ) : (
                  Array.isArray(v)?v.join(", "):v?.toString()
                )}
              </td>
            ))}
            <td className="text-nowrap">
              <button onClick={()=>viewDetail(item.id,type)} className="btn btn-outline-secondary btn-sm me-2">Xem</button>
              {editing[item.id] ? (
                <button onClick={()=>saveChange(item,type)} className="btn btn-success btn-sm me-2">Lưu</button>
              ) : (
                <button onClick={()=>setEditing({...editing,[item.id]:true})} className="btn btn-outline-primary btn-sm me-2">Sửa</button>
              )}
              <button onClick={()=>deleteItem(item.id,type)} className="btn btn-outline-danger btn-sm">Xoá</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container py-4">
      <style>{`
        .nav-tabs .nav-link { color:#555; transition:0.2s; }
        .nav-tabs .nav-link:hover { background-color:#f6c9d0ff; color:#000; }
        .nav-tabs .nav-link.active { background-color:#ff385c; color:#fff; border-color:#ff385c #ff385c #fff; }
      `}</style>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${tab==="users"?"active":""}`} onClick={()=>setTab("users")}>Users</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab==="properties"?"active":""}`} onClick={()=>setTab("properties")}>Properties</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab==="contracts"?"active":""}`} onClick={()=>setTab("contracts")}>Contracts</button>
        </li>
      </ul>

      <div className="mb-3">
        {(tab==="users"||tab==="properties"||tab==="contracts") &&
          <button onClick={()=>openModal(tab)} className="btn btn-outline-success">+ Thêm mới</button>
        }
      </div>

      {tab==="users" && renderTable(users,"users")}
      {tab==="properties" && renderTable(properties,"properties")}
      {tab==="contracts" && renderTable(contracts,"contracts")}

      <ModalWrapper show={modalOpen} handleClose={closeModal} title={`Thêm ${modalType}`}>
        {(() => {
          let fields = [];
          if(modalType==="users") fields = ["name","username","password","role","avatar"];
          if(modalType==="properties") fields = ["name","description","address","price","status","image","amenitiesList"];
          if(modalType==="contracts") fields = ["userId","propertyId","startDate","endDate","guests","totalPrice","monthlyPayment","paidAt","status"];

          return fields.map(key => (
            <div className="mb-2" key={key}>
              {modalType==="users" && key==="avatar" ? (
                <input type="file" className="form-control" onChange={e=>setFormData({...formData,[key]:e.target.files[0]||null})} />
              ) : modalType==="properties" && key==="amenitiesList" ? (
                <select multiple className="form-select" value={formData[key]||[]} onChange={e=>{
                  const selected = Array.from(e.target.selectedOptions).map(o=>o.value);
                  setFormData({...formData,[key]:selected});
                }}>
                  {propertyAmenitiesOptions.map(opt=><option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : modalType==="properties" && key==="status" ? (
                <select className="form-select" value={formData[key]||propertyStatusOptions[0]} onChange={e=>setFormData({...formData,[key]:e.target.value})}>
                  {propertyStatusOptions.map(opt=><option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : modalType==="properties" && key==="price" ? (
                <div className="input-group">
                  <input type="number" className="form-control" value={formData[key]||0} onChange={e=>setFormData({...formData,[key]:parseInt(e.target.value)})} />
                  <span className="input-group-text">đ</span>
                </div>
              ) : modalType==="contracts" && key==="userId" ? (
                <select className="form-select" value={formData[key]||""} onChange={e=>setFormData({...formData,[key]:e.target.value})}>
                  <option value="">Chọn user</option>
                  {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              ) : modalType==="contracts" && key==="propertyId" ? (
                <select className="form-select" value={formData[key]||""} onChange={e=>setFormData({...formData,[key]:e.target.value})}>
                  <option value="">Chọn property</option>
                  {properties.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              ) : modalType==="contracts" && (key==="startDate"||key==="endDate"||key==="paidAt") ? (
                <input type="date" className="form-control" value={formData[key]||""} onChange={e=>setFormData({...formData,[key]:e.target.value})} />
              ) : modalType==="contracts" && ["guests","totalPrice","monthlyPayment"].includes(key) ? (
                <input type="number" className="form-control" value={formData[key]||0} onChange={e=>setFormData({...formData,[key]:parseInt(e.target.value)})} />
              ) : modalType==="contracts" && key==="status" ? (
                <select className="form-select" value={formData[key]||"pending"} onChange={e=>setFormData({...formData,[key]:e.target.value})}>
                  {contractStatusOptions.map(opt=><option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : modalType==="properties" && key==="image" ? (
                <input type="file" className="form-control" onChange={e=>setFormData({...formData,[key]:e.target.files[0]||null})} />
              ) : (
                <input type="text" className="form-control" placeholder={key} value={formData[key]||""} onChange={e=>setFormData({...formData,[key]:e.target.value})} />
              )}
            </div>
          ));
        })()}
        <button onClick={addNew} className="btn btn-primary">Lưu</button>
      </ModalWrapper>
    </div>
  );
}
