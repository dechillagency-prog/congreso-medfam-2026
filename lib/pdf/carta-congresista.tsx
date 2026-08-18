import React from "react";
import path from "node:path";
import { Document, Page, View, Text, Image, Svg, Path, Circle, Font, StyleSheet } from "@react-pdf/renderer";
import { construirSaludoCarta } from "@/lib/utils/saludo";

/**
 * Reconstrucción fiel del diseño de referencia "Carta de Congresista".
 * Texto institucional fijo transcrito directamente de la imagen de referencia.
 * Variables dinámicas: nombreCompleto, folio, tipoInscripcion, fechaConfirmacion.
 *
 * Fuentes y assets institucionales (logos, firma) viven en lib/pdf/fonts/ y
 * lib/pdf/assets/ — NO en public/. Se resuelven con process.cwd() + la ruta
 * literal del repo (NO __dirname): Next.js empaqueta este módulo dentro de
 * .next/server/chunks/ al compilar, así que en runtime __dirname apunta ahí
 * — no a lib/pdf/ — y el ENOENT solo cambiaba de ruta rota, no se
 * resolvía. process.cwd() en la Function de Vercel SÍ es el root del
 * proyecto (/var/task), que es exactamente donde Node File Trace coloca
 * los archivos incluidos explícitamente por outputFileTracingIncludes en
 * next.config.mjs (preservando la ruta del repo, lib/pdf/fonts/...,
 * lib/pdf/assets/...) — confirmado inspeccionando el output de
 * `npm run build` directamente, no solo los .nft.json.
 *
 * Pendiente/omitido a propósito:
 *  - Fotografía real del auditorio (se usa una foto real existente del sitio como sustituto temporal).
 */

const fontsDir = path.join(process.cwd(), "lib", "pdf", "fonts");
const assetsDir = path.join(process.cwd(), "lib", "pdf", "assets");
const LOGO_CONGRESO = path.join(assetsDir, "logo-congreso.png");
const LOGO_ASOCIACION = path.join(assetsDir, "logo-asociacion.png");
const FIRMA_MAURO = path.join(assetsDir, "firma-mauro.png");

Font.register({
  family: "Manrope",
  fonts: [
    { src: path.join(fontsDir, "manrope", "Manrope-Regular.woff"), fontWeight: 400 },
    { src: path.join(fontsDir, "manrope", "Manrope-SemiBold.woff"), fontWeight: 600 },
    { src: path.join(fontsDir, "manrope", "Manrope-Bold.woff"), fontWeight: 700 },
    { src: path.join(fontsDir, "manrope", "Manrope-ExtraBold.woff"), fontWeight: 800 },
  ],
});

Font.register({
  family: "Inter",
  fonts: [
    { src: path.join(fontsDir, "inter", "Inter-Regular.woff"), fontWeight: 400 },
    { src: path.join(fontsDir, "inter", "Inter-Medium.woff"), fontWeight: 500 },
    { src: path.join(fontsDir, "inter", "Inter-SemiBold.woff"), fontWeight: 600 },
    { src: path.join(fontsDir, "inter", "Inter-Italic.woff"), fontWeight: 400, fontStyle: "italic" },
  ],
});

// Sin esto, react-pdf parte palabras largas con guion a mitad de palabra al
// ajustar línea; la referencia no hace eso, así que se desactiva.
Font.registerHyphenationCallback((word) => [word]);

