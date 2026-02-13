import { useState } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentPage("landing");
  };

  return (
    <>
      {currentPage === "landing" && <Landing onNavigate={handleNavigate} />}
      {currentPage === "login" && <Login onNavigate={handleNavigate} />}
      {currentPage === "register" && <Register onNavigate={handleNavigate} />}
      {currentPage === "user-dashboard" && <UserDashboard onNavigate={handleNavigate} onLogout={handleLogout} />}
      {currentPage === "admin-dashboard" && <AdminDashboard onNavigate={handleNavigate} onLogout={handleLogout} />}
    </>
  );
}

export default App;