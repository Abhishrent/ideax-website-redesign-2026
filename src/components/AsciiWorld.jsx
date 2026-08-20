import { useRef, useEffect, useState } from 'react'
import { buildMuseum, setupTorchFlicker } from '../engine/museum'
import { createPlayer, createInputState, updatePlayer } from '../engine/player'
import { createRendererState, resize, render, renderMinimap, renderHud } from '../engine/renderer'
import { SPRITE_DEFS } from '../engine/textures'
import './AsciiWorld.css'

export default function AsciiWorld({ onReturn }) {
  const canvasRef = useRef(null)
  const minimapRef = useRef(null)
  const hudTRRef = useRef(null)
  const hudBLRef = useRef(null)
  const [showOverlay, setShowOverlay] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    const mmCanvas = minimapRef.current
    if (!canvas || !mmCanvas) return

    const ctx = canvas.getContext("2d")
    const mmCtx = mmCanvas.getContext("2d")

    const museum = buildMuseum()
    const paintingLookup = {}
    museum.paintings.forEach(p => { paintingLookup[`${p.x},${p.y}`] = p; })
    const torches = setupTorchFlicker(museum.torches)
    for (const s of museum.sprites) {
      const d = SPRITE_DEFS[s.type]
      s.collide = d.collide
      s.radius = d.radius
    }

    const player = createPlayer(museum.spawn)
    const input = createInputState()
    const rendererState = createRendererState()

    resize(rendererState, canvas)

    const onResize = () => resize(rendererState, canvas)
    window.addEventListener("resize", onResize)

    const onPointerLockChange = () => {
      input.mouseLocked = document.pointerLockElement === canvas || document.pointerLockElement === document.body
      setShowOverlay(!input.mouseLocked)
    }
    document.addEventListener("pointerlockchange", onPointerLockChange)

    const onMouseMove = (e) => {
      if (!input.mouseLocked || input.mapOpen) return
      player.angle += e.movementX * 0.0022
      player.pitch = Math.max(-rendererState.PITCH_LIMIT, Math.min(rendererState.PITCH_LIMIT, player.pitch - e.movementY * 0.045))
    }
    document.addEventListener("mousemove", onMouseMove)

    const onKeyDown = (e) => {
      input.keys[e.code] = true
      if (e.code === "KeyM" && !e.repeat) input.mapOpen = !input.mapOpen
    }
    const onKeyUp = (e) => { input.keys[e.code] = false }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    let last = performance.now()
    const t0 = last
    let raf

    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const timeSec = (now - t0) / 1000

      updatePlayer(dt, player, input, museum, museum.sprites)
      render(timeSec, ctx, rendererState, player, input, museum, paintingLookup, torches, museum.sprites)
      renderMinimap(mmCtx, mmCanvas, player, museum)

      rendererState.fpsFrames++
      rendererState.fpsTimer += dt
      if (rendererState.fpsTimer >= 0.5) {
        rendererState.fps = Math.round(rendererState.fpsFrames / rendererState.fpsTimer)
        rendererState.fpsFrames = 0
        rendererState.fpsTimer = 0
      }
      renderHud(hudTRRef.current, hudBLRef.current, rendererState.fps, player, rendererState)

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("pointerlockchange", onPointerLockChange)
      document.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [])

  const handleOverlayClick = () => {
    const canvas = canvasRef.current
    canvas?.requestPointerLock?.() ?? document.body?.requestPointerLock?.()
  }

  return (
    <div className="ascii-world-stage">
      <canvas ref={canvasRef} className="ascii-world-canvas" />
      <div className="crt-overlay" />
      <div className="fullscreen-vignette" />
      <div className="ascii-world-crosshair">+</div>
      <div className="ascii-world-hud">
        <div className="ascii-world-hud-corner ascii-world-hud-tl">
          <pre className="ascii-world-logo">█ █▀▄ █▀▀ ▄▀█ ▀▄▀
█ █▄▀ ██▄ █▀█ █ █</pre>
        </div>
        <div className="ascii-world-hud-corner ascii-world-hud-tr" ref={hudTRRef} />
        <div className="ascii-world-hud-corner ascii-world-hud-bl" ref={hudBLRef} />
        <div className="ascii-world-hud-corner ascii-world-hud-br">
          <canvas ref={minimapRef} className="ascii-world-minimap" width="120" height="120" />
        </div>
      </div>
      {showOverlay && (
        <div className="ascii-world-overlay">
          <div className="ascii-world-overlay-content" onClick={handleOverlayClick}>
            <h1>IdeaX welcomes you to its hall of fame</h1>
            <p>
              A gallery of sponsors, kept within a torch-lit stone keep, rendered entirely in text density.<br />
              <span className="ascii-world-key">W A S D</span> to walk &middot; mouse to look freely, any direction &middot;
              <span className="ascii-world-key">SHIFT</span> to hurry &middot; <span className="ascii-world-key">M</span> for the full map &middot; <span className="ascii-world-key">ESC</span> to release cursor
            </p>
            <div className="ascii-world-blink">[ click to step inside ]</div>
          </div>
          {onReturn && (
            <button className="return-btn" onClick={onReturn}>
              ← back to terminal
            </button>
          )}
        </div>
      )}
    </div>
  )
}
