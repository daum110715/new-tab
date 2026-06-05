import { useState, useEffect } from 'react'
import { BG_PRESETS } from '../App'

// Helper to convert Hex to RGB
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 }
}

// Helper to convert RGB to Hex
function rgbToHex(r, g, b) {
  const toHex = x => {
    const val = Math.max(0, Math.min(255, Math.round(x)))
    const hex = val.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}


// Helper to convert Hex to HSV
function hexToHsv(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)
  if (!result) return { h: 0, s: 100, v: 100 }

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min

  let h
  let s = max === 0 ? 0 : d / max
  let v = max

  if (max === min) {
    h = 0
  } else {
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
    v: Math.round(v * 100)
  }
}

// Helper to convert HSV to Hex
function hsvToHex(h, s, v) {
  h /= 360
  s /= 100
  v /= 100

  let r, g, b
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break
    case 1: r = q; g = v; b = p; break
    case 2: r = p; g = v; b = t; break
    case 3: r = p; g = q; b = v; break
    case 4: r = t; g = p; b = v; break
    case 5: r = v; g = p; b = q; break
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
  const [colorFormat, setColorFormat] = useState('hex') // 'hex' | 'rgb'
  const [tempHex, setTempHex] = useState('')
  const [tempRgb, setTempRgb] = useState({ r: '', g: '', b: '' })

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

  const activeHsv = hexToHsv(activeColorValue)

  // Sync inputs with activeColorValue when it changes from board/slider/preset
  useEffect(() => {
    setTempHex(activeColorValue)
    const rgb = hexToRgb(activeColorValue)
    setTempRgb({ r: String(rgb.r), g: String(rgb.g), b: String(rgb.b) })
  }, [activeColorValue])

  function handleHueChange(h) {
    const hex = hsvToHex(h, activeHsv.s, activeHsv.v)
    onUpdate(activePicker === 'start' ? 'customGradientStart' : 'customGradientEnd', hex)
  }

  function handlePaletteSelect(color) {
    onUpdate(activePicker === 'start' ? 'customGradientStart' : 'customGradientEnd', color)
  }

  const handleHexInputChange = (e) => {
    const val = e.target.value
    setTempHex(val)
    
    let hex = val
    if (!hex.startsWith('#') && (hex.length === 3 || hex.length === 6)) {
      hex = '#' + hex
    }
    
    if (/^#[0-9A-Fa-f]{3}$/.test(hex) || /^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onUpdate(activePicker === 'start' ? 'customGradientStart' : 'customGradientEnd', hex)
    }
  }

  const handleRgbInputChange = (channel, val) => {
    const cleanVal = val.replace(/\D/g, '')
    if (cleanVal === '') {
      setTempRgb(prev => ({ ...prev, [channel]: '' }))
      return
    }
    
    let num = parseInt(cleanVal, 10)
    num = Math.max(0, Math.min(255, num))
    
    const nextRgb = {
      ...tempRgb,
      [channel]: String(num)
    }
    
    setTempRgb(nextRgb)
    
    const r = parseInt(nextRgb.r, 10)
    const g = parseInt(nextRgb.g, 10)
    const b = parseInt(nextRgb.b, 10)
    
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      const hex = rgbToHex(r, g, b)
      onUpdate(activePicker === 'start' ? 'customGradientStart' : 'customGradientEnd', hex)
    }
  }

  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window

  const handleEyeDropper = async () => {
    if (!hasEyeDropper) return
    try {
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open()
      onUpdate(activePicker === 'start' ? 'customGradientStart' : 'customGradientEnd', result.srgbHex)
    } catch (err) {
      console.log('Eyedropper closed or failed:', err)
    }
  }

  const handleSatValMouseDown = (e) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    
    const updateColor = (clientX, clientY) => {
      let x = (clientX - rect.left) / rect.width
      let y = 1 - (clientY - rect.top) / rect.height
      
      x = Math.max(0, Math.min(1, x))
      y = Math.max(0, Math.min(1, y))
      
      const hex = hsvToHex(activeHsv.h, x * 100, y * 100)
      onUpdate(activePicker === 'start' ? 'customGradientStart' : 'customGradientEnd', hex)
    }

    updateColor(e.clientX, e.clientY)

    const handleMouseMove = (moveEvent) => {
      updateColor(moveEvent.clientX, moveEvent.clientY)
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleSatValTouchStart = (e) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    
    const updateColor = (clientX, clientY) => {
      let x = (clientX - rect.left) / rect.width
      let y = 1 - (clientY - rect.top) / rect.height
      
      x = Math.max(0, Math.min(1, x))
      y = Math.max(0, Math.min(1, y))
      
      const hex = hsvToHex(activeHsv.h, x * 100, y * 100)
      onUpdate(activePicker === 'start' ? 'customGradientStart' : 'customGradientEnd', hex)
    }

    const touch = e.touches[0]
    updateColor(touch.clientX, touch.clientY)

    const handleTouchMove = (moveEvent) => {
      const moveTouch = moveEvent.touches[0]
      updateColor(moveTouch.clientX, moveTouch.clientY)
    }

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }

    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
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
          <div className="header-actions">
            <button 
              className="header-theme-toggle"
              onClick={() => onUpdate('theme', settings.theme === 'dark' ? 'light' : 'dark')}
              title={settings.theme === 'dark' ? "切换为浅色主题" : "切换为深色主题"}
              type="button"
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
            </button>
            <button className="settings-close" onClick={onClose}>
              ✕
            </button>
          </div>
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

              {/* Custom styled 2D HSV color picker popover */}
              {activePicker && (
                <div className="custom-color-popover">
                  <div className="popover-header">
                    <h4>{activePicker === 'start' ? '调整起点颜色' : '调整终点颜色'}</h4>
                    <button className="popover-close-btn" onClick={() => setActivePicker(null)} type="button">✕</button>
                  </div>

                  {/* 2D Saturation-Value Canvas */}
                  <div 
                    className="color-picker-board"
                    style={{ backgroundColor: `hsl(${activeHsv.h}, 100%, 50%)` }}
                    onMouseDown={handleSatValMouseDown}
                    onTouchStart={handleSatValTouchStart}
                  >
                    <div className="board-saturation-layer" />
                    <div className="board-value-layer" />
                    <div 
                      className="board-cursor"
                      style={{ 
                        left: `${activeHsv.s}%`, 
                        bottom: `${activeHsv.v}%` 
                      }}
                    />
                  </div>

                  {/* Controls Row */}
                  <div className="color-picker-row">
                    {hasEyeDropper && (
                      <button 
                        className="eyedropper-btn" 
                        onClick={handleEyeDropper}
                        title="吸取屏幕颜色"
                        type="button"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 4a2 2 0 0 0-2.83 0l-8.48 8.48a6 6 0 0 1-1.42 1.42l-4.24 4.24a1 1 0 0 0 1.41 1.41l4.24-4.24a6 6 0 0 1 1.42-1.42l8.48-8.48A2 2 0 0 0 21 4z" />
                          <path d="M16 8l3 3" />
                          <path d="m9 11-4 4v4h4l4-4" />
                        </svg>
                      </button>
                    )}
                    <div className="picker-preview-circle" style={{ backgroundColor: activeColorValue }} />
                    <div className="picker-sliders-col">
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={activeHsv.h}
                        onChange={(e) => handleHueChange(parseInt(e.target.value, 10))}
                        className="hue-slider rainbow-slider"
                      />
                    </div>
                  </div>

                  {/* Input Fields for Hex or RGB */}
                  <div className="color-picker-inputs">
                    {colorFormat === 'hex' ? (
                      <div className="input-group hex-group">
                        <input 
                          type="text" 
                          value={tempHex} 
                          onChange={handleHexInputChange}
                          className="hex-input-box"
                          placeholder="#c2e9fb"
                        />
                        <span className="input-label">HEX</span>
                      </div>
                    ) : (
                      <div className="rgb-inputs-group">
                        <div className="input-group rgb-group">
                          <input 
                            type="text" 
                            value={tempRgb.r} 
                            onChange={(e) => handleRgbInputChange('r', e.target.value)}
                            className="rgb-input-box"
                            placeholder="r"
                          />
                          <span className="input-label">R</span>
                        </div>
                        <div className="input-group rgb-group">
                          <input 
                            type="text" 
                            value={tempRgb.g} 
                            onChange={(e) => handleRgbInputChange('g', e.target.value)}
                            className="rgb-input-box"
                            placeholder="g"
                          />
                          <span className="input-label">G</span>
                        </div>
                        <div className="input-group rgb-group">
                          <input 
                            type="text" 
                            value={tempRgb.b} 
                            onChange={(e) => handleRgbInputChange('b', e.target.value)}
                            className="rgb-input-box"
                            placeholder="b"
                          />
                          <span className="input-label">B</span>
                        </div>
                      </div>
                    )}
                    <button 
                      className="format-switch-btn" 
                      onClick={() => setColorFormat(colorFormat === 'hex' ? 'rgb' : 'hex')}
                      title="切换颜色格式"
                      type="button"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="17 1 21 5 17 9" />
                        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                        <polyline points="7 23 3 19 7 15" />
                        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                      </svg>
                    </button>
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
            <span className="bg-bing-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bg-bing-icon-svg">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
              </svg>
            </span>
            动态流光
            <span className="bg-bing-tag">Canvas</span>
          </button>

          <button
            className={`bg-bing-btn ${settings.bgType === 'bing' ? 'active' : ''}`}
            onClick={() => onUpdate('bgType', 'bing')}
          >
            <span className="bg-bing-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bg-bing-icon-svg">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </span>
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
