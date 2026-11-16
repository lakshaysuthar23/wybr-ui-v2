import React, { useState } from 'react'
import { TIERS, KNOWN_IDS, moodOf } from '../data.js'
import { Orb, Dial } from '../ui.jsx'

export default function Me({ s, set, reset, signOut }) {
  const [q, setQ] = useState('')
  const [found, setFound] = useState(null)
  const [sent, setSent] = useState(false)
  const t = TIERS[s.trust]
  function search(e) {
    e.preventDefault()
    const id = q.trim().toLowerCase().replace(/^@/, '')
    setSent(false); setFound(KNOWN_IDS[id] ? { id, name: KNOWN_IDS[id] } : 'none')
  }
  return (
    <div className="screen">
      <h1>{s.name || 'You'}</h1>
      <div className="card">
        <Orb energy={s.energy} size={120} />
        <h3 style={{ textAlign: 'center' }}>Energy: {moodOf(s.energy).toLowerCase()}</h3>
        <Dial value={s.energy} onChange={(v) => set({ energy: v })} />
        <p className="fine">Your profile stays hidden until a mutual yes.</p>
      </div>

      <div className="card">
        <h3>Trust badge</h3>
        <div className="tierbox">
          <div className="big" aria-hidden="true">{t.e}</div>
          <div><h2>{t.n}</h2><p className="fine">{t.d}</p></div>
        </div>
        <p className="fine">Others see the badge, never how many dates you've had.</p>
      </div>

      <div className="card">
        <h3>Find someone you know</h3>
        <p className="fine">No browsing here. Search a Wybr ID a friend gave you. Try riya.k</p>
        <form className="fieldwrap" onSubmit={search}>
          <input className="field" style={{ fontSize: 16 }} placeholder="Wybr ID" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Wybr ID" />
          <button className="btn sm" type="submit" style={{ flex: 'none' }}>Search</button>
        </form>
        {found === 'none' && <p className="err">No one has that ID. Check the spelling with your friend.</p>}
        {found && found !== 'none' && (
          <div className="row" style={{ alignItems: 'center' }}>
            <div><h3>{found.name}</h3><p className="fine">Profile hidden until they accept.</p></div>
            <button className="btn sm" style={{ flex: 'none' }} disabled={sent} onClick={() => setSent(true)}>{sent ? 'Request sent' : 'Send request'}</button>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Your data</h3>
        <p className="fine">We keep your number, answers and selfie only to run Wybr. Delete everything any time, and it's gone.</p>
        <button className="btn white" onClick={signOut}>Sign out</button>
        <button className="btn white" onClick={reset}>Delete my account and data</button>
      </div>
    </div>
  )
}
