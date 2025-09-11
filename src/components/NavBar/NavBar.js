import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSignOutAlt,
  faSignInAlt,
  faUserPlus,
  faDatabase,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../Context/UserContext";
import Login from "../Auth/Login";
import Register from "../Auth/Register";
import "./NavBar.css";

export default function NavBar() {
  const { currentUser, setCurrentUser } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); 
  const navigate = useNavigate();

  const userRef = useRef();
  const hamburgerRef = useRef();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
    setOpenDropdown(null);
  };

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (userRef.current && !userRef.current.contains(event.target)) &&
        (hamburgerRef.current && !hamburgerRef.current.contains(event.target))
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg border-bottom fixed-top px-3">
        <Link to="/" className="navbar-brand img-fluid">
          <img src={"/asset/logo.png"} alt="Logo" className="navbar-logo" />
        </Link>

        <div className="ms-auto d-flex align-items-center">
          {/* User Dropdown */}
          {currentUser && (
            <div className="dropdown me-3 position-relative" ref={userRef}>
              <button
                className="btn btn-outline-dark rounded-circle"
                onClick={() => toggleDropdown("user")}
              >
                <FontAwesomeIcon icon={faUser} />
              </button>
              {openDropdown === "user" && (
                <ul className="dropdown-menu show custom-dropdown">
                  <span className="dropdown-header text-dark px-3">
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
                        setOpenDropdown(null);
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
                </ul>
              )}
            </div>
          )}

          {/* Admin Button */}
          {currentUser?.role === "admin" && (
            <button
              onClick={() => navigate("/admin-manage")}
              className="btn btn-outline-dark rounded-circle me-2"
            >
              <FontAwesomeIcon icon={faDatabase} />
            </button>
          )}

          {/* Hamburger Menu */}
          <div className="dropdown ms-2 position-relative" ref={hamburgerRef}>
            <button
              className="btn btn-outline-dark rounded-circle"
              onClick={() => toggleDropdown("hamburger")}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            {openDropdown === "hamburger" && (
              <ul className="dropdown-menu show custom-dropdown">
                {!currentUser ? (
                  <>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setShowLogin(true);
                          setOpenDropdown(null);
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
                          setOpenDropdown(null);
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
                        setOpenDropdown(null);
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
                    onClick={() => setOpenDropdown(null)}
                  >
                    News
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="dropdown-item"
                    onClick={() => setOpenDropdown(null)}
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="dropdown-item"
                    onClick={() => setOpenDropdown(null)}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>

      <Login show={showLogin} handleClose={() => setShowLogin(false)} />
      <Register show={showRegister} handleClose={() => setShowRegister(false)} />
    </>
  );
}
