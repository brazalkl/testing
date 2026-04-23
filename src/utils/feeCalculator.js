export function calculateProviderResult(rawAmount, provider, exchangeRate = 1) {
  const percentageRate =
    typeof provider.percentageFee === 'number'
      ? provider.percentageFee
      : typeof provider.feePercent === 'number'
        ? provider.feePercent / 100
        : 0
  const percentageFee = rawAmount * percentageRate
  // flatFee is defined in the base currency (USD); convert to target currency
  const flatFee = (provider.flatFee ?? 0) * exchangeRate
  const deductedFee = percentageFee + flatFee
  const finalAmount = Math.max(rawAmount - deductedFee, 0)

  return {
    ...provider,
    percentageFee: percentageRate,
    flatFee,
    deductedFee,
    deductedFeeBase: exchangeRate > 0 ? deductedFee / exchangeRate : 0,
    finalAmount,
    finalAmountBase: exchangeRate > 0 ? finalAmount / exchangeRate : 0,
  }
}

export function calculateProviderResults(rawAmount, providers, exchangeRate = 1) {
  return providers.map((provider) => calculateProviderResult(rawAmount, provider, exchangeRate))
}
