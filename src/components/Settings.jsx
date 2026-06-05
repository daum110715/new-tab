import { useState } from 'react'
import { BG_PRESETS } from '../App'

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
                  <input
                    type="color"
                    value={settings.customGradientStart || '#c2e9fb'}
                    onChange={(e) => onUpdate('customGradientStart', e.target.value)}
                  />
                  <span className="hex-text">{settings.customGradientStart || '#c2e9fb'}</span>
                </div>
              </div>
              <div className="picker-row">
                <span>终点</span>
                <div className="picker-control">
                  <input
                    type="color"
                    value={settings.customGradientEnd || '#a1c4fd'}
                    onChange={(e) => onUpdate('customGradientEnd', e.target.value)}
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
