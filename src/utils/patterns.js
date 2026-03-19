import { getBabyAgeWeeks } from './helpers.js';

// ============================================================
// SMART PATTERN DETECTION ENGINE v2
//
// Improvements over v1:
//   1. Per-pattern detection windows (not fixed 3d vs 14d)
//   2. Night/day segmentation for sleep & feed analysis
//   3. Pattern lifecycle tracking (onset → active → resolving)
//   4. Multi-pattern disambiguation (teething vs illness)
// ============================================================

// ---- HELPERS ----

const NIGHT_START = 19; // 7pm
const NIGHT_END = 7;    // 7am

const isNightEvent = (ts) => {
  const h = new Date(ts).getHours();
  return h >= NIGHT_START || h < NIGHT_END;
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

const filterWindow = (events, startDaysAgo, endDaysAgo = 0) => {
  const start = daysAgo(startDaysAgo);
  const end = endDaysAgo === 0 ? new Date() : daysAgo(endDaysAgo);
  return events.filter((e) => {
    const t = new Date(e.timestamp);
    return t >= start && t <= end;
  });
};

const avgPerDay = (arr, days) => arr.length / Math.max(days, 1);

const avgDurationPerDay = (arr, days) => arr.reduce((s, e) => s + (e.duration || 0), 0) / Math.max(days, 1);

const pctChange = (recent, baseline) => baseline > 0 ? ((recent - baseline) / baseline) * 100 : 0;

// ---- ANALYSIS BUILDER ----
// Builds feed/sleep/diaper analysis for any time window pair

const analyze = (events, recentDays, baselineStartDay, baselineEndDay) => {
  const recentWindow = filterWindow(events, recentDays);
  const baselineWindow = filterWindow(events, baselineStartDay, baselineEndDay);
  const baseDays = baselineStartDay - baselineEndDay;

  // Split by type
  const byType = (arr, type) => arr.filter((e) => e.type === type);

  // Sleep
  const recentSleep = byType(recentWindow, "sleep");
  const baseSleep = byType(baselineWindow, "sleep");
  const recentNightSleep = recentSleep.filter((e) => isNightEvent(e.timestamp));
  const baseNightSleep = baseSleep.filter((e) => isNightEvent(e.timestamp));
  const recentSleepDur = avgDurationPerDay(recentSleep, recentDays);
  const baseSleepDur = avgDurationPerDay(baseSleep, baseDays);
  const sleepDropPct = pctChange(recentSleepDur, baseSleepDur) * -1; // positive = sleep decreased
  const sleepFreqRecent = avgPerDay(recentSleep, recentDays);
  const sleepFreqBase = avgPerDay(baseSleep, baseDays);
  const nightWakeRecent = avgPerDay(recentNightSleep, recentDays);
  const nightWakeBase = avgPerDay(baseNightSleep, baseDays);
  const nightWakeIncreasePct = pctChange(nightWakeRecent, nightWakeBase);

  // Feeds
  const recentFeeds = byType(recentWindow, "feed");
  const baseFeeds = byType(baselineWindow, "feed");
  const recentNightFeeds = recentFeeds.filter((e) => isNightEvent(e.timestamp));
  const baseNightFeeds = baseFeeds.filter((e) => isNightEvent(e.timestamp));
  const feedFreqRecent = avgPerDay(recentFeeds, recentDays);
  const feedFreqBase = avgPerDay(baseFeeds, baseDays);
  const feedIncreasePct = pctChange(feedFreqRecent, feedFreqBase);
  const nightFeedIncreasePct = pctChange(
    avgPerDay(recentNightFeeds, recentDays),
    avgPerDay(baseNightFeeds, baseDays)
  );

  // Diapers
  const recentDiapers = byType(recentWindow, "diaper");
  const baseDiapers = byType(baselineWindow, "diaper");
  const recentStools = recentDiapers.filter((d) => d.content === "stool" || d.content === "both");
  const baseStools = baseDiapers.filter((d) => d.content === "stool" || d.content === "both");
  const recentColors = recentStools.map((d) => d.stoolColor).filter(Boolean);
  const baseColors = baseStools.map((d) => d.stoolColor).filter(Boolean);

  return {
    recentDays, baseDays,
    recentWindow, baselineWindow,
    // Sleep
    recentSleepDur, baseSleepDur, sleepDropPct,
    sleepFreqRecent, sleepFreqBase,
    nightWakeRecent, nightWakeBase, nightWakeIncreasePct,
    // Feeds
    feedFreqRecent, feedFreqBase, feedIncreasePct,
    nightFeedIncreasePct,
    // Diapers
    recentStools, baseStools, recentColors, baseColors,
    // Notes from recent window
    recentNotes: recentWindow.filter((e) => e.notes).map((e) => e.notes),
  };
};

// ---- PATTERN LIFECYCLE ----
// Compares current detection against previous healthLog entries
// to determine if a pattern is new, ongoing, or resolving

const getPatternLifecycle = (patternId, healthLog = []) => {
  const priorEntries = healthLog
    .filter((h) => h.patternId === patternId && h.timestamp)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (priorEntries.length === 0) return { phase: "new", daysSinceOnset: 0, priorCount: 0 };

  const firstSeen = new Date(priorEntries[priorEntries.length - 1].timestamp);
  const lastSeen = new Date(priorEntries[0].timestamp);
  const daysSinceOnset = Math.floor((Date.now() - firstSeen.getTime()) / 86400000);
  const daysSinceLastSeen = Math.floor((Date.now() - lastSeen.getTime()) / 86400000);

  // If last seen more than 3 days ago and now detected again, it's a recurrence
  if (daysSinceLastSeen > 3) return { phase: "new", daysSinceOnset: 0, priorCount: priorEntries.length };

  return { phase: "active", daysSinceOnset, priorCount: priorEntries.length };
};

const lifecycleMessage = (lifecycle, baseMessage) => {
  if (lifecycle.phase === "new" && lifecycle.priorCount > 0) {
    return baseMessage + ` (This pattern appeared before — ${lifecycle.priorCount} previous occurrence${lifecycle.priorCount > 1 ? "s" : ""}.)`;
  }
  if (lifecycle.phase === "active" && lifecycle.daysSinceOnset > 1) {
    return baseMessage + ` (Day ${lifecycle.daysSinceOnset} of this pattern.)`;
  }
  return baseMessage;
};

// ---- RESOLVING PATTERNS ----
// Checks if a previously active pattern is no longer triggering

const detectResolutions = (events, baby, healthLog = []) => {
  const resolutions = [];
  const ageWeeks = getBabyAgeWeeks(baby.birthDate);

  // Find patterns that were active in last 7 days
  const recentPatterns = (healthLog || [])
    .filter((h) => h.patternId && h.timestamp && (Date.now() - new Date(h.timestamp).getTime()) < 7 * 86400000)
    .reduce((map, h) => { map[h.patternId] = h; return map; }, {});

  // For each previously active pattern, check if it's still triggering
  // We do a lightweight check using 2-day recent vs 5-day baseline
  const a = analyze(events, 2, 14, 3);

  for (const [patternId, entry] of Object.entries(recentPatterns)) {
    let resolved = false;

    if (patternId === "sleep_regression" && a.sleepDropPct < 5 && a.nightWakeIncreasePct < 10) {
      resolved = true;
    } else if (patternId === "growth_spurt" && a.feedIncreasePct < 10) {
      resolved = true;
    } else if (patternId === "teething" && a.sleepDropPct < 5 && a.feedIncreasePct < 10) {
      resolved = true;
    } else if (patternId === "possible_illness" && a.feedIncreasePct > -10 && a.sleepDropPct < 5) {
      resolved = true;
    }

    if (resolved) {
      const daysSince = Math.floor((Date.now() - new Date(entry.timestamp).getTime()) / 86400000);
      resolutions.push({
        id: `${patternId}_resolved`,
        emoji: "✅",
        title: `${entry.title || patternId} — Resolving`,
        confidence: "good_news",
        message: `${baby.name}'s patterns are returning to normal after ${daysSince} day${daysSince !== 1 ? "s" : ""}.`,
        tips: "Great news! Things seem to be settling back into rhythm.",
        color: "#10B981",
      });
    }
  }

  return resolutions;
};

// ---- DISAMBIGUATION ----
// When both teething and illness trigger, score which is more likely

const disambiguate = (insights, ageWeeks, recentNotes) => {
  const hasTeething = insights.find((i) => i.id === "teething");
  const hasIllness = insights.find((i) => i.id === "possible_illness");

  if (!hasTeething || !hasIllness) return insights;

  // Score each hypothesis
  let teethingScore = 0;
  let illnessScore = 0;

  // Age: teething is more common 16-52 weeks
  if (ageWeeks >= 16 && ageWeeks <= 52) teethingScore += 2;

  // Notes: teething keywords vs illness keywords
  const noteText = recentNotes.join(" ").toLowerCase();
  if (/drool|biting|gum|chew/i.test(noteText)) teethingScore += 3;
  if (/fever|cold|cough|runny|congested|vomit/i.test(noteText)) illnessScore += 3;
  if (/rash/i.test(noteText)) illnessScore += 1; // could be either but more illness
  if (/fuss|irritable/i.test(noteText)) teethingScore += 1; // slight lean

  // Feed decrease = illness (teething usually increases feeds)
  if (hasIllness.signs?.includes("feeding less than usual")) illnessScore += 2;

  // If one is clearly stronger, downgrade the other
  if (teethingScore > illnessScore + 2) {
    return insights.map((i) => i.id === "possible_illness"
      ? { ...i, confidence: "unlikely", message: i.message + " (Though this looks more like teething than illness.)" }
      : i
    );
  }
  if (illnessScore > teethingScore + 2) {
    return insights.map((i) => i.id === "teething"
      ? { ...i, confidence: "unlikely", message: i.message + " (Though illness symptoms are more prominent right now.)" }
      : i
    );
  }

  // Ambiguous — flag both but note the overlap
  return insights.map((i) => {
    if (i.id === "teething" || i.id === "possible_illness") {
      return { ...i, message: i.message + " (Note: teething and mild illness can look similar — watch for fever above 38°C as the differentiator.)" };
    }
    return i;
  });
};

// ============================================================
// MAIN DETECTION — exported
// ============================================================

export const detectPatterns = (events, baby, contextNotes = [], healthLog = []) => {
  if (!baby?.birthDate || events.length < 5) return [];

  const ageWeeks = getBabyAgeWeeks(baby.birthDate);
  const insights = [];

  // Check if already noted by parent
  const activeNoteTexts = contextNotes.filter((n) => n.active).map((n) => n.text.toLowerCase());
  const alreadyNoted = (keyword) => activeNoteTexts.some((t) => t.includes(keyword.toLowerCase()));

  // ======= PATTERN: GROWTH SPURT =======
  // Fast onset — use 1-day recent vs 7-day baseline
  const spurtWeeks = [1, 2, 3, 6, 7, 12, 13, 16, 17, 24, 25, 26, 36, 37, 52, 53];
  if (spurtWeeks.includes(ageWeeks) && !alreadyNoted("growth")) {
    const a = analyze(events, 1, 8, 2);
    if (a.baselineWindow.length >= 3) {
      const signs = [];
      if (a.feedIncreasePct > 25) signs.push("feeding much more than usual");
      if (a.recentSleepDur > a.baseSleepDur * 1.15) signs.push("sleeping a bit more");
      if (a.feedFreqRecent > a.feedFreqBase + 1.5) signs.push(`${Math.round(a.feedFreqRecent)} feeds/day vs usual ${Math.round(a.feedFreqBase)}`);

      if (signs.length >= 1 && a.feedIncreasePct > 20) {
        const lc = getPatternLifecycle("growth_spurt", healthLog);
        insights.push({
          id: "growth_spurt",
          emoji: "📈",
          title: "Possible Growth Spurt",
          confidence: signs.length >= 2 ? "likely" : "possible",
          message: lifecycleMessage(lc, `${baby.name} seems hungrier than usual — this could be a growth spurt! I noticed: ${signs.join(", ")}.`),
          tips: "Feed on demand during growth spurts. They usually last 2-3 days. Baby might also be a bit fussier.",
          color: "#10B981",
          patternId: "growth_spurt",
        });
      }
    }
  }

  // ======= PATTERN: SLEEP REGRESSION =======
  // Develops over a week — use 5-day recent vs 14-day baseline
  const regressionWeeks = [15, 16, 17, 18, 19, 34, 35, 36, 37, 50, 51, 52, 53, 72, 73, 74, 75];
  if (regressionWeeks.includes(ageWeeks) && !alreadyNoted("regression")) {
    const a = analyze(events, 5, 19, 6);
    if (a.baselineWindow.length >= 3) {
      const signs = [];
      if (a.sleepDropPct > 15) signs.push("total sleep dropped significantly");
      if (a.nightWakeIncreasePct > 30) signs.push("more night wake-ups than usual");
      if (a.nightFeedIncreasePct > 20) signs.push("feeding more at night");
      // Day feeds unchanged but night disrupted = strong regression signal
      if (a.nightWakeIncreasePct > 25 && Math.abs(a.feedIncreasePct) < 15) signs.push("nights disrupted but days normal");

      if (signs.length >= 1 && a.sleepDropPct > 10) {
        const month = Math.round(ageWeeks / 4.33);
        const lc = getPatternLifecycle("sleep_regression", healthLog);
        insights.push({
          id: "sleep_regression",
          emoji: "🔄",
          title: `${month}-Month Sleep Regression`,
          confidence: signs.length >= 2 ? "likely" : "possible",
          message: lifecycleMessage(lc, `${baby.name}'s sleep has changed — this looks like the ${month}-month sleep regression. I noticed: ${signs.join(", ")}.`),
          tips: lc.daysSinceOnset > 14
            ? "You're over 2 weeks in — the worst is usually behind you. Keep holding the routine, it should improve soon."
            : lc.daysSinceOnset > 7
              ? "About a week in. This is typically the hardest stretch. Stay consistent with your routines."
              : "This is a developmental leap, not a setback. It typically lasts 2-6 weeks. Maintain your routines and it will pass.",
          color: "#7C6CF0",
          patternId: "sleep_regression",
        });
      }
    }
  }

  // ======= PATTERN: TEETHING =======
  // Gradual onset — use 3-day recent vs 14-day baseline
  if (ageWeeks >= 14 && ageWeeks <= 56 && !alreadyNoted("teething")) {
    const a = analyze(events, 3, 17, 4);
    if (a.baselineWindow.length >= 3) {
      const signs = [];
      if (a.sleepDropPct > 12) signs.push("sleeping less than usual");
      if (a.feedIncreasePct > 15) signs.push("feeding more often");
      if (a.nightWakeIncreasePct > 20) signs.push("waking more at night");
      const teethingNotes = a.recentNotes.filter((n) => /drool|biting|gum|fuss|chew/i.test(n));
      if (teethingNotes.length > 0) signs.push("notes mention drooling/fussiness");

      if (signs.length >= 2) {
        const lc = getPatternLifecycle("teething", healthLog);
        insights.push({
          id: "teething",
          emoji: "🦷",
          title: "Possible Teething",
          confidence: signs.length >= 3 ? "likely" : "possible",
          message: lifecycleMessage(lc, `${baby.name} might be teething. I noticed: ${signs.join(", ")}. This is very normal at ${ageWeeks} weeks!`),
          tips: "Offer a chilled teething ring, extra cuddles, and don't worry about slightly disrupted schedules.",
          color: "#F59E0B",
          patternId: "teething",
          signs, // pass for disambiguation
        });
      }
    }
  }

  // ======= PATTERN: STOOL COLOR CHANGE =======
  // Use 2-day recent vs 10-day baseline
  if (!alreadyNoted("stool")) {
    const a = analyze(events, 2, 12, 3);
    if (a.recentColors.length >= 2) {
      const unusualColors = a.recentColors.filter((c) => c === "green" || c === "black" || c === "red" || c === "white");
      const baseUnusual = a.baseColors.filter((c) => c === "green" || c === "black" || c === "red" || c === "white");

      if (unusualColors.length >= 2 && unusualColors.length > baseUnusual.length) {
        const counts = {};
        unusualColors.forEach((c) => { counts[c] = (counts[c] || 0) + 1; });
        const dominantColor = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

        let tip = "";
        if (dominantColor === "green") tip = "Green stools can be normal, especially with foremilk/hindmilk imbalance, teething, or a cold. Usually not concerning.";
        else if (dominantColor === "red") tip = "Red stools could indicate blood — please consult your pediatrician to be safe.";
        else if (dominantColor === "white") tip = "Pale/white stools should be checked by a doctor as they can indicate a liver issue.";
        else if (dominantColor === "black") tip = ageWeeks > 1 ? "Black stools after the newborn period should be checked by a doctor." : "Dark stools are normal in the first few days (meconium).";

        insights.push({
          id: "stool_change",
          emoji: "💩",
          title: "Stool Color Change",
          confidence: dominantColor === "red" || dominantColor === "white" ? "check_doctor" : "note",
          message: `I've noticed more ${dominantColor} stools recently compared to ${baby.name}'s usual pattern.`,
          tips: tip,
          color: dominantColor === "red" || dominantColor === "white" ? "#EF4444" : "#F59E0B",
          patternId: "stool_change",
        });
      }
    }
  }

  // ======= PATTERN: ILLNESS SIGNS =======
  // Fast onset — use 2-day recent vs 10-day baseline
  if (!alreadyNoted("sick") && !alreadyNoted("ill") && !alreadyNoted("cold") && !alreadyNoted("fever")) {
    const a = analyze(events, 2, 12, 3);
    if (a.baselineWindow.length >= 3) {
      const signs = [];
      if (a.feedFreqRecent < a.feedFreqBase * 0.7 && a.feedFreqBase > 2) signs.push("feeding less than usual");
      if (a.sleepDropPct < -20) signs.push("sleeping more than usual");
      if (a.nightWakeIncreasePct > 40) signs.push("much more night waking");
      const sickNotes = a.recentNotes.filter((n) => /fever|cold|sick|cough|runny|congested|vomit|fussy|irritable/i.test(n));
      if (sickNotes.length > 0) signs.push("notes mention illness symptoms");

      if (signs.length >= 2) {
        const lc = getPatternLifecycle("possible_illness", healthLog);
        insights.push({
          id: "possible_illness",
          emoji: "🤒",
          title: "Baby Might Not Feel Well",
          confidence: "check",
          message: lifecycleMessage(lc, `${baby.name}'s patterns have shifted. I noticed: ${signs.join(", ")}. Worth keeping an eye on.`),
          tips: lc.daysSinceOnset > 3
            ? "This has been going on for a few days. If you haven't already, it's worth checking in with your pediatrician."
            : "Monitor temperature, keep up fluids/feeds, and contact your pediatrician if symptoms worsen or baby is under 3 months with a fever.",
          color: "#EF4444",
          patternId: "possible_illness",
          signs, // pass for disambiguation
        });
      }
    }
  }

  // ---- DISAMBIGUATION ----
  const allNotes = events.filter((e) => e.notes && (Date.now() - new Date(e.timestamp).getTime()) < 3 * 86400000).map((e) => e.notes);
  const disambiguated = disambiguate(insights, ageWeeks, allNotes);

  // ---- RESOLUTIONS ----
  const resolutions = detectResolutions(events, baby, healthLog);

  // Merge: active patterns first, then resolutions
  return [...disambiguated.filter((i) => i.confidence !== "unlikely"), ...resolutions, ...disambiguated.filter((i) => i.confidence === "unlikely")];
};
