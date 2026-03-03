import React, { useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext"; // ✅ Added cart context
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartItems } = useCart(); // ✅ Access the cart state

  // Calculate the total quantity (sum of all quantities)
  const totalItems = cartItems?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </div>

        <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link></li>
          <li><Link to="/catalogue" onClick={() => setMenuOpen(false)}>Catálogo</Link></li>
          <li><Link to="/contact" onClick={() => setMenuOpen(false)}>Contacto</Link></li>
        </ul>

        {/* ✅ Cart Icon now links to /cart and shows the badge */}
        <div className="navbar-cart">
          <Link to="/cart" className="cart-icon-wrapper">
            <FiShoppingCart />
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </Link>
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