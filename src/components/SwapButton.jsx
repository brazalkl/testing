function SwapButton({ onClick }) {
  return (
    <div className="swap-wrap">
      <button
        aria-label="Swap currencies"
        className="swap-button"
        onClick={onClick}
        type="button"
      >
        ⇄
      </button>
    </div>
  )
}

export default SwapButton
