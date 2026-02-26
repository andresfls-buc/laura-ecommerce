import React, { useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import "./Navbar.css";


function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <div className="navbar-logo">
          <img src={logo} alt="Logo" />
        </div>

        <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
          
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link></li>

          <li><Link to="/catalogue" onClick={() => setMenuOpen(false)}>Catálogo</Link></li>

          <li><Link to="/contact" onClick={() => setMenuOpen(false)}>Contacto</Link></li>
        </ul>

        <div className="navbar-cart">
          <FiShoppingCart />
        </div>

        <div 
  className={`navbar-toggle ${menuOpen ? "open" : ""}`}
  onClick={() => setMenuOpen(!menuOpen)}
>
  <span></span>
  <span></span>
  <span></span>
</div>

      </div>
    </nav>
  );
}

export default Navbar;