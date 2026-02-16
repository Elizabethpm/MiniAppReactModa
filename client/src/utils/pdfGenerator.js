import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Genera una ficha técnica PDF profesional con las 4 secciones de medidas.
 * Secciones: Delanteras · Brazo · Pantalón/Falda · Traseras
 *
 * @param {object} client  - Datos del cliente (name, phone, email, gender...)
 * @param {object} measure - Datos de la medición (upper, arms, pants, lower, fitType, ...)
 * @param {object} studio  - Datos del taller (name, phone, website) — opcional
 */
export function generatePDF(client, measure, studio = {}) {
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const PAGE_W = doc.internal.pageSize.getWidth()
  const PAGE_H = doc.internal.pageSize.getHeight()
  const MARGIN = 18

  // ── Paleta de colores ──────────────────────────────────
  const OLIVE   = [138, 125, 60]
  const GOLD    = [201, 122, 30]
  const BLUE    = [59, 130, 246]
  const GREEN   = [34, 150, 80]
  const DARK    = [31, 41, 55]
  const GRAY    = [107, 114, 128]
  const LIGHT   = [219, 210, 176]
  const WHITE   = [255, 255, 255]

  let pageCount = 1

  // ── Helpers ────────────────────────────────────────────
  /** Añade pie de página en la página actual */
  function drawFooter(pageNum) {
    const footerY = PAGE_H - 12
    doc.setDrawColor(...LIGHT)
    doc.setLineWidth(0.4)
    doc.line(MARGIN, footerY - 4, PAGE_W - MARGIN, footerY - 4)

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)

    const studioName = studio.name || 'Atelier Elizabeth'
    const contactParts = [
      studio.phone,
      studio.website?.replace(/^https?:\/\//, ''),
    ].filter(Boolean).join(' · ')

    doc.text(
      `${studioName} © ${new Date().getFullYear()} — Ficha técnica confidencial`,
      MARGIN,
      footerY
    )
    if (contactParts) {
      doc.text(contactParts, PAGE_W / 2, footerY, { align: 'center' })
    }
    doc.text(`Página ${pageNum}`, PAGE_W - MARGIN, footerY, { align: 'right' })
  }

  /** Comprueba si queda espacio; si no, salta de página */
  function ensureSpace(needed) {
    if (y > PAGE_H - needed - 20) {
      drawFooter(pageCount)
      doc.addPage()
      pageCount++
      y = 20
    }
  }

  /** Dibuja una barra de sección con número y título */
  function drawSectionHeader(number, title, color) {
    ensureSpace(30)
    const barH = 8
    doc.setFillColor(...color)
    doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, barH, 2, 2, 'F')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...WHITE)
    doc.text(`${number}. ${title}`, MARGIN + 4, y + 5.8)

    y += barH + 4
  }

  // ── CABECERA ───────────────────────────────────────────
  // Barra principal oliva
  doc.setFillColor(...OLIVE)
  doc.rect(0, 0, PAGE_W, 36, 'F')

  doc.setTextColor(...WHITE)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(studio.name || 'Atelier Elizabeth', MARGIN, 14)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Ficha Técnica de Medidas', MARGIN, 21)

  doc.setFontSize(8.5)
  doc.text(
    `Emitida el ${format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}`,
    PAGE_W - MARGIN,
    21,
    { align: 'right' }
  )

  // Línea dorada decorativa
  doc.setFillColor(...GOLD)
  doc.rect(0, 36, PAGE_W, 2.5, 'F')

  // ── DATOS DEL CLIENTE ──────────────────────────────────
  let y = 50

  doc.setTextColor(...DARK)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  const clientTitle =
    client.gender === 'masculino' ? 'Datos del Cliente' : 'Datos del Cliente'
  doc.text(clientTitle, MARGIN, y)

  y += 2
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.6)
  doc.line(MARGIN, y, MARGIN + 40, y)
  y += 6

  const genderLabel = { femenino: 'Femenino', masculino: 'Masculino', otro: 'Otro' }

  // Preparar campos en dos columnas
  const leftFields = [
    ['Nombre:', client.name || '—'],
    ...(client.gender ? [['Género:', genderLabel[client.gender] || client.gender]] : []),
    ['Teléfono:', client.phone || '—'],
    ['Email:', client.email || '—'],
  ]
  const rightFields = [
    ...(measure?.label       ? [['Sesión:', measure.label]] : []),
    ...(measure?.fitType     ? [['Ajuste:', measure.fitType]] : []),
    ...(measure?.fabricType  ? [['Tela:', measure.fabricType]] : []),
    ...(measure?.suggestedSize ? [['Talla sugerida:', measure.suggestedSize]] : []),
  ]

  const maxRows = Math.max(leftFields.length, rightFields.length)
  const COL_L = MARGIN
  const COL_LV = MARGIN + 28
  const COL_R = PAGE_W / 2 + 5
  const COL_RV = COL_R + 32

  doc.setFontSize(9.5)
  for (let i = 0; i < maxRows; i++) {
    if (leftFields[i]) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...DARK)
      doc.text(leftFields[i][0], COL_L, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...GRAY)
      doc.text(String(leftFields[i][1]), COL_LV, y)
    }
    if (rightFields[i]) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...DARK)
      doc.text(rightFields[i][0], COL_R, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...GRAY)
      doc.text(String(rightFields[i][1]), COL_RV, y)
    }
    y += 6
  }

  y += 6

  // ── MEDIDAS ────────────────────────────────────────────
  const upper = measure?.upper || {}
  const arms  = measure?.arms  || {}
  const pants = measure?.pants || {}
  const lower = measure?.lower || {}

  // Estilo compartido para las tablas de medidas
  const tableStyles = (accentColor, altBg) => ({
    margin: { left: MARGIN, right: MARGIN },
    styles: {
      fontSize:    9,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      textColor:   DARK,
      lineColor:   [229, 231, 235],
      lineWidth:   0.25,
    },
    headStyles: {
      fillColor:  accentColor,
      textColor:  WHITE,
      fontStyle:  'bold',
      halign:     'left',
      fontSize:   9,
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
    },
    alternateRowStyles: { fillColor: altBg },
    columnStyles: {
      0: { cellWidth: 55 },  // Medida 1
      1: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },  // Valor 1
      2: { cellWidth: 55 },  // Medida 2
      3: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },  // Valor 2
    },
  })

  /** Convierte un array de [label, value] a filas de 4 columnas (2 pares por fila) */
  function toDoubleRows(rows) {
    const result = []
    for (let i = 0; i < rows.length; i += 2) {
      const left  = rows[i] || ['', '']
      const right = rows[i + 1] || ['', '']
      result.push([left[0], left[1], right[0], right[1]])
    }
    return result
  }

  // ──────────────────────────────────────────────────
  // 1. MEDIDAS DELANTERAS
  // ──────────────────────────────────────────────────
  const upperRows = [
    ['Contorno de cuello',      upper.contornoCuello     ? `${upper.contornoCuello} cm`     : '—'],
    ['Contorno sobre busto',    upper.contornoSobreBusto ? `${upper.contornoSobreBusto} cm` : '—'],
    ['Contorno de busto',       upper.contornoBusto      ? `${upper.contornoBusto} cm`      : '—'],
    ['Contorno bajo busto',     upper.contornoBajoBusto  ? `${upper.contornoBajoBusto} cm`  : '—'],
    ['Contorno de cintura',     upper.contornoCintura    ? `${upper.contornoCintura} cm`    : '—'],
    ['Contorno de cadera',      upper.contornoCadera     ? `${upper.contornoCadera} cm`     : '—'],
    ['Hombros',                 upper.hombros            ? `${upper.hombros} cm`            : '—'],
    ['Ancho de hombro',         upper.anchoHombro        ? `${upper.anchoHombro} cm`        : '—'],
    ['Caída de hombro',         upper.caidaHombro        ? `${upper.caidaHombro} cm`        : '—'],
    ['Ancho de busto',          upper.anchoBusto         ? `${upper.anchoBusto} cm`         : '—'],
    ['Altura de busto',         upper.alturaBusto        ? `${upper.alturaBusto} cm`        : '—'],
    ['Altura de cadera',        upper.alturaCapdera      ? `${upper.alturaCapdera} cm`      : '—'],
    ['Largo de talle',          upper.largoTalle         ? `${upper.largoTalle} cm`         : '—'],
    ['Largo de talle centro',   upper.largoTalleCentro   ? `${upper.largoTalleCentro} cm`   : '—'],
  ]

  drawSectionHeader('1', 'Medidas Delanteras (14)', OLIVE)
  autoTable(doc, {
    startY: y,
    head:   [['Medida', 'Valor', 'Medida', 'Valor']],
    body:   toDoubleRows(upperRows),
    ...tableStyles(OLIVE, [247, 246, 240]),
  })
  y = doc.lastAutoTable.finalY + 8

  // ──────────────────────────────────────────────────
  // 2. MEDIDAS DE BRAZO
  // ──────────────────────────────────────────────────
  const armRows = [
    ['Largo de brazo',      arms.largoBrazo      ? `${arms.largoBrazo} cm`      : '—'],
    ['Contorno de bíceps',  arms.contornoBiceps  ? `${arms.contornoBiceps} cm`  : '—'],
    ['Bajo el brazo',       arms.bajoElBrazo     ? `${arms.bajoElBrazo} cm`     : '—'],
    ['Contorno de codo',    arms.contornoCodo    ? `${arms.contornoCodo} cm`    : '—'],
    ['Contorno de muñeca',  arms.contornoMuneca  ? `${arms.contornoMuneca} cm`  : '—'],
    ['Contorno de puño',    arms.contornoPuno    ? `${arms.contornoPuno} cm`    : '—'],
  ]

  drawSectionHeader('2', 'Medidas de Brazo (6)', BLUE)
  autoTable(doc, {
    startY: y,
    head:   [['Medida', 'Valor', 'Medida', 'Valor']],
    body:   toDoubleRows(armRows),
    ...tableStyles(BLUE, [239, 246, 255]),
  })
  y = doc.lastAutoTable.finalY + 8

  // ──────────────────────────────────────────────────
  // 3. MEDIDAS DE PANTALÓN O FALDA
  // ──────────────────────────────────────────────────
  const pantsRows = [
    ['Contorno de cintura',  pants.contornoCintura ? `${pants.contornoCintura} cm` : '—'],
    ['Altura de cadera',     pants.alturaCadera    ? `${pants.alturaCadera} cm`    : '—'],
    ['Contorno de cadera',   pants.contornoCadera  ? `${pants.contornoCadera} cm`  : '—'],
    ['Altura de asiento',    pants.alturaAsiento   ? `${pants.alturaAsiento} cm`   : '—'],
    ['Largo de pantalón',    pants.largoPantalon   ? `${pants.largoPantalon} cm`   : '—'],
    ['Largo de falda',       pants.largoFalda      ? `${pants.largoFalda} cm`      : '—'],
  ]

  drawSectionHeader('3', 'Medidas de Pantalón / Falda (6)', GREEN)
  autoTable(doc, {
    startY: y,
    head:   [['Medida', 'Valor', 'Medida', 'Valor']],
    body:   toDoubleRows(pantsRows),
    ...tableStyles(GREEN, [240, 253, 244]),
  })
  y = doc.lastAutoTable.finalY + 8

  // ──────────────────────────────────────────────────
  // 4. MEDIDAS TRASERAS
  // ──────────────────────────────────────────────────
  const lowerRows = [
    ['Largo talle trasero',      lower.largoTalleTrasero     ? `${lower.largoTalleTrasero} cm`     : '—'],
    ['Ancho hombros trasero',    lower.anchoHombrosTrasero   ? `${lower.anchoHombrosTrasero} cm`   : '—'],
    ['Largo centro trasero',     lower.largoCentroTrasero    ? `${lower.largoCentroTrasero} cm`    : '—'],
    ['Reboque de cuello',        lower.reboqueCuelloTrasero  ? `${lower.reboqueCuelloTrasero} cm`  : '—'],
    ['Largo caída trasero',      lower.largoCaidaTrasero     ? `${lower.largoCaidaTrasero} cm`     : '—'],
    ['Ancho tórax trasero',      lower.anchoToraxTrasero     ? `${lower.anchoToraxTrasero} cm`     : '—'],
    ['Ancho omóplatos trasero',  lower.anchoOmoplatosTrasero ? `${lower.anchoOmoplatosTrasero} cm` : '—'],
    ['Ancho cintura trasero',    lower.anchoCinturaTrasero   ? `${lower.anchoCinturaTrasero} cm`   : '—'],
  ]

  drawSectionHeader('4', 'Medidas Traseras (8)', GOLD)
  autoTable(doc, {
    startY: y,
    head:   [['Medida', 'Valor', 'Medida', 'Valor']],
    body:   toDoubleRows(lowerRows),
    ...tableStyles(GOLD, [253, 248, 240]),
  })
  y = doc.lastAutoTable.finalY + 10

  // ── RESUMEN RÁPIDO ─────────────────────────────────────
  ensureSpace(25)
  doc.setFillColor(247, 246, 240)
  doc.setDrawColor(...LIGHT)
  const summaryW = PAGE_W - MARGIN * 2
  doc.roundedRect(MARGIN, y, summaryW, 16, 2, 2, 'FD')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...OLIVE)

  const totalMeasures =
    upperRows.filter(([, v]) => v !== '—').length +
    armRows.filter(([, v]) => v !== '—').length +
    pantsRows.filter(([, v]) => v !== '—').length +
    lowerRows.filter(([, v]) => v !== '—').length

  const summaryItems = [
    `Total medidas: ${totalMeasures} / 34`,
    measure?.fitType ? `Ajuste: ${measure.fitType}` : null,
    measure?.suggestedSize ? `Talla: ${measure.suggestedSize}` : null,
    measure?.fabricType ? `Tela: ${measure.fabricType}` : null,
  ].filter(Boolean)

  const gap = summaryW / (summaryItems.length + 1)
  summaryItems.forEach((txt, i) => {
    doc.text(txt, MARGIN + gap * (i + 1), y + 10, { align: 'center' })
  })

  y += 24

  // ── NOTAS TÉCNICAS ─────────────────────────────────────
  if (measure?.technicalNotes) {
    ensureSpace(45)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...DARK)
    doc.text('Notas Técnicas', MARGIN, y)

    y += 5
    doc.setDrawColor(...LIGHT)
    doc.setFillColor(247, 246, 240)
    const noteLines = doc.splitTextToSize(measure.technicalNotes, PAGE_W - MARGIN * 2 - 10)
    const boxH = Math.max(20, Math.min(noteLines.length * 4.5 + 10, 50))
    doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, boxH, 2, 2, 'FD')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...GRAY)
    doc.text(noteLines.slice(0, 8), MARGIN + 5, y + 7)
    y += boxH + 8
  }

  // ── PIE DE PÁGINA ──────────────────────────────────────
  drawFooter(pageCount)

  // ── DESCARGAR ──────────────────────────────────────────
  const safeName = (client.name || 'cliente').replace(/\s+/g, '-').toLowerCase()
  const filename = `ficha-${safeName}-${format(new Date(), 'ddMMyyyy')}.pdf`
  doc.save(filename)
}
