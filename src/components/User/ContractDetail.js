import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CONTRACTS_URL, PROPERTIES_URL, USERS_URL } from "../../config";
import { useUser } from "../Context/UserContext";

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const [contract, setContract] = useState(null);
  const [property, setProperty] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contractRes = await axios.get(`${CONTRACTS_URL}/${id}`);
        const contractData = contractRes.data;

        if (!currentUser) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        const isOwner = currentUser.id === contractData.userId;
        const isAdmin = currentUser.role === "admin";

        if (!isOwner && !isAdmin) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        setContract(contractData);

        const [propertyRes, userRes] = await Promise.all([
          axios.get(`${PROPERTIES_URL}/${contractData.propertyId}`),
          axios.get(`${USERS_URL}/${contractData.userId}`)
        ]);

        setProperty(propertyRes.data);
        setUser(userRes.data);
      } catch (err) {
        console.error(err);
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser]);

  const handleCancel = async () => {
    if (!contract || contract.status !== "pending") return;
    setUpdating(true);
    try {
      const updatedContract = { ...contract, status: "canceled" };
      await axios.put(`${CONTRACTS_URL}/${contract.id}`, updatedContract);
      setContract(updatedContract);
      if (property) {
        const updatedProperty = { ...property, status: "available" };
        await axios.put(`${PROPERTIES_URL}/${property.id}`, updatedProperty);
        setProperty(updatedProperty);
      }
      alert("Hủy hợp đồng thành công!");
    } catch (err) {
      console.error(err);
      alert("Hủy hợp đồng thất bại!");
    } finally {
      setUpdating(false);
    }
  };

  const handlePay = async () => {
    if (!contract || contract.status !== "confirmed" || currentUser.id !== contract.userId) return;
    setUpdating(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const updatedContract = { ...contract, status: "paid", paidAt: today };
      await axios.put(`${CONTRACTS_URL}/${contract.id}`, updatedContract);
      setContract(updatedContract);

      if (property) {
        const updatedProperty = { ...property, status: "rented" };
        await axios.put(`${PROPERTIES_URL}/${property.id}`, updatedProperty);
        setProperty(updatedProperty);
      }
      alert("Thanh toán thành công!");
    } catch (err) {
      console.error(err);
      alert("Thanh toán thất bại!");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (accessDenied) return <p>Bạn không có quyền xem hợp đồng này!</p>;
  if (!contract || !property || !user) return <p>Không tìm thấy thông tin hợp đồng!</p>;

  const isOwner = currentUser.id === contract.userId;
  const isAdmin = currentUser.role === "admin";

  return (
    <div className="container my-4">
      <h2>Chi tiết hợp đồng</h2>

      <div className="card p-3 mb-4">
        <h4>Thông tin người thuê</h4>
        <p><strong>Họ tên:</strong> {user.name || user.username}</p>
        <p><strong>Email:</strong> {user.email || "Không có"}</p>
      </div>

      <div className="card p-3 mb-4">
        <h4>Thông tin phòng</h4>
        <p><strong>Tên phòng:</strong> {property.name}</p>
        <p><strong>Địa chỉ:</strong> {property.address}</p>
        <p><strong>Giá thuê 1 tháng:</strong> {property.price.toLocaleString()} VND</p>
        {property.image && (
          <img
            src={property.image}
            alt={property.name}
            className="img-fluid my-2 rounded"
            style={{ maxWidth: "200px" }}
          />
        )}
      </div>

      <div className="card p-3 mb-4">
        <h4>Thông tin hợp đồng</h4>
        <p><strong>Ngày bắt đầu:</strong> {contract.startDate}</p>
        <p><strong>Ngày kết thúc:</strong> {contract.endDate || "Chưa có"}</p>
        <p><strong>Số khách:</strong> {contract.guests || 1}</p>
        <p><strong>Tổng tiền:</strong> {contract.monthlyPayment.toLocaleString()} VND</p>
        <p>
          <strong>Trạng thái:</strong>{" "}
          {contract.status === "paid"
            ? `Đã thanh toán (ngày ${contract.paidAt || "không rõ"})`
            : contract.status}
        </p>

        {!isAdmin && isOwner && (
          <div className="mt-3">
            {contract.status === "pending" && (
              <button
                className="btn btn-danger me-2"
                onClick={handleCancel}
                disabled={updating}
              >
                Hủy hợp đồng
              </button>
            )}
            {contract.status === "confirmed" && (
              <button
                className="btn btn-success"
                onClick={handlePay}
                disabled={updating}
              >
                Thanh toán
              </button>
            )}
          </div>
        )}
      </div>

      <button className="btn btn-secondary" onClick={() => navigate(-1)}>Quay lại</button>
    </div>
  );
}
