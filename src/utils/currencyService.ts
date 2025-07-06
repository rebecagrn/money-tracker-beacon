// Currency conversion service using ExchangeRate-API
export const getExchangeRate = async (fromCurrency: string, toCurrency: string = 'BRL', date?: string): Promise<number> => {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  try {
    // Using exchangerate-api.com free tier
    const baseUrl = 'https://api.exchangerate-api.com/v4/latest';
    const response = await fetch(`${baseUrl}/${fromCurrency}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }
    
    const data = await response.json();
    
    if (!data.rates || !data.rates[toCurrency]) {
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    }
    
    return data.rates[toCurrency];
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    
    // Fallback rates (approximate values)
    const fallbackRates: Record<string, number> = {
      'USD': 5.0,
      'EUR': 5.5,
      'GBP': 6.2,
      'BRL': 1.0
    };
    
    return fallbackRates[fromCurrency] || 1;
  }
};

export const convertToBRL = async (amount: number, fromCurrency: string): Promise<{
  convertedAmount: number;
  exchangeRate: number;
}> => {
  const rate = await getExchangeRate(fromCurrency, 'BRL');
  return {
    convertedAmount: amount * rate,
    exchangeRate: rate
  };
};