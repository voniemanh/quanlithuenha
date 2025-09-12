import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import axios from "axios";
import { CONTRACTS_URL, PROPERTIES_URL } from "../../config";
import { checkAvailable } from "../util/CheckAvailable";
import { useUser } from "../Context/UserContext";
import ModalWrapper from "../Modal/ModalWrapper";
import { useForm } from "react-hook-form";
import "./HomePage.css";

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUser(); 
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [favourites, setFavourites] = useState([]);
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      description: "",
      address: "",
      price: 0,
      status: "available",
      image: "",
      amenitiesList: []
    }
  });

  const amenities = [
    "Wifi", "TV", "Điều hòa", "Máy giặt", "Tủ lạnh", "Bàn làm việc",
    "Bathtub", "Luggage dropoff allowed", "Security camera", "Paid dryer",
    "Washer", "Air conditioning"
  ];

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [propertiesRes, contractsRes] = await Promise.all([
        axios.get(PROPERTIES_URL),
        axios.get(CONTRACTS_URL)
      ]);

      const propertiesData = propertiesRes.data;
      const contractsData = contractsRes.data;

      const updatedProperties = await Promise.all(
        propertiesData.map(async (property) => {
          const contract = contractsData.find(
            (c) => c.propertyId === property.id
          );

          const newStatus = checkAvailable(contract);

          if (property.status !== newStatus) {
            const updatedProperty = { ...property, status: newStatus };
            await axios.put(`${PROPERTIES_URL}/${property.id}`, updatedProperty);
            return updatedProperty;
          }

          return property;
        })
      );

      setProperties(updatedProperties);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const handleCardClick = (id) => navigate(`/property-detail/${id}`);

  const handleFavourite = (e, id) => {
    e.stopPropagation();
    setFavourites((prev) =>
      prev.includes(id)
        ? prev.filter((fid) => fid !== id) 
        : [...prev, id] 
    );
  };

  const handleEdit = (e, property) => {
    e.stopPropagation();
    setEditingId(property.id);
    reset(property); 
    setImagePreview(property.image || "");
    setModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc muốn xoá phòng này?")) {
      try {
        await axios.delete(`${PROPERTIES_URL}/${id}`);
        setProperties(properties.filter(p => p.id !== id));
        alert("Xoá thành công!");
      } catch (err) {
        console.error(err);
        alert("Xoá thất bại!");
      }
    }
  };

  const validateProperty = (data) => {
    if (!data.name || !data.address) {
      alert("Tên và địa chỉ là bắt buộc!");
      return false;
    }
    if (data.price < 0) {
      alert("Giá phải lớn hơn hoặc bằng 0!");
      return false;
    }
    return true;
  };

  const onSubmit = async (data) => {
    if (!validateProperty(data)) return;
    try {
      await axios.put(`${PROPERTIES_URL}/${editingId}`, data);
      setProperties(properties.map(p => (p.id === editingId ? { ...data, id: editingId } : p)));
      setModalOpen(false);
      setEditingId(null);
      reset();
      setImagePreview("");
      alert("Cập nhật thành công!");
    } catch {
      alert("Lỗi khi lưu bất động sản!");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container my-4">
      <Row className="g-3">
        {properties.map((property) => (
          <Col
            key={property.id}
            xs={12}
            sm={6}
            md={4}
            lg={3}
            xl={2}
            className="d-flex justify-content-center"
          >
            <Card
              className="property-card"
              onClick={() => handleCardClick(property.id)}
            >
              <Card.Img variant="top" src={property.image} />

              {/* Heart giống Airbnb */}
              <div
                className={`heart-icon ${favourites.includes(property.id) ? "active" : ""}`}
                onClick={(e) => handleFavourite(e, property.id)}
              >
                <FontAwesomeIcon 
                  icon={favourites.includes(property.id) ? solidHeart : regularHeart} 
                  className="heart" 
                />
              </div>

              <Card.Body className="card-body d-flex flex-column">
                <div className="content flex-grow-1">
                  <Card.Title className="property-title">{property.name}</Card.Title>
                  <Card.Text className="property-text">Mô tả: {property.description}</Card.Text>
                  <Card.Text className="property-text">Địa chỉ: {property.address}</Card.Text>
                  <Card.Text className="property-text" style={{fontStyle: "italic"}}>
                    Giá: {property.price.toLocaleString()} VND / tháng
                  </Card.Text>
                </div>

                <div className="status-wrapper">
                  <button
                    disabled
                    className={`status-button ${property.status === "available" ? "status-available" : "status-unavailable"}`}
                  >
                    {property.status === "available" ? "Còn trống" : "Đã cho thuê"}
                  </button>

                  {currentUser?.role === "admin" && (
                    <div className="admin-links">
                      <span className="edit" onClick={(e) => handleEdit(e, property)}>Sửa |</span>
                      <span className="delete" onClick={(e) => handleDelete(e, property.id)}>Xoá</span>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal Edit */}
      <ModalWrapper
        show={modalOpen}
        handleClose={() => setModalOpen(false)}
        title="Chỉnh sửa bất động sản"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
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
            <textarea className="form-control" {...register("description")}></textarea>
          </div>
          <div className="mb-2">
            <label className="form-label">Giá</label>
            <input type="number" className="form-control" min="0" {...register("price", { valueAsNumber: true, min: 0 })} />
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
              {...register("image")}
              onChange={e => setImagePreview(e.target.value)}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="rounded-circle mt-2" width="50" height="50" />
            )}
          </div>
          <div className="mb-2">
            <label className="form-label">Tiện ích</label>
            <select multiple className="form-control" {...register("amenitiesList")}>
              {amenities.map((amenity) => (
                <option key={amenity} value={amenity}>
                  {amenity}
                </option>
              ))}
            </select>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setModalOpen(false)}>Hủy</button>
            <button type="submit" className="btn btn-outline-primary">Lưu</button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
}
