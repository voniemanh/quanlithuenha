import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faUser,
  faSignOutAlt,
  faSignInAlt,
  faUserPlus,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../Context/UserContext";
import Login from "../Auth/Login";
import Register from "../Auth/Register";
import "./NavBar.css";

export default function NavBar() {
  const { currentUser, setCurrentUser } = useUser();
  const [openMenu, setOpenMenu] = useState("none");
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    setOpenMenu("none");
    navigate("/");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg border-bottom fixed-top px-3">
        {/* Logo */}
        <Link to="/" className="navbar-brand img-fluid">
          <img src={"/asset/logo.png"} alt="Logo" className="navbar-logo" />
        </Link>

        <div className="ms-auto d-flex align-items-center">
          {/* User Dropdown */}
          {currentUser && (
            <div className="dropdown me-3 position-relative">
              <button
                className="btn-icon"
                onClick={() =>
                  setOpenMenu(openMenu === "user" ? "none" : "user")
                }
              >
                <FontAwesomeIcon icon={faUser} size="lg" />
              </button>

              {openMenu === "user" && (
                <ul className="dropdown-menu show custom-dropdown">
                  <span className="dropdown-header text-dark px-3 user-greeting">
                    Hi, {currentUser.username}!
                  </span>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate(`/user-detail/${currentUser.id}`);
                        setOpenMenu("none");
                      }}
                    >
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Profile
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Button Đăng tin (Admin only) */}
          {currentUser?.role === "admin" && (
            <button
              onClick={() => navigate("/property-manage")}
              className="btn-icon me-2"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          )}

          {/* Hamburger Dropdown */}
          <div className="dropdown ms-2 position-relative">
            <button
              className="btn-icon"
              onClick={() =>
                setOpenMenu(openMenu === "hamburger" ? "none" : "hamburger")
              }
            >
              <FontAwesomeIcon icon={faBars} />
            </button>

            {openMenu === "hamburger" && (
              <ul className="dropdown-menu show custom-dropdown">
                {!currentUser ? (
                  <>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setShowLogin(true);
                          setOpenMenu("none");
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
                          setOpenMenu("none");
                        }}
                      >
                        <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                        Đăng ký
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/");
                        setOpenMenu("none");
                      }}
                    >
                      Trang chủ
                    </button>
                  </li>
                )}

                <li>
                  <Link
                    to="/news"
                    className="dropdown-item"
                    onClick={() => setOpenMenu("none")}
                  >
                    Newsletter
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="dropdown-item"
                    onClick={() => setOpenMenu("none")}
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="dropdown-item"
                    onClick={() => setOpenMenu("none")}
                  >
                    Contact
                  </Link>
                </li>
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
