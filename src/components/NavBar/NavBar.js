import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faUser,
  faSignOutAlt,
  faSignInAlt,
  faUserPlus,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../Context/UserContext";
import Login from "../Auth/Login";
import Register from "../Auth/Register";

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
      <nav className="navbar navbar-expand-lg border-bottom px-3">
        {/* Logo */}
        <Link to="/" className="navbar-brand img-fluid">
          <img
            src={"/asset/logo.png"}
            alt="Logo"
            style={{ maxHeight: "50px", width: "auto" }}
          />
        </Link>

        <div className="ms-auto d-flex align-items-center">
          {/* User Dropdown */}
          {currentUser && (
            <div className="dropdown me-3 position-relative">
              <button
                className="btn btn-outline-dark rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px", transition: "all 0.3s" }}
                onClick={() =>
                  setOpenMenu(openMenu === "user" ? "none" : "user")
                }
              >
                <FontAwesomeIcon icon={faUser} size="lg" />
              </button>

              {openMenu === "user" && (
                <ul
                  className="dropdown-menu show"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "0.5rem",
                    minWidth: "200px",
                  }}
                >
                  <span className="dropdown-header text-dark px-3" style={{fontSize: "1rem"}}>
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
              onClick={() => navigate("/post")}
              className="btn btn-outline-dark rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{ width: "40px", height: "40px", transition: "all 0.3s" }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          )}

          {/* Hamburger Dropdown */}
          <div className="dropdown ms-2 position-relative">
            <button
              className="btn btn-outline-dark rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "40px", height: "40px", transition: "all 0.3s" }}
              onClick={() =>
                setOpenMenu(openMenu === "hamburger" ? "none" : "hamburger")
              }
            >
              <FontAwesomeIcon icon={faBars} />
            </button>

            {openMenu === "hamburger" && (
              <ul
                className="dropdown-menu show"
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "0.5rem",
                  minWidth: "200px",
                }}
              >
                {/* Nếu chưa đăng nhập */}
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
                  <>
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
                  </>
                )}

                {/* Các mục cố định */}
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
