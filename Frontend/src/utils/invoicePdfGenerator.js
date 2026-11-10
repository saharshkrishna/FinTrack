import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (invoice, download = true) => {
  if (!invoice) {
    throw new Error('Invoice data is required to generate PDF');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = 16;

  // --- Header / Document Title ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, currentY, pageWidth - margin * 2, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE', pageWidth / 2, currentY + 7, { align: 'center' });
  currentY += 15;

  // --- Top Info Banner: Supplier (Left) & Invoice Meta (Right) ---
  const colWidth = (pageWidth - margin * 2) / 2;
  const leftX = margin;
  const rightX = margin + colWidth;

  // Supplier Details Box
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.supplierName || 'Business Name', leftX, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600

  let supplierY = currentY + 4.5;
  if (invoice.supplierAddress) {
    const splitAddr = doc.splitTextToSize(invoice.supplierAddress, colWidth - 8);
    doc.text(splitAddr, leftX, supplierY);
    supplierY += splitAddr.length * 4;
  }
  if (invoice.supplierState) {
    doc.text(`State: ${invoice.supplierState}${invoice.supplierStateCode ? ` (${invoice.supplierStateCode})` : ''}`, leftX, supplierY);
    supplierY += 4;
  }
  if (invoice.supplierGSTIN) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`GSTIN: ${invoice.supplierGSTIN}`, leftX, supplierY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    supplierY += 4;
  }
  if (invoice.supplierPhone || invoice.supplierEmail) {
    const contactText = [invoice.supplierPhone, invoice.supplierEmail].filter(Boolean).join(' | ');
    doc.text(contactText, leftX, supplierY);
    supplierY += 4;
  }

  // Invoice Meta (Right)
  let metaY = currentY;
  const metaLabelX = rightX + 8;
  const metaValX = pageWidth - margin;

  const drawMetaRow = (label, value, isBold = false) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, metaLabelX, metaY);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(String(value || '-'), metaValX, metaY, { align: 'right' });
    metaY += 4.5;
  };

  drawMetaRow('Invoice No:', invoice.invoiceNumber, true);
  drawMetaRow('Invoice Date:', invoice.invoiceDate);
  if (invoice.dueDate) {
    drawMetaRow('Due Date:', invoice.dueDate);
  }
  drawMetaRow('Place of Supply:', invoice.placeOfSupply || invoice.customerState || '-');
  drawMetaRow('Tax Type:', invoice.isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)');
  if (invoice.reverseCharge) {
    drawMetaRow('Reverse Charge:', 'Yes');
  }

  currentY = Math.max(supplierY, metaY) + 4;

  // --- Divider ---
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  // --- Customer / Bill To Section ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 24, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 24, 1.5, 1.5, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO / CUSTOMER DETAILS:', margin + 4, currentY + 5);

  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.customerName || '-', margin + 4, currentY + 10.5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const custDetails = [];
  if (invoice.customerAddress) custDetails.push(invoice.customerAddress);
  if (invoice.customerState) custDetails.push(`State: ${invoice.customerState}${invoice.customerStateCode ? ` (${invoice.customerStateCode})` : ''}`);
  doc.text(custDetails.join(' | ') || 'Address: N/A', margin + 4, currentY + 15.5);

  const subCust = [];
  if (invoice.customerGSTIN) subCust.push(`GSTIN: ${invoice.customerGSTIN}`);
  if (invoice.customerPhone) subCust.push(`Phone: ${invoice.customerPhone}`);
  if (invoice.customerEmail) subCust.push(`Email: ${invoice.customerEmail}`);
  doc.setFont('helvetica', invoice.customerGSTIN ? 'bold' : 'normal');
  doc.text(subCust.join('  •  ') || 'Customer Contact: N/A', margin + 4, currentY + 20.5);

  currentY += 28;

  // --- Line Items Table ---
  const isInter = Boolean(invoice.isInterState);
  
  // Table headers based on inter/intra state
  const tableHeaders = isInter
    ? [['#', 'Item Description', 'HSN/SAC', 'Qty', 'Unit', 'Rate', 'Disc', 'Taxable', 'IGST', 'Total']]
    : [['#', 'Item Description', 'HSN/SAC', 'Qty', 'Unit', 'Rate', 'Disc', 'Taxable', 'CGST', 'SGST', 'Total']];

  const tableRows = (invoice.items || []).map((item, idx) => {
    const discStr = item.discount ? `${item.discount}${item.discountType === '%' ? '%' : ''}` : '-';
    if (isInter) {
      return [
        idx + 1,
        item.description || '-',
        item.hsnSac || '-',
        item.quantity || 1,
        item.unit || 'Nos',
        `Rs. ${Number(item.rate || 0).toFixed(2)}`,
        discStr,
        `Rs. ${Number(item.taxableValue || 0).toFixed(2)}`,
        `${item.gstRate || 0}%\nRs. ${Number(item.igstAmount || 0).toFixed(2)}`,
        `Rs. ${Number(item.totalAmount || 0).toFixed(2)}`
      ];
    } else {
      const halfRate = (item.gstRate || 0) / 2;
      return [
        idx + 1,
        item.description || '-',
        item.hsnSac || '-',
        item.quantity || 1,
        item.unit || 'Nos',
        `Rs. ${Number(item.rate || 0).toFixed(2)}`,
        discStr,
        `Rs. ${Number(item.taxableValue || 0).toFixed(2)}`,
        `${halfRate}%\nRs. ${Number(item.cgstAmount || 0).toFixed(2)}`,
        `${halfRate}%\nRs. ${Number(item.sgstAmount || 0).toFixed(2)}`,
        `Rs. ${Number(item.totalAmount || 0).toFixed(2)}`
      ];
    }
  });

  // Call autoTable as function (standard jspdf-autotable v5 API)
  autoTable(doc, {
    startY: currentY,
    head: tableHeaders,
    body: tableRows,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.2
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: isInter ? 44 : 38 },
      2: { halign: 'center', cellWidth: 16 },
      3: { halign: 'center', cellWidth: 10 },
      4: { halign: 'center', cellWidth: 11 },
      5: { halign: 'right', cellWidth: 18 },
      6: { halign: 'center', cellWidth: 12 },
      7: { halign: 'right', cellWidth: 20 },
      8: { halign: 'right', cellWidth: isInter ? 22 : 18 },
      9: { halign: 'right', cellWidth: isInter ? 21 : 18 },
      ...(isInter ? {} : { 10: { halign: 'right', cellWidth: 19 } })
    },
    didDrawPage: (data) => {
      currentY = data.cursor.y;
    }
  });

  currentY = (doc.lastAutoTable?.finalY || currentY) + 4;

  // Check if we need a new page for totals & footer
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 16;
  }

  // --- Summary & Totals Section ---
  const totalsBoxWidth = 80;
  const totalsX = pageWidth - margin - totalsBoxWidth;
  const notesWidth = totalsX - margin - 6;

  // Left side: Amount in words + Bank details + Notes
  let notesY = currentY;
  
  // Amount in words box
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL AMOUNT IN WORDS:', margin, notesY);
  notesY += 4;
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(15, 23, 42);
  const wordsSplit = doc.splitTextToSize(invoice.amountInWords || 'Zero Rupees Only', notesWidth);
  doc.text(wordsSplit, margin, notesY);
  notesY += wordsSplit.length * 4 + 3;

  // Bank Details
  if (invoice.bankName || invoice.bankAccount) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('BANK DETAILS FOR PAYMENT:', margin, notesY);
    notesY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    if (invoice.bankName) {
      doc.text(`Bank: ${invoice.bankName}${invoice.bankBranch ? ` (${invoice.bankBranch})` : ''}`, margin, notesY);
      notesY += 3.8;
    }
    if (invoice.bankAccount) {
      doc.text(`A/C No: ${invoice.bankAccount}`, margin, notesY);
      notesY += 3.8;
    }
    if (invoice.bankIFSC) {
      doc.text(`IFSC: ${invoice.bankIFSC}`, margin, notesY);
      notesY += 3.8;
    }
    notesY += 2;
  }

  // Terms / Notes
  if (invoice.notes || invoice.termsAndConditions) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('TERMS & NOTES:', margin, notesY);
    notesY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const combinedNotes = [invoice.notes, invoice.termsAndConditions].filter(Boolean).join('\n');
    const splitNotes = doc.splitTextToSize(combinedNotes, notesWidth);
    doc.text(splitNotes, margin, notesY);
  }

  // Right side: Breakdown Calculations Box
  let calcY = currentY;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(totalsX, calcY, totalsBoxWidth, 42, 1, 1, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsX, calcY, totalsBoxWidth, 42, 1, 1, 'S');

  calcY += 5;
  const drawCalcRow = (label, amount) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(label, totalsX + 4, calcY);
    doc.setTextColor(15, 23, 42);
    doc.text(`Rs. ${Number(amount || 0).toFixed(2)}`, pageWidth - margin - 4, calcY, { align: 'right' });
    calcY += 4.5;
  };

  drawCalcRow('Taxable Subtotal:', invoice.subtotal);
  if (invoice.isInterState) {
    drawCalcRow('Total IGST:', invoice.totalIGST);
  } else {
    drawCalcRow('Total CGST:', invoice.totalCGST);
    drawCalcRow('Total SGST:', invoice.totalSGST);
  }
  drawCalcRow('Total Tax:', invoice.totalTax);
  if (invoice.roundOff) {
    drawCalcRow('Round Off:', invoice.roundOff);
  }

  // Grand Total bar
  doc.setFillColor(15, 23, 42);
  doc.rect(totalsX, calcY, totalsBoxWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Grand Total:', totalsX + 4, calcY + 5.5);
  doc.text(`Rs. ${Number(invoice.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, calcY + 5.5, { align: 'right' });

  // --- Footer / Signatory ---
  const footerY = Math.max(notesY, calcY + 14) + 8;
  if (footerY < pageHeight - 20) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('This is a computer generated invoice and requires no physical signature.', margin, pageHeight - 12);

    const signX = pageWidth - margin - 50;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`For ${invoice.supplierName || 'Authorized Signatory'}`, signX, pageHeight - 22);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Authorized Signatory', signX, pageHeight - 12);
    doc.line(signX, pageHeight - 16, pageWidth - margin, pageHeight - 16);
  }

  // --- Download or Return ---
  if (download) {
    const rawNumber = invoice.invoiceNumber || 'Invoice';
    const safeFilename = `${rawNumber.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`;
    
    try {
      doc.save(safeFilename);
    } catch (err) {
      console.warn('doc.save() failed, attempting blob link fallback:', err);
      // Fallback: create Blob and trigger programmatic click
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = safeFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
    }
  }

  return doc;
};
