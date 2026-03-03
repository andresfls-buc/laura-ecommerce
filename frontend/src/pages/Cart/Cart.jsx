import { useCart } from "../../context/CartContext";
import { FiTrash2 } from "react-icons/fi"; // ✅ Standard trash icon
import "./Cart.css";

const Cart = () => {
  const { cartItems, setCartItems } = useCart();
  const items = cartItems || [];

  const updateQuantity = (id, delta) => {
    const updatedItems = items.map((item) => {
      if (item.productVariantId === id) {
        const newQuantity = (item.quantity || 1) + delta;
        if (newQuantity < 1) return item; 
        if (newQuantity > item.stock) {
          alert(`Solo hay ${item.stock} disponibles.`);
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedItems);
  };

  const removeItem = (id) => {
    const filtered = items.filter((item) => item.productVariantId !== id);
    setCartItems(filtered);
  };

  const total = items.reduce((acc, item) => acc + Number(item.price) * (item.quantity || 1), 0);

  if (!items.length) return <div className="cart-empty"><h2>Tu carrito está vacío 🛒</h2></div>;

  return (
    <div className="cart-page">
      <h1 className="cart-title">Tu Carrito</h1>
      <div className="cart-container">
        
        <div className="cart-items-section">
          {items.map((item) => (
            <div key={item.productVariantId} className="cart-card">
              <img src={item.image} alt={item.name} className="cart-card-img" />
              
              <div className="cart-card-info">
                <h3>{item.name}</h3>
                <p>{item.color} / {item.size}</p>
                
                <div className="cart-qty-selector">
                  <button onClick={() => updateQuantity(item.productVariantId, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productVariantId, 1)} 
                    disabled={item.quantity >= item.stock}
                  >+</button>
                </div>
              </div>

              <div className="cart-card-price">
                <p>${(Number(item.price) * item.quantity).toLocaleString("es-CO")} COP</p>
                {/* ✅ New professional delete icon button */}
                <button 
                  onClick={() => removeItem(item.productVariantId)} 
                  className="delete-icon-btn"
                  title="Eliminar"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Resumen</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${total.toLocaleString("es-CO")}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toLocaleString("es-CO")}</span>
          </div>
          <button className="checkout-btn">Finalizar Compra</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;