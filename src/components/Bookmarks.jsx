import { useState, useEffect } from 'react'

const DEFAULT_BOOKMARKS = [
  { name: 'Google', url: 'https://www.google.com' },
  { name: 'YouTube', url: 'https://www.youtube.com' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: '百度', url: 'https://www.baidu.com' },
  { name: '知乎', url: 'https://www.zhihu.com' },
  { name: 'Bilibili', url: 'https://www.bilibili.com' },
  { name: 'Twitter', url: 'https://twitter.com' },
  { name: 'Reddit', url: 'https://www.reddit.com' },
]

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
      return saved ? JSON.parse(saved) : DEFAULT_BOOKMARKS
    } catch {
      return DEFAULT_BOOKMARKS
    }
  })
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', url: '' })

  useEffect(() => {
    localStorage.setItem('newtab-bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

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
            title={bm.url}
            onContextMenu={(e) => { e.preventDefault(); openEdit(i) }}
          >
            <div className="bookmark-icon">
              <BookmarkFavicon name={bm.name} url={bm.url} />
            </div>
            <span className="bookmark-name">{bm.name}</span>
          </a>
        ))}
        <button className="bookmark add-bookmark" onClick={openAdd}>
          <div className="bookmark-icon">
            <span className="add-icon">+</span>
          </div>
          <span className="bookmark-name">添加</span>
        </button>
      </div>

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
