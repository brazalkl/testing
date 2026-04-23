function FavoritePairs({ favorites, onLoadFavorite, onRemoveFavorite }) {
  return (
    <section className="favorites-block">
      <h2>Favorite pairs</h2>
      <p>Store multiple routes locally and reload them with one click.</p>

      {favorites.length ? (
        <div className="favorite-list">
          {favorites.map((pair) => (
            <div className="favorite-item" key={pair.id}>
              <button
                className="pair-button"
                onClick={() => onLoadFavorite(pair)}
                type="button"
              >
                <span className="pair-title">
                  {pair.from} to {pair.to}
                </span>
                <span className="pair-copy">Tap to load this pair into the form.</span>
              </button>

              <button
                aria-label={`Remove ${pair.from} to ${pair.to}`}
                className="remove-button"
                onClick={() => onRemoveFavorite(pair.id)}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          Save a pair from the converter to build your personal shortlist.
        </div>
      )}
    </section>
  )
}

export default FavoritePairs
