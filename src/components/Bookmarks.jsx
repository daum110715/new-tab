import { useState, useEffect } from 'react'

const DEFAULT_BOOKMARKS = []

function BookmarkFavicon({ name, url }) {
  const [useFallback, setUseFallback] = useState(false)

  let domain = ''
  try {
    domain = new URL(url).hostname
  } catch {
    return <span className="bookmark-letter">{(name[0] || '?').toUpperCase()}</span>
  }

  if (useFallback) {
    return <span className="bookmark-letter">{(name[0] || '?').toUpperCase()}</span>
  }

  return (
    <img
      className="bookmark-favicon"
      src={`https://${domain}/favicon.ico`}
      onError={() => setUseFallback(true)}
      alt=""
      loading="lazy"
    />
  )
}

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('newtab-bookmarks')
      if (saved) {
        const parsed = JSON.parse(saved)
        // If the user's local storage contains the exact old default presets, reset to empty
        const isOldDefault = Array.isArray(parsed) && parsed.length === 8 && parsed[0].name === 'Google' && parsed[7].name === 'Reddit'
        if (isOldDefault) {
          return DEFAULT_BOOKMARKS
        }
        return parsed
      }
      return DEFAULT_BOOKMARKS
    } catch {
      return DEFAULT_BOOKMARKS
    }
  })
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', url: '' })
  const [contextMenu, setContextMenu] = useState(null)

  useEffect(() => {
    localStorage.setItem('newtab-bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  useEffect(() => {
    const handleGlobalContextMenu = (e) => {
      // Ignore right click inside text inputs or settings panel
      if (
        e.target.closest('input') ||
        e.target.closest('textarea') ||
        e.target.closest('.settings-panel') ||
        e.target.closest('.modal')
      ) {
        return
      }

      e.preventDefault()

      const bookmarkEl = e.target.closest('.bookmark')
      let type = 'page'
      let targetIdx = undefined

      if (bookmarkEl) {
        type = 'bookmark'
        targetIdx = parseInt(bookmarkEl.dataset.index)
      }

      const menuWidth = 140
      const menuHeight = type === 'bookmark' ? 110 : 45

      let x = e.clientX
      let y = e.clientY

      if (x + menuWidth > window.innerWidth) {
        x = window.innerWidth - menuWidth - 10
      }
      if (y + menuHeight > window.innerHeight) {
        y = window.innerHeight - menuHeight - 10
      }

      setContextMenu({ x, y, type, targetIdx })
    }

    window.addEventListener('contextmenu', handleGlobalContextMenu)
    return () => {
      window.removeEventListener('contextmenu', handleGlobalContextMenu)
    }
  }, [bookmarks])

  useEffect(() => {
    if (!contextMenu) return
    const closeMenu = () => setContextMenu(null)
    window.addEventListener('click', closeMenu)
    window.addEventListener('contextmenu', closeMenu)
    return () => {
      window.removeEventListener('click', closeMenu)
      window.removeEventListener('contextmenu', closeMenu)
    }
  }, [contextMenu])

  function openAdd() {
    setEditForm({ name: '', url: '' })
    setEditing('add')
  }

  function openEdit(index) {
    setEditForm({ ...bookmarks[index] })
    setEditing(index)
  }

  function handleSave() {
    const { name, url } = editForm
    if (!name.trim() || !url.trim()) return
    let finalUrl = url.trim()
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl

    const updated = [...bookmarks]
    if (editing === 'add') {
      updated.push({ name: name.trim(), url: finalUrl })
    } else {
      updated[editing] = { name: name.trim(), url: finalUrl }
    }
    setBookmarks(updated)
    setEditing(null)
  }

  function handleDelete() {
    if (typeof editing !== 'number') return
    setBookmarks(bookmarks.filter((_, i) => i !== editing))
    setEditing(null)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setEditing(null)
  }

  return (
    <>
      <div className="bookmarks-grid">
        {bookmarks.map((bm, i) => (
          <a
            key={i}
            href={bm.url}
            className="bookmark"
            data-index={i}
            title={bm.url}
          >
            <div className="bookmark-icon">
              <BookmarkFavicon name={bm.name} url={bm.url} />
            </div>
            <span className="bookmark-name">{bm.name}</span>
          </a>
        ))}
      </div>

      {contextMenu && (
        <div 
          className="context-menu" 
          style={{ 
            top: contextMenu.y, 
            left: contextMenu.x 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'bookmark' ? (
            <>
              <button onClick={() => { window.location.href = bookmarks[contextMenu.targetIdx].url; setContextMenu(null); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span>打开书签</span>
              </button>
              <button onClick={() => { openEdit(contextMenu.targetIdx); setContextMenu(null); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>编辑书签</span>
              </button>
              <button 
                className="delete-item"
                onClick={() => {
                  setBookmarks(bookmarks.filter((_, idx) => idx !== contextMenu.targetIdx));
                  setContextMenu(null);
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                <span>删除书签</span>
              </button>
            </>
          ) : (
            <button onClick={() => { openAdd(); setContextMenu(null); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                <line x1="12" y1="7" x2="12" y2="13" />
                <line x1="9" y1="10" x2="15" y2="10" />
              </svg>
              <span>添加书签</span>
            </button>
          )}
        </div>
      )}

      {editing !== null && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{typeof editing === 'number' ? '编辑书签' : '添加书签'}</h3>
            <input
              className="modal-input"
              type="text"
              placeholder="名称"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <input
              className="modal-input"
              type="text"
              placeholder="网址"
              value={editForm.url}
              onChange={(e) => setEditForm((f) => ({ ...f, url: e.target.value }))}
              onKeyDown={handleKeyDown}
            />
            <div className="modal-actions">
              {typeof editing === 'number' && (
                <button className="modal-btn modal-btn-delete" onClick={handleDelete}>删除</button>
              )}
              <button className="modal-btn modal-btn-cancel" onClick={() => setEditing(null)}>取消</button>
              <button className="modal-btn modal-btn-save" onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Bookmarks
