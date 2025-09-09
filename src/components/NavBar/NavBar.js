import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faUser,
  faSignOutAlt,
  faSignInAlt,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../Context/UserContext";
import Login from "../Auth/Login";
import Register from "../Auth/Register";
import logo from '../../asset/logo.png';

export default function NavBar() {
  const { currentUser, setCurrentUser } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg border-bottom px-3">
        {/* Logo */}
        <Link to="/" className="navbar-brand img-fluid">
          <img src={logo} alt="Logo" style={{ maxHeight: "50px", width: "auto" }} />
        </Link>

        <div className="ms-auto d-flex align-items-center">
          {/* Button Đăng tin (Admin only) */}
          {currentUser?.role === "admin" && (
            <button
              onClick={() => navigate("/post")}
              className="btn btn-dark me-3"
            >
              + Đăng tin
            </button>
          )}
          {/* User Icon */}
          {currentUser && (
            <button
              onClick={() => navigate(`/user-detail/${currentUser.id}`)}
              className="btn btn-link text-dark me-3"
            >
              <FontAwesomeIcon icon={faUser} size="lg" />
            </button>
          )}
          {/* Hamburger */}
          <div className="dropdown me-2">
            <button
              className="btn btn-outline-dark rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "40px", height: "40px" }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>

            {menuOpen && (
              <ul className="dropdown-menu dropdown-menu-start show mt-2">
                {!currentUser ? (
                  <>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setShowLogin(true);
                          setMenuOpen(false);
                        }}
                      >
                        <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                        Đăng nhập
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setShowRegister(true);
                          setMenuOpen(false);
                        }}
                      >
                        <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                        Đăng ký
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          navigate(`/user-detail/${currentUser.id}`);
                          setMenuOpen(false);
                        }}
                      >
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        Profile
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={handleLogout}
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                        Logout
                      </button>
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>
        </div>
      </nav>

      {/* Modals */}
      <Login show={showLogin} handleClose={() => setShowLogin(false)} />
      <Register show={showRegister} handleClose={() => setShowRegister(false)} />
    </>
  );
}
