
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatGNF } from './currency';
import { CatalogProduct } from '@/types/catalog';

interface QuoteData {
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  validityDate: string;
  notes: string;
  products: Array<{
    product: CatalogProduct;
    quantity: number;
  }>;
}

export const generateQuotePDF = (data: QuoteData) => {
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
  doc.text('DEVIS', pageWidth / 2, 25, { align: 'center' });
  
  // Quote Info
  doc.setTextColor(darkPurple);
  doc.setFontSize(12);
  doc.text(`Numéro: ${data.quoteNumber}`, 20, 60);
  doc.text(`Date de validité: ${data.validityDate}`, 20, 70);
  
  // Client Info
  doc.setFontSize(14);
  doc.text('Informations Client', 20, 90);
  doc.setFontSize(12);
  doc.text(`Nom: ${data.clientName}`, 20, 100);
  doc.text(`Email: ${data.clientEmail}`, 20, 110);
  
  // Products Table
  const tableData = data.products.map(item => [
    item.product.name,
    item.quantity.toString(),
    formatGNF(item.product.price),
    formatGNF(item.product.price * item.quantity)
  ]);
  
  const total = data.products.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0
  );
  
  let finalY = 130;
  
  autoTable(doc, {
    startY: 130,
    head: [['Produit', 'Quantité', 'Prix unitaire', 'Total']],
    body: tableData,
    foot: [['', '', 'Total HT', formatGNF(total)]],
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
    footStyles: {
      fillColor: darkPurple,
      textColor: white,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    },
    didDrawPage: function(data) {
      finalY = data.cursor.y;
    },
  });
  
  // Notes
  if (data.notes) {
    doc.setFontSize(12);
    doc.text('Notes:', 20, finalY + 20);
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 40);
    doc.text(splitNotes, 20, finalY + 30);
  }
  
  return doc;
};
