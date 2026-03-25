import React, { useState } from "react";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    orderNumber: "",
    message: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const BASE_URL =
        process.env.REACT_APP_API_URL || "http://localhost:3000/api";
      const res = await fetch(`${BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar el mensaje.");
      }

      setShowSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        orderNumber: "",
        message: "",
      });

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqData = [
    {
      question: "¿Cómo puedo rastrear mi pedido?",
      answer:
        "Contáctanos por email a gogouniformes@gmail.com con tu número de pedido y nombre, te responderemos con la información actualizada de tu envío dentro de 24 horas.",
    },
    {
      question: "¿Cuál es su política de devoluciones?",
      answer:
        "Ofrecemos una política de devolución de 15 días en la mayoría de los artículos. Los productos deben estar sin usar y en su empaque original. Simplemente inicia una devolución contactando a nuestro equipo de soporte para asistencia, mediante un email o whatsapp.",
    },
    {
      question: "¿Cuánto tarda el envío?",
      answer:
        "El envío estándar tarda de 3-5 días hábiles, varían según el destino (máximo 8 días hábiles).",
    },
    {
      question: "¿Envían internacionalmente?",
      answer:
        "No por el momento solo trabajamos con envíos Nacionales a cualquier Ciudad de Colombia.",
    },
    {
      question: "¿Cómo puedo cambiar o cancelar mi pedido?",
      answer:
        "Contáctanos inmediatamente por correo electrónico a gogouniformes@gmail.com con tu número de pedido. Podemos modificar o cancelar pedidos que aún no se hayan procesado (generalmente dentro de 1-2 horas desde la realización del pedido).",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "Aceptamos pagos seguros a través de Wompi: tarjetas de crédito y débito (Visa, MasterCard, American Express), PSE, Nequi y Daviplata. Todas las transacciones son 100% seguras y encriptadas.",
    },
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Estamos Aquí para Ayudarte</h1>
          <p className="hero-subtitle">
            ¿Tienes una pregunta sobre tu pedido, necesitas ayuda con un
            producto o quieres asociarte con nosotros? Nuestro equipo está listo
            para asistirte.
          </p>
        </div>
      </section>

      <div className="container">
        {/* Quick Contact Options - Solo Email */}
        <div className="quick-contact">
          <div className="contact-card">
            <div className="card-icon">📧</div>
            <h3 className="card-title">Soporte por Email</h3>
            <p className="card-description">
              Obtén respuestas detalladas a tus preguntas por correo electrónico
            </p>
            <a href="mailto:gogouniformes@gmail.com" className="card-action">
              gogouniformes@gmail.com
              <span>→</span>
            </a>
            <div className="card-meta">⏱️ Respuesta en 24 horas</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Contact Form */}
          <div className="form-section">
            <h2 className="section-title">Envíanos un Mensaje</h2>
            <p className="section-description">
              Completa el formulario a continuación y te responderemos lo antes
              posible.
            </p>

            {showSuccess && (
              <div className="success-message">
                ✓ ¡Gracias por tu mensaje! Te responderemos dentro de 24 horas.
              </div>
            )}

            {submitError && (
              <div
                className="error-message"
                style={{
                  color: "#c0392b",
                  background: "#fdecea",
                  border: "1px solid #f5c6cb",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  marginBottom: "16px",
                }}
              >
                ✗ {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="firstName">
                    Nombre <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="form-input"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="lastName">
                    Apellido <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="form-input"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    Correo Electrónico <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subject">
                  Asunto <span className="required">*</span>
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="form-select"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un tema...</option>
                  <option value="order">Estado y Seguimiento de Pedido</option>
                  <option value="product">Información de Producto</option>
                  <option value="return">Devoluciones y Reembolsos</option>
                  <option value="shipping">Envío y Entrega</option>
                  <option value="technical">Soporte Técnico</option>
                  <option value="billing">Facturación y Pagos</option>
                  <option value="partnership">Negocios y Asociaciones</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="orderNumber">
                  Número de Pedido (si aplica)
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  name="orderNumber"
                  className="form-input"
                  placeholder="#12345"
                  value={formData.orderNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">
                  Mensaje <span className="required">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="form-textarea"
                  placeholder="Por favor proporciona todos los detalles posibles..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? "Enviando..." : "Enviar Mensaje"}</span>
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            <div className="info-card">
              <h3 className="info-title">Horarios de Atención</h3>
              <div className="info-item">
                <div className="info-item-title">
                  <span className="status-badge">
                    <span className="status-dot"></span>
                    En Línea
                  </span>
                </div>
                <div className="info-item-content">
                  Nuestro equipo está disponible actualmente
                </div>
              </div>
              <div className="info-item">
                <div className="info-item-title">📧 Soporte por Email</div>
                <div className="info-item-content">
                  24/7 (Respuesta en 24hrs)
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3 className="info-title">Síguenos</h3>
              <div className="info-item">
                <div className="info-item-content">
                  Mantente conectado para actualizaciones, promociones y nuevos
                  productos
                </div>
              </div>
              <div className="social-links">
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
          </aside>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2 className="section-title">Preguntas Frecuentes</h2>
          <p className="section-description">
            Respuestas rápidas a preguntas comunes. ¿No encuentras lo que
            buscas? Contáctanos arriba.
          </p>

          {faqData.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${activeFaq === index ? "active" : ""}`}
            >
              <div className="faq-question" onClick={() => toggleFaq(index)}>
                <span>{faq.question}</span>
                <span className="faq-toggle">+</span>
              </div>
              <div className="faq-answer">{faq.answer}</div>
            </div>
          ))}
        </div>

        {/* Social Proof Stats */}
        <div className="social-proof">
          <div className="stat-card">
            <div className="stat-number">&lt;24h</div>
            <div className="stat-label">Tiempo de Respuesta</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">98%</div>
            <div className="stat-label">Satisfacción del Cliente</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Casos Resueltos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
