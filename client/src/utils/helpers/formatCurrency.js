import numberToWords from 'number-to-words';

export const numberToWordsFull = (input) => {
    if (isNaN(input)) return 'Invalid number';
  
    const [whole, decimal] = input.toString().split('.');
  
    const wholeNum = parseInt(whole);
    if (!Number.isSafeInteger(wholeNum)) return 'Amount is too large';

    try {
      let words = numberToWords.toWords(wholeNum);
    
      if (decimal) {
        const decimalWords = decimal.split('').map(d => numberToWords.toWords(parseInt(d))).join(' ');
        words += ' point ' + decimalWords;
      }
    
      return words;
    } catch (e) {
      return 'Invalid number';
    }
  }
  
  export const numberToCurrencyWords = (amount) => {
    if (isNaN(amount) || typeof amount !== 'number') return 'Invalid number';

    const wholeNumber = Math.floor(Math.abs(amount));
    const decimalPart = Math.round((Math.abs(amount) - wholeNumber) * 100);

    if (!Number.isSafeInteger(wholeNumber) || !Number.isSafeInteger(decimalPart)) {
      return 'Amount is too large';
    }

    try {
      const words = numberToWords.toWords(wholeNumber).replaceAll('-', ' ');
      const decimalWords = numberToWords.toWords(decimalPart).replaceAll('-', ' ');

      const capitalizeWords = (str) =>
        str
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

      return `${capitalizeWords(words)} and ${capitalizeWords(decimalWords)} Cents`;
    } catch (e) {
      return 'Amount is too large';
    }
  }
  

  
   // Function to format amount as currency
   export const formatAmountAsCurrency = (value) => {
    if (!value && value !== 0) return '';
    const strValue = String(value);
    const numericValue = strValue.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    const formattedValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
    // Format with 2 decimal places
    return Number(formattedValue).toFixed(2);
  };
  