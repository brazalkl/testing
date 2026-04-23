import { useMemo, useState } from 'react'
import CurrencySelect from './CurrencySelect'
import { formatCurrencyAmount, formatRate } from '../utils/formatters'

function MultiConversionList({
  amount,
  currencies,
  fromCurrency,
  isLoading,
  onAddTarget,
  onRemoveTarget,
  results,
  selectedTargets,
}) {
  const availableCurrencies = useMemo(
    () =>
      currencies.filter(
        (currency) =>
          currency.code !== fromCurrency && !selectedTargets.includes(currency.code),
      ),
    [currencies, fromCurrency, selectedTargets],
  )

  const [nextTarget, setNextTarget] = useState(availableCurrencies[0]?.code ?? '')

  const resolvedNextTarget = availableCurrencies.some(
    (currency) => currency.code === nextTarget,
  )
    ? nextTarget
    : availableCurrencies[0]?.code ?? ''

  return (
    <div>
      <div className="section-heading">
        <div>
          <h2>Multiple target conversion</h2>
          <p>Convert one base amount into several targets at the same live rate snapshot.</p>
        </div>
        <p className="muted-text">{isLoading ? 'Refreshing rates...' : 'Local results update instantly.'}</p>
      </div>

      <div className="multi-toolbar">
        <CurrencySelect
          helper="Add another target currency."
          id="multiTarget"
          label="Target list"
          onChange={setNextTarget}
          options={availableCurrencies}
          value={resolvedNextTarget}
        />
        <button
          className="action-button"
          disabled={!resolvedNextTarget}
          onClick={() => onAddTarget(resolvedNextTarget)}
          type="button"
        >
          Add target
        </button>
      </div>

      {selectedTargets.length ? (
        <div className="tag-list">
          {selectedTargets.map((code) => (
            <span className="target-tag" key={code}>
              {code}
              <button
                aria-label={`Remove ${code}`}
                className="tag-remove"
                onClick={() => onRemoveTarget(code)}
                type="button"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {results.length ? (
        <div className="multi-grid">
          {results.map((result) => (
            <article className="multi-card" key={result.code}>
              <header>
                <div>
                  <h3>{result.code}</h3>
                  <p className="muted-text">{result.name}</p>
                </div>
              </header>
              <dl>
                <div>
                  <dt>Converted amount</dt>
                  <dd className="multi-total">
                    {formatCurrencyAmount(result.amount, result.code)}
                  </dd>
                </div>
                <div>
                  <dt>Live rate</dt>
                  <dd>{formatRate(fromCurrency, result.code, result.rate)}</dd>
                </div>
                <div>
                  <dt>Source amount</dt>
                  <dd>{amount.toLocaleString('en-US')}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          Build a target list to compare several live payouts at once.
        </div>
      )}
    </div>
  )
}

export default MultiConversionList
