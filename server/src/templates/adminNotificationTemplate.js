export const adminNotificationTemplate = (order, orderItems, storeName) => {
  const formatCOP = (amount) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);

  const itemsRows = orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #1a1a1a;">
          ${item.productName || "Producto"}
          ${item.variantInfo ? `<br/><span style="font-size: 12px; color: #888;">${item.variantInfo}</span>` : ""}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: center; font-size: 14px; color: #374151;">${item.quantity}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 14px; color: #374151;">${formatCOP(item.priceAtPurchase)}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 14px; font-weight: 700; color: #1d4ed8;">${formatCOP(item.priceAtPurchase * item.quantity)}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nueva Venta</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px; width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%); border-radius: 12px 12px 0 0; padding: 36px 40px 28px; text-align: center;">
              <div style="font-size: 36px; margin-bottom: 10px;">🛒</div>
              <h1 style="margin: 0 0 6px; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                ¡Nueva Venta Registrada!
              </h1>
              <p style="margin: 0; color: #93c5fd; font-size: 14px;">
                Se ha procesado un nuevo pago exitosamente vía Wompi
              </p>
            </td>
          </tr>

          <!-- ALERT BANNER -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 40px 0;">
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;">Referencia del Pedido</div>
                      <div style="font-size: 22px; font-weight: 800; color: #1e3a5f; margin-top: 4px; letter-spacing: 1px;">#${order.reference}</div>
                    </td>
                    <td align="right">
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;">ID Transacción Wompi</div>
                      <div style="font-size: 13px; font-weight: 700; color: #1d4ed8; margin-top: 4px; font-family: monospace;">${order.wompiTransactionId || "N/A"}</div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- CUSTOMER INFO -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 40px 0;">
              <h2 style="margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #1a1a1a; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">
                👤 Datos del Cliente
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-bottom: 10px;">
                    <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 600; margin-bottom: 4px;">Nombre</div>
                    <div style="font-size: 14px; font-weight: 600; color: #1a1a1a;">${order.customerName}</div>
                  </td>
                  <td width="50%" style="padding-bottom: 10px;">
                    <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 600; margin-bottom: 4px;">Email</div>
                    <div style="font-size: 14px; color: #1d4ed8;">${order.customerEmail}</div>
                  </td>
                </tr>
                <tr>
                  <td width="50%">
                    <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 600; margin-bottom: 4px;">Teléfono</div>
                    <div style="font-size: 14px; color: #1a1a1a;">${order.customerPhone || "No especificado"}</div>
                  </td>
                  <td width="50%">
                    <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 600; margin-bottom: 4px;">Método de Pago</div>
                    <div style="font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: capitalize;">${order.paymentMethod}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SHIPPING ADDRESS -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 40px 0;">
              <h2 style="margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #1a1a1a; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">
                📦 Dirección de Envío
              </h2>
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px 20px; border-left: 4px solid #1d4ed8;">
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.8;">
                  ${order.shippingAddress}<br/>
                  <strong>${order.shippingCity}</strong>, CP: ${order.shippingPostalCode}
                </p>
              </div>
            </td>
          </tr>

          <!-- ORDER ITEMS -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 40px 0;">
              <h2 style="margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #1a1a1a; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">
                🛍️ Productos Vendidos
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f8fafc;">
                    <th style="padding: 10px 16px; text-align: left; font-size: 11px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;">Producto</th>
                    <th style="padding: 10px 16px; text-align: center; font-size: 11px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;">Cant.</th>
                    <th style="padding: 10px 16px; text-align: right; font-size: 11px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;">P. Unit.</th>
                    <th style="padding: 10px 16px; text-align: right; font-size: 11px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- FINANCIAL SUMMARY -->
          <tr>
            <td style="background-color: #ffffff; padding: 16px 40px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Subtotal</td>
                  <td style="padding: 5px 0; text-align: right; color: #374151; font-size: 14px;">${formatCOP(order.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Costo de envío</td>
                  <td style="padding: 5px 0; text-align: right; color: #374151; font-size: 14px;">${formatCOP(order.shippingCost)}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 0 0; border-top: 2px solid #e5e7eb; font-size: 17px; font-weight: 800; color: #1a1a1a;">💰 Total Cobrado</td>
                  <td style="padding: 14px 0 0; border-top: 2px solid #e5e7eb; text-align: right; font-size: 19px; font-weight: 800; color: #1d4ed8;">${formatCOP(order.totalAmount)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #1e3a5f; border-radius: 0 0 12px 12px; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 4px; color: #93c5fd; font-size: 13px; font-weight: 600;">
                ${storeName} — Panel de Administración
              </p>
              <p style="margin: 0; color: #60a5fa; font-size: 12px;">
                Este es un correo automático generado tras confirmación de pago en Wompi.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};