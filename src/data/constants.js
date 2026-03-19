// ============================================================
// STATIC DATA — Activities, Milestones, Vaccinations
// ============================================================

export const INITIAL_STATE = {
  baby: null,
  parentName: "",
  familyCode: "",
  events: [],
  appointments: [],
  milestones: [],
  weightLog: [],
  calendarEvents: [],
  chatMessages: [],
  activeTimers: {},
  contextNotes: [],
  healthLog: [],
  settings: { notificationInterval: 150, aiProvider: "claude" },
};

// ============================================================
// AGE-BASED ACTIVITY RECOMMENDATIONS
// ============================================================
export const DAILY_ACTIVITIES = {
  0: [
    { title: "Tummy Time", duration: 3, icon: "🤸", description: "Place baby on tummy on a firm surface. Stay close and engage." },
    { title: "Eye Tracking", duration: 5, icon: "👀", description: "Hold a colorful object 8-12 inches from baby's face. Move slowly side to side." },
    { title: "Skin to Skin", duration: 15, icon: "🤗", description: "Hold baby against your bare chest. Promotes bonding and regulation." },
    { title: "Gentle Massage", duration: 5, icon: "✋", description: "Use gentle strokes on arms, legs, and tummy with baby-safe oil." },
    { title: "Talk & Sing", duration: 10, icon: "🎵", description: "Narrate your day or sing softly. Baby recognizes your voice." },
  ],
  4: [
    { title: "Tummy Time", duration: 5, icon: "🤸", description: "Aim for multiple short sessions. Use a mirror or toy to engage." },
    { title: "Rattle Play", duration: 5, icon: "🎶", description: "Shake a rattle gently near each ear. Helps auditory development." },
    { title: "Black & White Cards", duration: 5, icon: "🃏", description: "Show high-contrast cards at 8-12 inches. Baby's vision is developing." },
    { title: "Bicycle Legs", duration: 3, icon: "🚲", description: "Gently move baby's legs in a cycling motion. Helps with gas and strengthens muscles." },
    { title: "Mirror Time", duration: 5, icon: "🪞", description: "Hold baby in front of a mirror. They'll be fascinated by faces." },
  ],
  8: [
    { title: "Tummy Time", duration: 10, icon: "🤸", description: "Place toys just out of reach to encourage reaching and mini push-ups." },
    { title: "Reach & Grasp", duration: 5, icon: "🖐️", description: "Offer colorful toys for baby to reach and grab. Builds hand-eye coordination." },
    { title: "Reading Time", duration: 10, icon: "📖", description: "Read a board book with big pictures. Point to images and name them." },
    { title: "Supported Sitting", duration: 5, icon: "🪑", description: "Sit baby in your lap facing out. Let them look around their environment." },
    { title: "Texture Exploration", duration: 5, icon: "🧸", description: "Let baby touch different textures: soft, bumpy, smooth, crinkly." },
    { title: "Peekaboo", duration: 5, icon: "🙈", description: "Play peekaboo with a cloth. Teaches object permanence." },
  ],
  12: [
    { title: "Tummy Time", duration: 15, icon: "🤸", description: "Encourage rolling and reaching. Place toys around them in a circle." },
    { title: "Splash Time", duration: 10, icon: "💦", description: "During bath, let baby splash and play with cups. Cause and effect learning." },
    { title: "Singing with Actions", duration: 5, icon: "🎵", description: "Sing songs with hand motions. Baby starts to anticipate movements." },
    { title: "Floor Play", duration: 15, icon: "🏠", description: "Supervised play on a play mat. Let baby roll, reach and explore." },
    { title: "Object Drop", duration: 5, icon: "🧊", description: "Let baby drop safe objects into a container. Teaches cause and effect." },
    { title: "Babble Conversations", duration: 5, icon: "💬", description: "When baby babbles, respond. Take turns 'talking.' Builds communication." },
  ],
  16: [
    { title: "Tummy Time", duration: 20, icon: "🤸", description: "Baby should be lifting chest off floor. Encourage pre-crawling movements." },
    { title: "Sitting Practice", duration: 10, icon: "🪑", description: "Support baby in sitting position with pillows around. Build core strength." },
    { title: "Teething Toys", duration: 10, icon: "🦷", description: "Offer safe teething toys for exploration and gum relief." },
    { title: "Music & Dance", duration: 5, icon: "💃", description: "Play music and gently bounce or sway with baby. Rhythm awareness." },
    { title: "Object Permanence", duration: 5, icon: "🎩", description: "Hide a toy under a cloth. Baby learns objects still exist when hidden." },
    { title: "Outdoor Walk", duration: 15, icon: "🌳", description: "Walk outside. Point to trees, birds, cars. Nature stimulates all senses." },
  ],
  24: [
    { title: "Tummy Time / Crawling", duration: 30, icon: "🤸", description: "Encourage crawling by placing toys slightly out of reach." },
    { title: "Finger Foods", duration: 10, icon: "🥦", description: "Practice self-feeding with safe finger foods. Develops fine motor skills." },
    { title: "Stacking", duration: 10, icon: "🧱", description: "Stack blocks or cups together. Baby may enjoy knocking them down." },
    { title: "Clapping Games", duration: 5, icon: "👏", description: "Pat-a-cake and clapping games. Social interaction and rhythm." },
    { title: "Peek-a-Boo Variations", duration: 5, icon: "🙈", description: "Hide behind furniture, use blankets. Baby anticipates and laughs." },
    { title: "Ball Rolling", duration: 10, icon: "⚽", description: "Sit facing baby and roll a ball back and forth." },
  ],
  36: [
    { title: "Cruising Practice", duration: 15, icon: "🚶", description: "Let baby pull up and cruise along furniture. Build leg strength." },
    { title: "Shape Sorter", duration: 10, icon: "🔷", description: "Practice putting shapes in matching holes. Problem-solving skills." },
    { title: "Dancing", duration: 10, icon: "💃", description: "Play upbeat music. Baby may bounce, clap, and try to dance." },
    { title: "Picture Book Time", duration: 10, icon: "📚", description: "Point to animals and objects. Ask 'where is the cat?' Baby may point." },
    { title: "Push Toys", duration: 10, icon: "🚗", description: "Provide push-along toys to encourage walking. Stay close for support." },
    { title: "Water Play", duration: 10, icon: "💧", description: "Fill containers, pour water, splash. Teaches volume and cause-effect." },
  ],
  48: [
    { title: "Walking Practice", duration: 15, icon: "🚶", description: "Encourage walking with support or independently. Celebrate every step." },
    { title: "Stacking 3+ Blocks", duration: 10, icon: "🧱", description: "Build towers of 3+ blocks. Develops spatial awareness and patience." },
    { title: "Simple Puzzles", duration: 10, icon: "🧩", description: "Simple 2-3 piece puzzles. Teaches shape matching and persistence." },
    { title: "Crayon Scribbling", duration: 10, icon: "🖍️", description: "Let baby hold a large crayon and scribble on paper. First art!" },
    { title: "Naming Game", duration: 10, icon: "🏷️", description: "Point to body parts, objects, people. 'Where is your nose?' Baby learns to point." },
    { title: "Sensory Bin", duration: 15, icon: "🫧", description: "Fill a bin with rice, pasta, or water beads. Supervised tactile exploration." },
  ],
};