// Azul marino = mismo token "ink" que usa el sitio (tailwind.config.ts).
// Verde = acento institucional propio de esta carta (la referencia no usa
// ningún verde del sitio, ya que el sitio no tiene un token verde definido).
const COLOR = {
  navy: "#0F172A",
  navyBand: "#0F172A",
  green: "#1F7A54",
  greenLight: "#EAF3ED",
  border: "#DCE3E0",
  body: "#1F2937",
  muted: "#4B5563",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 8.5,
    color: COLOR.body,
  },
  headerBand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingVertical: 0,
    borderBottomWidth: 2,
    borderBottomColor: COLOR.navy,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  // Logo oficial del Congreso: ya trae "XXV", nombre completo y año
  // dibujados en el propio archivo, así que es el único elemento de
  // identidad en esta zona (evita duplicar el título en texto vectorial).
  // El archivo real (1536x1024, aspecto 1.5) trae relleno transparente a
  // la derecha del círculo — con la caja anterior (175x138, aspecto 1.268)
  // ese relleno se traducía en una franja vacía invisible arriba/abajo del
  // logo dentro de su propia caja. La altura aquí (175/1.5) hace que la
  // caja coincida exactamente con el aspecto real del archivo, así que el
  // logo se renderiza sin ese margen interno perdido — pero al mismo
  // tamaño visible que antes (175 de ancho, mismo contenido visible).
  headerLogo: {
    width: 175,
    height: 116.7,
    objectFit: "contain",
  },
  dateBadge: {
    backgroundColor: COLOR.navyBand,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  dateBadgeText: {
    color: "#9FB0C3",
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 6.5,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  dateBadgeValue: {
    color: "#FFFFFF",
    fontFamily: "Manrope",
    fontWeight: 700,
    fontSize: 10,
  },
  body: {
    flexDirection: "row",
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    gap: 22,
  },
  leftCol: {
    width: 328,
  },
  rightCol: {
    width: 208,
  },
  eyebrow: {
    fontFamily: "Manrope",
    fontWeight: 700,
    fontSize: 8.5,
    color: COLOR.green,
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  h1: {
    fontFamily: "Manrope",
    fontWeight: 800,
    fontSize: 17.5,
    color: COLOR.navy,
    lineHeight: 1.26,
    marginBottom: 9,
  },
  salutation: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 9.3,
    color: COLOR.body,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 8.8,
    lineHeight: 1.6,
    color: COLOR.body,
    marginBottom: 6,
  },
  bold: {
    fontFamily: "Inter",
    fontWeight: 600,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginVertical: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLOR.green,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  badgeIconCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontFamily: "Manrope",
    fontWeight: 700,
    fontSize: 10.5,
    letterSpacing: 0.4,
  },
  folioText: {
    fontSize: 7.5,
    color: COLOR.muted,
    fontFamily: "Inter",
    fontWeight: 500,
    marginBottom: 2,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
    marginBottom: 6,
  },
  featureItem: {
    width: 54,
    alignItems: "center",
  },
  featureIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLOR.navy,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  featureLabel: {
    fontFamily: "Manrope",
    fontWeight: 700,
    fontSize: 5.9,
    color: COLOR.navy,
    textAlign: "center",
    lineHeight: 1.25,
  },
  closingBold: {
    fontFamily: "Inter",
    fontWeight: 700,
    fontSize: 8.8,
    color: COLOR.body,
    marginBottom: 6,
  },
  signatureLabel: {
    fontFamily: "Inter",
    fontWeight: 700,
    fontSize: 8.8,
    marginBottom: 2,
  },
  // La firma real ya aporta el espacio/jerarquía que antes simulaba el
  // margen grande de signatureLabel — por eso ese margen bajó a 2.
  firmaImage: {
    width: 96,
    height: 65.7,
    objectFit: "contain",
    marginTop: 1,
    marginBottom: 1,
  },
  signatureBlockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  signatureName: {
    fontFamily: "Manrope",
    fontWeight: 800,
    fontSize: 10,
    color: COLOR.navy,
  },
  signatureRole: {
    fontSize: 8.3,
    color: COLOR.muted,
    marginTop: 2,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  contactText: {
    fontSize: 7.8,
    color: COLOR.body,
  },
  // Logo de la Asociación: jerarquía secundaria — ~1.9x el tamaño anterior
  // (38x38), pegado al bloque de firma del Dr. Mauro, pero sigue siendo
  // más pequeño que el logo del Congreso.
  associationLogo: {
    width: 72,
    height: 72,
    objectFit: "contain",
  },
  detailsBox: {
    borderWidth: 1,
    borderColor: COLOR.border,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },
  detailsHeader: {
    backgroundColor: COLOR.navyBand,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  detailsHeaderText: {
    color: "#FFFFFF",
    fontFamily: "Manrope",
    fontWeight: 700,
    fontSize: 8.8,
    letterSpacing: 0.6,
  },
  detailsBody: {
    paddingHorizontal: 12,
    paddingTop: 13,
    paddingBottom: 3,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    paddingBottom: 11,
    marginBottom: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.border,
  },
  detailItemLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  detailTextCol: {
    flex: 1,
  },
  detailIconCircle: {
    width: 17,
    height: 17,
    borderRadius: 4,
    backgroundColor: COLOR.navy,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0.5,
  },
  detailLabel: {
    fontFamily: "Manrope",
    fontWeight: 700,
    fontSize: 7,
    color: COLOR.navy,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 7.8,
    color: COLOR.body,
    lineHeight: 1.4,
  },
  detailValueItalic: {
    fontSize: 7.8,
    color: COLOR.body,
    fontFamily: "Inter",
    fontStyle: "italic",
    lineHeight: 1.4,
  },
  qrBox: {
    backgroundColor: COLOR.greenLight,
    borderRadius: 10,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 16,
  },
  qrImage: {
    width: 48,
    height: 48,
  },
  qrText: {
    flex: 1,
    fontFamily: "Manrope",
    fontWeight: 700,
    fontSize: 7,
    color: COLOR.navy,
    lineHeight: 1.4,
    letterSpacing: 0.1,
  },
  photoBox: {
    width: 208,
    height: 192,
    borderRadius: 10,
    overflow: "hidden",
  },
  photo: {
    width: 208,
    height: 192,
    objectFit: "cover",
  },
  footerBand: {
    marginTop: 4,
    backgroundColor: COLOR.navyBand,
    paddingHorizontal: 28,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerTitle: {
    color: "#FFFFFF",
    fontFamily: "Manrope",
    fontWeight: 700,
    fontSize: 7.5,
    letterSpacing: 0.2,
  },
  footerTagline: {
    color: "#C7D6CE",
    fontFamily: "Inter",
    fontStyle: "italic",
    fontSize: 7.5,
  },
});

function IconCalendar({ color = "#FFFFFF", size = 10 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 5 h16 a1 1 0 0 1 1 1 v13 a1 1 0 0 1 -1 1 H4 a1 1 0 0 1 -1 -1 V6 a1 1 0 0 1 1 -1 Z M3 10 h18 M8 3 v4 M16 3 v4"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
      />
    </Svg>
  );
}

function IconPin({ color = "#FFFFFF", size = 10 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 22 C12 22 19 15 19 10 A7 7 0 1 0 5 10 C5 15 12 22 12 22 Z"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
      />
      <Circle cx={12} cy={10} r={2.4} stroke={color} strokeWidth={1.6} fill="none" />
    </Svg>
  );
}

function IconUsers({ color = "#FFFFFF", size = 10 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={9} cy={8} r={3} stroke={color} strokeWidth={1.6} fill="none" />
      <Path d="M3 20 c0 -4 3 -6 6 -6 s6 2 6 6" stroke={color} strokeWidth={1.6} fill="none" />
      <Circle cx={17} cy={9} r={2.3} stroke={color} strokeWidth={1.4} fill="none" />
      <Path d="M15.5 14 c2.6 0 5 1.6 5.5 5" stroke={color} strokeWidth={1.4} fill="none" />
    </Svg>
  );
}

function IconLandmark({ color = "#FFFFFF", size = 10 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 21 h18 M4 21 V10 M20 21 V10 M2 10 L12 4 L22 10 Z M8 10 v11 M16 10 v11 M12 10 v11"
        stroke={color}
        strokeWidth={1.6}
        fill="none"
      />
    </Svg>
  );
}

function IconTarget({ color = "#FFFFFF", size = 10 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.6} fill="none" />
      <Circle cx={12} cy={12} r={4.5} stroke={color} strokeWidth={1.6} fill="none" />
      <Circle cx={12} cy={12} r={1.2} fill={color} />
    </Svg>
  );
}

function IconMic({ color = COLOR.navy, size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2 a3 3 0 0 1 3 3 v6 a3 3 0 0 1 -6 0 V5 a3 3 0 0 1 3 -3 Z M6 11 a6 6 0 0 0 12 0 M12 17 v4 M9 21 h6"
        stroke={color}
        strokeWidth={1.5}
        fill="none"
      />
    </Svg>
  );
}

function IconPresentation({ color = COLOR.navy, size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 4 h18 M4 4 v11 h16 V4 M9 19 l3 -4 l3 4"
        stroke={color}
        strokeWidth={1.5}
        fill="none"
      />
    </Svg>
  );
}

function IconClipboard({ color = COLOR.navy, size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M8 4 h8 v3 H8 Z M6 6 h12 a1 1 0 0 1 1 1 v13 a1 1 0 0 1 -1 1 H6 a1 1 0 0 1 -1 -1 V7 a1 1 0 0 1 1 -1 Z M8 12 h8 M8 16 h5"
        stroke={color}
        strokeWidth={1.5}
        fill="none"
      />
    </Svg>
  );
}

function IconHandshake({ color = COLOR.navy, size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M2 12 l4 -4 l4 3 l3 -3 l3 3 l4 -3 l2 4 M9 11 l3 3.5 l-2 2 M13 11 l-3 3.5"
        stroke={color}
        strokeWidth={1.5}
        fill="none"
      />
    </Svg>
  );
}

function IconParty({ color = COLOR.navy, size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={8} cy={9} r={3} stroke={color} strokeWidth={1.4} fill="none" />
      <Circle cx={16} cy={9} r={3} stroke={color} strokeWidth={1.4} fill="none" />
      <Path d="M3 20 c0 -3.5 2.5 -5.5 5 -5.5 s5 2 5 5.5 M11 20 c0 -3.5 2.5 -5.5 5 -5.5 s5 2 5 5.5" stroke={color} strokeWidth={1.4} fill="none" />
    </Svg>
  );
}

function IconCastle({ color = COLOR.navy, size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 21 V9 l3 -3 v3 h2 V6 l3 -3 l3 3 v3 h2 V6 l3 3 v12 Z M9 21 v-5 h6 v5"
        stroke={color}
        strokeWidth={1.4}
        fill="none"
      />
    </Svg>
  );
}

const FEATURES = [
  { label: "CONFERENCIAS\nMAGISTRALES", Icon: IconMic },
  { label: "TALLERES\nESPECIALIZADOS", Icon: IconPresentation },
  { label: "PRESENTACIÓN\nDE TRABAJOS", Icon: IconClipboard },
  { label: "NETWORKING\nPROFESIONAL", Icon: IconHandshake },
  { label: "EVENTOS\nSOCIALES", Icon: IconParty },
  { label: "ACTIVIDADES\nCULTURALES", Icon: IconCastle },
];

export interface CartaCongresistaProps {
  nombreCompleto: string;
  folio: string;
  tipoInscripcion: string;
  fechaConfirmacion: string;
  /** Data URL (image/png;base64,...) del QR ya generado. */
  qrDataUrl: string;
  /** Ruta absoluta en filesystem de la fotografía usada como placeholder. */
  fotoPath: string;
}

export function CartaCongresista({
  nombreCompleto,
  folio,
  tipoInscripcion,
  fechaConfirmacion,
  qrDataUrl,
  fotoPath,
}: CartaCongresistaProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerBand}>
          <View style={styles.headerLeft}>
            <Image src={LOGO_CONGRESO} style={styles.headerLogo} />
          </View>
          <View style={styles.dateBadge}>
            <IconCalendar />
            <View>
              <Text style={styles.dateBadgeText}>FECHA</Text>
              <Text style={styles.dateBadgeValue}>{fechaConfirmacion}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.leftCol}>
            <Text style={styles.eyebrow}>BIENVENIDO(A) AL</Text>
            <Text style={styles.h1}>XXV CONGRESO REGIONAL NORESTE DE MEDICINA FAMILIAR</Text>

            <Text style={styles.salutation}>{construirSaludoCarta(nombreCompleto)}</Text>

            <Text style={styles.paragraph}>
              En nombre de la Asociación Lagunera de Especialistas en Medicina Familiar y Residentes A.C.
              (ALEMFRAC) y del Comité Organizador, nos complace darle la más cordial bienvenida al{" "}
              <Text style={styles.bold}>XXV Congreso Regional Noreste de Medicina Familiar</Text>, que se
              celebrará del <Text style={styles.bold}>14 al 17 de octubre de 2026</Text> en la ciudad de{" "}
              <Text style={styles.bold}>Torreón, Coahuila</Text>.
            </Text>

            <Text style={styles.paragraph}>
              Nos es grato confirmar que hemos recibido correctamente su comprobante de pago y usted ha
              quedado inscrito como:
            </Text>

            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <View style={styles.badgeIconCircle}>
                  <IconUsers size={9} />
                </View>
                <Text style={styles.badgeText}>{tipoInscripcion.toUpperCase()}</Text>
              </View>
              <Text style={styles.folioText}>Folio: {folio}</Text>
            </View>

            <Text style={styles.paragraph}>
              Durante cuatro días tendrá acceso a un programa académico diseñado para impulsar la
              actualización profesional y fortalecer sus habilidades y conocimientos en Medicina Familiar.
            </Text>

            <View style={styles.featureRow}>
              {FEATURES.map(({ label, Icon }) => (
                <View key={label} style={styles.featureItem}>
                  <View style={styles.featureIconCircle}>
                    <Icon />
                  </View>
                  <Text style={styles.featureLabel}>{label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.paragraph}>
              Contaremos con médicos expertos reconocidos a nivel regional, nacional e internacional y con
              una agenda sociocultural que hará de su estancia en Torreón una experiencia inolvidable.
            </Text>

            <Text style={styles.closingBold}>Le esperamos en Torreón.</Text>

            <Text style={styles.paragraph}>
              Sin más por el momento, le enviamos un caluroso saludo, quedamos a la orden y nos vemos pronto
              en Torreón. Muchas gracias por su inscripción.
            </Text>

            <Text style={styles.signatureLabel}>Atentamente,</Text>
            <Image src={FIRMA_MAURO} style={styles.firmaImage} />
            <View style={styles.signatureBlockRow}>
              <View>
                <Text style={styles.signatureName}>DR. MAURO ANTONIO SOLÍS SALAS</Text>
                <Text style={styles.signatureRole}>Presidente de ALEMFRAC.</Text>
                <View style={styles.contactRow}>
                  <Text style={styles.contactText}>sosamauro@hotmail.com</Text>
                </View>
                <View style={styles.contactRow}>
                  <Text style={styles.contactText}>871 101 5289</Text>
                </View>
              </View>
              <Image src={LOGO_ASOCIACION} style={styles.associationLogo} />
            </View>
          </View>

          <View style={styles.rightCol}>
            <View style={styles.detailsBox}>
              <View style={styles.detailsHeader}>
                <Text style={styles.detailsHeaderText}>DETALLES DEL CONGRESO</Text>
              </View>
              <View style={styles.detailsBody}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconCircle}>
                    <IconCalendar />
                  </View>
                  <View style={styles.detailTextCol}>
                    <Text style={styles.detailLabel}>FECHAS</Text>
                    <Text style={styles.detailValue}>14 – 17 de octubre de 2026</Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconCircle}>
                    <IconPin />
                  </View>
                  <View style={styles.detailTextCol}>
                    <Text style={styles.detailLabel}>SEDE</Text>
                    <Text style={styles.detailValue}>Crowne Plaza Torreón{"\n"}Torreón, Coahuila</Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconCircle}>
                    <IconUsers />
                  </View>
                  <View style={styles.detailTextCol}>
                    <Text style={styles.detailLabel}>MODALIDAD</Text>
                    <Text style={styles.detailValue}>Presencial</Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconCircle}>
                    <IconLandmark />
                  </View>
                  <View style={styles.detailTextCol}>
                    <Text style={styles.detailLabel}>ORGANIZA</Text>
                    <Text style={styles.detailValue}>
                      Asociación Lagunera de Especialistas en Medicina Familiar y Residentes A.C.
                    </Text>
                  </View>
                </View>
                <View style={[styles.detailItem, styles.detailItemLast]}>
                  <View style={styles.detailIconCircle}>
                    <IconTarget />
                  </View>
                  <View style={styles.detailTextCol}>
                    <Text style={styles.detailLabel}>LEMA</Text>
                    <Text style={styles.detailValueItalic}>
                      &quot;La Medicina Familiar, el eje de la Atención Primaria.&quot;
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.qrBox}>
              <Image src={qrDataUrl} style={styles.qrImage} />
              <Text style={styles.qrText}>ESCANEA PARA DESCARGAR EL PROGRAMA PRELIMINAR</Text>
            </View>

            <View style={styles.photoBox}>
              <Image src={fotoPath} style={styles.photo} />
            </View>
          </View>
        </View>

        <View style={styles.footerBand}>
          <Text style={styles.footerTitle}>XXV Congreso Regional Noreste de Medicina Familiar 2026</Text>
          <Text style={styles.footerTagline}>
            &quot;La Medicina Familiar, el eje de la Atención Primaria.&quot;
          </Text>
        </View>
      </Page>
    </Document>
  );
}
