// AI Chat — Claude & OpenAI with baby data context

export const buildContext = (state) => {
  const { baby, events, weightLog, milestones, appointments, contextNotes, healthLog } = state;
  const ageWeeks = baby?.birthDate ? Math.floor((Date.now() - new Date(baby.birthDate).getTime()) / (7 * 24 * 60 * 60 * 1000)) : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayEv = events.filter((e) => new Date(e.timestamp) >= today);
  const fmt = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const last = (type) => events.filter((e) => e.type === type).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  const activeNotes = (contextNotes || []).filter((n) => n.active);

  return `You are a warm, knowledgeable baby care assistant. Use the tracking data below. Be specific and actionable. Never stress parents about numbers being off — be encouraging. If context notes mention regressions/teething/illness, adapt your advice accordingly.

BABY: ${baby?.name || 'Baby'}, ${ageWeeks !== null ? `${ageWeeks} weeks old` : 'age unknown'}
TODAY: ${todayEv.filter((e) => e.type === 'feed').length} feeds, ${todayEv.filter((e) => e.type === 'diaper').length} diapers, ${todayEv.filter((e) => e.type === 'sleep').length} sleep sessions
LAST FEED: ${last('feed') ? fmt(last('feed').timestamp) + ' (' + last('feed').feedType + ')' : 'none today'}
LAST SLEEP: ${last('sleep') ? fmt(last('sleep').timestamp) : 'none today'}
LAST DIAPER: ${last('diaper') ? fmt(last('diaper').timestamp) + ' (' + last('diaper').content + ')' : 'none today'}
${activeNotes.length > 0 ? `\nACTIVE CONTEXT: ${activeNotes.map((n) => n.text).join(', ')} — adjust recommendations accordingly` : ''}
${(healthLog || []).length > 0 ? `\nRECENT HEALTH: ${healthLog.slice(0, 5).map((h) => h.label + ' on ' + new Date(h.timestamp).toLocaleDateString()).join(', ')}` : ''}
WEIGHT: ${weightLog.length > 0 ? weightLog[weightLog.length - 1].weight + weightLog[weightLog.length - 1].unit : 'not logged'}`;
};

export const chatWithClaude = async (messages, systemPrompt) => {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!key) throw new Error('Add VITE_ANTHROPIC_API_KEY to .env.local');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1024, system: systemPrompt, messages }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Claude API error');
  return data.content[0]?.text || '';
};

export const chatWithGPT = async (messages, systemPrompt) => {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  if (!key) throw new Error('Add VITE_OPENAI_API_KEY to .env.local');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 1024, messages: [{ role: 'system', content: systemPrompt }, ...messages] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'OpenAI API error');
  return data.choices[0]?.message?.content || '';
};

export const sendChat = async (messages, state, provider = 'claude') => {
  const ctx = buildContext(state);
  return provider === 'claude' ? chatWithClaude(messages, ctx) : chatWithGPT(messages, ctx);
};