export const getActivitiesForAge = (ageWeeks) => {
  const keys = Object.keys(DAILY_ACTIVITIES).map(Number).sort((a, b) => a - b);
  let selectedKey = keys[0];
  for (const k of keys) {
    if (ageWeeks >= k) selectedKey = k;
  }
  return DAILY_ACTIVITIES[selectedKey] || DAILY_ACTIVITIES[0];
};

// ============================================================
// MILESTONE DATA (WHO-based)
// ============================================================
export const WHO_MILESTONES = [
  { id: "m1", title: "Lifts head briefly", category: "physical", weekStart: 0, weekEnd: 4, description: "When on tummy, briefly lifts head" },
  { id: "m2", title: "Responds to sounds", category: "cognitive", weekStart: 0, weekEnd: 4, description: "Startles or quiets to loud sounds" },
  { id: "m3", title: "Focuses on faces", category: "social", weekStart: 0, weekEnd: 6, description: "Looks at faces, especially parents" },
  { id: "m4", title: "Makes soft sounds", category: "language", weekStart: 2, weekEnd: 6, description: "Coos and makes gurgling sounds" },
  { id: "m5", title: "Holds head at 45°", category: "physical", weekStart: 4, weekEnd: 8, description: "Lifts head 45 degrees on tummy" },
  { id: "m6", title: "Follows objects", category: "cognitive", weekStart: 4, weekEnd: 8, description: "Tracks moving objects with eyes" },
  { id: "m7", title: "Social smile", category: "social", weekStart: 4, weekEnd: 10, description: "Smiles at people intentionally" },
  { id: "m8", title: "Self-soothing", category: "social", weekStart: 4, weekEnd: 12, description: "Brings hands to mouth to self-soothe" },
  { id: "m9", title: "Pushes up on arms", category: "physical", weekStart: 8, weekEnd: 14, description: "Pushes up on forearms during tummy time" },
  { id: "m10", title: "Opens/closes hands", category: "physical", weekStart: 8, weekEnd: 14, description: "Opens and closes hands, bats at toys" },
  { id: "m11", title: "Recognizes parents", category: "cognitive", weekStart: 8, weekEnd: 14, description: "Recognizes familiar people at a distance" },
  { id: "m12", title: "Babbles & coos", category: "language", weekStart: 8, weekEnd: 16, description: "Makes vowel sounds (ah, eh, oh)" },
  { id: "m13", title: "Holds head steady", category: "physical", weekStart: 12, weekEnd: 18, description: "Holds head steady without support" },
  { id: "m14", title: "Grasps toys", category: "physical", weekStart: 12, weekEnd: 18, description: "Reaches for and grasps toys" },
  { id: "m15", title: "Laughs", category: "social", weekStart: 12, weekEnd: 20, description: "Laughs out loud" },
  { id: "m16", title: "Copies movements", category: "cognitive", weekStart: 12, weekEnd: 20, description: "Copies some facial expressions" },
  { id: "m17", title: "Rolls over", category: "physical", weekStart: 16, weekEnd: 26, description: "Rolls from tummy to back" },
  { id: "m18", title: "Brings objects to mouth", category: "cognitive", weekStart: 16, weekEnd: 24, description: "Explores objects by mouthing them" },
  { id: "m19", title: "Responds to name", category: "language", weekStart: 20, weekEnd: 30, description: "Turns head when name is called" },
  { id: "m20", title: "Sits with support", category: "physical", weekStart: 16, weekEnd: 26, description: "Sits with help or propped up" },
  { id: "m21", title: "Sits without support", category: "physical", weekStart: 24, weekEnd: 36, description: "Sits independently without support" },
  { id: "m22", title: "Crawls", category: "physical", weekStart: 26, weekEnd: 40, description: "Moves forward by crawling" },
  { id: "m23", title: "Transfers objects", category: "cognitive", weekStart: 24, weekEnd: 36, description: "Passes objects between hands" },
  { id: "m24", title: "Stranger anxiety", category: "social", weekStart: 26, weekEnd: 40, description: "Shows wariness around strangers" },
  { id: "m25", title: "Says mama/dada", category: "language", weekStart: 28, weekEnd: 44, description: "Babbles mama, dada (non-specific)" },
  { id: "m26", title: "Pincer grasp", category: "physical", weekStart: 32, weekEnd: 44, description: "Picks up small objects with thumb and finger" },
  { id: "m27", title: "Pulls to stand", category: "physical", weekStart: 36, weekEnd: 48, description: "Pulls up to standing position" },
  { id: "m28", title: "Cruises furniture", category: "physical", weekStart: 36, weekEnd: 52, description: "Walks while holding onto furniture" },
  { id: "m29", title: "First words", category: "language", weekStart: 40, weekEnd: 56, description: "Says 1-3 words with meaning" },
  { id: "m30", title: "Points to objects", category: "cognitive", weekStart: 36, weekEnd: 52, description: "Points to things of interest" },
  { id: "m31", title: "Waves bye-bye", category: "social", weekStart: 36, weekEnd: 48, description: "Waves goodbye when prompted" },
  { id: "m32", title: "First steps", category: "physical", weekStart: 44, weekEnd: 60, description: "Takes first independent steps" },
  { id: "m33", title: "Walks independently", category: "physical", weekStart: 48, weekEnd: 72, description: "Walks well without help" },
  { id: "m34", title: "Stacks 2 blocks", category: "cognitive", weekStart: 52, weekEnd: 72, description: "Stacks two or more blocks" },
  { id: "m35", title: "10+ words", category: "language", weekStart: 56, weekEnd: 78, description: "Uses 10 or more words" },
  { id: "m36", title: "Drinks from cup", category: "physical", weekStart: 48, weekEnd: 72, description: "Drinks from a cup with help" },
];

