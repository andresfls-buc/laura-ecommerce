import logo from "../../assets/logo.png";
import "./Footer.css";
import { Link } from "react-router-dom";
import {
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section footer-brand">
          <img src={logo} alt="Logo" />
          <p>Viste con estilo todos los días.</p>
        </div>

        <div className="footer-section">
          <h4>Enlaces</h4>
          <ul>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/catalogue">Catálogo</Link>
            </li>
            <li>
              <Link to="/contact">Contacto</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section" id="footer-contacto">
          <h4>Contacto</h4>
          <p>gogouniformes@gmail.com</p>
          <div className="footer-social">
            <a
              href="https://instagram.com/gogo_uniformes"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://tiktok.com/@gogo_uniformes"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <FaTiktok />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-payment">
        <span className="footer-payment-label">Métodos de pago aceptados</span>
        <div className="payment-icons">
          <FaCcVisa title="Visa" />
          <FaCcMastercard title="Mastercard" />
          <FaCcAmex title="American Express" />
          <span className="pse-badge">PSE</span>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} GoGo Uniformes. Todos los derechos
        reservados.
      </div>
    </footer>
  );
};

export default Footer;
