import React, { useEffect, useRef, useState } from 'react'
import { STARTERS, REPLIES, fmt, moodOf } from '../data.js'
import { Orb, Dial, Confetti } from '../ui.jsx'

const CROWD = [
  { l: '6%', t: 30, c: 20, d: 0 }, { l: '17%', t: 4, c: 300, d: .4 }, { l: '29%', t: 48, c: 160, d: .8 },
  { l: '41%', t: 10, c: 50, d: .2 }, { l: '53%', t: 52, c: 210, d: 1 }, { l: '64%', t: 6, c: 340, d: .6 },
  { l: '75%', t: 44, c: 120, d: 1.2 }, { l: '86%', t: 14, c: 260, d: .3 },
]

export default function Room({ s, set, partner, go, openPlan }) {
  const [phase, setPhase] = useState('lobby')
  const [secs, setSecs] = useState(600)
  const [msgs, setMsgs] = useState([])
  const [draft, setDraft] = useState('')
  const [extended, setExtended] = useState('idle')
  const replyIdx = useRef(0)
  const box = useRef(null)

  useEffect(() => {
    if (phase === 'searching') { const t = setTimeout(startChat, 2800); return () => clearTimeout(t) }
    if (phase === 'waiting') { const t = setTimeout(() => { set({ journey: 'matched' }); setPhase('reveal') }, 2200); return () => clearTimeout(t) }
  }, [phase])

  useEffect(() => {
    if (phase !== 'chat') return
    const id = setInterval(() => setSecs((x) => { if (x <= 1) { clearInterval(id); setPhase('decide'); return 0 } return x - 1 }), 1000)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight }, [msgs])

  function startChat() {
    setSecs(600); setExtended('idle'); replyIdx.current = 0
    setMsgs([{ f: 'sys', t: 'You are chatting with Fern. Names and photos stay hidden until you both say yes.' }])
    setPhase('chat')
    setTimeout(() => setMsgs((m) => [...m, { f: 'them', t: 'Hi. Strange to start with no photo, but I like it. How is your evening?' }]), 1100)
  }
  function send(text) {
    const t = (text ?? draft).trim()
    if (!t) return
    setMsgs((m) => [...m, { f: 'me', t }]); setDraft('')
    const reply = REPLIES[replyIdx.current++ % REPLIES.length]
    setTimeout(() => setMsgs((m) => [...m, { f: 'them', t: reply }]), 1500)
  }
  function more() {
    setExtended('asked')
    setTimeout(() => { setExtended('yes'); setSecs((x) => x + 300); setMsgs((m) => [...m, { f: 'sys', t: 'Fern wants more time too. Five minutes added.' }]) }, 1800)
  }

  if (phase === 'lobby') return (
    <div className="screen">
      <h1>{s.live ? 'The room is open.' : 'The room is closed.'}</h1>
      <div className="crowd" aria-hidden="true">
        {s.live && CROWD.map((b, i) => <i key={i} style={{ left: b.l, top: b.t, '--c': b.c, animationDelay: b.d + 's' }} />)}
      </div>
      <div className="card">
        <p>
          {s.live
            ? '38 people are here, 19 men and 19 women. You get paired by energy and your answers, then chat for ten minutes with no photos.'
            : 'Random Wybr runs daily from 8 to 10 PM. Everyone is paired at once, so every room is full.'}
        </p>
        <h3>Your energy tonight: {moodOf(s.energy).toLowerCase()}</h3>
        <Dial value={s.energy} onChange={(v) => set({ energy: v })} />
      </div>
      <div className="grow"><button className="btn" style={{ width: '100%' }} disabled={!s.live} onClick={() => setPhase('searching')}>{s.live ? 'Enter the room' : 'Opens at 8 PM'}</button></div>
    </div>
  )

  if (phase === 'searching') return (
    <div className="screen center" style={{ textAlign: 'center' }}>
      <div className="pair" aria-hidden="true">
        <div className="a"><Orb energy={s.energy} size={110} /></div>
        <div className="b"><Orb energy={78} size={110} hue={(s.energy * 2 + 200) % 360} /></div>
      </div>
      <h2>Finding someone who fits your energy.</h2>
      <p className="fine">Keep the room open. It takes a few seconds.</p>
    </div>
  )

  if (phase === 'chat') return (
    <>
      <div className="chathead">
        <div className="who">
          <Orb energy={60} size={46} hue={300} />
          <div><h3>Fern</h3><span className="fine">Photos hidden</span></div>
        </div>
        <div className={'timer' + (secs < 60 ? ' low' : '')} role="timer" aria-label="Time left">{fmt(secs)}</div>
      </div>
      <div className="msgs" ref={box}>
        {msgs.map((m, i) => <div key={i} className={'msg ' + m.f}>{m.t}</div>)}
      </div>
      <div className="starters">
        <div className="chips">{STARTERS.map((x) => <button key={x} className="chip" onClick={() => send(x)}>{x}</button>)}</div>
        <div className="links">
          {extended === 'idle' && <button className="link" onClick={more}>Ask for 5 more minutes</button>}
          {extended === 'asked' && <span className="fine">Waiting for Fern…</span>}
          {extended === 'yes' && <span />}
          <button className="link" onClick={() => setPhase('decide')}>Demo: skip to decision</button>
        </div>
      </div>
      <form className="composer" onSubmit={(e) => { e.preventDefault(); send() }}>
        <input className="field" placeholder="Say something real" value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Message" />
        <button className="btn" type="submit">Send</button>
      </form>
    </>
  )

  if (phase === 'decide') return (
    <div className="screen center">
      <h1>Time's up. Want to see each other?</h1>
      <p className="lead">Only if you both say yes do photos appear. A no stays private. Fern never sees it.</p>
      <div className="thumbs">
        <button className="btn" onClick={() => setPhase('waiting')}><b aria-hidden="true">👍</b>Show me</button>
        <button className="btn white" onClick={() => setPhase('no')}><b aria-hidden="true">👎</b>Not this time</button>
      </div>
    </div>
  )

  if (phase === 'waiting') return (
    <div className="screen center" style={{ textAlign: 'center' }}>
      <Orb energy={s.energy} size={140} />
      <h2>Waiting for Fern to decide…</h2>
    </div>
  )

  if (phase === 'no') return (
    <div className="screen center">
      <h1>Thanks for being honest.</h1>
      <p className="lead">Nothing about you was shared. Ready for another round?</p>
      <button className="btn" onClick={() => setPhase('lobby')}>Back to the room</button>
    </div>
  )

  return (
    <div className="screen">
      <Confetti />
      <h1>It's mutual!</h1>
      <div className="profilecard">
        <div className="avatar">{partner[0]}</div>
        <div><h2>{partner}, 26</h2><p className="fine">Koramangala. Energy: easy.</p></div>
        <div className="answer"><span>Sunday, sofa or street?</span>Street, if there is chai.</div>
        <div className="answer"><span>What charges you?</span>One good friend at a slow table.</div>
      </div>
      <div className="grow">
        <button className="btn" style={{ width: '100%', marginBottom: 12 }} onClick={openPlan}>Plan the date</button>
        <button className="btn white" style={{ width: '100%' }} onClick={() => go('dates')}>Say hi first</button>
      </div>
    </div>
  )
}
