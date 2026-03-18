const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const msg = admin.messaging();

const ANTHROPIC_KEY = defineSecret('ANTHROPIC_API_KEY');
const OPENAI_KEY = defineSecret('OPENAI_API_KEY');

// AI Chat Proxy
exports.aiChat = onCall({ secrets: [ANTHROPIC_KEY, OPENAI_KEY], cors: true }, async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Login required');
  const { messages, babyContext, provider = 'claude' } = req.data;
  try {
    if (provider === 'claude') {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY.value(), 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1024, system: babyContext, messages }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || 'API error');
      return { response: d.content[0]?.text || '' };
    } else {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY.value()}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 1024, messages: [{ role: 'system', content: babyContext }, ...messages] }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || 'API error');
      return { response: d.choices[0]?.message?.content || '' };
    }
  } catch (e) { throw new HttpsError('internal', e.message); }
});

// Notify partner on new event
exports.onNewEvent = onDocumentCreated('families/{familyId}/events/{eventId}', async (event) => {
  const data = event.data.data();
  const fSnap = await db.doc(`families/${event.params.familyId}`).get();
  if (!fSnap.exists) return;
  const family = fSnap.data();
  const name = family.baby?.name || 'Baby';
  let title, body;
  switch (data.type) {
    case 'feed': title = `🍼 ${name} was fed`; body = data.feedType + (data.side ? ` (${data.side})` : ''); break;
    case 'diaper': title = `🧷 Diaper changed`; body = data.content; break;
    case 'sleep': title = `😴 Sleep logged`; body = data.duration ? `${Math.round(data.duration / 60000)}min` : 'Started'; break;
    default: return;
  }
  const tokens = [];
  for (const uid of family.members) {
    const u = await db.doc(`users/${uid}`).get();
    if (u.exists && u.data().fcmTokens) tokens.push(...u.data().fcmTokens);
  }
  if (tokens.length > 0) await msg.sendEachForMulticast({ notification: { title, body }, tokens }).catch(() => {});
});

// Appointment reminder (hourly)
exports.appointmentReminder = onSchedule({ schedule: '0 * * * *', timeZone: 'Africa/Cairo' }, async () => {
  const now = Date.now();
  const in1h = now + 3600000;
  const in24h = now + 86400000;
  const families = await db.collection('families').get();
  for (const fDoc of families.docs) {
    const family = fDoc.data();
    const appts = await db.collection(`families/${fDoc.id}/appointments`).where('completed', '==', false).get();
    for (const aDoc of appts.docs) {
      const a = aDoc.data();
      const aTime = new Date(`${a.date}T${a.time || '09:00'}`).getTime();
      let notify = false, text = '';
      if (Math.abs(aTime - in24h) < 1800000) { notify = true; text = `Tomorrow: ${a.title}`; }
      if (Math.abs(aTime - in1h) < 1800000) { notify = true; text = `In 1 hour: ${a.title}`; }
      if (!notify) continue;
      const tokens = [];
      for (const uid of family.members) {
        const u = await db.doc(`users/${uid}`).get();
        if (u.exists && u.data().fcmTokens) tokens.push(...u.data().fcmTokens);
      }
      if (tokens.length > 0) await msg.sendEachForMulticast({ notification: { title: `📅 ${family.baby?.name || 'Baby'}`, body: text }, tokens }).catch(() => {});
    }
  }
});
