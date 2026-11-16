import React, { useEffect, useState } from 'react'
import { supabase, isLive } from './lib/supabase.js'
import { initial, hueOf } from './data.js'
import { Icon } from './ui.jsx'
import Onboarding from './screens/Onboarding.jsx'
import Home from './screens/Home.jsx'
import Room from './screens/Room.jsx'
import Dates, { PlanSheet } from './screens/Dates.jsx'
import Me from './screens/Me.jsx'

function usePersist(key, init) {
  const [v, setV] = useState(() => {
    try { const raw = localStorage.getItem(key); if (raw) return { ...init, ...JSON.parse(raw) } } catch (e) {}
    return init
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch (e) {} }, [key, v])
  return [v, setV]
}

const TABS = [['home', 'Home', 'home'], ['room', 'Room', 'room'], ['dates', 'Dates', 'dates'], ['me', 'Me', 'me']]

export default function App() {
  const [s, setS] = usePersist('wybr-v2', initial)
  const [plan, setPlan] = useState(false)
  const [toast, setToast] = useState('')
  const [tray, setTray] = useState(false)
  const set = (patch) => setS((p) => ({ ...p, ...(typeof patch === 'function' ? patch(p) : patch) }))
  const partner = s.gender === 'woman' ? 'Aarav' : 'Ananya'
  const say = (m) => { setToast(m); setTimeout(() => setToast(''), 3200) }
  const go = (tab) => set({ tab })
  const signOut = async () => { if (isLive) await supabase.auth.signOut(); setS(initial) }
  const reset = async () => {
    if (isLive) { await supabase.rpc('delete_my_account'); await supabase.auth.signOut() }
    setS(initial)
  }
  const confirm = (met) => {
    if (met) { set((p) => ({ journey: 'none', plan: null, trust: Math.min(2, p.trust + 1), tab: 'me' })); say('Date confirmed. Your trust badge grew.') }
    else { set({ journey: 'none', plan: null }); say("No problem. Your badge stays the same.") }
  }

  useEffect(() => {
    if (!isLive) return
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setS((p) => (p.stage === 'app' ? initial : p)); return }
      const { data: prof } = await supabase.from('profiles').select('first_name,gender,energy,trust_level').maybeSingle()
      if (prof) setS((p) => ({ ...p, stage: 'app', name: prof.first_name, gender: prof.gender, energy: prof.energy, trust: prof.trust_level }))
    })
  }, [])

  const onboarding = s.stage !== 'app'
  const common = { s, set, partner, go, openPlan: () => setPlan(true), confirm }

  return (
    <>
      {!isLive && (
        <div className="tray">
          <button onClick={() => setTray(!tray)} aria-expanded={tray}>Prototype controls {tray ? '▴' : '▾'}</button>
          {tray && (
            <div className="panel">
              <span>Path:</span>
              {[['none', 'New'], ['matched', 'Matched'], ['planned', 'Date planned'], ['dated', 'After date']].map(([k, l]) => (
                <button key={k} className={s.journey === k ? 'on' : ''} onClick={() => set({ journey: k, stage: 'app', plan: k === 'planned' || k === 'dated' ? s.plan || { slot: 'Sat 4:00 PM', cafe: 'ff' } : null })}>{l}</button>
              ))}
              <span>Room:</span>
              <button className={s.live ? 'on' : ''} onClick={() => set({ live: true })}>Live</button>
              <button className={!s.live ? 'on' : ''} onClick={() => set({ live: false })}>Closed</button>
              <button onClick={() => set({ stage: 'welcome' })}>Restart</button>
            </div>
          )}
        </div>
      )}
      <main className={'frame' + (!isLive ? ' withtray' : '')} style={{ '--h': hueOf(s.energy) }}>
        {onboarding ? <Onboarding s={s} set={set} /> : (
          <>
            {s.tab === 'home' && <Home {...common} />}
            {s.tab === 'room' && <Room {...common} />}
            {s.tab === 'dates' && <Dates {...common} />}
            {s.tab === 'me' && <Me s={s} set={set} reset={reset} signOut={signOut} />}
            <nav className="nav" aria-label="Main">
              {TABS.map(([k, l, ic]) => (
                <button key={k} className={s.tab === k ? 'on' : ''} onClick={() => go(k)} aria-current={s.tab === k ? 'page' : undefined}>
                  <span className="ic"><Icon name={ic} size={22} /></span>{l}
                  {k === 'dates' && s.journey !== 'none' && <span className="badge" />}
                </button>
              ))}
            </nav>
          </>
        )}
        {plan && <PlanSheet partner={partner} onClose={() => setPlan(false)} onConfirm={(p) => { set({ plan: p, journey: 'planned', tab: 'dates' }); setPlan(false); say('Date confirmed. Your date kit is ready.') }} />}
        {toast && <div className="toast" role="status">{toast}</div>}
      </main>
    </>
  )
}
