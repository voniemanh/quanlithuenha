import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar/NavBar";
import HomePage from "./components/HomePage/HomePage";
import BookingManage from "./components/Booking/BookingManage";
import PropertyManage from "./components/Admin/PropertyManage";
import UserManage from "./components/Admin/UserManage";
import UserDetail from "./components/User/UserDetail"; 
import PropertyDetail from "./components/Property/PropertyDetail";
import ContractDetail from "./components/User/ContractDetail";
import About from "./components/Company/About";
import Contact from "./components/Company/Contact";
import { UserProvider } from "./components/Context/UserContext";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  return (
    <UserProvider>
      <div className="App">
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/user-detail/:id" element={<UserDetail />} />
            <Route path="/property-detail/:id" element={<PropertyDetail />} />
            <Route path="/contract-detail/:id" element={<ContractDetail />} />
            <Route path="/property-manage" element={<PropertyManage />} />
            <Route path="/booking-manage" element={<BookingManage />} />
            <Route path="/users-manage" element={<UserManage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <footer>
          <p>© 2023 Công ty TNHH ABC. Bảo lưu mọi quyền.</p>
        </footer>
      </div>
    </UserProvider>
  );
}
