import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import { PROPERTIES_URL } from "../../config";
import { useUser } from "../Context/UserContext";

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

  const handleCardClick = (id) => {
    navigate(`/property-detail/${id}`);
  };

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
              style={{ cursor: "pointer", width: "100%", position: "relative" }} 
            >
              <Card.Img
                variant="top"
                src={property.image}
                style={{ borderRadius: "8px" }}
              />
              {/* Heart icon ở góc trên bên phải */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  zIndex: 2,
                }}
                onClick={(e) => handleFavourite(e, property.id)}
              >
                <FontAwesomeIcon icon={faHeart} style={{ cursor: "pointer", color: "#FF385C" }} />
              </div>
              <Card.Body
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {/* Nội dung property */}
                <div style={{ flexGrow: 1 }}>
                  <Card.Title style={{ fontSize: "1rem" }}>{property.name}</Card.Title>
                  <Card.Text style={{ fontSize: "0.85rem" }}>Mô tả: {property.description}</Card.Text>
                  <Card.Text style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                    Giá: {property.price.toLocaleString()} VND / tháng
                  </Card.Text>
                  <Card.Text
                    style={{
                      fontSize: "0.85rem",
                      color: property.status === "available" ? "green" : "red",
                    }}
                  >
                    <button
                      disabled
                      style={{
                        fontSize: "0.75rem",
                        padding: "3px 6px",
                        borderRadius: "5px",
                        border: property.status === "available" ? "1px solid white" : "1px solid grey",
                        backgroundColor: property.status === "available" ? "grey" : "white",
                        color: property.status === "available" ? "white" : "grey",
                        cursor: "default"
                      }}
                    >
                      {property.status === "available" ? "Còn trống" : "Đã cho thuê"}
                    </button>
                  </Card.Text>
                </div>

                {/* Link admin luôn canh dưới */}
                {currentUser?.role === "admin" && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "auto", 
                      fontStyle: "italic"
                    }}
                  >
                    <span
                      style={{ textDecoration: "underline", color: "blue", cursor: "pointer", fontSize: "0.8rem" }}
                      onClick={(e) => handleEdit(e, property.id)}
                    >
                      Sửa |
                    </span>
                    <span
                      style={{ textDecoration: "underline", color: "red", cursor: "pointer", fontSize: "0.8rem" }}
                      onClick={(e) => handleDelete(e, property.id)}
                    >
                       Xoá
                    </span>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
