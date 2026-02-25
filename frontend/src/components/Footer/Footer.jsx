import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-section">
          <h3>GoGo Uniformes</h3>
          <p>Viste con estilo todos los días.</p>
        </div>

        <div className="footer-section">
          <h4>Enlaces</h4>
          <ul>
            <li>Inicio</li>
            <li>Catálogo</li>
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