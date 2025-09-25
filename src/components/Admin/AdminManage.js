import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserManage from "./UserManage";
import PropertyManage from "./PropertyManage";
import ContractManage from "./ContractManage";
import { useUser } from "../Context/UserContext"; 

export default function AdminManage() {
  const { currentUser } = useUser(); 
  const [tab, setTab] = useState("users");
  const navigate = useNavigate();

  if (!currentUser || currentUser.role !== "admin") {
    navigate("/");
  }

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs mb-3 gap-2">
        <li className="nav-item">
          <button
            className={`nav-link border ${tab === "users" ? "active bg-pink text-white" : "bg-light text-dark"}`}
            onClick={() => setTab("users")}
          >
            Users
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link border  ${tab === "properties" ? "active bg-pink text-white" : "bg-light text-dark"}`}
            onClick={() => setTab("properties")}
          >
            Properties
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link border  ${tab === "contracts" ? "active bg-pink text-white" : "bg-light text-dark"}`}
            onClick={() => setTab("contracts")}
          >
            Contracts
          </button>
        </li>
      </ul>

      <div className="fade-in">
        {tab === "users" && <UserManage />}
        {tab === "properties" && <PropertyManage />}
        {tab === "contracts" && <ContractManage />}
      </div>
    </div>
  );
}
