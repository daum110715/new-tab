import { useState } from 'react'
import { BG_PRESETS } from '../App'

// Helper to convert Hex to HSL
function hexToHsl(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)
  if (!result) return { h: 0, s: 100, l: 50 }

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

// Helper to convert HSL to Hex
function hslToHex(h, s, l) {
  h /= 360
  s /= 100
  l /= 100
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function Toggle({ checked, onChange }) {
  return (
    <button
      className={`toggle ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span className="toggle-knob" />
    </button>
  )
}

function Settings({ settings, onUpdate, onClose }) {
  const [customUrl, setCustomUrl] = useState(settings.customBgUrl || '')
  const [activePicker, setActivePicker] = useState(null) // 'start' | 'end' | null

  const RECOMMENDED_COLORS = [
    '#c2e9fb', // Ice Blue
    '#a1c4fd', // Soft Blue
    '#e0f2f1', // Mint Pale
    '#b2dfdb', // Teal Light
    '#ffecd2', // Soft Apricot
    '#fcb69f', // Peach Pink
    '#e0c3fc', // Lilac Purple
    '#fbc2eb', // Sakura Pink
  ]

  const activeColorValue = activePicker === 'start'
    ? (settings.customGradientStart || '#c2e9fb')
    : (settings.customGradientEnd || '#a1c4fd')

  const activeHsl = hexToHsl(activeColorValue)

  function handleHslChange(key, val) {
    const newHsl = { ...activeHsl, [key]: val }
    const hex = hslToHex(newHsl.h, newHsl.s, newHsl.l)
    onUpdate(activePicker === 'start' ? 'customGradientStart' : 'customGradientEnd', hex)
  }

  function handlePaletteSelect(color) {
    onUpdate(activePicker === 'start' ? 'customGradientStart' : 'customGradientEnd', color)
  }

  function applyCustomBg() {
    const url = customUrl.trim()
    if (url) {
      onUpdate('customBgUrl', url)
      onUpdate('bgType', 'custom')
    }
  }

  function selectPreset(id) {
    onUpdate('bgPreset', id)
    onUpdate('bgType', 'preset')
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>设置</h2>
          <button className="settings-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-section">
          <h3>背景</h3>
          <div className="bg-presets">
            {BG_PRESETS.map((p) => (
              <button
                key={p.id}
                className={`bg-preset ${settings.bgType === 'preset' && settings.bgPreset === p.id ? 'active' : ''}`}
                style={{ background: p.css }}
                onClick={() => selectPreset(p.id)}
                title={p.name}
                type="button"
              >
                {settings.bgType === 'preset' && settings.bgPreset === p.id && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="preset-check">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}

            <button
              className={`bg-preset ${settings.bgType === 'customGradient' ? 'active' : ''}`}
              style={{
                background: `linear-gradient(${settings.customGradientAngle || 135}deg, ${settings.customGradientStart || '#c2e9fb'}, ${settings.customGradientEnd || '#a1c4fd'})`
              }}
              onClick={() => onUpdate('bgType', 'customGradient')}
              title="自定义渐变"
              type="button"
            >
              {settings.bgType === 'customGradient' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="preset-check">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="preset-edit-icon">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              )}
            </button>
          </div>

          {settings.bgType === 'customGradient' && (
            <div className="custom-gradient-picker">
              <div className="picker-row">
                <span>起点</span>
                <div className="picker-control">
                  <button
                    className="custom-color-swatch"
                    style={{ backgroundColor: settings.customGradientStart || '#c2e9fb' }}
                    onClick={() => setActivePicker(activePicker === 'start' ? null : 'start')}
                    type="button"
                  />
                  <span className="hex-text">{settings.customGradientStart || '#c2e9fb'}</span>
                </div>
              </div>
              <div className="picker-row">
                <span>终点</span>
                <div className="picker-control">
                  <button
                    className="custom-color-swatch"
                    style={{ backgroundColor: settings.customGradientEnd || '#a1c4fd' }}
                    onClick={() => setActivePicker(activePicker === 'end' ? null : 'end')}
                    type="button"
                  />
                  <span className="hex-text">{settings.customGradientEnd || '#a1c4fd'}</span>
                </div>
              </div>
              <div className="picker-row">
                <span>角度</span>
                <div className="picker-control range-control">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={settings.customGradientAngle || 135}
                    onChange={(e) => onUpdate('customGradientAngle', e.target.value)}
                  />
                  <span className="angle-text">{settings.customGradientAngle || 135}°</span>
                </div>
              </div>

              {/* Custom styled HSL picker popover */}
              {activePicker && (
                <div className="custom-color-popover">
                  <div className="popover-header">
                    <h4>{activePicker === 'start' ? '调整起点颜色' : '调整终点颜色'}</h4>
                    <button className="popover-close-btn" onClick={() => setActivePicker(null)} type="button">✕</button>
                  </div>

                  <div className="hsl-sliders">
                    <div className="slider-group">
                      <label>
                        <span>色相</span>
                        <span>{activeHsl.h}°</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={activeHsl.h}
                        onChange={(e) => handleHslChange('h', parseInt(e.target.value))}
                        className="hue-slider"
                      />
                    </div>

                    <div className="slider-group">
                      <label>
                        <span>饱和度</span>
                        <span>{activeHsl.s}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={activeHsl.s}
                        onChange={(e) => handleHslChange('s', parseInt(e.target.value))}
                        style={{
                          background: `linear-gradient(to right, hsl(${activeHsl.h}, 0%, ${activeHsl.l}%), hsl(${activeHsl.h}, 100%, ${activeHsl.l}%))`
                        }}
                      />
                    </div>

                    <div className="slider-group">
                      <label>
                        <span>亮度</span>
                        <span>{activeHsl.l}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={activeHsl.l}
                        onChange={(e) => handleHslChange('l', parseInt(e.target.value))}
                        style={{
                          background: `linear-gradient(to right, #000, hsl(${activeHsl.h}, ${activeHsl.s}%, 50%), #fff)`
                        }}
                      />
                    </div>
                  </div>

                  <div className="quick-palette-section">
                    <h5>推荐清新色</h5>
                    <div className="quick-palette-grid">
                      {RECOMMENDED_COLORS.map((color) => (
                        <button
                          key={color}
                          className="palette-color-btn"
                          style={{ backgroundColor: color }}
                          onClick={() => handlePaletteSelect(color)}
                          title={color}
                          type="button"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            className={`bg-bing-btn ${settings.bgType === 'dynamic' ? 'active' : ''}`}
            onClick={() => onUpdate('bgType', 'dynamic')}
            type="button"
          >
            <span 
              className="bg-bing-icon theme-toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                onUpdate('theme', settings.theme === 'dark' ? 'light' : 'dark');
              }}
              title={settings.theme === 'dark' ? "切换为浅色主题" : "切换为深色主题"}
            >
              {settings.theme === 'dark' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </span>
            动态流光
            <span className="bg-bing-tag">Canvas</span>
          </button>

          <button
            className={`bg-bing-btn ${settings.bgType === 'bing' ? 'active' : ''}`}
            onClick={() => onUpdate('bgType', 'bing')}
          >
            <span className="bg-bing-icon">🌄</span>
            每日一图
            <span className="bg-bing-tag">Bing</span>
          </button>

          <div className="custom-bg-row">
            <input
              className="settings-input"
              type="text"
              placeholder="自定义图片 URL"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyCustomBg()}
            />
            <button className="settings-apply-btn" onClick={applyCustomBg}>
              应用
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>时钟</h3>
          <div className="settings-row">
            <span>24 小时制</span>
            <Toggle
              checked={settings.clockFormat === '24h'}
              onChange={(v) => onUpdate('clockFormat', v ? '24h' : '12h')}
            />
          </div>
          <div className="settings-row">
            <span>显示秒钟</span>
            <Toggle
              checked={settings.showSeconds}
              onChange={(v) => onUpdate('showSeconds', v)}
            />
          </div>
          <div className="settings-row">
            <span>显示日期</span>
            <Toggle
              checked={settings.showDate}
              onChange={(v) => onUpdate('showDate', v)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
