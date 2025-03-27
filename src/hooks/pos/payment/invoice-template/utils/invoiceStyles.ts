
/**
 * CSS styles for the invoice template
 */
export const invoiceStyles = `
  @page {
    size: A4;
    margin: 15mm;
  }
  body {
    font-family: system-ui, -apple-system, sans-serif;
    margin: 0;
    padding: 0;
    color: #000;
    background: white;
  }
  .invoice-container {
    width: 100%;
    max-width: 210mm;
    margin: 0 auto;
    border: 1px solid #000;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #000;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f5f5f5;
    font-weight: bold;
  }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
  .font-bold {
    font-weight: bold;
  }
  .invoice-title {
    background-color: #fff;
    padding: 10px;
    font-size: 18px;
    font-weight: bold;
    text-transform: uppercase;
    border-bottom: 1px solid #000;
  }
  .company-info {
    width: 50%;
    padding: 15px;
  }
  .company-info h2 {
    margin-top: 0;
    font-size: 16px;
    margin-bottom: 10px;
  }
  .company-info p {
    margin: 5px 0;
  }
  .company-logo {
    background-color: #f0f8ff;
    padding: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .company-logo img {
    max-height: 80px;
  }
  .invoice-header-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid #000;
  }
  .client-info {
    padding: 15px;
    background-color: #f5f5f5;
  }
  .client-info h3 {
    margin-top: 0;
    margin-bottom: 10px;
    font-weight: bold;
  }
  .invoice-details {
    padding: 15px;
  }
  .invoice-details p {
    margin: 5px 0;
  }
  .amount-in-words {
    padding: 10px;
    font-style: italic;
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
  }
  .status-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .payment-status {
    padding: 15px;
    border-right: 1px solid #000;
  }
  .delivery-status {
    padding: 15px;
  }
  .status-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }
  .status-label {
    font-weight: bold;
  }
  .status-value {
    text-align: right;
  }
  .status-notification {
    margin-top: 10px;
    padding: 10px;
    background-color: #e6f7e6;
    border-left: 4px solid #4caf50;
    display: flex;
    align-items: center;
  }
  .status-notification-icon {
    margin-right: 10px;
    color: #4caf50;
  }
  
  @media print {
    body { 
      padding: 0; 
      margin: 0; 
    }
    button { 
      display: none !important; 
    }
    .invoice-container { 
      border: 1px solid black;
      width: 100%;
      margin: 0;
      padding: 0;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .bg-gray-100 {
      background-color: #f3f4f6 !important;
    }
    .bg-green-50 {
      background-color: #f0fdf4 !important;
    }
  }
`;
