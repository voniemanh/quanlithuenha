import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  return (
    <footer style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px",
      borderTop: "1px solid #ccc",
      position: "relative"
    }}>
      {/* Centered text */}
      <p style={{
        margin: 0,
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)"
      }}>
        © 2025 Holiday Rentals, Inc. All rights reserved.
      </p>

      {/* Right-aligned icons */}
      <div style={{ display: "flex", gap: "20px", marginLeft: "auto" }}>
        {[faFacebookF, faTwitter, faInstagram].map((icon, index) => (
          <div key={index} style={{
            color: "#000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            fontSize: "1.2rem"
          }}>
            <FontAwesomeIcon icon={icon}/>
          </div>
        ))}
      </div>
    </footer>
  );
}
