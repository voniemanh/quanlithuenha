// AlertContext.js
import { createContext, useContext, useState, useCallback } from "react";
import ModalWrapper from "../Modal/ModalWrapper";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [modal, setModal] = useState({
    show: false,
    type: "alert",
    title: "",
    message: "",
    resolve: null,
  });

  const showAlert = useCallback((message, type = "info") => {
    const title = type.charAt(0).toUpperCase() + type.slice(1);
    setModal({ show: true, type: "alert", title, message, resolve: null });
  }, []);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setModal({ show: true, type: "confirm", title: "Xác nhận", message, resolve });
    });
  }, []);

  const closeModal = () => {
    if (modal.type === "alert") setModal(prev => ({ ...prev, show: false }));
    else if (modal.type === "confirm") {
      if (modal.resolve) modal.resolve(false);
      setModal({ show: false, type: "alert", title: "", message: "", resolve: null });
    }
  };

  const handleConfirm = (result) => {
    if (modal.resolve) modal.resolve(result);
    setModal({ show: false, type: "alert", title: "", message: "", resolve: null });
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      <ModalWrapper show={modal.show} handleClose={closeModal} title={modal.title}>
        <p>{modal.message}</p>
        <div className="d-flex justify-content-end gap-2">
          {modal.type === "confirm" && (
            <>
              <button className="btn-black" onClick={() => handleConfirm(false)}>Hủy</button>
              <button className="btn-outline-black" onClick={() => handleConfirm(true)}>Đồng ý</button>
            </>
          )}
          {modal.type === "alert" && (
            <button className="btn-black" onClick={closeModal}>OK</button>
          )}
        </div>
      </ModalWrapper>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}
