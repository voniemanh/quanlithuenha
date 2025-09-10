import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import "./Footer.css"; // import file CSS

export default function Footer() {
  const icons = [faFacebookF, faTwitter, faInstagram];

  return (
    <footer className="footer">
      {/* Centered text */}
      <p className="footer-text">
        © 2025 Holiday Rentals, Inc. All rights reserved.
      </p>

      {/* Right-aligned icons */}
      <div className="footer-icons">
        {icons.map((icon, index) => (
          <div key={index} className="footer-icon">
            <FontAwesomeIcon icon={icon} />
          </div>
        ))}
      </div>
    </footer>
  );
}
