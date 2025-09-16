import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { PROPERTIES_URL} from "../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faWifi, faTv, faBuilding, faSoap, faFan, faSnowflake, 
  faBath, faSuitcaseRolling, faVideo, faHeart  
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../Context/UserContext";
import { checkConflict } from "../util/CheckConflict";
import { Carousel } from "react-bootstrap";

const amenityIcons = {
  "Wifi": faWifi,
  "TV": faTv,
  "Điều hòa": faSnowflake,
  "Máy giặt": faSoap,
  "Tủ lạnh": faBuilding,
  "Bàn làm việc": faSuitcaseRolling,
  "Bathtub": faBath,
  "Luggage dropoff allowed": faSuitcaseRolling,
  "Security camera": faVideo,
  "Paid dryer": faFan,
  "Washer": faSoap,
  "Air conditioning": faSnowflake
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`${PROPERTIES_URL}/${id}`);
        const data = res.data;
        data.images = [data.image];
        setProperty(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (checkIn && checkOut && property) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      setMonthlyPayment(diffDays > 0 ? Math.round((diffDays / 30) * property.price * guests) : 0);
    }
  }, [checkIn, checkOut, property, guests]);

  const handleGuestChange = (delta) => {
    setGuests(prev => Math.min(3, Math.max(1, prev + delta)));
  };

  const handleRent = async () => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để thuê phòng!");
      return;
    }
    if (!checkIn || !checkOut) {
      alert("Vui lòng chọn ngày check-in và check-out!");
      return;
    }
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (start < today) {
      alert("Ngày check-in phải từ hôm nay trở đi!");
      return;
    }
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      alert("Ngày check-out phải sau ngày check-in!");
      return;
    }

    try {
      const { data: contracts } = await axios.get(`${PROPERTIES_URL.replace("/properties", "")}/contracts`);

      if (checkConflict(contracts, property.id, checkIn, checkOut)) {
        alert("Phòng đã được thuê trong khoảng thời gian này!");
        return;
      }

      const newContract = {
        userId: currentUser.id,
        propertyId: property.id,
        startDate: checkIn,
        endDate: checkOut,
        guests,
        monthlyPayment: Math.round((property.price / 30) * diffDays * guests),
        status: "pending",
        payAt: null
      };

      const res = await axios.post(
        `${PROPERTIES_URL.replace("/properties", "")}/contracts`,
        newContract
      );
      const newContractId = res.data.id;
      alert("Thuê phòng thành công!");
      navigate(`/contract-detail/${newContractId}`);
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!property) return <p>Property not found!</p>;

  return (
    <div className="container my-4">
      <h2 className="mb-4 d-flex align-items-center">
        {property.name}
        <span className="ms-3 d-flex align-items-center fs-4 fw-normal">
          <FontAwesomeIcon icon={faHeart} className="text-danger me-1" />
          {property.likeCount || 0}
        </span>
      </h2>
      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <Carousel
            activeIndex={carouselIndex}
            onSelect={setCarouselIndex}
            indicators={false}
          >
            {property.images.map((img, idx) => (
              <Carousel.Item key={idx}>
                <img
                  src={img}
                  alt={`${property.name} ${idx + 1}`}
                  className="d-block w-100 rounded"
                  style={{ maxHeight: "400px", objectFit: "cover" }}
                />
              </Carousel.Item>
            ))}
          </Carousel>

          {/* Thumbnail indicators */}
          <div className="d-flex justify-content-center mt-2">
            {property.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`thumb-${i}`}
                onClick={() => setCarouselIndex(i)}
                className={`img-thumbnail thumb ${carouselIndex === i ? "active-thumb" : ""}`}
                style={{objectFit: "cover", cursor: "pointer" }}
              />
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <h2>Thông tin chi tiết</h2>
          <p className="mt-4"><strong>Địa chỉ:</strong> {property.address}</p>
          <p><strong>Mô tả:</strong> {property.description}</p>
          <p><strong>Giá theo tháng/1 người:</strong> {property.price.toLocaleString()} VND</p>
          <p><strong>Tiện ích:</strong> {property.amenitiesList.join(", ")}</p>
          <div className="mb-2 mt-3">
            <label className="form-label">Ngày check-in:</label>
            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="form-control"/>
          </div>
          <div className="mb-2">
            <label className="form-label">Ngày check-out:</label>
            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="form-control"/>
          </div>
          <div className="mb-2 d-flex align-items-center">
            <label className="form-label me-3">Số khách:</label>
            <button className="btn btn-outline-secondary me-2" onClick={() => handleGuestChange(-1)}>-</button>
            <span>{guests}</span>
            <button className="btn btn-outline-secondary ms-2" onClick={() => handleGuestChange(1)}>+</button>
          </div>
          <p className="my-2 mt-3"><strong>Tổng:</strong> {monthlyPayment.toLocaleString()} VND</p>
          {property.status === "rented" ? (
            <button className="btn btn-secondary" disabled>
              Phòng đã được thuê
            </button>
          ) : (
            <button onClick={handleRent} className="btn-pink">
              Thuê phòng
            </button>
          )}
        </div>
      </div>
      <div className="d-flex flex-column align-items-center">
        <div className="w-100" style={{ maxWidth: "900px" }}>
          <div className="row row-cols-3 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-4 justify-content-center mt-3">
            {property.amenitiesList.map((amenity) => {
              const icon = amenityIcons[amenity] || faVideo; 
              return (
                <div key={amenity} className="col d-flex flex-column align-items-center">
                  <FontAwesomeIcon icon={icon} size="2x" className="mb-2" />
                  <span className="text-center">{amenity}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded overflow-hidden mt-5 mb-5 w-100" style={{ width: "100%", height: "400px" }}>
          <iframe
            title="property-map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Extra CSS */}
      <style>
        {`
          .thumb {
            opacity: 0.6;
            border: 2px solid transparent;
            max-width: 100px; 
          }
          .thumb:hover {
            opacity: 0.9;
            transform: scale(1.05);
            transition: all 0.3s ease-in-out;
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
