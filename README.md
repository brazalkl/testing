# Currency Converter

A responsive React currency converter built with Vite. It uses ExchangeRate-API for live rates and supported currency codes, simulates provider fees, supports multiple target conversions, and stores favorite pairs in `localStorage`.

The app now uses a same-origin proxy for ExchangeRate-API requests so the upstream API key does not need to be exposed in client-side code.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file from the example:

```bash
cp .env.example .env
```

3. Add your ExchangeRate-API key to `.env`:

```bash
EXCHANGE_RATE_API_KEY=your_key_here
```

4. Start the app:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

## Project Structure

```text
src/
  components/
    ConverterForm.jsx
    CurrencySelect.jsx
    ErrorBanner.jsx
    FavoritePairs.jsx
    FeeProviderList.jsx
    MultiConversionList.jsx
    ResultCard.jsx
    SwapButton.jsx
  services/
    exchangeRateApi.js
  utils/
    feeCalculator.js
    formatters.js
    storage.js
  App.jsx
  App.css
  index.css
```

## API Notes

- The browser calls the local `/api/exchange-rate/*` proxy instead of hitting ExchangeRate-API directly.
- Supported currency codes are loaded from the proxied `codes` endpoint.
- Live conversion rates are loaded from the proxied `latest/{base}` endpoint.
- Set `EXCHANGE_RATE_API_BASE_URL` only if you need to override the default base URL.
- For Vercel deployments, add `EXCHANGE_RATE_API_KEY` in the project environment variables so the serverless proxy can forward requests securely.

## Features

- Live exchange rate conversion
- Responsive amount and currency controls
- Swap button for source/target currencies
- Provider fee simulation for 5 hard-coded providers
- Multiple target conversion cards
- Favorite pair save/load/remove with `localStorage`
- Validation, loading states, and API error handling
