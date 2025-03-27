
export const invoicePrintStyles = `
  @page {
    size: A4;
    margin: 20mm;
  }
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    color: #000;
    background: white;
    font-size: 12px;
  }
  .invoice-container {
    width: 100%;
    max-width: 210mm;
    margin: 0 auto;
  }
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
  }
  .logo-container {
    width: 40%;
    padding: 10px;
    border: 1px solid #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .logo {
    max-width: 100%;
    height: auto;
    max-height: 100px;
  }
  .company-info {
    width: 55%;
    border: 1px solid #ccc;
    padding: 10px;
    background-color: #f9f9f9;
  }
  .company-info h2 {
    margin-top: 0;
    font-size: 14px;
    margin-bottom: 10px;
    font-weight: bold;
  }
  .company-info p {
    margin: 5px 0;
    line-height: 1.4;
  }
  .invoice-title {
    font-size: 18px;
    font-weight: bold;
    margin: 20px 0 10px 0;
    text-transform: uppercase;
    border-bottom: 1px solid #000;
    padding-bottom: 5px;
  }
  .invoice-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .invoice-number {
    width: 45%;
  }
  .invoice-number p {
    margin: 5px 0;
    line-height: 1.4;
  }
  .client-info {
    width: 50%;
    background-color: #f5f5f5;
    padding: 10px;
    border: 1px solid #ccc;
  }
  .client-info h3 {
    margin-top: 0;
    font-size: 14px;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .client-info p {
    margin: 5px 0;
    line-height: 1.4;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f0f0f0;
    font-weight: bold;
    text-align: center;
    font-size: 12px;
  }
  td {
    font-size: 12px;
  }
  .summary-table {
    width: auto;
    margin-left: auto;
    margin-right: 0;
    border-collapse: collapse;
  }
  .summary-table td {
    padding: 5px 10px;
    border: 1px solid #ccc;
  }
  .summary-table tr:last-child {
    font-weight: bold;
  }
  .amount-in-words {
    margin: 15px 0;
    font-style: italic;
  }
  .payment-status {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
  }
  .status-box {
    width: 48%;
  }
  .status-title {
    font-weight: bold;
    margin-bottom: 10px;
  }
  .status-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }
  .notification {
    background-color: #fff9e0;
    border: 1px solid #ffeeba;
    padding: 10px;
    margin-top: 10px;
    border-radius: 4px;
  }
  .notification.payment {
    border-left: 4px solid #ffc107;
    background-color: #fffdf0;
  }
  .notification.delivery {
    border-left: 4px solid #17a2b8;
    background-color: #f0f9ff;
  }
  .status-icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #ffc107;
    color: white;
    text-align: center;
    line-height: 20px;
    margin-right: 8px;
  }
  .image-placeholder {
    width: 40px;
    height: 40px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
  }
  @media print {
    button { display: none; }
    .notification.payment { background-color: #fffdf0 !important; }
    .notification.delivery { background-color: #f0f9ff !important; }
  }
`;
