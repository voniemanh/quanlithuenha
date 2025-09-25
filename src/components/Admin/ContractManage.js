import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import { CONTRACTS_URL, USERS_URL, PROPERTIES_URL } from "../../config";
import { checkAvailable } from "../util/CheckAvailable";
import { checkConflict } from "../util/CheckConflict";
import ModalWrapper from "../Modal/ModalWrapper";

export default function ContractManage() {
  const [contracts, setContracts] = useState([]);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      userId: "",
      propertyId: "",
      startDate: "",
      endDate: "",
      guests: 1,
      status: "pending",
      payment: 0,
      paidAt: "",
    },
  });

  const calculatePayment = (propertyPrice = 0, guests = 1, startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end) || end <= start) return 0;

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Math.round((propertyPrice / 30) * guests * days);
  };

  const fetchData = async () => {
    try {
      const [resContracts, resUsers, resProperties] = await Promise.all([
        axios.get(CONTRACTS_URL),
        axios.get(USERS_URL),
        axios.get(PROPERTIES_URL),
      ]);
      setContracts(resContracts.data);
      setUsers(resUsers.data);
      setProperties(resProperties.data);
    } catch {
      alert("Lỗi khi tải dữ liệu!");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!editingId) return;

    const property = properties.find((p) => p.id === editData.propertyId);
    const price = property?.price || 0;
    const oncePayment = calculatePayment(price, editData.guests || 1, editData.startDate, editData.endDate);

    setEditData((prev) => ({ ...prev, payment: oncePayment }));
  }, [editData.startDate, editData.endDate, editData.guests, editData.propertyId, properties, editingId]);

  const modalPayment = useMemo(() => {
    const property = properties.find((p) => p.id === watch("propertyId"));
    const price = property?.price || 0;
    return calculatePayment(price, watch("guests") || 1, watch("startDate"), watch("endDate"));
  }, [watch("propertyId"), watch("startDate"), watch("endDate"), watch("guests"), properties]);

  useEffect(() => {
    setValue("payment", modalPayment);
  }, [modalPayment, setValue]);

  const validateContract = (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const user = users.find((u) => u.id === data.userId);
    const property = properties.find((p) => p.id === data.propertyId);

    if (!user) { alert("Người thuê không tồn tại!"); return false; }
    if (!property) { alert("Bất động sản không tồn tại!"); return false; }
    if (start > end) { alert("Ngày bắt đầu phải trước ngày kết thúc!"); return false; }
    if (data.guests < 1 || data.guests > 3) { alert("Số khách phải từ 1 đến 3 người!"); return false; }
    if ((data.status === "paid" || data.status === "completed") && !data.paidAt) { alert("Vui lòng chọn ngày thanh toán!"); return false; }
    if (data.status === "paid" || data.status === "confirmed") {
      if (checkConflict(contracts, data.propertyId, data.startDate, data.endDate, editingId)) {
        alert("Phòng đã được thuê trong khoảng thời gian này!");
        return false;
      }
    }
    return true;
  };

  const handleSave = async (data) => {
    if (!validateContract(data)) return;

    try {
      await axios.put(`${CONTRACTS_URL}/${editingId}`, data);

      const property = properties.find((p) => p.id === data.propertyId);
      if (property) {
        const newStatus = checkAvailable({ ...data, id: editingId });
        if (property.status !== newStatus) {
          await axios.put(`${PROPERTIES_URL}/${property.id}`, { ...property, status: newStatus });
        }
      }

      setEditingId(null);
      setEditData({});
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu hợp đồng!");
    }
  };

  const onSubmit = async (data) => {
    if (!validateContract(data)) return;

    try {
      let savedId = editingId;

      if (editingId) {
        await axios.put(`${CONTRACTS_URL}/${editingId}`, data);
      } else {
        const res = await axios.post(CONTRACTS_URL, data);
        savedId = res.data.id;
      }

      const property = properties.find((p) => p.id === data.propertyId);
      if (property) {
        const newStatus = checkAvailable({ ...data, id: savedId });
        if (property.status !== newStatus) {
          await axios.put(`${PROPERTIES_URL}/${property.id}`, { ...property, status: newStatus });
        }
      }

      setEditingId(null);
      setModalOpen(false);
      reset();
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu hợp đồng!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa hợp đồng này?")) {
      try {
        await axios.delete(`${CONTRACTS_URL}/${id}`);
        setContracts(prev => prev.filter(c => c.id !== id));
      } catch {
        alert("Lỗi khi xóa hợp đồng!");
      }
    }
  };

  const viewDetail = (id) => navigate(`/contract-detail/${id}`);

  return (
    <div className="container mt-4">
      <button
        className="btn-outline-black mb-3"
        onClick={() => {
          reset();
          setEditingId(null);
          setModalOpen(true);
        }}
      >
        + Thêm hợp đồng
      </button>
       <div style={{ overflowX: "auto" }}>
        <table className="table table-bordered table-hover">
          <thead className="table-secondary text-center align-top">
            <tr>
              <th>ID</th>
              <th>Người thuê</th>
              <th>Bất động sản</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Khách</th>
              <th>Giá phòng gốc</th>
              <th>Số tiền phải trả</th>
              <th>Trạng thái</th>
              <th>Ngày thanh toán</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => {
              const user = users.find((u) => u.id === c.userId);
              const property = properties.find((p) => p.id === c.propertyId);
              const isEditing = editingId === c.id;

              return (
                <tr key={c.id} className="text-center align-middle">
                  <td>{c.id}</td>
                  <td>
                    {isEditing ? (
                      <select
                        className="form-select"
                        value={editData.userId}
                        onChange={(e) => setEditData({ ...editData, userId: e.target.value })}
                      >
                        <option value="">Chọn người thuê</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    ) : (user?.name || "Người thuê bị xóa")}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        className="form-select"
                        value={editData.propertyId}
                        onChange={(e) => setEditData({ ...editData, propertyId: e.target.value })}
                      >
                        <option value="">Chọn BĐS</option>
                        {properties.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    ) : (property?.name || "BĐS bị xóa")}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="date"
                        className="form-control"
                        value={editData.startDate}
                        onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                      />
                    ) : c.startDate}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="date"
                        className="form-control"
                        value={editData.endDate}
                        onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                      />
                    ) : c.endDate}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        className="form-control"
                        value={editData.guests}
                        onChange={(e) => setEditData({ ...editData, guests: Number(e.target.value) })}
                      />
                    ) : c.guests}
                  </td>
                  <td>{property?.price}</td>
                  <td>{isEditing ? editData.payment : calculatePayment(property?.price, c.guests, c.startDate, c.endDate)}</td>
                  <td>
                    {isEditing ? (
                      <select
                        className="form-select"
                        value={editData.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="paid">Paid</option>
                        <option value="canceled">Canceled</option>
                        <option value="completed">Completed</option>
                      </select>
                    ) : c.status}
                  </td>
                  <td>
                    {isEditing ? (
                      (editData.status === "paid" || editData.status === "completed") ? (
                        <input
                          type="date"
                          className="form-control"
                          value={editData.paidAt || ""}
                          onChange={(e) => setEditData({ ...editData, paidAt: e.target.value })}
                        />
                      ) : "Chưa thanh toán"
                    ) : (c.paidAt || "Chưa thanh toán")}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <button 
                          className="btn btn-outline-primary btn-sm me-1" 
                          onClick={() => handleSave(editData)}>
                          Lưu
                        </button>
                        <button 
                          className="btn btn-outline-secondary btn-sm" 
                          onClick={() => setEditingId(null)}>
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="btn btn-outline-success btn-sm me-1" 
                          onClick={() => viewDetail(c.id)}>
                          Xem
                        </button>
                        <button 
                          className="btn btn-outline-warning btn-sm me-1" 
                          onClick={() => {
                            setEditingId(c.id);
                            setEditData({ ...c });
                          }} 
                          disabled={modalOpen}>
                          Sửa
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm" 
                          onClick={() => handleDelete(c.id)} 
                          disabled={modalOpen}>
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
      </div>
      {/* Modal thêm hợp đồng */}
      <ModalWrapper show={modalOpen} handleClose={() => setModalOpen(false)} title="Thêm hợp đồng">
        <form id="contractForm" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-2">
            <label className="form-label">Người thuê</label>
            <select className="form-select" {...register("userId", { required: true })}>
              <option value="">Chọn người thuê</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="form-label">Bất động sản</label>
            <select className="form-select" {...register("propertyId", { required: true })}>
              <option value="">Chọn BĐS</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="form-label">Ngày bắt đầu</label>
            <input type="date" className="form-control" {...register("startDate", { required: true })}/>
          </div>
          <div className="mb-2">
            <label className="form-label">Ngày kết thúc</label>
            <input type="date" className="form-control" {...register("endDate", { required: true })}/>
          </div>
          <div className="mb-2">
            <label className="form-label">Số khách</label>
            <input type="number" className="form-control" {...register("guests", { min:1, max:3 })} min={1} max={3}/>
          </div>
          <div className="mb-2">
            <label className="form-label">Giá tiền phòng cơ bản</label>
            <input
              type="number"
              className="form-control"
              value={properties.find((p) => p.id === watch("propertyId"))?.price || 0}
              min={0}
              readOnly
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Số tiền phải trả</label>
            <input type="number" className="form-control" {...register("payment")} value={modalPayment} readOnly/>
          </div>
          <div className="mb-2">
            <label className="form-label">Trạng thái</label>
            <select className="form-select" {...register("status")}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="paid">Paid</option>
              <option value="canceled">Canceled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          {(watch("status") === "paid" || watch("status") === "completed") && (
            <div className="mb-2">
              <label className="form-label">Ngày thanh toán</label>
              <input type="date" className="form-control" {...register("paidAt")}/>
            </div>
          )}
          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setModalOpen(false)}>Hủy</button>
            <button type="submit" className="btn btn-outline-primary">Lưu</button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
}
