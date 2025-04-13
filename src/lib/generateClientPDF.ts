
import jsPDF from "jspdf";
import { Client } from "@/types/client";
import autoTable from "jspdf-autotable";

export const generateClientPDF = (client: Client) => {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text("Fiche Client", 105, 15, { align: "center" });

  // Client details as a table
  const clientDetails = [
    ["Nom du contact", client.contact_name || ""],
    ["Nom de l'entreprise", client.company_name || ""],
    ["Type de client", client.client_type || "Occasionnel"],
    ["Téléphone", client.phone || ""],
    ["Téléphone mobile", client.mobile_1 || ""],
    ["WhatsApp", client.whatsapp || ""],
    ["Email", client.email || ""],
    ["Adresse", client.address || ""],
    ["Ville", client.city || ""],
    ["Pays", client.country || ""],
    ["RC", client.rc_number || ""],
    ["CC", client.cc_number || ""],
    ["Limite de crédit", client.credit_limit ? `${client.credit_limit} GNF` : "Non définie"],
    ["Notes", client.notes || ""],
  ];

  // Filter out empty rows
  const filteredDetails = clientDetails.filter(
    ([, value]) => value && value !== ""
  );

  autoTable(doc, {
    startY: 25,
    head: [["Information", "Détail"]],
    body: filteredDetails,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Save the PDF
  const clientName = client.company_name || client.contact_name || "client";
  const sanitizedClientName = clientName.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`fiche_client_${sanitizedClientName}.pdf`);
};
