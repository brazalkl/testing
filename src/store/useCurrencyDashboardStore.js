import { create } from 'zustand'
import {
  DEFAULT_MULTI_TARGETS,
  FALLBACK_CURRENCIES,
} from '../data/dashboardConfig'
import {
  getLatestRates,
  getSupportedCurrencyCodes,
} from '../services/exchangeRateApi'
import {
  loadFavoritePairs,
  removeFavoritePair,
  saveFavoritePair,
} from '../utils/storage'

export const useCurrencyDashboardStore = create((set, get) => ({
  amount: '',
  fromCurrency: 'PHP',
  toCurrency: 'USD',
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

  swapCurrencies: () => {
    const { fromCurrency, toCurrency } = get()

    set({
      fromCurrency: toCurrency,
      toCurrency: fromCurrency,
    })
  },

  saveCurrentFavorite: () => {
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

  removeFavoritePairAction: (id) =>
    set({
      favoritePairs: removeFavoritePair(id),
    }),

  addTarget: (targetCode, baseCode) =>
    set((state) => {
      if (
        !targetCode ||
        targetCode === baseCode ||
        state.selectedTargets.includes(targetCode)
      ) {
        return state
      }

      return {
        selectedTargets: [...state.selectedTargets, targetCode],
      }
    }),

  removeTarget: (code) =>
    set((state) => ({
      selectedTargets: state.selectedTargets.filter(
        (targetCode) => targetCode !== code,
      ),
    })),

  loadCurrencies: async (signal) => {
    set({
      currenciesLoading: true,
      currenciesError: '',
    })

    try {
      const supportedCurrencies = await getSupportedCurrencyCodes({ signal })

      set({
        currencyOptions: supportedCurrencies,
      })
    } catch (error) {
      if (error.name !== 'AbortError') {
        set({
          currenciesError: error.message,
        })
      }
    } finally {
      if (!signal?.aborted) {
        set({
          currenciesLoading: false,
        })
      }
    }
  },

  loadRates: async (baseCode, signal) => {
    if (!baseCode || get().rateCache[baseCode]) {
      return
    }

    set({
      ratesLoading: true,
      ratesError: '',
    })

    try {
      const rates = await getLatestRates(baseCode, { signal })

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
      if (!signal?.aborted) {
        set({
          ratesLoading: false,
        })
      }
    }
  },
}))
