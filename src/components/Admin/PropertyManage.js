import { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { PROPERTIES_URL, CONTRACTS_URL } from "../../config";
import ModalWrapper from "../Modal/ModalWrapper";
import { useNavigate } from "react-router-dom";

export default function PropertyManage() {
  const [properties, setProperties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const navigate = useNavigate();

  const amenities = [
    "Wifi",
    "TV",
    "Điều hòa",
    "Máy giặt",
    "Tủ lạnh",
    "Bàn làm việc",
    "Bathtub",
    "Luggage dropoff allowed",
    "Security camera",
    "Paid dryer",
    "Washer",
    "Air conditioning"
  ];

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      description: "",
      address: "",
      price: 0,
      status: "available",
      image: "",
      amenitiesList: [],
      likes: [],
      likeCount: 0
    }
  });

  const fetchProperties = async () => {
    try {
      const res = await axios.get(PROPERTIES_URL);
      setProperties(res.data);
    } catch {
      alert("Lỗi khi lấy danh sách bất động sản!");
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const validateProperty = (data) => {
    if (!data.name || !data.address) {
      alert("Tên và địa chỉ là bắt buộc!");
      return false;
    }
    if (data.price < 1000000) {
      alert("Giá phải lớn hơn hoặc bằng 1 triệu!");
      return false;
    }
    return true;
  };

  const handleSave = async (property) => {
    if (!validateProperty(editData)) return;

    try {
      if (editData.status === "available" && property.status === "rented") {
        const res = await axios.get(`${CONTRACTS_URL}?propertyId=${property.id}`);
        const contracts = res.data;
        const today = new Date();

        const hasActiveContract = contracts.some((c) => {
          const start = new Date(c.startDate);
          const end = new Date(c.endDate);
          return (
            c.status === "paid" &&
            today >= start &&
            today <= end
          );
        });

        if (hasActiveContract) {
          alert("Không thể đổi thành Available vì hợp đồng vẫn đang hiệu lực!");
          return;
        }
      }

      await axios.put(`${PROPERTIES_URL}/${property.id}`, editData);
      setEditingId(null);
      fetchProperties();
    } catch {
      alert("Lỗi khi lưu!");
    }
  };

  const onSubmit = async (data) => {
    if (!validateProperty(data)) return;
    try {
      if (editingId) {
        await axios.put(`${PROPERTIES_URL}/${editingId}`, data);
        setEditingId(null);
      } else {
        await axios.post(PROPERTIES_URL, data);
      }
      fetchProperties();
      setModalOpen(false);
      reset();
      setImagePreview("");
    } catch {
      alert("Lỗi khi lưu bất động sản!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa bất động sản này?")) {
      try {
        await axios.delete(`${PROPERTIES_URL}/${id}`);
        fetchProperties();
      } catch {
        alert("Lỗi khi xóa bất động sản!");
      }
    }
  };

  const viewDetail = (id) => navigate(`/property-detail/${id}`);

  return (
    <div className="container mt-4">
      <button
        className="btn-outline-black mb-3"
        onClick={() => {
          reset();
          setEditingId(null);
          setImagePreview("");
          setModalOpen(true);
        }}
      >
        + Thêm bất động sản
      </button>
      <div style={{ overflowX: "auto" }}>
        <table className="table table-bordered table-hover">
          <thead className="table-secondary text-center align-top">
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Địa chỉ</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Hình ảnh</th>
              <th>Tiện ích</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => {
              const isEditing = p.id === editingId;
              return (
                <tr key={p.id} className="text-center align-middle">
                  <td>{p.id}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                    ) : (
                      p.name
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editData.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      />
                    ) : (
                      p.address
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={editData.price}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setEditData({ ...editData, price: value < 0 ? 0 : value });
                        }}
                      />
                    ) : (
                      p.price
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        className="form-select"
                        value={editData.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      >
                        <option value="available">Available</option>
                        <option value="rented">Rented</option>
                      </select>
                    ) : (
                      p.status
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editData.image}
                        onChange={(e) => setEditData({ ...editData, image: e.target.value })}
                      />
                    ) : (
                      <img
                        src={p.image}
                        alt={p.name}
                        width="50"
                        height="auto"
                        style={{ borderRadius: "2px" }}
                      />
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        multiple
                        className="form-control"
                        value={editData.amenitiesList || []}
                        onChange={(e) => {
                          const selected = Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          );
                          setEditData({ ...editData, amenitiesList: selected });
                        }}
                      >
                        {amenities.map((amenity) => (
                          <option key={amenity} value={amenity}>
                            {amenity}
                          </option>
                        ))}
                      </select>
                    ) : Array.isArray(p.amenitiesList) ? (
                      p.amenitiesList.join(", ")
                    ) : (
                      ""
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <button
                          className="btn btn-outline-primary btn-sm me-1"
                          onClick={() => handleSave(p)}
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
                          onClick={() => viewDetail(p.id)}
                        >
                          Xem
                        </button>
                        <button
                          className="btn btn-outline-warning btn-sm me-1"
                          onClick={() => {
                            setEditingId(p.id);
                            setEditData(p);
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(p.id)}
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
      </div>
      <ModalWrapper
        show={modalOpen}
        handleClose={() => setModalOpen(false)}
        title="Thêm bất động sản"
      >
        <form id="propertyForm" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-2">
            <label className="form-label">Tên</label>
            <input type="text" className="form-control" {...register("name", { required: true })} />
          </div>
          <div className="mb-2">
            <label className="form-label">Địa chỉ</label>
            <input type="text" className="form-control" {...register("address", { required: true })} />
          </div>
          <div className="mb-2">
            <label className="form-label">Mô tả</label>
            <textarea className="form-control" {...register("description", { required: true })}></textarea>
          </div>
          <div className="mb-2">
            <label className="form-label">Giá</label>
            <input
              type="number"
              className="form-control"
              min="0"
              {...register("price", { valueAsNumber: true, min: 0 }, { required: true })}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Trạng thái</label>
            <select className="form-select" {...register("status")}>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="form-label">Hình ảnh URL</label>
            <input
              type="text"
              className="form-control"
              {...register("image", { required: true })}
              onChange={(e) => setImagePreview(e.target.value)}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="rounded-circle mt-2"
                width="50"
                height="50"
              />
            )}
          </div>
          <div className="mb-2">
            <label className="form-label">Tiện ích (giữ Ctrl để chọn nhiều)</label>
            <select multiple className="form-control" {...register("amenitiesList")}>
              {amenities.map((amenity) => (
                <option key={amenity} value={amenity}>
                  {amenity}
                </option>
              ))}
            </select>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary me-2"
              onClick={() => setModalOpen(false)}
            >
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
