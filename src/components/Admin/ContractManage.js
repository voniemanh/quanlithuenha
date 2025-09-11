import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm, useWatch } from "react-hook-form";
import { CONTRACTS_URL, USERS_URL, PROPERTIES_URL } from "../../config";

export default function ContractManage() {
  const [contracts, setContracts] = useState([]);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, setValue, control } = useForm({
    defaultValues: {
      userId: "",
      propertyId: "",
      startDate: "",
      endDate: "",
      guests: 1,
      monthlyPayment: 0,
      totalPrice: 0,
      status: "pending",
      paidAt: ""
    }
  });

  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });
  const guests = useWatch({ control, name: "guests" });
  const monthlyPayment = useWatch({ control, name: "monthlyPayment" });
  const status = useWatch({ control, name: "status" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resContracts, resUsers, resProperties] = await Promise.all([
          axios.get(CONTRACTS_URL),
          axios.get(USERS_URL),
          axios.get(PROPERTIES_URL)
        ]);
        setContracts(resContracts.data);
        setUsers(resUsers.data);
        setProperties(resProperties.data);
      } catch {
        alert("Lỗi khi tải dữ liệu!");
      }
    };
    fetchData();
  }, []);

useEffect(() => {
  if (startDate && endDate && monthlyPayment >= 0 && guests >= 1) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setValue("totalPrice", 0);
      return;
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = Math.round((monthlyPayment / 30) * guests * days);

    setValue("totalPrice", totalPrice);
  } else {
    setValue("totalPrice", 0);
  }
}, [startDate, endDate, guests, monthlyPayment, setValue]);
 

  const validateContract = (data) => {
    const now = new Date();
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (!users.find(u => u.id === data.userId)) {
      alert("Người thuê không tồn tại!");
      return false;
    }
    if (!properties.find(p => p.id === data.propertyId)) {
      alert("Bất động sản không tồn tại!");
      return false;
    }
    if (start > end) {
      alert("Ngày kết thúc phải sau ngày bắt đầu!");
      return false;
    }
    if (data.guests < 1 || data.guests > 3) {
      alert("Số khách phải từ 1 đến 3 người!");
      return false;
    }
    if (data.monthlyPayment < 0) {
      alert("Tiền thuê/tháng không được âm!");
      return false;
    }
    if (data.status === "paid" && !data.paidAt) {
      alert("Vui lòng chọn ngày thanh toán khi đã thanh toán!");
      return false;
    }
    return true;
  };

  const onSubmit = async (data) => {
    if (!validateContract(data)) return;
    try {
      if (editingId) {
        await axios.put(`${CONTRACTS_URL}/${editingId}`, data);
        setEditingId(null);
      } else {
        await axios.post(CONTRACTS_URL, data);
      }
      setModalOpen(false);
      reset();
      const resContracts = await axios.get(CONTRACTS_URL);
      setContracts(resContracts.data);
    } catch {
      alert("Lỗi khi lưu hợp đồng!");
    }
  };

  const handleEdit = (contract) => {
    const user = users.find(u => u.id === contract.userId);
    const property = properties.find(p => p.id === contract.propertyId);
    if (!user || !property) {
      alert("Hợp đồng này không hợp lệ vì người thuê hoặc bất động sản đã bị xóa!");
      return;
    }
    setEditingId(contract.id);
    reset(contract);
    setModalOpen(true);
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
        className="btn-pink mb-3"
        onClick={() => {
          reset();
          setEditingId(null);
          setModalOpen(true);
        }}
      >
        + Thêm hợp đồng
      </button>

      <table className="table table-bordered table-hover">
        <thead className="table-secondary text-center">
          <tr>
            <th>ID</th>
            <th>Người thuê</th>
            <th>Bất động sản</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Khách</th>
            <th>Tổng giá</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map(c => {
            const user = users.find(u => u.id === c.userId);
            const property = properties.find(p => p.id === c.propertyId);
            const isInvalid = !user || !property;
            return (
              <tr key={c.id} className="text-center align-middle">
                <td>{c.id}</td>
                <td>{user?.name || "Người thuê bị xóa"}</td>
                <td>{property?.name || "BĐS bị xóa"}</td>
                <td>{c.startDate}</td>
                <td>{c.endDate}</td>
                <td>{c.guests}</td>
                <td>{c.totalPrice}</td>
                <td>{c.status}</td>
                <td>
                  <button className="btn btn-outline-success btn-sm me-1" onClick={() => viewDetail(c.id)}>Xem</button>
                  <button className="btn btn-outline-warning btn-sm me-1" onClick={() => handleEdit(c)} disabled={isInvalid}>Sửa</button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(c.id)} disabled={isInvalid}>Xóa</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {modalOpen && (
        <div className="modal show d-block" tabIndex="-1" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingId ? "Sửa hợp đồng" : "Thêm hợp đồng"}</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <form id="contractForm" onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-2">
                    <label className="form-label">Người thuê</label>
                    <select className="form-select" {...register("userId", { required: true })}>
                      <option value="">Chọn người thuê</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Bất động sản</label>
                    <select className="form-select" {...register("propertyId", { required: true })}>
                      <option value="">Chọn bất động sản</option>
                      {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Ngày bắt đầu</label>
                    <input type="date" className="form-control" {...register("startDate", { required: true })} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Ngày kết thúc</label>
                    <input type="date" className="form-control" {...register("endDate", { required: true })} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Số khách</label>
                    <input
                      type="number"
                      className="form-control"
                      {...register("guests", { min: 1, max: 3 })}
                      min={1}
                      max={3}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Tiền thuê/tháng</label>
                    <input
                      type="number"
                      className="form-control"
                      {...register("monthlyPayment", { min: 0 })}
                      min={0}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Tổng giá</label>
                    <input
                      type="number"
                      className="form-control"
                      value={parseFloat(control._formValues.totalPrice || 0)}
                      readOnly
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Trạng thái</label>
                    <select className="form-select" {...register("status")}>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="paid">Paid</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </div>
                  {status === "paid" && (
                    <div className="mb-2">
                      <label className="form-label">Thanh toán lúc</label>
                      <input type="date" className="form-control" {...register("paidAt")} />
                    </div>
                  )}
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Hủy</button>
                <button type="submit" form="contractForm" className="btn btn-primary">Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
