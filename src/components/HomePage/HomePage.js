import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Spinner, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import axios from "axios";
import { PROPERTIES_URL, USERS_URL, CONTRACTS_URL } from "../../config";
import { checkAvailable } from "../util/CheckAvailable";
import { useUser } from "../Context/UserContext";
import ModalWrapper from "../Modal/ModalWrapper";
import { useForm } from "react-hook-form";
import { useAlert } from "../Context/AlertContext";

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, setCurrentUser } = useUser();
  const { showAlert, showConfirm } = useAlert();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [favourites, setFavourites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState(""); 
  const navigate = useNavigate();

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
            const contract = contractsData.find(c => c.propertyId === property.id);
            const newStatus = checkAvailable(contract);
            if (property.status !== newStatus) {
              const updatedProperty = { ...property, status: newStatus };
              await axios.patch(`${PROPERTIES_URL}/${property.id}`, updatedProperty);
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

  useEffect(() => {
    if (currentUser) {
      setFavourites(Array.isArray(currentUser.likeProperties) ? currentUser.likeProperties : []);
    } else {
      setFavourites([]);
    }
  }, [currentUser]);

  const handleCardClick = (id) => navigate(`/property-detail/${id}`);

  const handleFavourite = async (e, property) => {
    e.stopPropagation();
    if (!currentUser) {
      showAlert("Bạn cần đăng nhập để bấm like!", "warning");
      return;
    }

    const userLikes = Array.isArray(currentUser.likeProperties) ? currentUser.likeProperties : [];
    const isLiked = favourites.includes(property.id);

    let updatedUserLikes, updatedPropertyLikes, updatedLikeCount;

    if (isLiked) {
      updatedUserLikes = userLikes.filter(id => id !== property.id);
      updatedPropertyLikes = (property.likes || []).filter(uid => uid !== currentUser.id);
      updatedLikeCount = property.likeCount - 1;
    } else {
      updatedUserLikes = [...userLikes, property.id];
      updatedPropertyLikes = [...(property.likes || []), currentUser.id];
      updatedLikeCount = property.likeCount + 1;
    }

    setFavourites(isLiked ? favourites.filter(id => id !== property.id) : [...favourites, property.id]);
    setProperties(properties.map(p => p.id === property.id ? { ...p, likes: updatedPropertyLikes, likeCount: updatedLikeCount } : p));
    const updatedUser = { ...currentUser, likeProperties: updatedUserLikes };
    setCurrentUser(updatedUser);

    try {
      await axios.patch(`${PROPERTIES_URL}/${property.id}`, { likes: updatedPropertyLikes, likeCount: updatedLikeCount });
      await axios.patch(`${USERS_URL}/${currentUser.id}`, { likeProperties: updatedUserLikes });
    } catch (err) {
      console.error(err);
      showAlert("Cập nhật like thất bại!", "error");
    }
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
    const confirm = await showConfirm("Bạn có chắc muốn xoá phòng này?");
    if (confirm) {
      try {
        
        await axios.delete(`${PROPERTIES_URL}/${id}`);
        setProperties(properties.filter(p => p.id !== id));
        showAlert("Xoá thành công!", "success");
      } catch (err) {
        console.error(err);
        showAlert("Xoá thất bại!", "error");
      }
    }
  };

  const validateProperty = (data) => {
    if (!data.name || !data.address) {
      showAlert("Tên và địa chỉ là bắt buộc!", "warning");
      return false;
    }
    if (data.price < 0) {
      showAlert("Giá phải lớn hơn hoặc bằng 0!", "warning");
      return false;
    }
    return true;
  };

  const onSubmit = async (data) => {
    if (!validateProperty(data)) return;
    try {
      await axios.patch(`${PROPERTIES_URL}/${editingId}`, data);
      setProperties(properties.map(p => p.id === editingId ? { ...data, id: editingId } : p));
      setModalOpen(false);
      setEditingId(null);
      reset();
      setImagePreview("");
      showAlert("Cập nhật thành công!", "success");
    } catch {
      showAlert("Lỗi khi lưu bất động sản!", "error");
    }
  };

  const sortedProperties = properties
    .filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "asc") return a.price - b.price;
      if (sortOrder === "desc") return b.price - a.price;
      return 0;
    });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in">
        <Form.Control
          className="rounded-pill search-input"
          type="text"
          placeholder="Tìm kiếm theo từ khoá..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
        <Form.Select
          className="rounded-pill"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{ maxWidth: "200px" }}
        >
          <option value="">Sắp xếp theo giá</option>
          <option value="asc">Giá tăng dần</option>
          <option value="desc">Giá giảm dần</option>
        </Form.Select>
      </div>

      <Row className="g-3 fade-in">
        {sortedProperties.length === 0 ? (
          <p>Không tìm thấy bất động sản phù hợp.</p>
        ) : (
          sortedProperties.map((property) => (
            <Col key={property.id} xs={6} sm={6} md={4} lg={3} xl={2} className="d-flex justify-content-center">
              <Card className="property-card" onClick={() => handleCardClick(property.id)}>
                <Card.Img variant="top" src={property.image} />
                <div className={`heart-icon ${favourites.includes(property.id) ? "active" : ""}`} onClick={(e) => handleFavourite(e, property)}>
                  <span className="like-count">{property.likeCount || 0}</span>
                  <FontAwesomeIcon icon={favourites.includes(property.id) ? solidHeart : regularHeart} className="heart" />
                </div>
                <Card.Body className="card-body d-flex flex-column">
                  <div className="content flex-grow-1">
                    <Card.Title className="property-title">{property.name}</Card.Title>
                    <Card.Text className="property-text">Mô tả: {property.description}</Card.Text>
                    <Card.Text className="property-text">Địa chỉ: {property.address}</Card.Text>
                    <Card.Text className="property-text" style={{fontStyle: "italic"}}>Giá: {property.price.toLocaleString()} VND / tháng</Card.Text>
                  </div>
                  <div className="status-wrapper">
                    <button disabled className={`status-button ${property.status === "available" ? "status-available" : "status-unavailable"}`}>
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
          ))
        )}
      </Row>
      <ModalWrapper show={modalOpen} handleClose={() => setModalOpen(false)} title="Chỉnh sửa bất động sản">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-2"><label className="form-label">Tên</label><input type="text" className="form-control" {...register("name", { required: true })} /></div>
          <div className="mb-2"><label className="form-label">Địa chỉ</label><input type="text" className="form-control" {...register("address", { required: true })} /></div>
          <div className="mb-2"><label className="form-label">Mô tả</label><textarea className="form-control" {...register("description")}></textarea></div>
          <div className="mb-2"><label className="form-label">Giá</label><input type="number" className="form-control" min="0" {...register("price", { valueAsNumber: true, min: 0 })} /></div>
          <div className="mb-2"><label className="form-label">Trạng thái</label>
            <select className="form-select" {...register("status")}>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
            </select>
          </div>
          <div className="mb-2"><label className="form-label">Hình ảnh URL</label>
            <input type="text" className="form-control" {...register("image")} onChange={e => setImagePreview(e.target.value)} />
            {imagePreview && <img src={imagePreview} alt="Preview" className="rounded-circle mt-2" width="50" height="50" />}
          </div>
          <div className="mb-2"><label className="form-label">Tiện ích</label>
            <select multiple className="form-control" {...register("amenitiesList")}>
              {amenities.map((amenity) => <option key={amenity} value={amenity}>{amenity}</option>)}
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
