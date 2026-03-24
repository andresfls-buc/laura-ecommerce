import { sendContactFormEmail } from "../services/emailService.js";

export const sendContactMessage = async (req, res) => {
  const { firstName, lastName, email, phone, subject, orderNumber, message } = req.body;

  if (!firstName || !lastName || !email || !subject || !message) {
    return res.status(400).json({ error: "Faltan campos requeridos." });
  }

  const result = await sendContactFormEmail({ firstName, lastName, email, phone, subject, orderNumber, message });

  if (!result.success) {
    return res.status(500).json({ error: "No se pudo enviar el mensaje. Intenta de nuevo." });
  }

  res.status(200).json({ message: "Mensaje enviado correctamente." });
};
