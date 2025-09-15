import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Contact() {
  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Contact Us</h1>
      <p className="text-center mb-4">
        Hãy liên hệ với chúng tôi qua form dưới đây hoặc đến trực tiếp văn phòng.
      </p>

      <div className="row">
          <div className="col-md-6 mb-4">
          <h5>Địa chỉ văn phòng</h5>
          <p className="mb-3">
            Công ty TNHH ABC<br />
            123 Đường Lớn, Phường Trung Tâm, Quận 1, TP. Hồ Chí Minh<br />
            Điện thoại: (028) 1234 5678
          </p>

          <div className="map-responsive">
            <iframe
              title="office-map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.123456789!2d106.700000!3d10.770000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f123456789%3A0xabcdef123456789!2s123%20Duong%20Lon!5e0!3m2!1sen!2s!4v1694471234567!5m2!1sen!2s"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
        <div className="col-md-6 mb-4">
           <h5>Liên hệ</h5>
          <form>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Họ và tên</label>
              <input type="text" className="form-control" id="name" placeholder="Nguyen Van A" />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" className="form-control" id="email" placeholder="email@example.com" />
            </div>
            <div className="mb-3">
              <label htmlFor="message" className="form-label">Nội dung</label>
              <textarea className="form-control" id="message" rows="5" placeholder="Nhập nội dung..."></textarea>
            </div>
            <button type="submit" className="btn-black">Gửi</button>
          </form>
        </div>
      </div>
    </div>
  );
}
