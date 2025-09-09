import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import { PROPERTIES_URL } from "../../config";
import { useUser } from "../Context/UserContext";
import "./HomePage.css";

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUser(); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get(PROPERTIES_URL);
        setProperties(res.data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleCardClick = (id) => navigate(`/property-detail/${id}`);

  const handleFavourite = (e, id) => {
    e.stopPropagation();
    alert(`Added Room ${id} to favourites!`);
  };

  const handleEdit = (e, id) => {
    e.stopPropagation();
    navigate(`/edit-property/${id}`);
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

              <div
                className="heart-icon"
                onClick={(e) => handleFavourite(e, property.id)}
              >
                <FontAwesomeIcon icon={faHeart} />
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
                      <span className="edit" onClick={(e) => handleEdit(e, property.id)}>Sửa |</span>
                      <span className="delete" onClick={(e) => handleDelete(e, property.id)}>Xoá</span>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
