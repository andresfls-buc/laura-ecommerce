import logo from "../../assets/logo.png";
import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-section footer-brand">
          <img src={logo} alt="Logo"  />
          <p>Viste con estilo todos los días.</p>
        </div>

        <div className="footer-section">
          <h4>Enlaces</h4>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/catalogue">Catálogo</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contacto</h4>
          <p>contacto@gogouniformes.com</p>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} GoGo Uniformes. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;