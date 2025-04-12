
// For item.products possibly null error, use optional chaining:
// Change from:
// const productNames = item.products.map(product => product.name).join(', ');
// To:
const productNames = item.products?.map(product => product.name).join(', ') || 'No products';

// For the status property error, safely access the property:
// Change from:
// client.status
// To:
client.status || 'unknown'
