const STORAGE_KEY = 'currency-converter:favorites'

function isStorageAvailable() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function loadFavoritePairs() {
  if (!isStorageAvailable()) {
    return []
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)

    if (!storedValue) {
      return []
    }

    const parsedValue = JSON.parse(storedValue)

    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

export function saveFavoritePair(pair) {
  const favorites = loadFavoritePairs()
  const nextFavorite = {
    id: `${pair.from}-${pair.to}`,
    from: pair.from,
    to: pair.to,
    label: pair.label,
  }

  const deduped = [
    nextFavorite,
    ...favorites.filter(
      (favorite) =>
        !(favorite.from === nextFavorite.from && favorite.to === nextFavorite.to),
    ),
  ]

  if (isStorageAvailable()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped))
  }

  return deduped
}

export function removeFavoritePair(id) {
  const nextFavorites = loadFavoritePairs().filter((pair) => pair.id !== id)

  if (isStorageAvailable()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextFavorites))
  }

  return nextFavorites
}
