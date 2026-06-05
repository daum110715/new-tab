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
              />
            ))}
          </div>

          <button
            className={`bg-bing-btn ${settings.bgType === 'dynamic' ? 'active' : ''}`}
            onClick={() => onUpdate('bgType', 'dynamic')}
          >
            <span className="bg-bing-icon">✨</span>
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
