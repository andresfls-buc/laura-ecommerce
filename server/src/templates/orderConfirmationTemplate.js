export const orderConfirmationTemplate = (
  order,
  orderItems,
  storeEmail,
  storeName
) => {
  const formatCOP = (amount) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);

  const freeShipping =
    Number(order.shippingCost) === 0 && order.totalUnits >= 3;
  const hasCreditCardSurcharge = Number(order.creditCardSurcharge) > 0;

  const itemsRows = orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 14px 16px; border-bottom: 1px solid #f0f0f0;">
          <div style="font-weight: 600; color: #1a1a1a; font-size: 14px;">${item.productName || "Producto"}</div>
          ${item.variantInfo ? `<div style="font-size: 12px; color: #888; margin-top: 2px;">${item.variantInfo}</div>` : ""}
        </td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #555; font-size: 14px;">
          ${item.quantity}
        </td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600; color: #1a1a1a; font-size: 14px;">
          ${formatCOP(item.priceAtPurchase)}
        </td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 700; color: #2d6a4f; font-size: 14px;">
          ${formatCOP(item.priceAtPurchase * item.quantity)}
        </td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirmación de Pedido</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%); border-radius: 12px 12px 0 0; padding: 40px 40px 32px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">✅</div>
              <h1 style="margin: 0 0 8px; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                ¡Pedido Confirmado!
              </h1>
              <p style="margin: 0; color: #95d5b2; font-size: 15px;">
                Hola <strong>${order.customerName}</strong>, recibimos tu pedido con éxito.
              </p>
            </td>
          </tr>

          <!-- ORDER REFERENCE BADGE -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 40px;">
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin-top: 28px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;">Número de Pedido</div>
                      <div style="font-size: 20px; font-weight: 800; color: #1b4332; margin-top: 4px; letter-spacing: 1px;">#${order.reference}</div>
                    </td>
                    <td align="right">
                      <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;">Estado</div>
                      <div style="display: inline-block; margin-top: 4px; background-color: #dcfce7; color: #166534; font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 20px;">
                        Pago Aprobado
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- ORDER ITEMS TABLE -->
          <tr>
            <td style="background-color: #ffffff; padding: 28px 40px 0;">
              <h2 style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #1a1a1a; border-bottom: 2px solid #f0f0f0; padding-bottom: 12px;">
                Resumen de tu pedido
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 8px; overflow: hidden; border: 1px solid #f0f0f0;">
                <thead>
                  <tr style="background-color: #f8fafc;">
                    <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px;">Producto</th>
                    <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px;">Cant.</th>
                    <th style="padding: 12px 16px; text-align: right; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px;">Precio</th>
                    <th style="padding: 12px 16px; text-align: right; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- TOTALS -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">

                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Subtotal</td>
                  <td style="padding: 6px 0; text-align: right; color: #1a1a1a; font-size: 14px;">${formatCOP(order.subtotal)}</td>
                </tr>

                <!-- ── Envío: free or fixed ── -->
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Envío</td>
                  <td style="padding: 6px 0; text-align: right; font-size: 14px;">
                    ${
                      freeShipping
                        ? `<span style="color: #16a34a; font-weight: 700;">¡Gratis! 🎉</span>`
                        : `<span style="color: #1a1a1a;">${formatCOP(order.shippingCost)}</span>`
                    }
                  </td>
                </tr>

                <!-- ── Free shipping banner ── -->
                ${
                  freeShipping
                    ? `
                <tr>
                  <td colspan="2" style="padding: 4px 0 8px;">
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px 12px; font-size: 12px; color: #15803d; font-weight: 500;">
                      🎉 ¡Compraste ${order.totalUnits} productos y obtuviste envío gratis!
                    </div>
                  </td>
                </tr>`
                    : ""
                }

                <!-- ── Credit card surcharge ── -->
                ${
                  hasCreditCardSurcharge
                    ? `
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Recargo por pago con tarjeta de crédito (5%)</td>
                  <td style="padding: 6px 0; text-align: right; color: #b45309; font-size: 14px; font-weight: 600;">${formatCOP(order.creditCardSurcharge)}</td>
                </tr>`
                    : ""
                }

                <!-- ── Total ── -->
                <tr>
                  <td style="padding: 14px 0 0; border-top: 2px solid #f0f0f0; color: #1a1a1a; font-size: 16px; font-weight: 800;">Total Pagado</td>
                  <td style="padding: 14px 0 0; border-top: 2px solid #f0f0f0; text-align: right; color: #1b4332; font-size: 18px; font-weight: 800;">${formatCOP(order.totalAmount)}</td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- SHIPPING INFO -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 40px 36px;">
              <div style="background-color: #f8fafc; border-radius: 10px; padding: 20px 24px; border-left: 4px solid #2d6a4f;">
                <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.6px;">📦 Dirección de Envío</h3>
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.7;">
                  <strong>${order.customerName}</strong><br/>
                  ${order.shippingAddress}<br/>
                  ${order.shippingCity}, ${order.shippingPostalCode}<br/>
                  📞 ${order.customerPhone || "No especificado"}
                </p>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #1b4332; border-radius: 0 0 12px 12px; padding: 28px 40px; text-align: center;">
              <p style="margin: 0 0 8px; color: #95d5b2; font-size: 13px;">
                ¿Tienes preguntas sobre tu pedido? Contáctanos en
              </p>
              <a href="mailto:${storeEmail}" style="color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none;">
                ${storeEmail}
              </a>
              <p style="margin: 20px 0 0; color: #52b788; font-size: 12px;">
                © ${new Date().getFullYear()} ${storeName}. Todos los derechos reservados.
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
