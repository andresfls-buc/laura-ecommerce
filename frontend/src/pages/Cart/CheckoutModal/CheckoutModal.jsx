import { useState, useEffect } from "react";
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiMap,
  FiHash,
  FiCreditCard,
  FiSmartphone,
  FiGlobe,
} from "react-icons/fi";
import "./CheckoutModal.css";

const SURCHARGE_RATE = 0.05;

const PAYMENT_OPTIONS = [
  {
    id: "nequi",
    label: "Nequi",
    sublabel: "Sin recargo",
    icon: FiSmartphone,
    color: "#7c3aed",
    bg: "#f3eeff",
  },
  {
    id: "daviplata",
    label: "Daviplata",
    sublabel: "Sin recargo",
    icon: FiSmartphone,
    color: "#e05c10",
    bg: "#fff4ed",
  },
  {
    id: "pse",
    label: "PSE",
    sublabel: "Sin recargo",
    icon: FiGlobe,
    color: "#0369a1",
    bg: "#f0f9ff",
  },
  {
    id: "credit_card",
    label: "Tarjeta",
    sublabel: "+ 5% recargo",
    icon: FiCreditCard,
    color: "#059669",
    bg: "#ecfdf5",
  },
];

const initialForm = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  shippingAddress: "",
  shippingCity: "",
  shippingPostalCode: "",
  paymentMethod: "nequi",
};

