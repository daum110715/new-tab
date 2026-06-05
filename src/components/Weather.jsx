import { useState, useEffect } from 'react'

const WEATHER_EMOJI = {
  113: '☀️', 116: '⛅', 119: '☁️', 122: '☁️',
  143: '🌫️', 176: '🌦️', 179: '🌨️', 182: '🌨️',
  200: '⛈️', 227: '🌨️', 230: '❄️', 248: '🌫️', 260: '🌫️',
  263: '🌦️', 266: '🌧️', 281: '🌧️', 284: '🌧️',
  293: '🌦️', 296: '🌧️', 299: '🌧️', 302: '🌧️',
  305: '🌧️', 308: '🌧️', 311: '🌧️', 314: '🌧️',
  317: '🌨️', 320: '🌨️',
  323: '🌨️', 326: '🌨️', 329: '🌨️', 332: '🌨️',
  335: '🌨️', 338: '❄️',
  350: '🌧️', 353: '🌧️', 356: '🌧️', 359: '🌧️',
  362: '🌨️', 365: '🌨️', 368: '🌨️', 371: '🌨️',
  374: '🌧️', 377: '🌧️',
  386: '⛈️', 389: '⛈️', 392: '⛈️', 395: '⛈️',
}

function getEmoji(code) {
  return WEATHER_EMOJI[Number(code)] || '🌤️'
}

function Weather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeather()
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  async function fetchWeather() {
    try {
      const res = await fetch('https://wttr.in/?format=j1&lang=zh')
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      const current = data.current_condition[0]
      const area = data.nearest_area[0]
      setWeather({
        temp: current.temp_C,
        code: current.weatherCode,
        desc: current.lang_zh?.[0]?.value || current.weatherDesc[0].value,
        city: area.areaName[0].value,
      })
    } catch {
      // weather is optional, fail silently
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="weather">
        <span className="weather-loading">...</span>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="weather">
      <span className="weather-emoji">{getEmoji(weather.code)}</span>
      <div className="weather-info">
        <span className="weather-temp">{weather.temp}°C</span>
        <span className="weather-desc">{weather.desc} · {weather.city}</span>
      </div>
    </div>
  )
}

export default Weather
