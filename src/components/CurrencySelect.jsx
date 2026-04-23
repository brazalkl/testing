function CurrencySelect({ helper, id, label, onChange, options, value }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.code} · {option.name}
          </option>
        ))}
      </select>
      <span className="helper-text">{helper}</span>
    </div>
  )
}

export default CurrencySelect
