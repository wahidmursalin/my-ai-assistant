import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateAssistant from "./pages/CreateAssistant.jsx";
import Chat from "./pages/Chat.jsx";
import TeachAssistant from "./pages/TeachAssistant.jsx";
import Memory from "./pages/Memory.jsx";
import Knowledge from "./pages/Knowledge.jsx";
import AdminReviews from "./pages/AdminReviews.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/assistants/new" element={<PrivateRoute><CreateAssistant /></PrivateRoute>} />
      <Route path="/assistants/:id/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
      <Route path="/assistants/:id/teach" element={<PrivateRoute><TeachAssistant /></PrivateRoute>} />
      <Route path="/assistants/:id/memory" element={<PrivateRoute><Memory /></PrivateRoute>} />
      <Route path="/assistants/:id/knowledge" element={<PrivateRoute><Knowledge /></PrivateRoute>} />

      <Route path="/admin/reviews" element={<PrivateRoute><AdminReviews /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}