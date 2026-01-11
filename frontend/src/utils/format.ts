export const formatCurrency = (amount: number, currency: 'USD' | 'G$' | 'CELO' = 'USD'): string => {
    if (currency === 'G$') {
        return `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} G$`;
    }
    if (currency === 'CELO') {
        return `${amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} CELO`;
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
