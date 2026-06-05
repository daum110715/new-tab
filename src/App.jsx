import { useState, useEffect } from 'react'
import Clock from './components/Clock'
import SearchBar from './components/SearchBar'
import Bookmarks from './components/Bookmarks'
import Settings from './components/Settings'
import DynamicBackground from './components/DynamicBackground'
import './App.css'

export const BG_PRESETS = [
  { id: 'azure', name: '天青', css: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)' },
  { id: 'mint', name: '薄荷', css: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)' },
  { id: 'dusk', name: '晚霞', css: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)' },
  { id: 'peach', name: '蜜桃', css: 'linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%)' },
  { id: 'starry', name: '星空', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
]

const DEFAULT_SETTINGS = {
  bgType: 'dynamic',
  bgPreset: 'azure',
  customBgUrl: '',
  clockFormat: '24h',
  showDate: true,
  showSeconds: false,
}

function App() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('newtab-settings')
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })
  const [showSettings, setShowSettings] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    localStorage.setItem('newtab-settings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    setImgLoaded(false)
  }, [settings.bgType, settings.customBgUrl])

  function updateSetting(key, value) {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  const preset = BG_PRESETS.find((p) => p.id === settings.bgPreset) || BG_PRESETS[0]
  const needsImage = settings.bgType === 'bing' || settings.bgType === 'custom'
  const imageUrl =
    settings.bgType === 'bing'
      ? 'https://bing.img.run/1920x1080.php'
      : settings.customBgUrl

  return (
    <div className="app" style={{ background: settings.bgType === 'dynamic' ? '#080811' : (needsImage ? '#1a1a2e' : preset.css) }}>
      {settings.bgType === 'dynamic' && <DynamicBackground />}
      {needsImage && imageUrl && (
        <>
          <img
            className={`wallpaper ${imgLoaded ? 'loaded' : ''}`}
            src={imageUrl}
            onLoad={() => setImgLoaded(true)}
            alt=""
            draggable={false}
          />
          <div className="wallpaper-overlay" />
        </>
      )}

      <main className="content">
        <Clock settings={settings} />
        <SearchBar />
        <Bookmarks />
      </main>

      <button className="settings-trigger" onClick={() => setShowSettings(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {showSettings && (
        <Settings
          settings={settings}
          onUpdate={updateSetting}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

export default App
