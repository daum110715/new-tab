import { useState, useEffect, useRef } from 'react'

const ENGINES = [
  { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'https://www.google.com/favicon.ico', letter: 'G' },
  { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'https://www.bing.com/favicon.ico', letter: 'B' },
  { name: '百度', url: 'https://www.baidu.com/s?wd=', icon: 'https://www.baidu.com/favicon.ico', letter: '百' },
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'https://duckduckgo.com/favicon.ico', letter: 'D' },
]

function EngineIcon({ engine, size = 20 }) {
  const [useFallback, setUseFallback] = useState(false)

  if (useFallback) {
    return <span>{engine.letter}</span>
  }

  return (
    <img
      src={engine.icon}
      onError={() => setUseFallback(true)}
      alt=""
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  )
}

function SearchBar() {
  const [query, setQuery] = useState('')
  const [engineIdx, setEngineIdx] = useState(() => {
    const saved = localStorage.getItem('newtab-engine')
    const idx = parseInt(saved)
    return idx >= 0 && idx < ENGINES.length ? idx : 0
  })
  const [showEngines, setShowEngines] = useState(false)
  const wrapperRef = useRef(null)
  const engine = ENGINES[engineIdx]

  useEffect(() => {
    localStorage.setItem('newtab-engine', String(engineIdx))
  }, [engineIdx])

  useEffect(() => {
    if (!showEngines) return
    function handler(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowEngines(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showEngines])

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (q) window.location.href = engine.url + encodeURIComponent(q)
  }

  return (
    <div className="search-bar" ref={wrapperRef}>
      <form onSubmit={handleSearch}>
        <button
          type="button"
          className="engine-btn"
          onClick={() => setShowEngines(!showEngines)}
        >
          <EngineIcon engine={engine} size={20} />
        </button>
        <input
          className="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索"
          autoFocus
        />
        <button type="submit" className="search-submit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>

      {showEngines && (
        <div className="engine-dropdown">
          {ENGINES.map((eng, i) => (
            <button
              key={eng.name}
              className={`engine-option ${i === engineIdx ? 'active' : ''}`}
              onClick={() => { setEngineIdx(i); setShowEngines(false) }}
            >
              <span className="engine-option-icon">
                <EngineIcon engine={eng} size={18} />
              </span>
              {eng.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar
