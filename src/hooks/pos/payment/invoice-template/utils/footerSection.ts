
/**
 * Generate the signature section
 */
export function generateSignatureSection(): string {
  return `
    <div style="margin-top: 40px; display: flex; justify-content: space-between;">
      <div style="width: 45%;">
        <p><strong>Signature du Client</strong></p>
        <div style="height: 60px; border-bottom: 1px dashed #ccc;"></div>
      </div>
      <div style="width: 45%; text-align: right;">
        <p><strong>Signature du Vendeur</strong></p>
        <div style="height: 60px; border-bottom: 1px dashed #ccc;"></div>
      </div>
    </div>
    
    <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
      <p>DEMO SARL - Numéro RCCM: GC-KAL/RCCM/2011-A-9908 - NIF: 123456789</p>
    </div>
  `;
}

/**
 * Generate the print script
 */
export function generatePrintScript(): string {
  return `
    <script>
      // Focus on the window and delay printing to ensure all content is loaded
      window.focus();
      setTimeout(function() {
        window.print();
      }, 1000);
    </script>
  `;
}
