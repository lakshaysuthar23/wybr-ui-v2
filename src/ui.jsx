import React, { useMemo } from 'react'
import { moodOf, hueOf } from './data.js'

const ICONS = {
  home: <path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z" />,
  room: <><circle cx="9" cy="12" r="5.5" /><circle cx="15" cy="12" r="5.5" /></>,
  dates: <path d="M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2zM3 11h18M8 3v4M16 3v4" />,
  me: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></>,
  back: <path d="M15 5l-7 7 7 7" />,
}
export function Icon({ name, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}

export function Wordmark({ sm }) {
  return <span className={'wordmark' + (sm ? ' sm' : '')}>wybr<i /></span>
}

/* The mascot. A blob that changes face and pace with energy. */
export function Orb({ energy = 50, size = 200, hue }) {
  const mood = moodOf(energy)
  const h = hue ?? (hueOf(energy) + 150) % 360
  const dur = mood === 'Quiet' ? 5.5 : mood === 'Easy' ? 3.4 : 1.7
  return (
    <div className="orb" style={{ width: size, height: size, '--oh': h, animationDuration: `${dur}s, 9s` }} role="img" aria-label={`Wybr mascot, feeling ${mood.toLowerCase()}`}>
      <svg viewBox="0 0 100 100" width="62%" height="62%">
        {mood === 'Quiet' && (<>
          <path d="M26 44q8 7 16 0M58 44q8 7 16 0" fill="none" stroke="#12102B" strokeWidth="5" strokeLinecap="round" />
          <path d="M42 66q8 4 16 0" fill="none" stroke="#12102B" strokeWidth="5" strokeLinecap="round" />
        </>)}
        {mood === 'Easy' && (<>
          <circle cx="34" cy="44" r="5.5" fill="#12102B" /><circle cx="66" cy="44" r="5.5" fill="#12102B" />
          <path d="M32 60q18 18 36 0" fill="none" stroke="#12102B" strokeWidth="5" strokeLinecap="round" />
        </>)}
        {mood === 'Lively' && (<>
          <circle cx="33" cy="42" r="7" fill="#12102B" /><circle cx="67" cy="42" r="7" fill="#12102B" />
          <circle cx="35" cy="40" r="2.2" fill="#fff" /><circle cx="69" cy="40" r="2.2" fill="#fff" />
          <path d="M30 58q20 30 40 0z" fill="#12102B" /><path d="M42 68q8 6 16 0q-8-5-16 0z" fill="#FF6A5C" />
        </>)}
      </svg>
    </div>
  )
}

export function Dial({ value, onChange, label }) {
  return (
    <div className="dialwrap">
      <input className="dial" type="range" min="0" max="100" value={value} aria-label={label || 'Energy'} onChange={(e) => onChange(+e.target.value)} />
      <div className="dialscale"><span>Quiet</span><span>Easy</span><span>Lively</span></div>
    </div>
  )
}

export function Journey({ journey }) {
  const idx = { none: -1, matched: 1, planned: 2, dated: 3 }[journey]
  const steps = ['Match', 'Chat', 'Plan', 'Date']
  return (
    <div className="journey" aria-label="Your path to a date">
      {steps.map((st, i) => (
        <React.Fragment key={st}>
          <div className={'step' + (i <= idx ? ' done' : '') + (i === idx + 1 ? ' now' : '')}><i />{st}</div>
          {i < steps.length - 1 && <div className={'gap' + (i < idx ? ' done' : '')} />}
        </React.Fragment>
      ))}
    </div>
  )
}

export function Confetti() {
  const bits = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    l: Math.random() * 100, d: Math.random() * 0.6, t: 1.8 + Math.random() * 1.4,
    c: ['#FFE14D', '#12102B', '#ffffff', '#FF6A5C', '#2FE3B0', '#5B63FF'][i % 6],
  })), [])
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => <i key={i} style={{ left: b.l + '%', background: b.c, animationDelay: b.d + 's', animationDuration: b.t + 's' }} />)}
    </div>
  )
}

export function Qr() {
  const cells = useMemo(() => {
    const n = 17, out = []
    let seed = 7
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const finder = (x < 5 && y < 5) || (x > n - 6 && y < 5) || (x < 5 && y > n - 6)
      const edge = finder && (x === 0 || y === 0 || x === 4 || y === 4 || x === n - 5 || x === n - 1 || y === n - 5 || y === n - 1)
      const core = finder && ((x === 2 && y === 2) || (x === n - 3 && y === 2) || (x === 2 && y === n - 3))
      if (finder ? edge || core : rnd() > 0.5) out.push([x, y])
    }
    return out
  }, [])
  return (
    <svg className="qr" viewBox="0 0 17 17" role="img" aria-label="Sample cafe check-in code">
      {cells.map(([x, y]) => <rect key={x + '-' + y} x={x} y={y} width="1" height="1" fill="#12102B" />)}
    </svg>
  )
}
