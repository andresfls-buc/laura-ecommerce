import { Link } from "react-router-dom";

function Hero() {
  return (
    <div className="hero">
      <h1>Bienvenido a tu tienda favorita GoGo Uniformes</h1>
      <p>Explora nuestros productos y encuentra lo que necesitas</p>
      <Link to="/catalogue" className="btn-primary">
        Ver Productos
      </Link>
    </div>
  );
}

export default Hero;