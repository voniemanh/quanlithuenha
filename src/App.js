import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar/NavBar";
import HomePage from "./components/HomePage/HomePage";
import AdminManage from "./components/Admin/AdminManage";
import UserDetail from "./components/User/UserDetail"; 
import PropertyDetail from "./components/Property/PropertyDetail";
import ContractDetail from "./components/User/ContractDetail";
import About from "./components/Company/About";
import Contact from "./components/Company/Contact";
import Footer from "./components/Footer/Footer";
import { UserProvider } from "./components/Context/UserContext";
import News from "./components/Company/News";
import Particles from "./components/util/Particles"; 
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  return (
    <UserProvider>
      <Particles fillColor="#e6f1f7" strokeColor="#3a92c5" />
      <div className="App">
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/user-detail/:id" element={<UserDetail />} />
            <Route path="/property-detail/:id" element={<PropertyDetail />} />
            <Route path="/contract-detail/:id" element={<ContractDetail />} />
            <Route path="/admin-manage" element={<AdminManage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/news" element={<News />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </UserProvider>
  );
}
