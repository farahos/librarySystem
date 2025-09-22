// src/components/Header.jsx
import { Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  return (
    <nav className="bg-gradient-to-r from-indigo-300 to-gray-700 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        {/* Logo / Title */}
        <h1 className="text-2xl font-extrabold tracking-wider hover:scale-105 transition-transform duration-300 cursor-pointer">
          📚 Book System
        </h1>

        {/* Navigation Links */}
        <ul className="flex space-x-6 items-center">
          {user ? (
            <>
              <li>
                <Link
                  to="/Home"
                  className="relative group px-2 py-1 font-medium hover:text-yellow-300 transition-colors duration-300"
                >
                  Home
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-300 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  to="/Books"
                  className="relative group px-2 py-1 font-medium hover:text-yellow-300 transition-colors duration-300"
                >
                  Books
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-300 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  to="/Booked"
                  className="relative group px-2 py-1 font-medium hover:text-yellow-300 transition-colors duration-300"
                >
                  My Book
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-300 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => logout()}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/Register"
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Header;
