
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatGNF } from './currency';

interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: string;
  description: string;
  vatRate: string;
  signature: string;
  discount: string;
  date?: string;
}

export const generateInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Set dark theme colors
  const darkPurple = '#1A1F2C';
  const lightGray = '#8E9196';
  const white = '#FFFFFF';
  
  // Header
  doc.setFillColor(darkPurple);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(white);
  doc.setFontSize(24);
  doc.text('FACTURE', pageWidth / 2, 25, { align: 'center' });
  
  // Invoice Info
  doc.setTextColor(darkPurple);
  doc.setFontSize(12);
  doc.text(`Numéro: ${data.invoiceNumber}`, 20, 60);
  doc.text(`Date: ${data.date || new Date().toLocaleDateString()}`, 20, 70);
  
  // Client Info
  doc.setFontSize(14);
  doc.text('Informations Client', 20, 90);
  doc.setFontSize(12);
  doc.text(`Nom: ${data.clientName}`, 20, 100);
  doc.text(`Email: ${data.clientEmail}`, 20, 110);
  
  // Description
  doc.text('Description:', 20, 130);
  const splitDescription = doc.splitTextToSize(data.description, pageWidth - 40);
  doc.text(splitDescription, 20, 140);
  
  // Montants
  const startY = 140 + (splitDescription.length * 10);
  
  const amount = parseFloat(data.amount) || 0;
  const discount = parseFloat(data.discount) || 0;
  const amountAfterDiscount = amount - discount;
  const vatRate = parseFloat(data.vatRate) || 0;
  const vatAmount = amountAfterDiscount * (vatRate / 100);
  const total = amountAfterDiscount + vatAmount;
  
  const tableData = [
    ['Montant HT', formatGNF(amount)],
    ['Remise', formatGNF(discount)],
    ['TVA ' + data.vatRate + '%', formatGNF(vatAmount)],
    ['Total TTC', formatGNF(total)]
  ];
  
  let finalY = startY;
  
  autoTable(doc, {
    startY: startY,
    head: [['Description', 'Montant']],
    body: tableData,
    theme: 'grid',
    styles: {
      textColor: darkPurple,
      lineColor: lightGray,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: darkPurple,
      textColor: white,
    },
    columnStyles: {
      1: { halign: 'right' }
    },
    didDrawPage: function(data) {
      finalY = data.cursor.y;
    },
  });
  
  // Signature
  if (data.signature) {
    doc.text('Signature:', 20, finalY + 20);
    doc.text(data.signature, 20, finalY + 30);
  }
  
  return doc;
};
