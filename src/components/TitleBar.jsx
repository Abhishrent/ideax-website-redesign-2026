import React from 'react'

export default function TitleBar({ onClear, onFetch, onFocus }) {
  return (
    <div className="titlebar">
      <div className="dots">
        <button
          className="dot dot1"
          onClick={onClear}
          title="clear"
          aria-label="clear terminal"
        />
        <button
          className="dot dot2"
          onClick={onFetch}
          title="replay fastfetch"
          aria-label="replay system info"
        />
        <button
          className="dot dot3"
          onClick={onFocus}
          title="focus input"
          aria-label="focus terminal input"
        />
      </div>
      <div className="tab-label">guest@ideax: ~</div>
      <div className="titlebar-right">ideax_2026.term · 48:00:00 build window</div>
    </div>
  )
}
