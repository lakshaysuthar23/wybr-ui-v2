import React, { useState } from 'react'
import { supabase, isLive } from '../lib/supabase.js'
import { QUIZ, moodOf } from '../data.js'
import { Icon, Orb, Dial, Wordmark, Confetti } from '../ui.jsx'

const TOTAL = 9

function Top({ idx, onBack }) {
  return (
    <div className="obtop">
      {onBack
        ? <button className="back" onClick={onBack} aria-label="Back"><Icon name="back" size={20} /></button>
        : <span style={{ width: 40 }} />}
      <div className="bars" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={idx + 1}>
        {Array.from({ length: TOTAL }, (_, i) => <i key={i} className={i <= idx ? 'on' : ''} />)}
      </div>
    </div>
  )
}

export default function Onboarding({ s, set }) {
  const [otp, setOtp] = useState('')
  const [checking, setChecking] = useState('idle')
  const [qi, setQi] = useState(0)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const validPhone = /^[6-9]\d{9}$/.test(s.phone)

  async function sendCode() {
    setErr('')
    if (!isLive) return set({ stage: 'otp' })
    setBusy(true)
    const { error } = await supabase.auth.signInWithOtp({ phone: '+91' + s.phone })
    setBusy(false)
    if (error) return setErr('We could not send the code. Check the number and try again in a minute.')
    set({ stage: 'otp' })
  }
  async function verify() {
    setErr('')
    if (!isLive) return set({ stage: 'you' })
    setBusy(true)
    const { data, error } = await supabase.auth.verifyOtp({ phone: '+91' + s.phone, token: otp, type: 'sms' })
    if (error || !data?.user) { setBusy(false); return setErr('That code is wrong or expired. Request a new one.') }
    const { data: prof } = await supabase.from('profiles').select('first_name,gender,energy,trust_level').maybeSingle()
    setBusy(false)
    if (prof) return set({ stage: 'app', tab: 'home', name: prof.first_name, gender: prof.gender, energy: prof.energy, trust: prof.trust_level })
    set({ stage: 'you' })
  }
  async function saveProfile() {
    setErr('')
    const next = s.gender === 'man' ? 'waitroom' : 'selfie'
    if (!isLive) return set({ stage: next })
    setBusy(true)
    const { data: u } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').insert({ id: u.user.id, first_name: s.name.trim(), gender: s.gender, energy: s.energy })
    setBusy(false)
    if (error && error.code !== '23505') return setErr('We could not save your details. Try again.')
    set({ stage: next })
  }
  async function finish() {
    if (isLive) {
      const { data: u } = await supabase.auth.getUser()
      await supabase.from('profiles').update({ energy: s.energy }).eq('id', u.user.id)
    }
    set({ stage: 'app', tab: 'home' })
  }

  if (s.stage === 'welcome') {
    const cycle = () => set({ energy: s.energy < 35 ? 55 : s.energy < 70 ? 90 : 15 })
    return (
      <div className="screen">
        <Wordmark />
        <h1>Find your vibe. Then actually meet.</h1>
        <button className="orbbtn" onClick={cycle} aria-label="Tap the mascot to change its mood"><Orb energy={s.energy} size={230} /></button>
        <p className="fine" style={{ textAlign: 'center', marginTop: -6 }}>Tap me. Your colour follows your energy.</p>
        <span className="sticker tilt">100 men : 92 women, always balanced</span>
        <div className="grow"><button className="btn" style={{ width: '100%' }} onClick={() => set({ stage: 'phone' })}>Let's go</button></div>
        <p className="fine">Bangalore first. Free to join during the pilot.</p>
      </div>
    )
  }

  if (s.stage === 'phone') return (
    <>
      <Top idx={0} onBack={() => set({ stage: 'welcome' })} />
      <div className="screen">
        <h2>What's your number?</h2>
        <p className="lead">It's your key to Wybr. We never show it to anyone.</p>
        <div className="fieldwrap">
          <span className="prefix">+91</span>
          <input className="field" inputMode="numeric" maxLength={10} placeholder="10-digit number" value={s.phone}
            onChange={(e) => set({ phone: e.target.value.replace(/\D/g, '') })} aria-label="Mobile number" />
        </div>
        {err && <p className="err" role="alert">{err}</p>}
        <div className="grow"><button className="btn" style={{ width: '100%' }} disabled={!validPhone || busy} onClick={sendCode}>{busy ? 'Sending…' : 'Send code'}</button></div>
      </div>
    </>
  )

  if (s.stage === 'otp') return (
    <>
      <Top idx={1} onBack={() => set({ stage: 'phone' })} />
      <div className="screen">
        <h2>Enter the 6-digit code.</h2>
        <p className="lead">Sent to +91 {s.phone}.{isLive ? '' : ' Demo: any 6 digits work.'}</p>
        <input className="field" inputMode="numeric" maxLength={6} placeholder="000000" value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} aria-label="One-time code" style={{ letterSpacing: '0.4em', textAlign: 'center' }} />
        {err && <p className="err" role="alert">{err}</p>}
        <div className="grow"><button className="btn" style={{ width: '100%' }} disabled={otp.length !== 6 || busy} onClick={verify}>{busy ? 'Checking…' : 'Verify'}</button></div>
      </div>
    </>
  )

  if (s.stage === 'you') return (
    <>
      <Top idx={2} />
      <div className="screen">
        <h2>What should we call you?</h2>
        <input className="field" placeholder="First name" value={s.name} maxLength={20} onChange={(e) => set({ name: e.target.value })} aria-label="First name" />
        <h3>I am a…</h3>
        <div className="row">
          {['woman', 'man'].map((g) => (
            <button key={g} className={'opt' + (s.gender === g ? ' on' : '')} onClick={() => set({ gender: g })} aria-pressed={s.gender === g}>{g[0].toUpperCase() + g.slice(1)}</button>
          ))}
        </div>
        {err && <p className="err" role="alert">{err}</p>}
        <div className="grow"><button className="btn" style={{ width: '100%' }} disabled={!s.name.trim() || !s.gender || busy} onClick={saveProfile}>{busy ? 'Saving…' : 'Continue'}</button></div>
      </div>
    </>
  )

  if (s.stage === 'waitroom') return (
    <>
      <Top idx={2} />
      <div className="screen">
        <h2>You're in line.</h2>
        <div className="card" style={{ alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--display)', fontSize: 68, fontWeight: 900, lineHeight: 1 }}>#12</span>
          <p className="fine">Women in today: 46. Men in today: 46.</p>
        </div>
        <p className="lead">We let men and women in together, so everyone gets real chances. The line moves as women join. Women always join free.</p>
        <p className="fine">We'll text you when your spot opens.</p>
        <div className="grow"><button className="btn white" style={{ width: '100%' }} onClick={() => set({ stage: 'selfie' })}>Demo: skip the wait</button></div>
      </div>
    </>
  )

  if (s.stage === 'selfie') return (
    <>
      <Top idx={3} />
      <div className="screen">
        {checking === 'done' && <Confetti />}
        <h2>One live selfie keeps Wybr real.</h2>
        <p className="lead">It proves you're a real person. Nobody sees it until you both say yes.</p>
        <div className="avatar" style={{ width: 150, height: 150, margin: '8px auto', fontSize: 56 }} aria-hidden="true">
          {checking === 'done' ? '✓' : checking === 'busy' ? '…' : '◐'}
        </div>
        <div className="grow">
          {checking !== 'done' ? (
            <button className="btn" style={{ width: '100%' }} disabled={checking === 'busy'} onClick={() => { setChecking('busy'); setTimeout(() => setChecking('done'), 1400) }}>
              {checking === 'busy' ? 'Checking…' : 'Take selfie (demo)'}
            </button>
          ) : (
            <button className="btn" style={{ width: '100%' }} onClick={() => set({ stage: 'quiz' })}>Verified. Continue</button>
          )}
        </div>
      </div>
    </>
  )

  if (s.stage === 'quiz') {
    if (qi < QUIZ.length) {
      const q = QUIZ[qi]
      return (
        <>
          <Top idx={4 + qi} onBack={qi ? () => setQi(qi - 1) : undefined} />
          <div className="screen">
            <span className="pill">Question {qi + 1} of {QUIZ.length + 1}</span>
            <h2>{q.q}</h2>
            <div className="opts">
              {q.o.map((o) => <button key={o} className="opt" onClick={() => setQi(qi + 1)}>{o}</button>)}
            </div>
            <p className="fine grow">More questions unlock as you use Wybr. They sharpen your matches.</p>
          </div>
        </>
      )
    }
    return (
      <>
        <Top idx={7} onBack={() => setQi(QUIZ.length - 1)} />
        <div className="screen">
          <span className="pill">Question {QUIZ.length + 1} of {QUIZ.length + 1}</span>
          <h2>Where's your social battery?</h2>
          <Orb energy={s.energy} size={190} />
          <h2 style={{ textAlign: 'center' }}>{moodOf(s.energy)}</h2>
          <Dial value={s.energy} onChange={(v) => set({ energy: v })} />
          <div className="grow"><button className="btn" style={{ width: '100%' }} onClick={() => set({ stage: 'how' })}>That's me</button></div>
        </div>
      </>
    )
  }

  if (s.stage === 'how') return (
    <>
      <Top idx={8} />
      <div className="screen">
        <h2>Here's how Wybr works.</h2>
        {[['1', 'Chat blind for 10 minutes', 'No photos, no profiles. Just talk.'],
          ['2', 'Both say yes to reveal', 'A no stays private. Nobody knows.'],
          ['3', 'Pick a cafe together', 'We choose a safe public spot you both like.']].map(([n, t, d]) => (
          <div key={n} className="card" style={{ flexDirection: 'row', alignItems: 'center' }}>
            <span className="avatar" style={{ width: 46, height: 46, fontSize: 19, flex: '0 0 auto' }}>{n}</span>
            <div><h3>{t}</h3><p className="fine">{d}</p></div>
          </div>
        ))}
        <div className="grow"><button className="btn" style={{ width: '100%' }} onClick={finish}>Enter Wybr</button></div>
      </div>
    </>
  )
  return null
}
