import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setMessage("Email không hợp lệ!");
      return;
    }
    setMessage(`Đăng ký thành công! ${email} sẽ nhận thông tin mới nhất.`);
    setEmail("");
  };

  return (
    <footer className="footer">
      {/* Footer Top */}
      <div className="footer-top">
        <p>Đăng ký nhận bản tin của chúng tôi</p>
        <form onSubmit={handleSubmit} className="footer-form">
          <input
            type="email"
            placeholder="Email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Đăng ký</button>
        </form>
        {message && <p className="footer-message">{message}</p>}
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
