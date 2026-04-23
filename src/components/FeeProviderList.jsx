import { formatCurrencyAmount, formatPercent } from '../utils/formatters'

function FeeProviderList({ providers, rawAmount, targetCurrency }) {
  return (
    <div>
      <div className="section-heading">
        <div>
          <h2>Provider fee simulation</h2>
          <p>
            Compare the live raw conversion against each provider&apos;s fee model.
          </p>
        </div>
      </div>

      {providers.length && rawAmount ? (
        <div className="provider-grid">
          {providers.map((provider) => (
            <article className="provider-card" key={provider.name}>
              <h3>{provider.name}</h3>
              <dl>
                <div>
                  <dt>Raw converted amount</dt>
                  <dd>{formatCurrencyAmount(rawAmount, targetCurrency)}</dd>
                </div>
                <div>
                  <dt>Fee model</dt>
                  <dd>
                    {formatPercent(provider.percentageFee)}
                    {provider.flatFee ? ` + ${formatCurrencyAmount(provider.flatFee, targetCurrency)}` : ''}
                  </dd>
                </div>
                <div>
                  <dt>Deducted fee</dt>
                  <dd>{formatCurrencyAmount(provider.deductedFee, targetCurrency)}</dd>
                </div>
                <div>
                  <dt>Final amount</dt>
                  <dd className="provider-final">
                    {formatCurrencyAmount(provider.finalAmount, targetCurrency)}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          Enter a valid conversion pair to see fee-adjusted payout amounts.
        </div>
      )}
    </div>
  )
}

export default FeeProviderList
