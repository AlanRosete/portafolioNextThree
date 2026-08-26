/**
 * Plantilla del correo de aviso cuando alguien escribe por el formulario.
 *
 * Los clientes de correo no entienden flexbox, grid ni hojas de estilo
 * externas: todo va en tablas y con estilos inline. Se ve feo de escribir,
 * pero es lo único que se renderiza igual en Gmail, Outlook y Apple Mail.
 */

const BG = "#0f0f0f";
const CARD = "#1c1c1c";
const QUOTE = "#141414";
const LINE = "#2e2e2e";
const ACCENT = "#8fb996";
const TEXT = "#f8f8f8";
const MUTED = "#898989";

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

type Mensaje = {
  name: string;
  email: string;
  message: string;
  createdAt: string;
  ip?: string | null;
  userAgent?: string | null;
};

/** Escapa HTML: el mensaje viene de un desconocido, no se inyecta crudo. */
function escape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fechaLegible(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(new Date(iso));
}

export function construirCorreo(m: Mensaje) {
  const name = escape(m.name);
  const email = escape(m.email);
  const fecha = fechaLegible(m.createdAt);
  // Los saltos de línea del textarea se pierden en HTML si no se convierten.
  const message = escape(m.message).replace(/\n/g, "<br />");

  const meta = [
    `Recibido: ${fecha}`,
    m.ip ? `IP: ${escape(m.ip)}` : null,
    m.userAgent ? `Navegador: ${escape(m.userAgent.slice(0, 80))}` : null,
  ].filter(Boolean);

  const asuntoRespuesta = encodeURIComponent(`Re: tu mensaje desde el portafolio`);

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Nuevo mensaje de ${name}</title>
</head>
<body style="margin:0;padding:0;background:${BG};">
  <!-- Preheader: lo que Gmail muestra en la lista, antes de abrir. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${name} &lt;${email}&gt; — ${escape(m.message.slice(0, 90))}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${CARD};border:1px solid ${LINE};border-radius:14px;overflow:hidden;">

          <tr><td style="height:3px;background:${ACCENT};font-size:0;line-height:0;">&nbsp;</td></tr>

          <tr>
            <td style="padding:32px 32px 8px 32px;font-family:${FONT};">
              <p style="margin:0 0 18px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};">
                Portafolio &middot; Nuevo mensaje
              </p>
              <h1 style="margin:0 0 6px 0;font-size:24px;line-height:1.25;font-weight:700;color:${TEXT};">
                ${name}
              </h1>
              <a href="mailto:${email}" style="font-size:15px;color:${ACCENT};text-decoration:none;">
                ${email}
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${QUOTE};border-left:3px solid ${ACCENT};border-radius:0 8px 8px 0;">
                <tr>
                  <td style="padding:20px 22px;font-family:${FONT};font-size:15px;line-height:1.65;color:#dcdcdc;">
                    ${message}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 32px 4px 32px;">
              <a href="mailto:${email}?subject=${asuntoRespuesta}"
                 style="display:inline-block;background:${ACCENT};color:#12241a;font-family:${FONT};font-size:14px;font-weight:600;text-decoration:none;padding:12px 26px;border-radius:8px;">
                Responder a ${name.split(" ")[0]}
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 30px 32px;font-family:${FONT};">
              <div style="border-top:1px solid ${LINE};padding-top:16px;font-size:12px;line-height:1.9;color:${MUTED};">
                ${meta.join("<br />")}
              </div>
            </td>
          </tr>

        </table>

        <p style="margin:18px 0 0 0;font-family:${FONT};font-size:11px;color:#5c5c5c;">
          Guardado en DynamoDB &middot; enviado desde tu portafolio
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Nuevo mensaje desde el portafolio`,
    ``,
    `De: ${m.name} <${m.email}>`,
    ...meta,
    ``,
    m.message,
  ].join("\n");

  return {
    subject: `Nuevo mensaje de ${m.name}`,
    html,
    text,
  };
}
