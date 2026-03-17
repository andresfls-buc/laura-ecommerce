import { useState } from "react";
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiMap,
  FiHash,
  FiCreditCard,
} from "react-icons/fi";
import "./CheckoutModal.css";

const initialForm = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  shippingAddress: "",
  shippingCity: "",
  shippingPostalCode: "",
  paymentMethod: "wompi", // default
};

const CheckoutModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

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

  // ── Toggle credit card surcharge ────────────────────────────────────────
  const handleCreditCardToggle = () => {
    setForm((prev) => ({
      ...prev,
      paymentMethod:
        prev.paymentMethod === "credit_card" ? "wompi" : "credit_card",
    }));
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

  const isCreditCard = form.paymentMethod === "credit_card";

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
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <FiX />
          </button>
        </div>

        {/* Divider */}
        <div className="modal-divider" />

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
              {errors.customerName && (
                <span className="error-msg">{errors.customerName}</span>
              )}
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
              {errors.customerEmail && (
                <span className="error-msg">{errors.customerEmail}</span>
              )}
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
              {errors.customerPhone && (
                <span className="error-msg">{errors.customerPhone}</span>
              )}
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
              {errors.shippingAddress && (
                <span className="error-msg">{errors.shippingAddress}</span>
              )}
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
              {errors.shippingCity && (
                <span className="error-msg">{errors.shippingCity}</span>
              )}
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
              {errors.shippingPostalCode && (
                <span className="error-msg">{errors.shippingPostalCode}</span>
              )}
            </div>
          </div>

          {/* ── Credit Card Toggle ─────────────────────────────────────────── */}
          <div
            className={`credit-card-toggle ${isCreditCard ? "active" : ""}`}
            onClick={handleCreditCardToggle}
          >
            <div className="credit-card-toggle-left">
              <FiCreditCard className="credit-card-icon" />
              <div className="credit-card-toggle-text">
                <span className="credit-card-label">
                  Pagar con tarjeta de crédito
                </span>
                <span className="credit-card-sublabel">
                  {isCreditCard
                    ? "Se aplicará un recargo del 5% sobre el total"
                    : "Aplica un recargo del 5% sobre el total"}
                </span>
              </div>
            </div>
            <div className={`toggle-switch ${isCreditCard ? "on" : "off"}`}>
              <div className="toggle-knob" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
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
  );
};

export default CheckoutModal;
