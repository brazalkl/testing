import CurrencySelect from './CurrencySelect'
import SwapButton from './SwapButton'

function ConverterForm({
  amount,
  canSaveFavorite,
  currencies,
  currenciesLoading,
  fromCurrency,
  isCurrentPairSaved,
  onAmountChange,
  onFromCurrencyChange,
  onSaveFavorite,
  onSwap,
  onToCurrencyChange,
  toCurrency,
}) {
  return (
    <div className="form-grid">
      <div className="section-heading">
        <div>
          <h2>Primary conversion</h2>
          <p>Enter an amount, choose a pair, then compare provider outcomes.</p>
        </div>
      </div>

      <div className="input-grid">
        <div className="field">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            inputMode="decimal"
            min="0"
            onChange={(event) => onAmountChange(event.target.value)}
            placeholder="1000"
            step="0.01"
            type="number"
            value={amount}
          />
          <span className="helper-text">Positive numbers only.</span>
        </div>

        <CurrencySelect
          helper={currenciesLoading ? 'Loading supported codes...' : 'Source'}
          id="fromCurrency"
          label="From"
          onChange={onFromCurrencyChange}
          options={currencies}
          value={fromCurrency}
        />

        <SwapButton onClick={onSwap} />

        <CurrencySelect
          helper="Target"
          id="toCurrency"
          label="To"
          onChange={onToCurrencyChange}
          options={currencies}
          value={toCurrency}
        />
      </div>

      <div className="action-row">
        <button
          className="action-button"
          disabled={!canSaveFavorite}
          onClick={onSaveFavorite}
          type="button"
        >
          {isCurrentPairSaved ? 'Favorite saved' : 'Save favorite pair'}
        </button>
      </div>
    </div>
  )
}

export default ConverterForm
