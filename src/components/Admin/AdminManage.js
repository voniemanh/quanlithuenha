// AdminManage.js
import { useState } from "react";
import { Navigate } from "react-router-dom";
import UserManage from "./UserManage";
import PropertyManage from "./PropertyManage";
import ContractManage from "./ContractManage";
import { useUser } from "../Context/UserContext"; 

export default function AdminManage() {
  const { currentUser } = useUser(); 
  const [tab, setTab] = useState("users");

  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "users" ? "active" : ""}`}
            onClick={() => setTab("users")}
          >
            Users
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "properties" ? "active" : ""}`}
            onClick={() => setTab("properties")}
          >
            Properties
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "contracts" ? "active" : ""}`}
            onClick={() => setTab("contracts")}
          >
            Contracts
          </button>
        </li>
      </ul>

      <div>
        {tab === "users" && <UserManage />}
        {tab === "properties" && <PropertyManage />}
        {tab === "contracts" && <ContractManage />}
      </div>
    </div>
  );
}
