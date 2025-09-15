import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Carousel, Card, Row, Col } from "react-bootstrap";

export default function About() {
  const navigate = useNavigate(); 
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const images = [
    { src: "./asset/r1.png", alt: "Slide 1" },
    { src: "./asset/r2.png", alt: "Slide 2" },
    { src: "./asset/r3.png", alt: "Slide 3" },
  ];

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">About Us</h1>
      <p className="text-center mb-5 fs-5 text-muted">
        Chúng tôi là nền tảng hàng đầu trong việc kết nối người thuê và chủ nhà, 
        mang đến trải nghiệm thuê nhà tiện lợi, an toàn và minh bạch.
      </p>

      {/* Carousel */}
      <div className="mb-5">
        <Carousel
          activeIndex={index}
          onSelect={handleSelect}
          indicators={false}
          fade  
          className="rounded overflow-hidden"
        >
          {images.map((img, i) => (
            <Carousel.Item key={i}>
              <img
                className="d-block w-100 img-fluid"
                src={img.src}
                alt={img.alt}
              />
            </Carousel.Item>
          ))}
        </Carousel>

        {/* Thumbnail indicators */}
        <div className="d-flex justify-content-center mt-3 gap-3">
          {images.map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={img.alt}
              onClick={() => setIndex(i)}
              className={`img-thumbnail thumb ${index === i ? "active-thumb" : ""}`}
              style={{
                width: "100px",
                height: "80px",
                objectFit: "cover",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out"
              }}
            />
          ))}
        </div>
      </div>

      {/* Features */}
      <Row xs={1} md={3} className="g-4 text-center mb-5">
        <Col>
          <Card className="h-100 border-1">
            <Card.Body>
              <Card.Title>Dễ dàng sử dụng</Card.Title>
              <Card.Text className="text-muted">
                Giao diện thân thiện giúp bạn tìm nhà nhanh chóng, dễ dàng.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="h-100 border-1">
            <Card.Body>
              <Card.Title>Đáng tin cậy</Card.Title>
              <Card.Text className="text-muted">
                Thông tin chính xác, bảo mật và minh bạch cho mọi giao dịch.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="h-100 border-1">
            <Card.Body>
              <Card.Title>Hỗ trợ 24/7</Card.Title>
              <Card.Text className="text-muted">
                Đội ngũ hỗ trợ luôn sẵn sàng giúp bạn giải quyết mọi thắc mắc.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Call to action */}
      <div className="text-center">
        <p className="mb-3 fs-5">Sẵn sàng tìm căn nhà lý tưởng của bạn?</p>
        <button onClick={() => navigate("/")} className="btn-black px-4">
          Xem nhà ngay
        </button>
      </div>

      {/* Extra CSS */}
      <style>
        {`
          .thumb {
            opacity: 0.6;
            border: 2px solid transparent;
          }
          .thumb:hover {
            opacity: 0.9;
            transform: scale(1.05);
          }
          .active-thumb {
            opacity: 1 !important;
            border-color: #ccc !important;
            transform: scale(1.1);
          }
        `}
      </style>
    </div>
  );
}
