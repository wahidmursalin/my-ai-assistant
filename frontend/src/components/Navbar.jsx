import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-lg font-semibold text-brand-700">
        Custom AI Platform
      </Link>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">Hi, {user.name}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
