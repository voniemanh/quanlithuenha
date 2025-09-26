import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAlert } from "../Context/AlertContext";
import "./Footer.css";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { showAlert } = useAlert();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      showAlert("Email không hợp lệ!", "error");
      return;
    }
    showAlert(`Đăng ký thành công! ${email} sẽ nhận thông tin mới nhất.`, "success");
    setEmail("");
  };

  return (
    <footer className="footer">
      {/* Footer Top */}
      <div className="footer-top">
        <p>Đăng ký nhận bản tin của chúng tôi</p>
        <form onSubmit={handleSubmit} className="footer-form">
          <input
            className="rounded-pill"
            type="email"
            placeholder="Email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="rounded-pill" type="submit">Đăng ký</button>
        </form>
      </div>

      <hr className="footer-divider" />

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p className="footer-copy">© 2025 Holiday Rentals Inc.</p>
        <div className="footer-right">
          <div className="footer-links">
            <Link to="/news">News</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/about">About Us</Link>
          </div>
          <div className="footer-socials">
            <FontAwesomeIcon icon={faFacebookF} />
            <FontAwesomeIcon icon={faTwitter} />
            <FontAwesomeIcon icon={faInstagram} />
          </div>
        </div>
      </div>
    </footer>
  );
}