// ============================================================
// VACCINATION SCHEDULE (Egypt + International)
// ============================================================
export const VACCINATION_SCHEDULE_BASE = [
  { name: "Hepatitis B (1st dose)", weekDue: 0, description: "At birth" },
  { name: "BCG", weekDue: 0, description: "At birth", region: "egypt" },
  { name: "OPV (Zero dose)", weekDue: 0, description: "At birth", region: "egypt" },
  { name: "Hepatitis B (2nd dose)", weekDue: 4, description: "1 month" },
  { name: "DTaP (1st dose)", weekDue: 8, description: "2 months" },
  { name: "IPV (1st dose)", weekDue: 8, description: "2 months" },
  { name: "Hib (1st dose)", weekDue: 8, description: "2 months" },
  { name: "PCV13 (1st dose)", weekDue: 8, description: "2 months" },
  { name: "Rotavirus (1st dose)", weekDue: 8, description: "2 months" },
  { name: "OPV (1st dose)", weekDue: 8, description: "2 months", region: "egypt" },
  { name: "DTaP (2nd dose)", weekDue: 16, description: "4 months" },
  { name: "IPV (2nd dose)", weekDue: 16, description: "4 months" },
  { name: "Hib (2nd dose)", weekDue: 16, description: "4 months" },
  { name: "PCV13 (2nd dose)", weekDue: 16, description: "4 months" },
  { name: "Rotavirus (2nd dose)", weekDue: 16, description: "4 months" },
  { name: "OPV (2nd dose)", weekDue: 16, description: "4 months", region: "egypt" },
  { name: "DTaP (3rd dose)", weekDue: 24, description: "6 months" },
  { name: "Hepatitis B (3rd dose)", weekDue: 24, description: "6 months" },
  { name: "OPV (3rd dose)", weekDue: 24, description: "6 months", region: "egypt" },
  { name: "Influenza (annual)", weekDue: 26, description: "6 months+" },
  { name: "PCV13 (booster)", weekDue: 36, description: "9 months", region: "egypt" },
  { name: "MMR (1st dose)", weekDue: 52, description: "12 months" },
  { name: "Varicella (1st dose)", weekDue: 52, description: "12 months" },
  { name: "Hepatitis A (1st dose)", weekDue: 52, description: "12 months" },
  { name: "Hib (booster)", weekDue: 56, description: "12-15 months" },
  { name: "OPV (booster)", weekDue: 72, description: "18 months", region: "egypt" },
  { name: "DTaP (4th dose)", weekDue: 72, description: "18 months" },
  { name: "MMR (2nd dose)", weekDue: 72, description: "18 months", region: "egypt" },
];

export const STANDARD_CHECKUPS = [
  { week: 1, title: "Newborn Checkup" },
  { week: 4, title: "1-Month Checkup" },
  { week: 8, title: "2-Month Checkup" },
  { week: 16, title: "4-Month Checkup" },
  { week: 24, title: "6-Month Checkup" },
  { week: 36, title: "9-Month Checkup" },
  { week: 52, title: "12-Month Checkup" },
  { week: 72, title: "18-Month Checkup" },
  { week: 104, title: "2-Year Checkup" },
];
