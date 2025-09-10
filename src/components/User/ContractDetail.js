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
      const updated = { ...contract, status: "canceled" };
      await axios.put(`${CONTRACTS_URL}/${contract.id}`, updated);
      setContract(updated);
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
      const updated = { ...contract, status: "paid" };
      await axios.put(`${CONTRACTS_URL}/${contract.id}`, updated);
      setContract(updated);
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
      </div>

      <div className="card p-3 mb-4">
        <h4>Thông tin hợp đồng</h4>
        <p><strong>Ngày bắt đầu:</strong> {contract.startDate}</p>
        <p><strong>Ngày kết thúc:</strong> {contract.endDate || "Chưa có"}</p>
        <p><strong>Số khách:</strong> {contract.guests || 1}</p>
        <p><strong>Tổng tiền:</strong> {contract.totalPrice?.toLocaleString() || property.price.toLocaleString()} VND</p>
        <p><strong>Trạng thái:</strong> {contract.status}</p>

        <h5 className="mt-3">Lịch sử thanh toán</h5>
        {contract.paymentHistory && contract.paymentHistory.length > 0 ? (
          <ul>
            {contract.paymentHistory.map((pay, idx) => (
              <li key={idx}>
                Tháng: {pay.month} - {pay.paid ? "Đã thanh toán" : "Chưa thanh toán"} {pay.paidAt ? `(Ngày thanh toán: ${pay.paidAt})` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p>Chưa có thanh toán nào</p>
        )}

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
    </div>
  );
}
