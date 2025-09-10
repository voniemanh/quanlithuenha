import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { PROPERTIES_URL } from "../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faWifi, 
  faTv, 
  faBuilding, 
  faSoap, 
  faFan, 
  faSnowflake, 
  faBath, 
  faSuitcaseRolling, 
  faVideo 
} from "@fortawesome/free-solid-svg-icons";

const amenitiesList = [
  { name: "Wifi", icon: faWifi },
  { name: "TV", icon: faTv },
  { name: "Elevator", icon: faBuilding },
  { name: "Washer", icon: faSoap },
  { name: "Paid dryer", icon: faFan },
  { name: "Air conditioning", icon: faSnowflake },
  { name: "Bathtub", icon: faBath },
  { name: "Luggage dropoff allowed", icon: faSuitcaseRolling },
  { name: "Security camera", icon: faVideo }
];

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`${PROPERTIES_URL}/${id}`);
        setProperty(res.data);
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
      setTotalPrice(diffDays > 0 ? Math.round((diffDays / 30) * property.price) : 0);
    }
  }, [checkIn, checkOut, property]);

  if (loading) return <p>Loading...</p>;
  if (!property) return <p>Property not found!</p>;

  return (
    <div className="container my-4">
      <h2 className="mb-4">{property.name}</h2>

      {/* hình ảnh + thông tin */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <img src={property.image} alt={property.name} className="img-fluid rounded" />
        </div>

        <div className="col-md-6">
          <h4 className="mt-3">Thông tin chi tiết</h4>
          <p className="mt-4"><strong>Địa chỉ:</strong> {property.address}</p>
          <p><strong>Mô tả:</strong> {property.description}</p>

          <div className="mb-2 mt-3">
            <label className="form-label">Ngày check-in:</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Ngày check-out:</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="form-control"
            />
          </div>
          <p className="my-2 mt-3"><strong>Giá tiền:</strong> {totalPrice.toLocaleString()} VND</p>
          <button
            onClick={() => navigate(`/contract-detail/${property.id}`)}
            className="btn-pink"
          >
            Thuê phòng
          </button>
        </div>
      </div>

      {/* amenities + map */}
      <div className="d-flex flex-column align-items-center">
        {/* Amenities */}
        <div className="w-100" style={{ maxWidth: "900px" }}>
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-4 justify-content-center mt-3">
            {amenitiesList.map((item) => (
              <div key={item.name} className="col d-flex flex-column align-items-center">
                <FontAwesomeIcon icon={item.icon} size="2x" className="mb-2" />
                <span className="text-center">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
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
    </div>
  );
}
