// Fake data and helpers. Replace with real backend calls in later phases.

export const CAFES = [
  { id: 'ff', name: 'Filter & Fern', area: 'Indiranagar' },
  { id: 'qc', name: 'The Quiet Cup', area: 'Koramangala' },
  { id: 'bl', name: 'Basil Lane Café', area: 'HSR Layout' },
  { id: 'cc', name: 'Chai Chapter', area: 'Jayanagar' },
  { id: 'lb', name: 'Loft Brew', area: 'Church Street' },
]
export const SLOTS = ['Fri 7:00 PM', 'Sat 4:00 PM', 'Sat 6:00 PM', 'Sun 11:00 AM', 'Sun 5:00 PM']
export const PARTNER_SLOTS = ['Sat 4:00 PM', 'Sun 11:00 AM', 'Fri 7:00 PM']
export const PARTNER_CAFES = ['bl', 'ff', 'cc']
export const STARTERS = ['Best thing you ate this week?', 'Sofa or street on a Sunday?', 'What drains you, what charges you?']
export const REPLIES = [
  'Ha, good one. Honestly a very average biryani, but it made my week.',
  'Street, if there is chai involved. You?',
  'Crowds drain me. One good friend at a slow table charges me fully.',
  'That is exactly my kind of evening.',
  'I was nervous about this. It is easier than I thought.',
]
export const TIERS = [
  { n: 'Seedling', e: '🌱', d: 'You just joined. Show up to a date to grow.' },
  { n: 'Sprout', e: '🌿', d: 'You showed up and it went well.' },
  { n: 'Grove', e: '🌳', d: 'People trust you to show up. Others see this badge, never a number.' },
]
export const KNOWN_IDS = { 'riya.k': 'Riya', 'arjun.m': 'Arjun' }
export const QUIZ = [
  { q: 'After a long week, you would rather…', o: ['Stay in and recharge', 'Have one friend over', 'Go out and find a crowd'] },
  { q: 'The best first date is…', o: ['A quiet cafe', 'A slow walk', 'Somewhere with buzz'] },
  { q: 'A pause in conversation feels…', o: ['Comfortable', 'A little awkward', 'Like my cue to talk'] },
]
export const SOON = [
  { id: 'walk', t: 'Sunrise walks', d: 'Easy loops with four new people.', e: '🌅' },
  { id: 'bad', t: 'Badminton doubles', d: 'Find a partner, book a court.', e: '🏸' },
  { id: 'gym', t: 'Gym buddy', d: 'Someone to show up with.', e: '💪' },
  { id: 'game', t: 'Board game cafes', d: 'Six strangers, one table.', e: '🎲' },
]

export const initial = {
  stage: 'welcome', name: '', gender: '', phone: '', energy: 50, checkin: null,
  tab: 'home', journey: 'none', live: true, plan: null, trust: 0, shareLoc: false, safe: false, notify: [],
}

// Colour follows energy: blue-violet (quiet) through mint to coral (lively).
export const hueOf = (e) => (e < 50 ? Math.round(235 - (e / 50) * 70) : Math.round(165 - ((e - 50) / 50) * 160))
export const moodOf = (e) => (e < 34 ? 'Quiet' : e < 67 ? 'Easy' : 'Lively')
export const fmt = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
export function untilEight() {
  const now = new Date(), t = new Date(now)
  t.setHours(20, 0, 0, 0)
  if (t <= now) t.setDate(t.getDate() + 1)
  const m = Math.round((t - now) / 60000)
  return `${Math.floor(m / 60)}h ${m % 60}m`
}
