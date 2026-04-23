import { create } from 'zustand'
import { getLatestRates, getSupportedCurrencyCodes } from '../services/exchangeRateApi'
import { loadFavoritePairs, removeFavoritePair, saveFavoritePair } from '../utils/storage'

const FALLBACK_CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
]

const DEFAULT_MULTI_TARGETS = ['EUR', 'GBP', 'JPY']

export const useCurrencyStore = create((set, get) => ({
  amount: '',
  fromCurrency: 'USD',
  toCurrency: 'EUR',
  favoritePairs: loadFavoritePairs(),
  selectedTargets: DEFAULT_MULTI_TARGETS,
  currencyOptions: FALLBACK_CURRENCIES,
  currenciesLoading: true,
  currenciesError: '',
  rateCache: {},
  ratesLoading: false,
  ratesError: '',
  nextTarget: DEFAULT_MULTI_TARGETS[0],

  setAmount: (amount) => set({ amount }),
  setFromCurrency: (fromCurrency) => set({ fromCurrency }),
  setToCurrency: (toCurrency) => set({ toCurrency }),
  setNextTarget: (nextTarget) => set({ nextTarget }),

  swapCurrencies: () =>
    set((state) => ({
      fromCurrency: state.toCurrency,
      toCurrency: state.fromCurrency,
    })),

  addFavoritePair: () => {
    const { fromCurrency, toCurrency } = get()

    set({
      favoritePairs: saveFavoritePair({
        from: fromCurrency,
        to: toCurrency,
        label: `${fromCurrency} to ${toCurrency}`,
      }),
    })
  },

  loadFavoritePair: (pair) =>
    set({
      fromCurrency: pair.from,
      toCurrency: pair.to,
    }),

  deleteFavoritePair: (id) =>
    set({
      favoritePairs: removeFavoritePair(id),
    }),

  addTarget: (targetCode) =>
    set((state) => {
      if (
        !targetCode ||
        targetCode === state.fromCurrency ||
        state.selectedTargets.includes(targetCode)
      ) {
        return state
      }

      return {
        selectedTargets: [...state.selectedTargets, targetCode],
      }
    }),

  removeTarget: (targetCode) =>
    set((state) => ({
      selectedTargets: state.selectedTargets.filter((code) => code !== targetCode),
    })),

  fetchCurrencies: async (options = {}) => {
    set({
      currenciesLoading: true,
      currenciesError: '',
    })

    try {
      const supported = await getSupportedCurrencyCodes(options)

      set({
        currencyOptions: supported,
      })
    } catch (error) {
      if (error.name !== 'AbortError') {
        set({
          currenciesError: error.message,
        })
      }
    } finally {
      if (!options.signal?.aborted) {
        set({
          currenciesLoading: false,
        })
      }
    }
  },

  fetchRates: async (baseCode, options = {}) => {
    if (!baseCode || get().rateCache[baseCode]) {
      return
    }

    set({
      ratesLoading: true,
      ratesError: '',
    })

    try {
      const rates = await getLatestRates(baseCode, options)

      set((state) => ({
        rateCache: {
          ...state.rateCache,
          [baseCode]: rates,
        },
      }))
    } catch (error) {
      if (error.name !== 'AbortError') {
        set({
          ratesError: error.message,
        })
      }
    } finally {
      if (!options.signal?.aborted) {
        set({
          ratesLoading: false,
        })
      }
    }
  },
}))
