import {
  formatCurrencyAmount,
  formatRate,
  formatTimestamp,
} from '../utils/formatters'

function ResultCard({ conversion, isLoading, rateError }) {
  return (
    <section className="result-card">
      <div className="section-heading">
        <div>
          <h2>Conversion result</h2>
          <p>
            {isLoading
              ? 'Fetching the latest exchange rate...'
              : 'Primary quote based on the selected pair.'}
          </p>
        </div>
      </div>

      {conversion ? (
        <div className="result-main">
          <div className="result-value">
            {formatCurrencyAmount(conversion.rawAmount, conversion.toCurrency)}
          </div>

          <div className="rate-line">
            <span>
              {formatCurrencyAmount(conversion.amount, conversion.fromCurrency)} converts from{' '}
              {conversion.fromName}
            </span>
            <span>{formatRate(conversion.fromCurrency, conversion.toCurrency, conversion.exchangeRate)}</span>
          </div>

          <dl className="meta-grid">
            <div>
              <dt>Last updated</dt>
              <dd>{formatTimestamp(conversion.lastUpdated)}</dd>
            </div>
            <div>
              <dt>Next update</dt>
              <dd>{formatTimestamp(conversion.nextUpdate)}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="empty-state">
          {rateError
            ? 'Live data is unavailable right now. Check the API key and try again.'
            : 'A valid amount and two different currencies are required before the result can be shown.'}
        </div>
      )}
    </section>
  )
}

export default ResultCard
