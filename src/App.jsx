import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/NavBar.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ClassifyPage from "./pages/ClassifyPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import StudentsPage from "./pages/students/StudentsPage.jsx";
import AddStudentPage from "./pages/students/AddStudentPage.jsx";
import EditStudentPage from "./pages/students/EditStudentPage.jsx";
import DashboardPage from "./pages/students/DashboardPage.jsx";
import NotFound from "./NotFound.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/classify" element={<ClassifyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/students"
          element={<ProtectedRoute><StudentsPage /></ProtectedRoute>}
        />
        <Route
          path="/students/add"
          element={<ProtectedRoute><AddStudentPage /></ProtectedRoute>}
        />
        <Route
          path="/students/edit/:id"
          element={<ProtectedRoute><EditStudentPage /></ProtectedRoute>}
        />
        <Route
          path="/students/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
