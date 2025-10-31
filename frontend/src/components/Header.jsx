// src/components/Header.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useEffect, useState } from "react";

const Header = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { to: "/Home", label: "Home" },
    { to: "/Books", label: "Books" },
    { to: "/Booked", label: "My Book" },
    { to: "/About", label: "About" },
    { to: "/Contact", label: "Contect" },


  ];

  const linkBaseClasses = "relative group px-3 py-2 font-medium transition-all duration-300 rounded-lg";
  const linkActiveClasses = "text-yellow-300 bg-white/10";
  const linkHoverClasses = "hover:text-yellow-300 hover:bg-white/10";
  const underlineClasses = "absolute left-3 -bottom-1 w-0 h-0.5 bg-yellow-300 transition-all group-hover:w-[calc(100%-1.5rem)]";

  return (
    <nav className={`bg-gradient-to-r from-indigo-300 to-gray-700 text-white p-4 shadow-2xl sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? "py-3" : "py-4"
    }`}>
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        {/* Logo / Title */}
        <Link 
          to={user ? "/Home" : "/login"} 
          className="text-2xl font-extrabold tracking-wider hover:scale-105 transition-transform duration-300 cursor-pointer flex items-center space-x-2"
        >
          <span className="text-2xl">📚Dhaxalbook</span>
          {/* <span className="hidden sm:inline">Book System</span> */}
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden md:flex items-center space-x-2">
          <ul className="flex space-x-2 items-center">
            {user ? (
              <>
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className={`${linkBaseClasses} ${linkHoverClasses} ${
                        location.pathname === link.to ? linkActiveClasses : ""
                      }`}
                    >
                      {link.label}
                      <span className={underlineClasses}></span>
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => logout()}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 active:bg-red-700 shadow-lg hover:shadow-red-500/25"
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
                    className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 active:scale-95 active:bg-indigo-100 shadow-lg hover:shadow-indigo-500/25"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/Register"
                    className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 active:scale-95 active:bg-indigo-100 shadow-lg hover:shadow-indigo-500/25"
                  >
                    Register
                  </Link>
                </li>
              </>
              
            )}
            
          </ul>
        </div>

        {/* Mobile Menu Button - Visible only on mobile */}
        
        <div className="md:hidden flex items-center space-x-4">
         
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 active:scale-95"
            aria-label="Toggle menu"
          >
            
            <div className="w-6 h-6 flex flex-col justify-between">
              
              <span className={`w-full h-0.5 bg-white rounded transform transition-all duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-2.5" : ""
              }`}></span>
              <span className={`w-full h-0.5 bg-white rounded transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}></span>
              <span className={`w-full h-0.5 bg-white rounded transform transition-all duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-2.5" : ""
              }`}></span>
              
            </div>
          </button>
          
        </div>
        
      </div>
      

      {/* Mobile Menu - Slides down when open */}
      
      <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
        isMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
        
      }`}>
        
        <ul className="flex flex-col space-y-3 pb-4">
          
          {user ? (
            navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`${linkBaseClasses} ${linkHoverClasses} block text-center py-3 ${
                    location.pathname === link.to ? linkActiveClasses : ""
                  }`}
                >
                  {link.label}
                  <span className={`${underlineClasses} left-1/2 transform -translate-x-1/2 group-hover:w-3/4`}></span>
                </Link>
              </li>
            ))
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className="bg-white text-indigo-600 px-4 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 active:scale-95 block text-center mx-4"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/Register"
                  className="bg-white text-indigo-600 px-4 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 active:scale-95 block text-center mx-4"
                >
                  Register
                </Link>
              </li>
            </>
          )}
           {user && (
            <button
              onClick={() => logout()}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm"
            >
              Logout
            </button>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Header;