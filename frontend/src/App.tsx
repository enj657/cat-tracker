import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddCatForm from "./components/AddCatForm";
import CatDetails from "./pages/CatDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-cat" element={<AddCatForm onCatSave={() => {}} />} />
        <Route path="/cats/:id" element={<CatDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
