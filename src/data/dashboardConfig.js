export const FALLBACK_CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
]

export const PROVIDERS = [
  { id: 1, name: 'Cebuana Lhuillier', percentageFee: 0.012, flatFee: 50 },
  { id: 2, name: 'M Lhuillier', percentageFee: 0.015, flatFee: 40 },
  { id: 3, name: 'Palawan Express', percentageFee: 0.01, flatFee: 30 },
  { id: 4, name: 'Western Union', percentageFee: 0.035, flatFee: 100 },
  { id: 5, name: 'GCash', percentageFee: 0.012, flatFee: 15 },
]

export const DEFAULT_MULTI_TARGETS = ['EUR', 'GBP', 'JPY']

export const SNAPSHOT_CHANGES = [0.24, -0.12, 0.88]

export const SPARK_PATTERNS = [
  [18, 24, 28, 22, 31],
  [26, 22, 18, 14, 11],
  [12, 18, 23, 26, 33],
]
