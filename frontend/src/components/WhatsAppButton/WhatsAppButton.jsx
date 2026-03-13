import { useState, useEffect } from "react";
import "./WhatsAppButton.css";

const WHATSAPP_NUMBER = "573172560614"; // +57 317 2560614

const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const [pulse, setPulse] = useState(true);

  // Fade in after mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Stop pulse after 4s
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="wa-wrapper">
      {/* Tooltip on hover */}
      {tooltip && (
        <div className="wa-tooltip">
          💬 Para uniformes personalizados o dudas, escribenos estamos para
          servirte!
        </div>
      )}

      {/* Button */}
      <a
        href={whatsappURL}
        target="_blank"
        rel="noopener noreferrer"
        className={`wa-btn ${visible ? "visible" : ""} ${pulse ? "pulse" : ""}`}
        aria-label="Chat on WhatsApp"
        onMouseEnter={() => {
          setTooltip(true);
          setPulse(false);
        }}
        onMouseLeave={() => setTooltip(false)}
      >
        {/* Official WhatsApp icon SVG */}
        <svg
          className="wa-icon"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16.004 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.347.637 4.637 1.845 6.643L2.667 29.333l6.875-1.803A13.3 13.3 0 0016.004 29.333c7.363 0 13.329-5.97 13.329-13.333S23.367 2.667 16.004 2.667zm0 24.222a11.01 11.01 0 01-5.617-1.54l-.403-.24-4.08 1.07 1.09-3.974-.263-.41A10.98 10.98 0 015.01 16c0-6.066 4.934-10.999 10.994-10.999S27 9.934 27 16 22.066 26.889 16.004 26.889zm6.03-8.232c-.33-.165-1.954-.964-2.257-1.073-.303-.11-.523-.165-.743.165-.22.33-.853 1.073-1.046 1.293-.193.22-.385.247-.715.082-.33-.165-1.394-.514-2.657-1.639-.982-.875-1.645-1.956-1.837-2.287-.193-.33-.02-.508.145-.672.149-.148.33-.385.495-.578.165-.193.22-.33.33-.55.11-.22.055-.413-.027-.578-.083-.165-.743-1.793-1.018-2.455-.268-.645-.54-.557-.743-.568l-.633-.01c-.22 0-.578.082-.88.413-.303.33-1.155 1.129-1.155 2.754s1.183 3.193 1.348 3.413c.165.22 2.327 3.554 5.64 4.985.788.34 1.403.543 1.882.695.79.252 1.51.216 2.079.131.634-.094 1.954-.799 2.23-1.571.274-.772.274-1.434.192-1.571-.083-.138-.303-.22-.633-.385z" />
        </svg>

        {/* Notification dot */}
        <span className="wa-dot" aria-hidden="true" />
      </a>
    </div>
  );
}
