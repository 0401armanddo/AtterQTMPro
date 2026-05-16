import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Captura um elemento DOM e gera um PDF A4 multi-página.
 * O elemento deve ter largura fixa de 794px (A4 a 96dpi).
 */
export async function elementToPDF(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: 794,
  })

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = 210  // mm
  const pageH = 297  // mm
  const imgW = pageW
  const imgH = (canvas.height / canvas.width) * pageW

  let remaining = imgH
  let offset = 0

  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, -offset, imgW, imgH)
  remaining -= pageH

  while (remaining > 0) {
    offset += pageH
    pdf.addPage()
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, -offset, imgW, imgH)
    remaining -= pageH
  }

  pdf.save(filename)
}