const CheckoutModal = ({ isOpen, onClose, onConfirm, loading, subtotal, shippingCost }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("checkout-open");
    } else {
      document.body.classList.remove("checkout-open");
    }
    return () => document.body.classList.remove("checkout-open");
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!form.customerName.trim())
      newErrors.customerName = "El nombre es obligatorio.";
    if (!form.customerEmail.trim()) {
      newErrors.customerEmail = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
      newErrors.customerEmail = "Ingresa un correo válido.";
    }
    if (!form.customerPhone.trim()) {
      newErrors.customerPhone = "El teléfono es obligatorio.";
    } else if (!/^\d{7,15}$/.test(form.customerPhone.replace(/\s/g, ""))) {
      newErrors.customerPhone = "Ingresa un teléfono válido.";
    }
    if (!form.shippingAddress.trim())
      newErrors.shippingAddress = "La dirección es obligatoria.";
    if (!form.shippingCity.trim())
      newErrors.shippingCity = "La ciudad es obligatoria.";
    if (!form.shippingPostalCode.trim()) {
      newErrors.shippingPostalCode = "El código postal es obligatorio.";
    } else if (!/^\d{4,10}$/.test(form.shippingPostalCode)) {
      newErrors.shippingPostalCode = "Ingresa un código postal válido.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onConfirm(form);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const base = subtotal + shippingCost;
  const surcharge = form.paymentMethod === "credit_card" ? Math.round(base * SURCHARGE_RATE) : 0;
  const total = base + surcharge;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-text">
            <span className="modal-step">Paso 1 de 2</span>
            <h2 className="modal-title">Datos de envío</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <FiX />
          </button>
        </div>

        <div className="modal-divider" />

        {/* Aviso métodos de pago */}
        <div className="modal-payment-notice">
          <span className="modal-payment-notice-icon">ℹ️</span>
          <p>
            Esta tienda acepta pagos únicamente a través de{" "}
            <strong>Nequi</strong>, <strong>Daviplata</strong>,{" "}
            <strong>PSE</strong> y <strong>tarjeta de crédito/débito</strong>.
            Al continuar, asegúrate de seleccionar uno de estos métodos en la
            pasarela de pago.
          </p>
        </div>

        {/* Form */}
        <div className="modal-body">
          <div className="form-grid">
            {/* Nombre */}
            <div className="form-group full-width">
              <label className="form-label">
                <FiUser className="label-icon" /> Nombre completo
              </label>
              <input
                className={`form-input ${errors.customerName ? "input-error" : ""}`}
                type="text"
                name="customerName"
                placeholder="Ej. Juan Pérez"
                value={form.customerName}
                onChange={handleChange}
              />
              {errors.customerName && <span className="error-msg">{errors.customerName}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                <FiMail className="label-icon" /> Correo electrónico
              </label>
              <input
                className={`form-input ${errors.customerEmail ? "input-error" : ""}`}
                type="email"
                name="customerEmail"
                placeholder="correo@ejemplo.com"
                value={form.customerEmail}
                onChange={handleChange}
              />
              {errors.customerEmail && <span className="error-msg">{errors.customerEmail}</span>}
            </div>

            {/* Teléfono */}
            <div className="form-group">
              <label className="form-label">
                <FiPhone className="label-icon" /> Teléfono
              </label>
              <input
                className={`form-input ${errors.customerPhone ? "input-error" : ""}`}
                type="tel"
                name="customerPhone"
                placeholder="3001234567"
                value={form.customerPhone}
                onChange={handleChange}
              />
              {errors.customerPhone && <span className="error-msg">{errors.customerPhone}</span>}
            </div>

            {/* Dirección */}
            <div className="form-group full-width">
              <label className="form-label">
                <FiMapPin className="label-icon" /> Dirección de envío
              </label>
              <input
                className={`form-input ${errors.shippingAddress ? "input-error" : ""}`}
                type="text"
                name="shippingAddress"
                placeholder="Calle 123 # 45-67, Apto 201"
                value={form.shippingAddress}
                onChange={handleChange}
              />
              {errors.shippingAddress && <span className="error-msg">{errors.shippingAddress}</span>}
            </div>

            {/* Ciudad */}
            <div className="form-group">
              <label className="form-label">
                <FiMap className="label-icon" /> Ciudad
              </label>
              <input
                className={`form-input ${errors.shippingCity ? "input-error" : ""}`}
                type="text"
                name="shippingCity"
                placeholder="Bogotá"
                value={form.shippingCity}
                onChange={handleChange}
              />
              {errors.shippingCity && <span className="error-msg">{errors.shippingCity}</span>}
            </div>

            {/* Código Postal */}
            <div className="form-group">
              <label className="form-label">
                <FiHash className="label-icon" /> Código postal
              </label>
              <input
                className={`form-input ${errors.shippingPostalCode ? "input-error" : ""}`}
                type="text"
                name="shippingPostalCode"
                placeholder="110111"
                value={form.shippingPostalCode}
                onChange={handleChange}
              />
              {errors.shippingPostalCode && <span className="error-msg">{errors.shippingPostalCode}</span>}
            </div>

            {/* Método de pago */}
            <div className="form-group full-width">
              <label className="form-label">
                <FiCreditCard className="label-icon" /> Método de pago
              </label>
              <div className="payment-method-grid">
                {PAYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const selected = form.paymentMethod === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`payment-option ${selected ? "payment-option--selected" : ""}`}
                      style={selected ? { borderColor: option.color, background: option.bg } : {}}
                      onClick={() => setForm((prev) => ({ ...prev, paymentMethod: option.id }))}
                    >
                      <span
                        className="payment-option__icon"
                        style={{ color: option.color, background: option.bg }}
                      >
                        <Icon size={18} />
                      </span>
                      <span className="payment-option__label">{option.label}</span>
                      <span
                        className="payment-option__sublabel"
                        style={selected ? { color: option.color } : {}}
                      >
                        {option.sublabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="modal-footer-total">
            <div className="modal-footer-total-breakdown">
              <span className="modal-footer-total-label">Total</span>
              {surcharge > 0 && (
                <span className="modal-footer-surcharge">
                  Recargo tarjeta: +${surcharge.toLocaleString("es-CO")} COP
                </span>
              )}
            </div>
            <span className="modal-footer-total-amount">
              ${total.toLocaleString("es-CO")} COP
            </span>
          </div>

          <div className="modal-footer-actions">
            <button className="btn-cancel" onClick={onClose} disabled={loading}>
              Volver al carrito
            </button>
            <button className="btn-pay" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" /> Procesando...
                </span>
              ) : (
                "Ir a Pagar →"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
