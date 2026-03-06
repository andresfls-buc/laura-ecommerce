import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalogue from "./pages/Catalogue";
import ProductDetail from "./pages/ProductDetail";
import { CartProvider } from "./context/CartContext";
import Cart from "./pages/Cart";
import ThankYou from "./pages/ThankYou";

function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>

        <Footer />
      </Router>
    </CartProvider>
  );
}

export default App;