import { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Preferences from "./pages/Preferences";
import MisTextos from "./pages/MisTextos";
import NuevaEntrada from "./pages/NuevaEntrada";
import Vocabulario from "./pages/Vocabulario";
import VocabularioForm from "./pages/VocabularioForm";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [editTextId, setEditTextId] = useState(null);
  const [editVocabId, setEditVocabId] = useState(null);
  const [pageHistory, setPageHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.is_admin) {
        setCurrentPage("admin-dashboard");
      } else {
        setCurrentPage("user-dashboard");
      }
    }
  }, []);

  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      if (pageHistory.length > 0) {
        const previousPage = pageHistory[pageHistory.length - 1];
        setPageHistory(prev => prev.slice(0, -1));
        setCurrentPage(previousPage);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [pageHistory]);

  const handleNavigate = (page) => {
    setPageHistory(prev => [...prev, currentPage]);
    window.history.pushState(null, '', window.location.pathname);
    
    if (page.startsWith("editar-texto-")) {
      setEditTextId(parseInt(page.replace("editar-texto-", "")));
      setCurrentPage("editar-texto");
    } else if (page.startsWith("editar-vocab-")) {
      setEditVocabId(parseInt(page.replace("editar-vocab-", "")));
      setCurrentPage("editar-vocab");
    } else {
      setEditTextId(null);
      setEditVocabId(null);
      setCurrentPage(page);
    }
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setPageHistory([]);
    setCurrentPage("landing");
  };

  return (
    <>
      {currentPage === "landing" && <Landing onNavigate={handleNavigate} />}
      {currentPage === "login" && <Login onNavigate={handleNavigate} />}
      {currentPage === "register" && <Register onNavigate={handleNavigate} />}
      {currentPage === "user-dashboard" && <UserDashboard onNavigate={handleNavigate} onLogout={handleLogout} />}
      {currentPage === "admin-dashboard" && <AdminDashboard onNavigate={handleNavigate} onLogout={handleLogout} />}
      {currentPage === "preferences" && <Preferences onNavigate={handleNavigate} onLogout={handleLogout} />}
      {currentPage === "mis-textos" && <MisTextos onNavigate={handleNavigate} onLogout={handleLogout} />}
      {currentPage === "nueva-entrada" && <NuevaEntrada onNavigate={handleNavigate} onLogout={handleLogout} />}
      {currentPage === "editar-texto" && <NuevaEntrada onNavigate={handleNavigate} onLogout={handleLogout} editTextId={editTextId} />}
      {currentPage === "vocabulario" && <Vocabulario onNavigate={handleNavigate} onLogout={handleLogout} />}
      {currentPage === "nueva-palabra" && <VocabularioForm onNavigate={handleNavigate} onLogout={handleLogout} />}
      {currentPage === "editar-vocab" && <VocabularioForm onNavigate={handleNavigate} onLogout={handleLogout} editVocabId={editVocabId} />}
    </>
  );
}

export default App;