import { construirSaludoEmail } from "@/lib/utils/saludo";

const COLOR = {
  navy: "#0F172A",
  green: "#1F7A54",
  body: "#1F2937",
  muted: "#4B5563",
  border: "#DCE3E0",
  surface: "#F8FAFC",
};

export interface DatosEmailConfirmacion {
  nombreCompleto: string;
  folio: string;
  tipoInscripcion: string;
  ligaCarta: string;
}

export interface EmailConfirmacion {
  asunto: string;
  html: string;
  text: string;
}

/**
 * Arma el correo de confirmación de inscripción — HTML institucional
 * simple (tabla de una sola columna, sin imágenes ni decoración de
 * flyer) usando la misma paleta azul marino/verde que la Carta de
 * Congresista (COLOR en lib/pdf/carta-congresista.tsx), y una versión de
 * texto plano equivalente para clientes que no rendericen HTML.
 */
export function construirEmailConfirmacion(datos: DatosEmailConfirmacion): EmailConfirmacion {
  const saludo = construirSaludoEmail(datos.nombreCompleto);
  const asunto = "Confirmación de inscripción — XXV Congreso Regional Noreste de Medicina Familiar";

  const html = `<!doctype html>
<html lang="es-MX">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${asunto}</title>
  </head>
  <body style="margin:0; padding:0; background-color:${COLOR.surface}; font-family:Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLOR.surface}; padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#FFFFFF; border-radius:12px; overflow:hidden; border:1px solid ${COLOR.border};">
            <tr>
              <td style="background-color:${COLOR.navy}; padding:24px 32px;">
                <p style="margin:0; color:#FFFFFF; font-size:13px; font-weight:700; letter-spacing:0.4px; text-transform:uppercase;">XXV Congreso Regional Noreste</p>
                <p style="margin:2px 0 0; color:#FFFFFF; font-size:13px; font-weight:700; letter-spacing:0.4px; text-transform:uppercase;">de Medicina Familiar</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px; color:${COLOR.body}; font-size:15px; line-height:1.6; font-weight:600;">${escapeHtml(saludo)}</p>

                <p style="margin:0 0 16px; color:${COLOR.body}; font-size:14px; line-height:1.6;">
                  Su inscripción al <strong>XXV Congreso Regional Noreste de Medicina Familiar</strong> ha sido confirmada correctamente.
                </p>

                <p style="margin:0 0 20px; color:${COLOR.body}; font-size:14px; line-height:1.6;">
                  Nos complace contar con su participación del <strong>14 al 17 de octubre de 2026</strong> en Torreón, Coahuila.
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; margin-bottom:20px; border-top:1px solid ${COLOR.border}; border-bottom:1px solid ${COLOR.border};">
                  <tr>
                    <td style="padding:12px 0; color:${COLOR.muted}; font-size:13px;">Folio</td>
                    <td style="padding:12px 0; color:${COLOR.navy}; font-size:13px; font-weight:700; text-align:right;">${escapeHtml(datos.folio)}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 12px; color:${COLOR.muted}; font-size:13px;">Tipo de inscripción</td>
                    <td style="padding:0 0 12px; color:${COLOR.navy}; font-size:13px; font-weight:700; text-align:right;">${escapeHtml(datos.tipoInscripcion)}</td>
                  </tr>
                </table>

                <p style="margin:0 0 20px; color:${COLOR.body}; font-size:14px; line-height:1.6;">
                  Adjuntamos su Carta de Congresista. También puede consultarla en el siguiente enlace:
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="border-radius:8px; background-color:${COLOR.green};">
                      <a href="${escapeHtmlAttr(datos.ligaCarta)}" style="display:inline-block; padding:12px 24px; color:#FFFFFF; font-size:14px; font-weight:700; text-decoration:none;">
                        Ver Carta de Congresista
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 24px; color:${COLOR.body}; font-size:14px; line-height:1.6; font-weight:600;">
                  Le esperamos en Torreón.
                </p>

                <p style="margin:0; color:${COLOR.body}; font-size:14px; line-height:1.6;">
                  Atentamente,<br />
                  Comité Organizador<br />
                  XXV Congreso Regional Noreste de Medicina Familiar
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    saludo,
    "",
    "Su inscripción al XXV Congreso Regional Noreste de Medicina Familiar ha sido confirmada correctamente.",
    "",
    "Nos complace contar con su participación del 14 al 17 de octubre de 2026 en Torreón, Coahuila.",
    "",
    `Folio: ${datos.folio}`,
    `Tipo de inscripción: ${datos.tipoInscripcion}`,
    "",
    "Adjuntamos su Carta de Congresista. También puede consultarla en el siguiente enlace:",
    `Ver Carta de Congresista: ${datos.ligaCarta}`,
    "",
    "Le esperamos en Torreón.",
    "",
    "Atentamente,",
    "Comité Organizador",
    "XXV Congreso Regional Noreste de Medicina Familiar",
  ].join("\n");

  return { asunto, html, text };
}

function escapeHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtmlAttr(valor: string): string {
  return escapeHtml(valor).replace(/'/g, "&#39;");
}
