
const units = [
  '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'
];

const tens = [
  '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'
];

function convertLessThanOneThousand(number: number): string {
  let result = '';

  if (number === 0) {
    return 'zéro';
  }

  if (number >= 100) {
    const hundreds = Math.floor(number / 100);
    if (hundreds === 1) {
      result += 'cent ';
    } else {
      result += units[hundreds] + ' cent ';
    }
    number %= 100;
    if (number === 0 && hundreds > 1) {
      result = result.trimEnd() + 's';
    }
  }

  if (number < 20) {
    result += units[number];
  } else {
    const digit = number % 10;
    const ten = Math.floor(number / 10);
    
    if (ten === 7 || ten === 9) {
      result += tens[ten - 1] + '-';
      if (digit === 1) {
        result += 'et-';
      }
      result += units[digit + 10];
    } else {
      result += tens[ten];
      if (digit === 1 && ten !== 8) {
        result += '-et-' + units[digit];
      } else if (digit > 0) {
        result += '-' + units[digit];
      }
      if (ten === 8 && digit === 0) {
        result += 's';
      }
    }
  }

  return result;
}

export function numberToWords(number: number): string {
  if (number === 0) {
    return 'zéro';
  }

  let result = '';
  const isNegative = number < 0;
  if (isNegative) {
    number = Math.abs(number);
  }

  // Format number to handle decimals
  number = Math.round(number);

  // Billions
  const billions = Math.floor(number / 1000000000);
  if (billions > 0) {
    if (billions === 1) {
      result += 'un milliard ';
    } else {
      result += convertLessThanOneThousand(billions) + ' milliards ';
    }
    number %= 1000000000;
  }

  // Millions
  const millions = Math.floor(number / 1000000);
  if (millions > 0) {
    if (millions === 1) {
      result += 'un million ';
    } else {
      result += convertLessThanOneThousand(millions) + ' millions ';
    }
    number %= 1000000;
  }

  // Thousands
  const thousands = Math.floor(number / 1000);
  if (thousands > 0) {
    if (thousands === 1) {
      result += 'mille ';
    } else {
      result += convertLessThanOneThousand(thousands) + ' mille ';
    }
    number %= 1000;
  }

  // Handle the rest
  if (number > 0) {
    result += convertLessThanOneThousand(number);
  }

  if (isNegative) {
    result = 'moins ' + result;
  }

  return result.trimEnd();
}
