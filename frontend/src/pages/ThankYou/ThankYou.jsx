import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./ThankYou.css";

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  const transactionId = searchParams.get("id");
  const status = searchParams.get("status");
  const reference = searchParams.get("reference");

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const isApproved = !status || status === "APPROVED";
  const isPending = status === "PENDING";

  return (
    <div className={`ty-wrapper ${visible ? "ty-visible" : ""}`}>
      <div className="ty-card">
        <div className="ty-icon-circle">
          <svg viewBox="0 0 52 52" className="ty-checkmark">
            <circle
              cx="26"
              cy="26"
              r="25"
              fill="none"
              className="ty-checkmark-circle"
            />
            <path
              fill="none"
              d="M14 27 l8 8 l16-16"
              className="ty-checkmark-check"
            />
          </svg>
        </div>

        <h1 className="ty-title">
          {isPending ? "¡Pago en proceso!" : "¡Gracias por tu compra!"}
        </h1>

        <p className="ty-subtitle">
          {isPending
            ? "Tu pago PSE está siendo procesado. Te notificaremos por correo cuando sea confirmado."
            : "Tu pago fue procesado exitosamente. En breve recibirás un correo de confirmación."}
        </p>

        {(transactionId || reference) && (
          <div className="ty-details">
            {reference && (
              <div className="ty-detail-row">
                <span className="ty-detail-label">Referencia</span>
                <span className="ty-detail-value">{reference}</span>
              </div>
            )}
            {transactionId && (
              <div className="ty-detail-row">
                <span className="ty-detail-label">ID Transacción</span>
                <span className="ty-detail-value">{transactionId}</span>
              </div>
            )}
            {status && (
              <div className="ty-detail-row">
                <span className="ty-detail-label">Estado</span>
                <span
                  className={`ty-status-badge ${
                    isApproved
                      ? "ty-approved"
                      : isPending
                        ? "ty-pending"
                        : "ty-other"
                  }`}
                >
                  {isApproved ? "Aprobado" : isPending ? "Pendiente" : status}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="ty-actions">
          <button
            className="ty-btn-primary"
            onClick={() => navigate("/catalogue")}
          >
            Seguir comprando
          </button>
          <button className="ty-btn-secondary" onClick={() => navigate("/")}>
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
