import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CONTRACTS_URL, PROPERTIES_URL, USERS_URL } from "../../config";
import { useUser } from "../Context/UserContext";
import { checkAvailable } from "../util/CheckAvailable";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

  const printRef = useRef(null);

  const handlePrintPDF = async () => {
    if (!printRef.current) return;

    const element = printRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

    let position = 0;
    if (pdfHeight < pageHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfHeight);
    } else {
      let remainingHeight = pdfHeight;
      while (remainingHeight > 0) {
        pdf.addImage(imgData, "PNG", 0, position, pageWidth, pdfHeight);
        remainingHeight -= pageHeight;
        if (remainingHeight > 0) pdf.addPage();
        position -= pageHeight;
      }
    }

    pdf.save(`HopDongThueNha-${contract.id}.pdf`);
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const contractRes = await axios.get(`${CONTRACTS_URL}/${id}`);
        const contractData = contractRes.data;

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
  }, [id, currentUser, navigate]);

  const handleCancel = async () => {
    if (!contract || contract.status !== "pending") return;
    setUpdating(true);
    try {
      const updatedContract = { ...contract, status: "canceled" };
      await axios.put(`${CONTRACTS_URL}/${contract.id}`, updatedContract);
      setContract(updatedContract);
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
        const newStatus = checkAvailable(updatedContract);
        const updatedProperty = { ...property, status: newStatus };
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
  if (accessDenied) return <p className="ms-3">Bạn không thể xem hợp đồng này!</p>;
  if (!contract || !property || !user) return <p>Không tìm thấy thông tin hợp đồng!</p>;

  const isOwner = currentUser?.id === contract.userId;

  return (
    <div className="container my-4 p-4 fade-in">
      <h3 className="mb-4">Chi tiết hợp đồng</h3>

      <div ref={printRef} className="card p-3">
        <div className="row align-items-start flex-row-reverse">
          <div className="col-12 col-md-6 text-start">
            <h5>Thông tin người thuê</h5>
            <table className="table table-borderless">
              <tbody>
                <tr>
                  <td className="fw-bold" style={{ width: "150px" }}>Họ tên:</td>
                  <td>{user.name || user.username}</td>
                  </tr>
                <tr>
                  <td className="fw-bold">Email:</td>
                  <td>{user.email || "Không có"}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Số điện thoại:</td>
                  <td>{user.phone || "Không có"}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Địa chỉ:</td>
                  <td>{user.address || "Không có"}</td>
                </tr>
                <tr>
                  <td className="fw-bold">CCCD:</td>
                  <td>{user.cccd || "Không có"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="col-12 col-md-6 text-start">
            <h5>Thông tin hợp đồng</h5>
            <table className="table table-borderless">
              <tbody>
                <tr>
                  <td className="fw-bold" style={{ width: "150px" }}>Ngày bắt đầu:</td>
                  <td>{contract.startDate}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Ngày kết thúc:</td>
                  <td>{contract.endDate || "Chưa có"}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Số khách:</td>
                  <td>{contract.guests || 1}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Tổng tiền:</td>
                  <td>{contract.payment.toLocaleString()} VND</td>
                </tr>
                <tr>
                  <td className="fw-bold">Trạng thái:</td>
                  <td>{contract.status === "paid" ? `Đã thanh toán (ngày ${contract.paidAt || "không rõ"})` : contract.status}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="row align-items-start mt-2">
          <div className="col-12 col-md-6 text-start">
            {property.image && <img src={property.image} alt={property.name} className="img-fluid rounded mb-3" style={{ maxWidth: "300px" }} />}
          </div>
          <div className="col-12 col-md-6 text-start">
            <h5>Thông tin phòng</h5>
            <table className="table table-borderless">
              <tbody>
                <tr>
                  <td className="fw-bold" style={{ width: "150px" }}>Tên phòng:</td>
                  <td>{property.name}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Địa chỉ:</td>
                  <td>{property.address}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Giá thuê 1 tháng:</td>
                  <td>{property.price.toLocaleString()} VND</td>
                </tr>
                <tr>
                  <td className="fw-bold">Tiện nghi:</td>
                  <td>{(property.amenitiesList || []).join(", ") || "Không có"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isOwner && (
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
              className="btn btn-success me-2"
              onClick={handlePay}
              disabled={updating}
            >
              Thanh toán
            </button>
          )}
          <button
            className="btn-black"
            onClick={handlePrintPDF}
          >
            In hợp đồng (PDF)
          </button>
        </div>
      )}

      <button className="btn btn-outline-secondary mt-4" onClick={() => navigate(-1)}>
        Quay lại
      </button>
    </div>
  );
}
