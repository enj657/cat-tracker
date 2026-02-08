import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import AddCatForm from "./components/AddCatForm";
import CatDetails from "./pages/CatDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />  {/* Add this line! */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/add-cat" element={<ProtectedRoute><AddCatForm onCatSave={() => {}} /></ProtectedRoute>} />
          <Route path="/cats/:id" element={<ProtectedRoute><CatDetails /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}