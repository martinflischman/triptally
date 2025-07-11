import { useState, useEffect } from "react";

export default function ClientNavBar({ userAvatar, userDisplay, handleLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 flex items-center justify-between h-16 px-6 md:px-12 font-sans transition-all duration-300 bg-white"
      style={{fontFamily: '-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif'}}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center">
        <span className="text-lg font-bold text-gray-800">{userDisplay}</span>
      </div>
      <div className="flex items-center">
        <img src={userAvatar} alt="User Avatar" className="w-8 h-8 rounded-full mr-2" />
        <button onClick={handleLogout} className="text-gray-600 hover:text-gray-900">
          Logout
        </button>
      </div>
    </nav>
  );
} 