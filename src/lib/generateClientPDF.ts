
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Client } from "@/types/client";

export const generateClientPDF = (client: Client) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text("Fiche Client", 105, 15, { align: "center" });

  // Add client info
  doc.setFontSize(12);
  
  const clientInfo = [
    ["Code Client", client.client_code || "-"],
    ["Nom du contact", client.contact_name || "-"],
    ["Nom de l'entreprise", client.company_name || "-"],
    ["Type de client", client.client_type || "occasionnel"],
    ["Téléphone", client.phone || "-"],
    ["Mobile 2", client.mobile_2 || "-"],
    ["WhatsApp", client.whatsapp || "-"],
    ["Email", client.email || "-"],
    ["Adresse", client.address || "-"],
    ["Ville", client.city || "-"],
    ["Code postal", client.postal_code || "-"],
    ["Numéro RC", client.rc_number || "-"],
    ["Numéro CC", client.cc_number || "-"],
    ["Limite de crédit", `${client.credit_limit || 0} DH`],
  ];

  autoTable(doc, {
    body: clientInfo,
    theme: 'striped',
    startY: 30,
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 100 },
    },
  });

  // Save the PDF
  doc.save(`client-${client.client_code || client.id}.pdf`);
};
