import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import { PROPERTIES_URL } from "../../config";
export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
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
              src={property.image || "https://via.placeholder.com/300x200?text=No+Image"}
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

            <Card.Body>
              <Card.Title style={{ fontSize: "1rem" }}>{property.name}</Card.Title>
              <Card.Text style={{ fontSize: "0.85rem" }}>{property.description}</Card.Text>
              <Card.Text style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                {property.price.toLocaleString()} VND / tháng
              </Card.Text>
              <Card.Text
                style={{
                  fontSize: "0.85rem",
                  color: property.status === "available" ? "green" : "red",
                }}
              >
                {property.status === "available" ? "Còn trống" : "Đã cho thuê"}
              </Card.Text>
            </Card.Body>
          </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
