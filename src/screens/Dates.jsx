import React, { useState } from 'react'
import { CAFES, SLOTS, PARTNER_SLOTS, PARTNER_CAFES } from '../data.js'
import { Qr } from '../ui.jsx'

export function PlanSheet({ partner, onClose, onConfirm }) {
  const [step, setStep] = useState(0)
  const [slots, setSlots] = useState([])
  const [cafes, setCafes] = useState([])
  const toggleSlot = (x) => setSlots((p) => (p.includes(x) ? p.filter((y) => y !== x) : p.length < 3 ? [...p, x] : p))
  const toggleCafe = (x) => setCafes((p) => (p.includes(x) ? p.filter((y) => y !== x) : p.length < 3 ? [...p, x] : p))
  const slotMatch = slots.find((x) => PARTNER_SLOTS.includes(x))
  const cafeMatch = cafes.find((x) => PARTNER_CAFES.includes(x))
  const slot = slotMatch || PARTNER_SLOTS[0]
  const cafe = CAFES.find((c) => c.id === (cafeMatch || PARTNER_CAFES[1]))
  return (
    <div className="sheetback" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Plan a date">
        {step === 0 && (<>
          <span className="pill" style={{ width: 'fit-content' }}>Step 1 of 3</span>
          <h2>When can you meet {partner}?</h2>
          <p className="fine">Pick up to 3 times. We find the overlap with theirs.</p>
          <div className="chips">{SLOTS.map((x) => <button key={x} className={'chip' + (slots.includes(x) ? ' on' : '')} onClick={() => toggleSlot(x)}>{x}</button>)}</div>
          <button className="btn" disabled={!slots.length} onClick={() => setStep(1)}>Next</button>
        </>)}
        {step === 1 && (<>
          <span className="pill" style={{ width: 'fit-content' }}>Step 2 of 3</span>
          <h2>Pick your top places.</h2>
          <p className="fine">Tap in order of preference, up to 3. Every place is a verified public cafe. Nobody chooses alone.</p>
          <div className="opts">
            {CAFES.map((c) => {
              const r = cafes.indexOf(c.id)
              return (
                <button key={c.id} className={'opt' + (r > -1 ? ' on' : '')} onClick={() => toggleCafe(c.id)}>
                  <span>{c.name}<small>{c.area}</small></span>
                  {r > -1 && <span className="rank">{r + 1}</span>}
                </button>
              )
            })}
          </div>
          <button className="btn" disabled={!cafes.length} onClick={() => setStep(2)}>See the match</button>
        </>)}
        {step === 2 && (<>
          <span className="pill" style={{ width: 'fit-content' }}>Step 3 of 3</span>
          <h2>{partner} picked too.</h2>
          <p>{slotMatch ? `You're both free ${slot}.` : `No shared time, so we suggest ${slot}, which suits both.`}</p>
          <p>{cafeMatch ? `You both chose ${cafe.name}.` : `No shared place, so we chose ${cafe.name}, the closest to both of you.`}</p>
          <div className="ticket"><div className="top"><h2>{slot}</h2><p>{cafe.name}, {cafe.area}</p></div><div className="bottom"><p className="fine">Public, easy to leave, and busy at that hour.</p></div></div>
          <button className="btn" onClick={() => onConfirm({ slot, cafe: cafe.id })}>Confirm the date</button>
          <button className="btn white" onClick={() => setStep(0)}>Change my picks</button>
        </>)}
      </div>
    </div>
  )
}

export default function Dates({ s, set, partner, go, openPlan, confirm }) {
  const [msgs, setMsgs] = useState([
    { f: 'them', t: 'That ten minutes went fast. Glad we both said yes.' },
    { f: 'sys', t: 'You two click. Pick a time to meet before the match closes.' },
  ])
  const [draft, setDraft] = useState('')
  const cafe = CAFES.find((c) => c.id === s.plan?.cafe)
  function send() {
    const t = draft.trim(); if (!t) return
    setMsgs((m) => [...m, { f: 'me', t }]); setDraft('')
    setTimeout(() => setMsgs((m) => [...m, { f: 'them', t: 'Saturday works for me. Shall we pick a place?' }]), 1400)
  }

  if (s.journey === 'none') return (
    <div className="screen center">
      <h1>No dates yet.</h1>
      <p className="lead">Matches come from the room. Each one stays open for 72 hours, so there's time to plan.</p>
      <button className="btn" onClick={() => go('room')}>Go to the room</button>
    </div>
  )

  if (s.journey === 'matched') return (
    <>
      <div className="chathead">
        <div><h2>{partner}</h2><span className="fine">61 hours left</span></div>
        <button className="btn sm" onClick={openPlan}>Plan the date</button>
      </div>
      <div style={{ padding: '0 20px' }}><div className="timebar"><i style={{ width: '85%' }} /></div></div>
      <div className="msgs" style={{ paddingTop: 14 }}>{msgs.map((m, i) => <div key={i} className={'msg ' + m.f}>{m.t}</div>)}</div>
      <form className="composer" onSubmit={(e) => { e.preventDefault(); send() }}>
        <input className="field" placeholder={`Message ${partner}`} value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Message" />
        <button className="btn" type="submit">Send</button>
      </form>
    </>
  )

  if (s.journey === 'planned') return (
    <div className="screen">
      <h1>Your date kit</h1>
      <div className="ticket">
        <div className="top"><h2>{s.plan.slot}</h2><p><b>{cafe.name}</b>, {cafe.area}</p></div>
        <div className="bottom">
          <Qr />
          <p className="fine">Both of you scan this at the table. That confirms the date happened.</p>
        </div>
      </div>
      <button className={'toggle' + (s.shareLoc ? ' on' : '')} onClick={() => set({ shareLoc: !s.shareLoc })} aria-pressed={s.shareLoc}>
        <span>Share live location with a friend<br /><span className="fine">{s.shareLoc ? 'Sharing until one hour after the date' : 'Off'}</span></span><i className="sw" />
      </button>
      <button className={'toggle' + (s.safe ? ' on' : '')} onClick={() => set({ safe: !s.safe })} aria-pressed={s.safe}>
        <span>I'm safe check-in<br /><span className="fine">{s.safe ? 'Checked in. Thank you.' : 'Tap when you arrive and when you leave'}</span></span><i className="sw" />
      </button>
      <button className="btn white" onClick={() => set({ journey: 'matched', plan: null })}>I can't make it. No penalty</button>
      <button className="link" onClick={() => set({ journey: 'dated' })}>Demo: jump to after the date</button>
    </div>
  )

  return (
    <div className="screen center">
      <h1>Did you meet {partner}?</h1>
      <p className="lead">Both of you answer separately. Only a confirmed date grows your trust badge.</p>
      <div className="row">
        <button className="btn" onClick={() => confirm(true)}>We met</button>
        <button className="btn white" onClick={() => confirm(false)}>Didn't happen</button>
      </div>
    </div>
  )
}
