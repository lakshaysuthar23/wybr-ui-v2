import React, { useState } from 'react'
import { CAFES, SOON, moodOf, untilEight } from '../data.js'
import { Orb, Dial, Journey, Wordmark } from '../ui.jsx'

export default function Home({ s, set, partner, go, openPlan, confirm }) {
  const [wait] = useState(untilEight)
  const cafe = CAFES.find((c) => c.id === s.plan?.cafe)
  const mood = moodOf(s.energy)
  let card
  if (s.journey === 'none') card = s.live ? (
    <>
      <h2>The room is open.</h2>
      <p>38 people are in, evenly balanced. Ten minutes, no photos, one honest decision.</p>
      <button className="btn" onClick={() => go('room')}>Go to the room</button>
    </>
  ) : (
    <>
      <h2>Room opens at 8 PM.</h2>
      <p>Opens in {wait}. Everyone is paired at once, so rooms are never empty. Set your energy now.</p>
      <button className="btn white" onClick={() => go('room')}>See how it works</button>
    </>
  )
  if (s.journey === 'matched') card = (
    <>
      <h2>You and {partner} clicked.</h2>
      <p>Your match stays open for 61 more hours. Pick a time and a place.</p>
      <button className="btn" onClick={openPlan}>Plan the date</button>
    </>
  )
  if (s.journey === 'planned') card = (
    <>
      <h2>{s.plan.slot} at {cafe.name}.</h2>
      <p>{cafe.area}. You both chose this place. Your date kit has check-in and safety tools.</p>
      <button className="btn" onClick={() => go('dates')}>Open date kit</button>
    </>
  )
  if (s.journey === 'dated') card = (
    <>
      <h2>How did it go with {partner}?</h2>
      <p>Both of you answer separately. A confirmed date grows your trust badge.</p>
      <div className="row">
        <button className="btn" onClick={() => confirm(true)}>We met</button>
        <button className="btn white" onClick={() => confirm(false)}>Didn't happen</button>
      </div>
    </>
  )

  return (
    <div className="screen">
      <div className="section-h">
        <Wordmark sm />
        <span className="pill">Bangalore</span>
      </div>
      <h1>Hey {s.name || 'you'}.</h1>
      <Orb energy={s.energy} size={170} />
      <h2 style={{ textAlign: 'center' }}>Tonight you're {mood.toLowerCase()}.</h2>
      <Dial value={s.energy} onChange={(v) => set({ energy: v })} />

      <div className="card">
        <Journey journey={s.journey} />
        {card}
      </div>

      <div className="card">
        <h3>What sounds best this weekend?</h3>
        {s.checkin ? (
          <p className="fine">You said: {s.checkin}. It sharpens tonight's pairing.</p>
        ) : (
          <div className="chips">
            {['A long walk', 'Good food', 'Something loud'].map((x) => <button key={x} className="chip" onClick={() => set({ checkin: x })}>{x}</button>)}
          </div>
        )}
      </div>

      <div>
        <div className="section-h" style={{ marginBottom: 8 }}><h3>Coming to Wybr</h3><span className="fine">Not just dates</span></div>
        <div className="hscroll">
          {SOON.map((c) => {
            const on = s.notify.includes(c.id)
            return (
              <div key={c.id} className="card">
                <span className="emoji" aria-hidden="true">{c.e}</span>
                <h3>{c.t}</h3>
                <p className="fine">{c.d}</p>
                <button className={'chip' + (on ? ' on' : '')} onClick={() => set({ notify: on ? s.notify.filter((x) => x !== c.id) : [...s.notify, c.id] })} aria-pressed={on}>
                  {on ? 'You are on the list' : 'Notify me'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
