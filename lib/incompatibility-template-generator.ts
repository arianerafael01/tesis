import { jsPDF } from 'jspdf';

export function generateIncompatibilityTemplate() {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  // Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉGIMEN DE INCOMPATIBILIDADES', pageWidth / 2, 15, { align: 'center' });

  // Personal Information Section
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  let y = 25;
  
  // Line 1: Name and DNI
  doc.text('APELLIDO Y NOMBRE: ………………………………………………..…… D.N.I. (N° y Tipo) ……………………………..………….', margin, y);
  
  y += 7;
  // Line 2: Birth info
  doc.text('LUGAR Y FECHA DE NACIMIENTO: …………………………………….. Pcia.: ……….…… Nacionalidad: ………………….', margin, y);
  
  y += 7;
  // Line 3: Address
  doc.text('DOMICILIO: Calle: ……………………………..…………………. Barrio: ……………….…Localidad: ……………..……....', margin, y);
  
  y += 7;
  // Line 4: Parents names
  doc.text('APELLIDO Y NOMBRE DEL PADRE: ……………………..…… APELLIDO Y NOMBRE DE LA MADRE: ……………………..……', margin, y);

  y += 10;
  // Declaration text
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('DECLARO BAJO JURAMENTO', margin, y);
  doc.setFont('helvetica', 'normal');
  const declarationText = 'QUE MI SITUACIÓN DE REVISTA Y LOS HORARIOS DE PRESTACIÓN DE SERVICIOS EN LOS DISTINTOS EMPLEOS QUE DESEMPEÑO, A LOS EFECTOS REQUERIDOS EN EL RÉGIMEN VIGENTE SOBRE INCOMPATIBILIDAD, SON LOS SIGUIENTES';
  const splitDeclaration = doc.splitTextToSize(declarationText, contentWidth - 55);
  doc.text(splitDeclaration, margin + 55, y - 1);

  y += 10;

  // Table - Adjusted widths to fit A4
  const tableStartY = y;
  const colWidths = [38, 10, 18, 10, 16, 13, 13, 13, 13, 13, 13, 20];
  const rowHeight = 10;
  
  // Table headers
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  
  // Header row 1
  let x = margin;
  doc.rect(x, y, colWidths[0], rowHeight);
  doc.text('REPARTICIÓN,', x + 1, y + 3);
  doc.text('ESTABLECIMIENTO,', x + 1, y + 6);
  doc.text('INSTITUTO U OFICINA', x + 1, y + 9);
  
  x += colWidths[0];
  doc.rect(x, y, colWidths[1], rowHeight);
  doc.text('NIVEL', x + 1, y + 4);
  doc.text('(1)', x + 2, y + 7);
  
  x += colWidths[1];
  doc.rect(x, y, colWidths[2], rowHeight);
  doc.text('CARGO QUE', x + 1, y + 3);
  doc.text('DESEMPEÑA', x + 1, y + 6);
  doc.text('(2)', x + 6, y + 9);
  
  x += colWidths[2];
  doc.rect(x, y, colWidths[3], rowHeight);
  doc.text('N° de', x + 1, y + 4);
  doc.text('Horas', x + 1, y + 6.5);
  doc.text('(3)', x + 2, y + 9);
  
  x += colWidths[3];
  doc.rect(x, y, colWidths[4], rowHeight);
  doc.text('CARÁCTER', x + 1, y + 3);
  doc.text('DEL', x + 4, y + 5.5);
  doc.text('CARGO (4)', x + 1, y + 8);
  
  x += colWidths[4];
  // Horario de prestación de servicios (5) - 6 columns
  const scheduleStartX = x;
  doc.rect(x, y, colWidths[5] + colWidths[6] + colWidths[7] + colWidths[8] + colWidths[9] + colWidths[10], rowHeight);
  doc.text('HORARIO DE PRESTACIÓN DE SERVICIOS (5)', x + 15, y + 6);
  
  x += colWidths[5] + colWidths[6] + colWidths[7] + colWidths[8] + colWidths[9] + colWidths[10];
  doc.rect(x, y, colWidths[11], rowHeight);
  doc.text('FIRMA Y', x + 1, y + 3);
  doc.text('SELLO', x + 2, y + 5.5);
  doc.text('AUTORIDAD', x + 1, y + 8);
  doc.text('(6)', x + 7, y + 9.5);

  // Header row 2 - Days of week
  y += rowHeight;
  x = scheduleStartX;
  const days = ['LUNES', 'MARTES', 'MIERC', 'JUEVES', 'VIERNES', 'SÁBADO'];
  days.forEach((day, i) => {
    doc.rect(x, y, colWidths[5 + i], rowHeight);
    doc.text(day, x + 1, y + 6);
    x += colWidths[5 + i];
  });

  // Empty rows for data entry
  y += rowHeight;
  for (let row = 0; row < 5; row++) {
    x = margin;
    colWidths.forEach((width, i) => {
      doc.rect(x, y, width, rowHeight * 1.8);
      x += width;
    });
    y += rowHeight * 1.8;
  }

  // Notes section
  y += 3;
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  
  const notes = [
    '(1) Indicar el Nivel del cargo u hora cátedra que desempeña: Inicial Primario, Medio o Superior',
    '(2) Consignar el cargo que desempeña: Profesor, Director, Vicedirector, Supervisor, Preceptor, Secretario, Ayudante Técnico, Maestro de Grado, etc.',
    '(3) Indicar la cantidad de horas semanales que cumple',
    '(4) Consignar el carácter del cargo que desempeña: Titular, Interino, Suplente o Precario',
    '(5) Indicar la hora en que empieza y termina cada hora de clase o cargo',
    '(6) Firmar y sellar por la autoridad jerárquica inmediata que corresponda a cada cargo',
    'Nota: En los casos de pase en comisión o cambio de ámbito laboral deberá adjuntar copia de la Resolución o Instrumento legal.'
  ];

  notes.forEach((note, i) => {
    const lines = doc.splitTextToSize(note, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 3;
  });

  // Footer
  y += 5;
  if (y > pageHeight - 20) {
    y = pageHeight - 20;
  }
  doc.setFontSize(8);
  doc.text('………………………………………………………………', margin, y);
  doc.text('………………………………………………………………', pageWidth - margin - 60, y);
  
  y += 4;
  doc.text('Lugar y Fecha', margin + 15, y);
  doc.text('Firma del Declarante', pageWidth - margin - 45, y);

  return doc;
}

export function downloadIncompatibilityTemplate() {
  const doc = generateIncompatibilityTemplate();
  doc.save('modelo-declaracion-jurada-incompatibilidades.pdf');
}
