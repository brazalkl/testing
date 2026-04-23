import { useEffect } from 'react'
import {
  ArrowRight,
  ChevronsLeftRight,
  Landmark,
  Plus,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import './App.css'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'


import { useDashboardViewModel } from './hooks/useDashboardViewModel'
import {
  formatCurrencyAmount,
  formatRate,
  formatTimestamp,
} from './utils/formatters'

function App() {
  const {
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
    activeTargets,
    multiConversionResults,
    availableTargets,
    resolvedNextTarget,
    activeError,
    isCurrentPairSaved,
    validationError,
    currencyLookup,
    setAmount,
    setFromCurrency,
    setToCurrency,
    setNextTarget,
    swapCurrencies,
    saveCurrentFavorite,
    loadFavoritePair,
    removeFavoritePairAction,
    handleAddTarget,
    removeTarget,
  } = useDashboardViewModel()

  useEffect(() => {
    if (activeError && activeError !== validationError) {
      toast.error(activeError)
    }
  }, [activeError, validationError])

  return (
    <div className="app-shell">
      <aside className="dashboard-sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">G</div>
          <div>
            <strong>Convertix</strong>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Button
            className="sidebar-link is-active justify-start"
            type="button"
            variant="ghost"
          >
            <Landmark size={16} />
            <span>Dashboard</span>
          </Button>
        </nav>

        <div className="sidebar-footnote">
          <p>Live feed</p>
          <span>
            {currentRateSet?.timeLastUpdate
              ? formatTimestamp(currentRateSet.timeLastUpdate)
              : 'Waiting for first quote'}
          </span>
        </div>
      </aside>

      <main className="dashboard-stage">
        <header className="page-masthead">
          <div>
            <h1>Live conversion</h1>
          </div>

        </header>

        <section className="hero-layout">
          <Card className="card-shell !gap-0 !py-0 overflow-hidden">
            <CardHeader className="conversion-shell pb-0">
              <div>
                <CardTitle>Institutional conversion</CardTitle>
                <p>Direct base-to-target quote with live mid-market pricing.</p>
              </div>
              <Badge className="live-chip rounded-full border-0 shadow-none" variant="secondary">
                <span className="live-dot" />
                {ratesLoading ? 'Refreshing' : 'Market live'}
              </Badge>
            </CardHeader>

            <CardContent className="conversion-shell pt-6">
              <div className="conversion-grid">
                <section className="quote-box quote-box-primary">
                  <div className="quote-box-head">
                    <span>From</span>
                    <span>{currenciesLoading ? 'Loading codes' : 'Base currency'}</span>
                  </div>

                  <Input
                    autoComplete="off"
                    className="amount-field"
                    inputMode="decimal"
                    min="0"
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    type="text"
                    value={amount}
                  />

                  <div className="quote-box-foot">
                    <Select onValueChange={setFromCurrency} value={fromCurrency}>
                      <SelectTrigger className="currency-pill" size="sm">
                        <SelectValue placeholder={fromCurrency} />
                      </SelectTrigger>
                      <SelectContent
                        align="start"
                        className="dashboard-select-content"
                        position="popper"
                        sideOffset={8}
                      >
                        {currencyOptions.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span>{currencyLookup.get(fromCurrency) ?? fromCurrency}</span>
                  </div>
                </section>

                <Button
                  aria-label="Swap currencies"
                  className="swap-orb"
                  onClick={swapCurrencies}
                  type="button"
                  variant="default"
                >
                  <ChevronsLeftRight size={18} />
                </Button>

                <section className="quote-box">
                  <div className="quote-box-head">
                    <span>To</span>
                    <span>
                      {primaryConversion ? 'Estimated live Exchange' : 'Waiting for quote'}
                    </span>
                  </div>

                  <div
                    className="amount-preview"
                    title={
                      primaryConversion
                        ? formatCurrencyAmount(primaryConversion.rawAmount, toCurrency)
                        : 'Live rate unavailable'
                    }
                  >
                    {primaryConversion
                      ? formatCurrencyAmount(primaryConversion.rawAmount, toCurrency)
                      : '--'}
                  </div>

                  <div className="quote-box-foot">
                    <Select onValueChange={setToCurrency} value={toCurrency}>
                      <SelectTrigger className="currency-pill" size="sm">
                        <SelectValue placeholder={toCurrency} />
                      </SelectTrigger>
                      <SelectContent
                        align="start"
                        className="dashboard-select-content"
                        position="popper"
                        sideOffset={8}
                      >
                        {currencyOptions.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span>{currencyLookup.get(toCurrency) ?? toCurrency}</span>
                  </div>
                </section>
              </div>

              {validationError === 'Enter an amount.' ? (
                <div className="inline-validation-card">
                  Input is empty
                </div>
              ) : null}

              <div className="conversion-footer">
                <div className="rate-tile">
                  {primaryConversion
                    ? formatRate(fromCurrency, toCurrency, primaryConversion.exchangeRate)
                    : 'Live rate unavailable'}
                </div>

                <div className="quote-meta">
                  <strong>Mid-market rate</strong>
                  <span>
                    {currentRateSet?.timeLastUpdate
                      ? `Updated ${formatTimestamp(currentRateSet.timeLastUpdate)}`
                      : 'Waiting for first update'}
                  </span>
                </div>

                <Button
                  className="hero-action"
                  disabled={Boolean(validationError) || isCurrentPairSaved}
                  onClick={saveCurrentFavorite}
                  type="button"
                  variant="default"
                >
                  <span>
                    {isCurrentPairSaved ? 'Favorite saved' : 'Save favorite pair'}
                  </span>
                  <ArrowRight size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="analytics-grid">
          <Card className="card-shell !gap-0 !py-0 overflow-hidden">
            <CardHeader className="multi-shell pb-0">
              <div>
                <CardTitle>Multi-conversion view</CardTitle>
                <p>Convert one source amount into several targets at once.</p>
              </div>
            </CardHeader>

            <CardContent className="multi-shell pt-6">
              <div className="multi-toolbar">
                <Select
                  disabled={!availableTargets.length}
                  onValueChange={setNextTarget}
                  value={resolvedNextTarget}
                >
                  <SelectTrigger className="inline-select w-full" size="sm">
                    <SelectValue placeholder="No targets available" />
                  </SelectTrigger>
                  <SelectContent
                    align="start"
                    className="dashboard-select-content"
                    position="popper"
                    sideOffset={8}
                  >
                    {availableTargets.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} · {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="ghost-action"
                  disabled={!resolvedNextTarget}
                  onClick={handleAddTarget}
                  type="button"
                  variant="secondary"
                >
                  <Plus size={15} />
                  Add target
                </Button>
              </div>

              {activeTargets.length ? (
                <div className="chip-row">
                  {activeTargets.map((code) => (
                    <Button
                      className="target-chip"
                      key={code}
                      onClick={() => removeTarget(code)}
                      type="button"
                      variant="ghost"
                    >
                      {code}
                      <span>×</span>
                    </Button>
                  ))}
                </div>
              ) : null}

              <ScrollArea className="dashboard-scroll-area multi-scroll-area">
                <div className="multi-list">
                  {multiConversionResults.length ? (
                    multiConversionResults.map((result) => (
                      <div className="multi-list-row" key={result.code}>
                        <div>
                          <strong>
                            {formatCurrencyAmount(amountValue, fromCurrency)} to {result.code}
                          </strong>
                          <span>{result.name}</span>
                        </div>
                        <strong>{formatCurrencyAmount(result.amount, result.code)}</strong>
                      </div>
                    ))
                  ) : (
                    <div className="empty-panel">
                      Add target currencies to build a comparison list.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="card-shell !gap-0 !py-0 overflow-hidden">
            <CardHeader className="comparison-shell pb-0">
              <div>
                <CardTitle>Fee comparison</CardTitle>
                <p>
                  {bestProvider
                    ? `${bestProvider.name} currently delivers the highest final amount.`
                    : 'Provider results appear after a valid quote is available.'}
                </p>
              </div>
            </CardHeader>

            <CardContent className="comparison-shell pt-6">
              <ScrollArea className="dashboard-scroll-area comparison-scroll-area">
                <div className="comparison-list">
                  {providerRanking.length ? (
                    providerRanking.map((provider, index) => (
                      <article
                        className={`provider-row${index === 0 ? ' is-best' : ''}`}
                        key={provider.name}
                      >
                        <div className="provider-row-main">
                          <div className="provider-badge">{provider.name.slice(0, 1)}</div>
                          <div>
                            <strong>{provider.name}</strong>
                            <span>
                              Total fee:{' '}
                              {formatCurrencyAmount(provider.deductedFeeBase, fromCurrency)}
                            </span>
                          </div>
                        </div>

                        <div className="provider-row-value">
                          {index === 0 ? (
                            <Badge
                              className="best-rate-tag rounded-full border-0"
                              variant="secondary"
                            >
                              Best rate
                            </Badge>
                          ) : null}
                          <strong>
                            {formatCurrencyAmount(provider.finalAmountBase, fromCurrency)}
                          </strong>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="empty-panel">
                      Enter a valid amount and a supported pair to compare provider fees.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>


        <section className="support-grid">
          <Card className="card-shell !gap-0 !py-0 overflow-hidden">
            <CardHeader className="favorite-shell pb-0">
              <div>
                <CardTitle>Favorite pairs</CardTitle>
                <p>Load or remove saved routing pairs from local storage.</p>
              </div>
            </CardHeader>

            <CardContent className="favorite-shell pt-6">
              {favoritePairs.length ? (
                <div className="favorite-grid">
                  {favoritePairs.map((pair) => (
                    <div className="favorite-card" key={pair.id}>
                      <Button
                        className="justify-start bg-transparent px-0 py-0 text-left text-inherit shadow-none hover:bg-transparent"
                        onClick={() => loadFavoritePair(pair)}
                        type="button"
                        variant="ghost"
                      >
                        <div>
                          <span>
                            {pair.from}/{pair.to}
                          </span>
                          <strong>
                            {pair.from === fromCurrency && pair.to === toCurrency
                              ? primaryConversion
                                ? formatCurrencyAmount(primaryConversion.rawAmount, toCurrency)
                                : 'Live'
                              : 'Load pair'}
                          </strong>
                        </div>
                      </Button>

                      <Button
                        aria-label={`Remove ${pair.from}/${pair.to}`}
                        className="favorite-remove"
                        onClick={() => removeFavoritePairAction(pair.id)}
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-panel">
                  Save the current pair to build a quick-access route list.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-shell !gap-0 !py-0 overflow-hidden">
            <CardHeader className="summary-shell pb-0">
              <div>
                <CardTitle>Conversion summary</CardTitle>
                <p>Primary quote details for the current route.</p>
              </div>
            </CardHeader>

            <CardContent className="summary-shell pt-6">
              {primaryConversion ? (
                <dl className="summary-list">
                  <div>
                    <dt>Route</dt>
                    <dd>
                      {fromCurrency}/{toCurrency}
                    </dd>
                  </div>
                  <div>
                    <dt>Exchange rate</dt>
                    <dd>
                      {formatRate(
                        fromCurrency,
                        toCurrency,
                        primaryConversion.exchangeRate,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Raw converted amount</dt>
                    <dd>
                      {formatCurrencyAmount(primaryConversion.rawAmount, toCurrency)}
                    </dd>
                  </div>
                  <div>
                    <dt>Next update</dt>
                    <dd>{formatTimestamp(primaryConversion.nextUpdate)}</dd>
                  </div>
                </dl>
              ) : (
                <div className="empty-panel">
                  A valid amount and two different currencies are required before the
                  summary can be shown.
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

export default App
