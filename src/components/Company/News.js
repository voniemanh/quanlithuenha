export default function News() {
  const newsList = [
    { id: 1, title: "Cập nhật chính sách cho thuê nhà mới", date: "10/09/2025", summary: "Chúng tôi cập nhật các quy định mới để đảm bảo quyền lợi của cả chủ nhà và khách thuê." },
    { id: 2, title: "Mẹo tìm nhà nhanh chóng và an toàn", date: "08/09/2025", summary: "Hướng dẫn bạn cách chọn nhà, kiểm tra hợp đồng và tránh rủi ro." },
    { id: 3, title: "Sự kiện gặp gỡ cộng đồng thuê nhà", date: "05/09/2025", summary: "Tham gia sự kiện offline để kết nối với các chủ nhà và người thuê khác." }
  ];

  return (
    <div className="container my-4">
      <h3 className="mb-3">Thông báo</h3>
      <div className="list-group">
        {newsList.map((news) => (
          <div key={news.id} className="list-group-item">
            <h5>{news.title}</h5>
            <small className="text-muted">{news.date}</small>
            <p>{news.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );

}

  