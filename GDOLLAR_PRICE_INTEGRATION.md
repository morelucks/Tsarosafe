# GoodDollar Price Integration Feature

## Overview
This comprehensive feature integrates real-time G$ price data, USD conversions, and historical price charts throughout the TsaroSafe application, providing users with complete price transparency and conversion tools.

## Features Implemented

### 1. Price Oracle Service (`/lib/priceOracle.ts`)
- **CoinGecko API Integration**: Real-time price data from reliable market source
- **Caching System**: 5-minute cache duration to optimize API usage
- **Error Handling**: Fallback prices and retry mechanisms
- **Historical Data**: Support for multiple time periods (1H to 1Y)
- **Conversion Methods**: Bidirectional G$ ↔ USD conversion

### 2. React Hooks (`/hooks/useGDollarPrice.ts`)
- **`useGDollarPrice()`**: Real-time price with auto-refresh every minute
- **`useGDollarPriceHistory()`**: Historical data for chart visualization
- **`useGDollarConversion()`**: Instant conversion calculations
- **`useGDollarPriceMonitor()`**: Price alerts and monitoring

### 3. UI Components

#### Price Display (`/components/GDollarPriceDisplay.tsx`)
- Real-time G$ to USD rate with 24h change indicators
- Compact and detailed display modes
- Market cap and volume data
- Refresh functionality and loading states

#### Amount Conversion (`/components/GDollarAmount.tsx`)
- **GDollarAmount**: Flexible component for displaying G$ with USD equivalent
- **InlineGDollarAmount**: Compact inline display with parenthetical USD
- **USDAmount**: USD-only display for G$ amounts
- Multiple format options (full, compact, minimal)

#### Price Chart (`/components/GDollarPriceChart.tsx`)
- SVG-based line chart with gradient fills
- Multiple time periods (1H, 24H, 7D, 30D, 90D, 1Y)
- Price range indicators and change percentages
- Interactive period selector

### 4. Integration Points

#### Dashboard Integration
- G$ price display alongside balance and UBI components
- Historical price chart in main dashboard view
- Price quick action for detailed price page
- UBI amounts show USD equivalents

#### Group Details Integration
- USD conversions for G$ group contributions
- Progress bars show USD equivalents for G$ groups
- Compact price display for G$ groups
- Contribution history with proper currency formatting

#### Balance Components
- GoodDollar balance shows USD equivalent
- UBI claim amounts display USD values
- Real-time conversion updates

### 5. Dedicated Price Page (`/app/price/page.tsx`)
- Comprehensive price analysis and market data
- Interactive G$ ↔ USD converter
- Detailed market statistics
- Educational content about GoodDollar
- Historical charts with multiple periods

## Technical Implementation

### API Integration
```typescript
// CoinGecko API endpoints
const PRICE_API = 'https://api.coingecko.com/api/v3/simple/price'
const HISTORY_API = 'https://api.coingecko.com/api/v3/coins/gooddollar/market_chart'
```

### Caching Strategy
- **Current Price**: 5-minute cache duration
- **Historical Data**: 5-minute cache per period
- **Automatic Refresh**: Every 60 seconds for real-time data
- **Error Fallback**: Uses cached data when API fails

### Price Conversion Logic
```typescript
// G$ to USD
const usdValue = gdollarAmount * currentPrice.usd

// USD to G$
const gdollarValue = usdAmount / currentPrice.usd
```

### Chart Data Processing
- Normalizes price data across different time periods
- Calculates min/max ranges for proper scaling
- Generates SVG paths for smooth line visualization
- Handles edge cases for flat or missing data

## Usage Examples

### Basic Price Display
```tsx
<GDollarPriceDisplay showDetails={true} />
```

### Amount with USD Conversion
```tsx
<InlineGDollarAmount amount={100} />
// Displays: "100 G$ ($0.12)"
```

### Historical Chart
```tsx
<GDollarPriceChart height={300} />
```

### Real-time Conversion
```tsx
const { getUSDValue } = useGDollarConversion();
const usdAmount = getUSDValue(gdollarAmount);
```

## Configuration

### Price Update Intervals
- **Real-time Price**: 60 seconds
- **Chart Data**: On-demand with caching
- **Cache Duration**: 5 minutes
- **Retry Attempts**: 3 maximum

### Supported Time Periods
- **1H**: Hourly data for 1 day
- **24H**: Hourly data for 1 day  
- **7D**: Daily data for 7 days
- **30D**: Daily data for 30 days
- **90D**: Daily data for 90 days
- **1Y**: Daily data for 365 days

### Fallback Configuration
```typescript
const FALLBACK_PRICE = 0.001; // USD
const MAX_RETRIES = 3;
const CACHE_DURATION = 300000; // 5 minutes
```

## Error Handling

### API Failures
- Automatic retry with exponential backoff
- Fallback to cached data when available
- Default fallback price for critical failures
- User-friendly error messages

### Network Issues
- Graceful degradation with cached data
- Loading states during network requests
- Retry buttons for manual refresh
- Offline indicator when appropriate

## Performance Optimizations

### Caching Strategy
- In-memory caching for frequently accessed data
- Configurable cache duration per data type
- Cache invalidation on manual refresh
- Efficient cache key management

### API Usage
- Batched requests where possible
- Rate limiting compliance
- Minimal data fetching
- Efficient polling intervals

### Component Optimization
- Memoized calculations for conversions
- Optimized re-renders with proper dependencies
- Lazy loading for chart components
- Efficient SVG rendering

## Future Enhancements

### Advanced Features
- Price alerts and notifications
- Portfolio tracking with G$ holdings
- Advanced charting with technical indicators
- Multi-currency support beyond USD

### Integration Improvements
- WebSocket connections for real-time updates
- Multiple price source aggregation
- Historical portfolio value tracking
- Price prediction models

### User Experience
- Customizable refresh intervals
- Favorite time periods
- Price comparison tools
- Export functionality for data

## Dependencies

### External APIs
- **CoinGecko API**: Primary price data source
- **Backup APIs**: Planned for redundancy

### React Libraries
- **React Hooks**: State management
- **SVG**: Chart visualization
- **Date utilities**: Time formatting

### Styling
- **TailwindCSS**: Component styling
- **Responsive design**: Mobile-first approach
- **Color coding**: Price change indicators

## Testing Strategy

### Unit Tests
- Price conversion accuracy
- Cache functionality
- Error handling scenarios
- Component rendering

### Integration Tests
- API integration reliability
- Real-time update functionality
- Cross-component data flow
- User interaction flows

### Performance Tests
- API response times
- Cache efficiency
- Component render performance
- Memory usage optimization

This comprehensive G$ price integration provides users with complete transparency into GoodDollar's market value while seamlessly integrating conversion functionality throughout the TsaroSafe application.