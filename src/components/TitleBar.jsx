import React from 'react'

export default function TitleBar({ onClear, onHome, onFocus }) {
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
          onClick={onHome}
          title="home"
          aria-label="return to home screen"
        />
        <button
          className="dot dot3"
          onClick={onFocus}
          title="focus input"
          aria-label="focus terminal input"
        />
      </div>
      <div className="tab-label">guest@ideax: ~</div>
      <div className="titlebar-right">
        <span className="titlebar-info">ideax_2026.term</span>
      </div>
    </div>
  )
}
