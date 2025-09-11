import React from "react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate(); 
  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">About Us</h1>
      <p className="text-center mb-5">
        Chúng tôi là nền tảng hàng đầu trong việc kết nối người thuê và chủ nhà, 
        mang đến trải nghiệm thuê nhà tiện lợi, an toàn và minh bạch.
      </p>

      <div className="text-center mb-5 w-50 mx-auto">
        <img 
          src="./asset/r1.png" 
          alt="About us" 
          className="img-fluid rounded"
        />
      </div>

      <div className="row text-center mb-5">
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Dễ dàng sử dụng</h5>
              <p className="card-text">Giao diện thân thiện giúp bạn tìm nhà nhanh chóng, dễ dàng.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Đáng tin cậy</h5>
              <p className="card-text">Thông tin chính xác, bảo mật và minh bạch cho mọi giao dịch.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Hỗ trợ 24/7</h5>
              <p className="card-text">Đội ngũ hỗ trợ luôn sẵn sàng giúp bạn giải quyết mọi thắc mắc.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="mb-3">Sẵn sàng tìm căn nhà lý tưởng của bạn?</p>
        <button onClick={() => navigate("/")} className="btn-pink btn-lg">
          Xem nhà ngay
        </button>
      </div>
    </div>
  );
}
