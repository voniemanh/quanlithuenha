import React, { useEffect, useState } from "react";
import { NEWS_URL } from "../../config";
import { useUser } from "../Context/UserContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function News() {
  const [newsList, setNewsList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: "", summary: "" });
  const [newData, setNewData] = useState({ title: "", summary: "" });

  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === "admin";

  const formatDate = (isoDate) => {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(NEWS_URL);
        let data = await response.json();

        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNewsList(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await fetch(`${NEWS_URL}/${id}`, { method: "DELETE" });
      setNewsList((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting news:", error);
    }
  };

  const handleEdit = (news) => {
    setEditingId(news.id);
    setEditData({ title: news.title, summary: news.summary });
  };

  const handleSave = async (id) => {
    try {
      const updated = { ...editData, date: new Date().toISOString() };
      await fetch(`${NEWS_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setNewsList((prev) =>
        prev
          .map((n) => (n.id === id ? { ...n, ...updated } : n))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error updating news:", error);
    }
  };

  const handleAdd = async () => {
    try {
      const newItem = {
        ...newData,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };
      await fetch(NEWS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      setNewsList((prev) =>
        [...prev, newItem].sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      setNewData({ title: "", summary: "" });
    } catch (error) {
      console.error("Error adding news:", error);
    }
  };

  return (
    <div className="container my-4">
      <h1 className="mb-4 text-center">Thông báo</h1>
      {newsList.length === 0 ? (
        <p className="text-center text-muted">Chưa có thông báo nào</p>
      ) : (
        newsList.map((news, index) => (
          <div
            key={news.id}
            className="pb-3 mb-3"
            style={{
              borderBottom:
                index !== newsList.length - 1 ? "1px solid #ddd" : "none",
            }}
          >
            {editingId === news.id ? (
              <>
                <input
                  type="text"
                  className="form-control mb-2"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
                <ReactQuill
                  theme="snow"
                  value={editData.summary}
                  onChange={(value) =>
                    setEditData((prev) => ({ ...prev, summary: value }))
                  }
                  className="mb-2"
                />
                <button
                  className="btn btn-outline-success me-2"
                  onClick={() => handleSave(news.id)}
                >
                  Lưu
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setEditingId(null)}
                >
                  Huỷ
                </button>
              </>
            ) : (
              <>
                <h5>{news.title}</h5>
                <small className="text-muted">{formatDate(news.date)}</small>
                <div dangerouslySetInnerHTML={{ __html: news.summary }} />

                {isAdmin && (
                  <div className="mt-2">
                    <button
                      className="btn btn-sm btn-outline-warning me-2"
                      onClick={() => handleEdit(news)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(news.id)}
                    >
                      Xoá
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))
      )}
            {isAdmin && (
        <div className="mb-5 p-3 border rounded">
          <h4>Thêm thông báo mới</h4>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Tiêu đề"
            value={newData.title}
            onChange={(e) =>
              setNewData((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <ReactQuill
            theme="snow"
            value={newData.summary}
            onChange={(value) =>
              setNewData((prev) => ({ ...prev, summary: value }))
            }
            className="mb-2"
          />
          <button className="btn btn-outline-primary" onClick={handleAdd}>
            Thêm
          </button>
        </div>
      )}
    </div>
  );
}
