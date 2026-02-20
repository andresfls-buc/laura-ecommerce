import React, { useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <div className="navbar-logo">
          GogoUniforms
        </div>

        <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <li>Inicio</li>
          <li>Catálogo</li>
          <li>Contacto</li>
        </ul>

        <div className="navbar-cart">
          <FiShoppingCart />
        </div>

        <div
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </div>

      </div>
    </nav>
  );
}

export default Navbar;