export default function News() {
  const newsList = [
    { id: 1, title: "Cập nhật chính sách cho thuê nhà mới", date: "10/09/2025", summary: "Chúng tôi cập nhật các quy định mới để đảm bảo quyền lợi của cả chủ nhà và khách thuê." },
    { id: 2, title: "Mẹo tìm nhà nhanh chóng và an toàn", date: "08/09/2025", summary: "Hướng dẫn bạn cách chọn nhà, kiểm tra hợp đồng và tránh rủi ro." },
    { id: 3, title: "Sự kiện gặp gỡ cộng đồng thuê nhà", date: "05/09/2025", summary: "Tham gia sự kiện offline để kết nối với các chủ nhà và người thuê khác." },
    { id: 4, title: "Giới thiệu tính năng mới trên nền tảng", date: "01/09/2025", summary: "Chúng tôi ra mắt các tính năng mới giúp bạn tìm nhà dễ dàng hơn." },
    { id: 5, title: "Chia sẻ kinh nghiệm từ người thuê nhà", date: "28/08/2025", summary: "Những câu chuyện thực tế và lời khuyên hữu ích từ cộng đồng." }
  ];

  return (
    <div className="container my-4">
      <h1 className="mb-4 text-center">Thông báo</h1>
      {newsList.map((news, index) => (
        <div
          key={news.id}
          className="pb-3 mb-3"
          style={{ borderBottom: index !== newsList.length - 1 ? "1px solid #ddd" : "none" }}
        >
          <h5>{news.title}</h5>
          <small className="text-muted">{news.date}</small>
          <p>{news.summary}</p>
        </div>
      ))}
    </div>
  );
}
