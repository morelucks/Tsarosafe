import { formatCurrency, formatAddress } from '../utils/format';

describe('formatCurrency', () => {
    it('formats USD correctly', () => {
        expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('formats G$ correctly', () => {
        expect(formatCurrency(1000.123456, 'G$')).toBe('1,000.12 G$');
    });

    it('formats CELO correctly', () => {
        expect(formatCurrency(5.12345678, 'CELO')).toBe('5.1235 CELO');
    });
});

describe('formatAddress', () => {
    it('formats address correctly', () => {
        expect(formatAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234...5678');
    });

    it('returns empty string for empty input', () => {
        expect(formatAddress('')).toBe('');
    });
});
