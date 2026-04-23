import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  DEFAULT_MULTI_TARGETS,
  PROVIDERS,
  SNAPSHOT_CHANGES,
  SPARK_PATTERNS,
} from '../data/dashboardConfig'
import { useCurrencyDashboardStore } from '../store/useCurrencyDashboardStore'
import { calculateProviderResults } from '../utils/feeCalculator'

function formatSignedChange(value) {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function useDashboardViewModel() {
  const state = useCurrencyDashboardStore(
    useShallow((currentState) => ({
      amount: currentState.amount,
      fromCurrency: currentState.fromCurrency,
      toCurrency: currentState.toCurrency,
      favoritePairs: currentState.favoritePairs,
      selectedTargets: currentState.selectedTargets,
      currencyOptions: currentState.currencyOptions,
      currenciesLoading: currentState.currenciesLoading,
      currenciesError: currentState.currenciesError,
      rateCache: currentState.rateCache,
      ratesLoading: currentState.ratesLoading,
      ratesError: currentState.ratesError,
      nextTarget: currentState.nextTarget,
      setAmount: currentState.setAmount,
      setFromCurrency: currentState.setFromCurrency,
      setToCurrency: currentState.setToCurrency,
      setNextTarget: currentState.setNextTarget,
      swapCurrencies: currentState.swapCurrencies,
      saveCurrentFavorite: currentState.saveCurrentFavorite,
      loadFavoritePair: currentState.loadFavoritePair,
      removeFavoritePairAction: currentState.removeFavoritePairAction,
      addTarget: currentState.addTarget,
      removeTarget: currentState.removeTarget,
      loadCurrencies: currentState.loadCurrencies,
      loadRates: currentState.loadRates,
    })),
  )

  const {
    amount,
    fromCurrency,
    toCurrency,
    favoritePairs,
    selectedTargets,
    currencyOptions,
    currenciesLoading,
    currenciesError,
    rateCache,
    ratesLoading,
    ratesError,
    nextTarget,
    setAmount,
    setFromCurrency,
    setToCurrency,
    setNextTarget,
    swapCurrencies,
    saveCurrentFavorite,
    loadFavoritePair,
    removeFavoritePairAction,
    addTarget,
    removeTarget,
    loadCurrencies,
    loadRates,
  } = state

  useEffect(() => {
    const controller = new AbortController()

    loadCurrencies(controller.signal)

    return () => controller.abort()
  }, [loadCurrencies])

  useEffect(() => {
    const controller = new AbortController()

    loadRates(fromCurrency, controller.signal)

    return () => controller.abort()
  }, [fromCurrency, loadRates])

  const amountValue = Number(amount)

  const currencyLookup = useMemo(
    () => new Map(currencyOptions.map((currency) => [currency.code, currency.name])),
    [currencyOptions],
  )

  const supportedCodes = useMemo(
    () => new Set(currencyOptions.map((currency) => currency.code)),
    [currencyOptions],
  )

  const currentRateSet = rateCache[fromCurrency]

  const validationError = useMemo(() => {
    if (!amount.trim()) {
      return 'Enter an amount.'
    }

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return 'Enter a valid positive amount.'
    }

    if (!supportedCodes.has(fromCurrency) || !supportedCodes.has(toCurrency)) {
      return 'Choose currencies supported by the current exchange rate feed.'
    }

    if (fromCurrency === toCurrency) {
      return 'Select two different currencies to convert.'
    }

    return ''
  }, [amount, amountValue, fromCurrency, supportedCodes, toCurrency])

  const exchangeRate = currentRateSet?.conversionRates?.[toCurrency]

  const primaryConversion = useMemo(() => {
    if (validationError || !exchangeRate) {
      return null
    }

    return {
      amount: amountValue,
      rawAmount: amountValue * exchangeRate,
      exchangeRate,
      fromCurrency,
      toCurrency,
      fromName: currencyLookup.get(fromCurrency) ?? fromCurrency,
      toName: currencyLookup.get(toCurrency) ?? toCurrency,
      lastUpdated: currentRateSet.timeLastUpdate,
      nextUpdate: currentRateSet.timeNextUpdate,
    }
  }, [
    amountValue,
    currentRateSet,
    currencyLookup,
    exchangeRate,
    fromCurrency,
    toCurrency,
    validationError,
  ])

  const providerResults = useMemo(() => {
    if (!primaryConversion) {
      return []
    }

    return calculateProviderResults(primaryConversion.rawAmount, PROVIDERS, primaryConversion.exchangeRate)
  }, [primaryConversion])

  const activeTargets = useMemo(
    () =>
      selectedTargets.filter(
        (code, index) =>
          code !== fromCurrency && selectedTargets.indexOf(code) === index,
      ),
    [fromCurrency, selectedTargets],
  )

  const multiConversionResults = useMemo(() => {
    if (
      !currentRateSet?.conversionRates ||
      validationError ||
      !Number.isFinite(amountValue) ||
      amountValue <= 0
    ) {
      return []
    }

    return activeTargets
      .map((code) => {
        const rate = currentRateSet.conversionRates[code]

        if (!rate) {
          return null
        }

        return {
          code,
          name: currencyLookup.get(code) ?? code,
          rate,
          amount: amountValue * rate,
        }
      })
      .filter(Boolean)
  }, [amountValue, currencyLookup, currentRateSet, activeTargets, validationError])

  const activeError =
    validationError || (!currentRateSet ? ratesError : '') || currenciesError

  const isCurrentPairSaved = favoritePairs.some(
    (pair) => pair.from === fromCurrency && pair.to === toCurrency,
  )

  const providerRanking = useMemo(
    () => [...providerResults].sort((left, right) => right.finalAmount - left.finalAmount),
    [providerResults],
  )

  const bestProvider = providerRanking[0]

  const snapshotCards = useMemo(
    () =>
      multiConversionResults.slice(0, 3).map((result, index) => {
        const change = SNAPSHOT_CHANGES[index] ?? 0.18

        return {
          ...result,
          change,
          changeLabel: formatSignedChange(change),
          bars: SPARK_PATTERNS[index] ?? SPARK_PATTERNS[0],
        }
      }),
    [multiConversionResults],
  )

  const availableTargets = useMemo(
    () =>
      currencyOptions.filter(
        (currency) =>
          currency.code !== fromCurrency && !activeTargets.includes(currency.code),
      ),
    [activeTargets, currencyOptions, fromCurrency],
  )

  const resolvedNextTarget = availableTargets.some(
    (currency) => currency.code === nextTarget,
  )
    ? nextTarget
    : availableTargets[0]?.code ?? ''

  const recentActivity = useMemo(
    () => [
      {
        id: '#TX-9482103',
        pair: `${fromCurrency}/${toCurrency}`,
        amount: Math.max(amountValue || 0, 150000),
        currency: fromCurrency,
        status: 'Settled',
        time: currentRateSet?.timeLastUpdate ?? new Date().toISOString(),
      },
      {
        id: '#TX-9482098',
        pair: `${fromCurrency}/${activeTargets[0] ?? DEFAULT_MULTI_TARGETS[1]}`,
        amount: Math.max(amountValue || 0, 150000) * 8,
        currency: fromCurrency,
        status: 'Pending',
        time: currentRateSet?.timeNextUpdate ?? new Date().toISOString(),
      },
      {
        id: '#TX-9482087',
        pair: `${favoritePairs[0]?.from ?? 'GBP'}/${favoritePairs[0]?.to ?? 'USD'}`,
        amount: Math.max(amountValue || 0, 85000) * 0.57,
        currency: favoritePairs[0]?.from ?? fromCurrency,
        status: 'Settled',
        time: currentRateSet?.timeLastUpdate ?? new Date().toISOString(),
      },
    ],
    [activeTargets, amountValue, currentRateSet, favoritePairs, fromCurrency, toCurrency],
  )

  return {
    amount,
    amountValue,
    fromCurrency,
    toCurrency,
    favoritePairs,
    currencyOptions,
    currenciesLoading,
    ratesLoading,
    currentRateSet,
    primaryConversion,
    providerRanking,
    bestProvider,
    snapshotCards,
    activeTargets,
    multiConversionResults,
    availableTargets,
    resolvedNextTarget,
    recentActivity,
    activeError,
    isCurrentPairSaved,
    validationError,
    providerCount: PROVIDERS.length,
    currencyLookup,
    setAmount,
    setFromCurrency,
    setToCurrency,
    setNextTarget,
    swapCurrencies,
    saveCurrentFavorite,
    loadFavoritePair,
    removeFavoritePairAction,
    handleAddTarget: () => addTarget(resolvedNextTarget, fromCurrency),
    removeTarget,
  }
}
