// ============================================================
// EVIDENCE-BASED DEVELOPMENTAL ACTIVITIES (0-12 months)
//
// Categories:
//   bonding   — attachment, oxytocin, secure base
//   motor     — gross & fine motor
//   cognitive — problem solving, object permanence, cause & effect
//   language  — receptive & expressive communication
//   sensory   — vestibular, tactile, visual, auditory
//   social    — turn-taking, imitation, social cognition
// ============================================================

export const ACTIVITY_CATEGORIES = {
  bonding:   { label: "Bonding",   emoji: "💛", color: "#EC4899" },
  motor:     { label: "Motor",     emoji: "🤸", color: "#10B981" },
  cognitive: { label: "Cognitive", emoji: "🧠", color: "#7C6CF0" },
  language:  { label: "Language",  emoji: "💬", color: "#F59E0B" },
  sensory:   { label: "Sensory",   emoji: "👁️", color: "#06B6D4" },
  social:    { label: "Social",    emoji: "🤝", color: "#F97316" },
};

export const DEV_ACTIVITIES = {
  // 0-2 WEEKS — Newborn
  0: [
    { title: "Skin-to-Skin (Kangaroo Care)", category: "bonding", duration: 60, icon: "🤗", description: "Hold baby on bare chest, skin to skin, for at least 60 minutes. Aim for at least once daily.", science: "Releases oxytocin in both parent and baby. Regulates baby's heart rate, breathing, and body temperature. WHO and AAP recommend daily kangaroo care for the first weeks — proven to improve breastfeeding, reduce crying, and strengthen attachment.", whoCanDo: "Both parents — fathers benefit too." },
    { title: "Eye Contact During Feeds", category: "bonding", duration: 10, icon: "👀", description: "Hold baby 8-12 inches from your face during feeds. Make eye contact.", science: "Babies are born able to focus 8-12 inches away — exactly the distance from breast to mother's face. Eye contact triggers oxytocin and is the foundation of secure attachment (Bowlby).", whoCanDo: "Whoever is feeding." },
    { title: "Talk & Narrate (Parentese)", category: "language", duration: 15, icon: "🗣️", description: "Describe what you're doing in higher pitch, slower tempo, exaggerated tones.", science: "Parentese is grammatically full speech. Research shows infants exposed to parentese have larger vocabularies at age 2. Simplest, most powerful language intervention.", whoCanDo: "Anyone interacting with baby." },
    { title: "Gentle Touch & Stroking", category: "bonding", duration: 5, icon: "✋", description: "Stroke baby's arms, legs, back gently with slow predictable motions.", science: "Touch is the most developed sense at birth. Gentle stroking releases serotonin and dopamine, lowers cortisol.", whoCanDo: "Both parents, caregiver." },
    { title: "Tummy Time (Supervised)", category: "motor", duration: 3, icon: "🤸", description: "Place baby on tummy on a firm surface for 1-3 minutes, multiple times a day. Stay close.", science: "Strengthens neck, shoulder, and core muscles. AAP recommends starting from day 1. Prevents flat head syndrome.", whoCanDo: "Anyone supervising — never leave alone." },
    { title: "High-Contrast Black & White Cards", category: "sensory", duration: 5, icon: "🃏", description: "Show black and white pattern cards 8-12 inches from baby's face. Hold each pattern for 30 seconds.", science: "Newborn vision is 20/400 — they can only see high-contrast patterns clearly. Stimulates the visual cortex during a critical development window.", whoCanDo: "Anyone." },
    { title: "Rattle Near Each Ear", category: "sensory", duration: 5, icon: "🎶", description: "Gently shake a soft rattle 6-12 inches from each side of baby's head. Wait for them to react.", science: "Newborns can hear well at birth. Sound localization is an early auditory milestone — supports brain wiring for hearing.", whoCanDo: "Anyone." },
    { title: "Respond to Every Cry", category: "bonding", duration: 0, icon: "💛", description: "Respond to every cry quickly and consistently. You cannot spoil a newborn.", science: "Bowlby & Ainsworth: consistent response in the first 6 months predicts secure attachment, which predicts better mental health and resilience for life.", whoCanDo: "All caregivers." },
  ],

  // 2-4 WEEKS
  2: [
    { title: "Skin-to-Skin (Kangaroo Care)", category: "bonding", duration: 60, icon: "🤗", description: "Continue daily skin-to-skin sessions, ideally 60+ minutes.", science: "Continues to regulate baby's nervous system. Especially important for weight catch-up — increases milk transfer.", whoCanDo: "Both parents." },
    { title: "Talk & Narrate (Parentese)", category: "language", duration: 20, icon: "🗣️", description: "Talk to baby throughout daily routines using high pitch, slow speech, exaggerated tones.", science: "Studies show babies exposed to >15 min parentese daily have significantly larger vocabularies by age 2.", whoCanDo: "Everyone." },
    { title: "Tummy Time", category: "motor", duration: 5, icon: "🤸", description: "Multiple short sessions (1-2 min each), total ~5 min/day.", science: "Builds neck strength needed for head control. AAP: 'every day, multiple times'.", whoCanDo: "Anyone supervising." },
    { title: "Eye Tracking with Object", category: "sensory", duration: 5, icon: "👀", description: "Hold a high-contrast object 8-12 inches from baby's face. Move slowly side to side, then up and down.", science: "Develops smooth pursuit eye movements — a precursor to reading skills later in life.", whoCanDo: "Anyone." },
    { title: "Infant Massage", category: "bonding", duration: 10, icon: "💆", description: "Gentle strokes on arms, legs, tummy with baby-safe oil. Stop if fussy.", science: "Infant massage research shows: lower cortisol, better sleep, improved digestion, stronger parent-infant bond.", whoCanDo: "Both parents." },
    { title: "Black & White Pattern Cards", category: "sensory", duration: 5, icon: "🃏", description: "Continue showing high-contrast cards. Try patterns with simple faces.", science: "Babies are hardwired to recognize face-like patterns from birth. Strengthens visual cortex.", whoCanDo: "Anyone." },
    { title: "Sing Lullabies", category: "language", duration: 10, icon: "🎵", description: "Sing simple lullabies. Same songs daily. Rhythm and melody both matter.", science: "Music activates multiple brain regions. Repetition helps babies recognize patterns — a precursor to language learning.", whoCanDo: "Everyone." },
  ],

  // 4-8 WEEKS — first smiles
  4: [
    { title: "Skin-to-Skin Time", category: "bonding", duration: 30, icon: "🤗", description: "Continue daily skin-to-skin. Now great for relaxation moments.", science: "Continues oxytocin release. Father skin-to-skin proven to improve father-infant attachment scores at 3 months.", whoCanDo: "Both parents." },
    { title: "Smile Conversations", category: "social", duration: 10, icon: "😊", description: "When baby smiles, smile back. Make exaggerated happy faces. Wait for their response.", science: "First social smiles appear around 6-8 weeks. Smiling back is 'serve and return' (Harvard) that builds neural pathways for emotional and social skills.", whoCanDo: "Everyone." },
    { title: "Tummy Time with Mirror", category: "motor", duration: 10, icon: "🤸", description: "Place an unbreakable baby mirror in front during tummy time. Babies push up to see themselves.", science: "Mirrors motivate babies to lift their head. Combines motor work with visual interest.", whoCanDo: "Anyone supervising." },
    { title: "Sing Songs & Lullabies", category: "language", duration: 10, icon: "🎵", description: "Sing simple songs repeatedly. Rhyme and rhythm matter more than the song.", science: "Music activates multiple brain regions simultaneously. Repetitive lullabies help babies recognize patterns.", whoCanDo: "Everyone." },
    { title: "Bicycle Legs", category: "motor", duration: 5, icon: "🚲", description: "Gently move baby's legs in cycling motion during diaper changes.", science: "Helps with gas, strengthens hip flexors and abdominals — preparation for crawling.", whoCanDo: "Anyone changing diapers." },
    { title: "Mirror Time", category: "cognitive", duration: 5, icon: "🪞", description: "Hold baby in front of an unbreakable mirror. Babies are fascinated by faces.", science: "Babies are hardwired to attend to faces. Mirror time supports early self-recognition.", whoCanDo: "Anyone." },
    { title: "Wrist & Ankle Rattles", category: "sensory", duration: 5, icon: "🔔", description: "Soft rattles on wrists or ankles. Baby discovers their own movement makes sound.", science: "Early cause-and-effect learning. Helps baby connect their body to the world.", whoCanDo: "Anyone supervising." },
    { title: "Show Colorful Toys", category: "sensory", duration: 5, icon: "🎨", description: "Hold colorful toys 12 inches from baby's face. Let them gaze.", science: "Color vision develops 2-4 months. Bright primary colors are now visible and stimulating.", whoCanDo: "Anyone." },
  ],

  // 8-12 WEEKS — hand discovery
  8: [
    { title: "Tummy Time", category: "motor", duration: 15, icon: "🤸", description: "15+ minutes spread across the day. Place toys to encourage reaching.", science: "By 3 months baby should push up on forearms. Critical for shoulder stability and crawling later.", whoCanDo: "Anyone supervising." },
    { title: "Hand Discovery", category: "motor", duration: 10, icon: "🖐️", description: "Encourage baby to look at and touch their own hands. Bring hands to midline.", science: "Baby is discovering their hands! Foundation for reaching and grasping skills.", whoCanDo: "Anyone." },
    { title: "Babble Conversations", category: "language", duration: 10, icon: "💬", description: "When baby coos, copy the sound. Pause. Wait for them to respond. Repeat.", science: "Classic 'serve and return' (Harvard). Teaches turn-taking — foundation of conversation. Strengthens language brain regions.", whoCanDo: "Everyone." },
    { title: "Face-to-Face Play", category: "social", duration: 10, icon: "👶", description: "Hold baby facing you. Talk, smile, stick out tongue, raise eyebrows. Wait for imitation.", science: "Babies start imitating facial expressions around 8-12 weeks. Builds social cognition and mirror neurons.", whoCanDo: "Both parents." },
    { title: "Read a Board Book", category: "language", duration: 10, icon: "📖", description: "Read any book aloud. Show pictures. Use animated voice. Even 5-minute sessions count.", science: "Daily reading from infancy is the strongest single predictor of literacy and academic success (AAP).", whoCanDo: "Everyone." },
    { title: "Track Moving Objects", category: "sensory", duration: 5, icon: "👀", description: "Move a colorful toy slowly across baby's field of vision. Watch them follow.", science: "Visual tracking matures around 3 months. Strengthens eye muscles and visual-motor coordination.", whoCanDo: "Anyone." },
    { title: "Soft Rattle Play", category: "cognitive", duration: 5, icon: "🪀", description: "Place a soft rattle in baby's hand. Help them shake it. They'll start to discover cause and effect.", science: "Voluntary grasping starts around 3 months. Connecting movement to sound builds early cognition.", whoCanDo: "Anyone." },
    { title: "Skin-to-Skin", category: "bonding", duration: 20, icon: "🤗", description: "Continue regular skin-to-skin. Especially good before naps.", science: "Oxytocin release continues to benefit both parent and baby through the first year.", whoCanDo: "Both parents." },
  ],

  // 12-16 WEEKS — reaching, laughing
  12: [
    { title: "Tummy Time + Reaching Toys", category: "motor", duration: 20, icon: "🤸", description: "Place toys just out of reach during tummy time. Encourage reaching and pushing up.", science: "Reaching during tummy time builds motor planning needed for rolling and eventually crawling.", whoCanDo: "Anyone supervising." },
    { title: "Reach & Grasp Practice", category: "motor", duration: 10, icon: "🖐️", description: "Offer rattles, soft toys, lightweight objects within arm's reach. Let baby grab.", science: "Grasping is the foundation of all fine motor skills — eventually leading to writing and self-feeding.", whoCanDo: "Anyone." },
    { title: "Daily Reading", category: "language", duration: 15, icon: "📖", description: "Read daily. Point to pictures. Name objects clearly. Use voices.", science: "Babies who are read to daily hear ~1 million more words by age 5. Shapes brain architecture for language.", whoCanDo: "Everyone." },
    { title: "Laughing Games", category: "social", duration: 10, icon: "😄", description: "Make silly sounds, gentle tickles, blow raspberries. Find what makes baby laugh.", science: "Laughter releases endorphins in both baby and caregiver — strengthens the bond.", whoCanDo: "Everyone." },
    { title: "Supported Sitting", category: "motor", duration: 5, icon: "🪑", description: "Sit baby in your lap facing out. Support their core. Let them look around.", science: "Builds head control and core strength needed for independent sitting around 6 months.", whoCanDo: "Anyone." },
    { title: "Texture Exploration", category: "sensory", duration: 5, icon: "🧸", description: "Let baby touch soft, bumpy, smooth, crinkly fabrics. Name each texture.", science: "Tactile exploration builds neural pathways in the somatosensory cortex. Combined with naming, also builds vocabulary.", whoCanDo: "Anyone." },
    { title: "Crinkle Toys", category: "cognitive", duration: 5, icon: "📜", description: "Offer crinkly fabric toys. Let baby squeeze and listen to the sound.", science: "Cause-and-effect: squeeze → sound. One of the earliest cognitive discoveries.", whoCanDo: "Anyone." },
    { title: "Soft Music & Movement", category: "sensory", duration: 10, icon: "🎼", description: "Play soft music while gently rocking or dancing with baby in your arms.", science: "Vestibular input (movement) + auditory input strengthens multiple sensory systems at once.", whoCanDo: "Anyone." },
  ],

  // 16-20 WEEKS — rolling
  16: [
    { title: "Rolling Practice", category: "motor", duration: 10, icon: "🔄", description: "Place baby on back, dangle a toy to one side to encourage rolling. Don't force it.", science: "Rolling is the first independent mobility milestone. Practice helps baby integrate motor planning.", whoCanDo: "Anyone supervising." },
    { title: "Reading with Pointing", category: "language", duration: 15, icon: "📖", description: "Read simple books. Point to pictures and name them. 'Look, a dog!'", science: "Pointing-and-naming is one of the strongest predictors of vocabulary growth. Builds joint attention.", whoCanDo: "Everyone." },
    { title: "Object Pass Game", category: "cognitive", duration: 10, icon: "🪀", description: "Hand baby a toy. Watch them grasp it. Take it back gently. Hand it again.", science: "Builds anticipation, turn-taking, and reinforces grasping skill. A serve-and-return interaction.", whoCanDo: "Anyone." },
    { title: "Songs with Hand Motions", category: "language", duration: 10, icon: "🎵", description: "Sing 'Itsy Bitsy Spider', 'Wheels on the Bus' with hand actions. Repeat the same songs.", science: "Repetition with motion teaches anticipation and motor patterns. Multimodal learning is more effective.", whoCanDo: "Everyone." },
    { title: "Skin-to-Skin", category: "bonding", duration: 20, icon: "🤗", description: "Continue regular skin-to-skin time. Especially before bed.", science: "Bonding through touch remains valuable through the first year. Helps with sleep regulation.", whoCanDo: "Both parents." },
    { title: "Mirror Play", category: "cognitive", duration: 5, icon: "🪞", description: "Sit with baby in front of a mirror. Point to features: 'eyes', 'nose', 'mouth'.", science: "Builds body awareness — a precursor to self-recognition and self-concept.", whoCanDo: "Anyone." },
    { title: "Teething Toys", category: "sensory", duration: 10, icon: "🦷", description: "Offer safe teething rings of different textures. Cool (not frozen) ones soothe gums.", science: "Oral exploration is a major sensory channel at this age. Different textures stimulate the mouth's nerve endings.", whoCanDo: "Anyone." },
    { title: "Bouncing on Lap", category: "motor", duration: 5, icon: "🦘", description: "Hold baby securely under arms and gently bounce on your lap. They'll start pushing with legs.", science: "Strengthens leg muscles, builds vestibular input, and prepares for standing.", whoCanDo: "Anyone." },
  ],

  // 20-26 WEEKS — sitting
  20: [
    { title: "Sitting Practice", category: "motor", duration: 15, icon: "🪑", description: "Sit baby on the floor between your legs or with pillows. Let them practice balance.", science: "Independent sitting unlocks a new view of the world. Strengthens core, prepares for crawling.", whoCanDo: "Anyone supervising." },
    { title: "Daily Reading", category: "language", duration: 15, icon: "📖", description: "Read interactive books with flaps and textures. Name everything you see.", science: "Receptive vocabulary explodes between 6-9 months. Books are the highest-density language input.", whoCanDo: "Everyone." },
    { title: "Peek-a-Boo", category: "cognitive", duration: 5, icon: "🙈", description: "Cover your face, then reveal. Or hide behind furniture. Baby will start to laugh.", science: "Teaches object permanence — the idea that things still exist when out of sight (Piaget). Major cognitive milestone.", whoCanDo: "Everyone." },
    { title: "Bath Splash Play", category: "sensory", duration: 10, icon: "💦", description: "During bath, let baby splash and explore water with cups and toys.", science: "Water play teaches cause-and-effect, builds sensory tolerance, and strengthens grip.", whoCanDo: "Anyone supervising." },
    { title: "Babble Back-and-Forth", category: "language", duration: 10, icon: "💬", description: "Whatever sound baby makes, repeat it. Then add a new sound. Wait for response.", science: "Pre-language conversation. Builds the brain's prediction model for turn-taking and grammar.", whoCanDo: "Everyone." },
    { title: "Outdoor Stroll", category: "sensory", duration: 30, icon: "🌳", description: "Walk outside daily. Point to trees, birds, cars, people. Let baby experience nature.", science: "Outdoor exposure benefits visual development, vitamin D, and sleep regulation. Naming objects builds vocabulary.", whoCanDo: "Anyone." },
    { title: "Object Banging", category: "cognitive", duration: 5, icon: "🥁", description: "Give baby two safe objects to bang together. Pots and wooden spoons work great.", science: "Bilateral coordination + cause-effect + auditory feedback all in one activity.", whoCanDo: "Anyone." },
    { title: "Soft Block Stacking", category: "motor", duration: 5, icon: "🧱", description: "Stack 2-3 soft blocks for baby. They'll knock them down. Repeat.", science: "Knocking down (before stacking) is the first step in understanding how objects work.", whoCanDo: "Anyone." },
  ],

  // 26-32 WEEKS (~6-7mo) — transferring, solids
  26: [
    { title: "Object Transfer", category: "motor", duration: 10, icon: "🪀", description: "Give baby a toy in one hand. They should pass it to the other hand.", science: "Bilateral coordination — using both hands together. Foundation for self-feeding and dressing.", whoCanDo: "Anyone." },
    { title: "Reading + Pointing", category: "language", duration: 15, icon: "📖", description: "Ask 'where is the dog?' and point. Eventually baby will point too.", science: "Joint attention is one of the strongest predictors of language development. Practice it daily.", whoCanDo: "Everyone." },
    { title: "Cause-and-Effect Toys", category: "cognitive", duration: 10, icon: "🎁", description: "Toys with buttons, lids, simple mechanisms. Baby learns 'I push, it does something'.", science: "Cause-and-effect understanding is the foundation of problem-solving and scientific thinking.", whoCanDo: "Anyone." },
    { title: "Mealtime Food Play", category: "sensory", duration: 15, icon: "🥄", description: "If starting solids, let baby touch and explore food with hands. Mess is learning.", science: "Tactile food exposure reduces picky eating later and supports oral motor skills for chewing and speech.", whoCanDo: "Anyone supervising meals." },
    { title: "Pat-a-Cake / Clapping", category: "social", duration: 5, icon: "👏", description: "Clap together, sing pat-a-cake. Take baby's hands and clap them.", science: "Imitation games build social engagement and motor planning. Foundation of cultural learning.", whoCanDo: "Everyone." },
    { title: "Stranger Comfort", category: "bonding", duration: 0, icon: "💛", description: "When baby clings or cries with strangers, comfort them. Don't force interactions.", science: "Stranger anxiety (peaks 7-9 months) is healthy and means secure attachment is forming. Comforting reinforces trust.", whoCanDo: "Primary caregivers." },
    { title: "Sensory Bin (Supervised)", category: "sensory", duration: 10, icon: "🫧", description: "Shallow tray with safe items: large pasta, fabric scraps, soft balls. Closely supervise — no choking hazards.", science: "Tactile exploration with varied textures builds sensory processing and fine motor.", whoCanDo: "Anyone supervising closely." },
    { title: "Drop & Retrieve", category: "cognitive", duration: 5, icon: "⬇️", description: "Sit with baby in high chair. Hand them a toy. They'll drop it. Pick it up. Repeat.", science: "Babies aren't being naughty — they're learning gravity, object permanence, and that you respond. Don't get frustrated!", whoCanDo: "Anyone." },
  ],

  // 32-39 WEEKS (~7-9mo) — crawling, pincer
  32: [
    { title: "Crawling Practice", category: "motor", duration: 15, icon: "🐛", description: "Place toys just out of reach. Let baby work to get them. Don't rush to help.", science: "Crawling cross-coordinates left and right brain, builds spatial awareness, and strengthens core.", whoCanDo: "Anyone supervising." },
    { title: "Pincer Grasp Practice", category: "motor", duration: 10, icon: "🤏", description: "Offer small safe finger foods (puffs, soft fruit) for baby to pick up with thumb and finger.", science: "Pincer grasp is the foundation of fine motor skills — handwriting, buttoning, self-feeding.", whoCanDo: "Anyone supervising." },
    { title: "Object Permanence Games", category: "cognitive", duration: 10, icon: "🎩", description: "Hide a toy under a cloth while baby watches. Encourage them to find it.", science: "Object permanence is fully developing — baby understands objects exist when hidden. Major cognitive leap.", whoCanDo: "Anyone." },
    { title: "Reading with Animal Sounds", category: "language", duration: 15, icon: "📖", description: "Read animal books. Make the sounds. 'The cow says moo!' Encourage baby to copy.", science: "Animal sounds are easy first 'words' — many babies say 'moo' or 'woof' before names.", whoCanDo: "Everyone." },
    { title: "Name Recognition", category: "language", duration: 5, icon: "📣", description: "Call baby's name often. Wait for them to turn. Praise the response.", science: "Responding to name (around 6-9 months) is an early language milestone — flag if not happening by 12 months.", whoCanDo: "Everyone." },
    { title: "Music & Bouncing", category: "sensory", duration: 10, icon: "🎶", description: "Play music and bounce baby gently in your lap to the beat.", science: "Rhythm exposure shapes auditory cortex, supports language and math skills later.", whoCanDo: "Anyone." },
    { title: "Container Filling", category: "cognitive", duration: 10, icon: "🪣", description: "Give baby a container and several blocks. Show them how to put in and take out.", science: "Container play is one of the most powerful activities for spatial reasoning and problem-solving.", whoCanDo: "Anyone." },
    { title: "Social Imitation Games", category: "social", duration: 5, icon: "🤝", description: "Play 'so big!' (raise arms), wave bye-bye, blow kisses. Baby will start to imitate.", science: "Social imitation is a major milestone. Foundation of cultural learning and language.", whoCanDo: "Everyone." },
  ],

  // 39-46 WEEKS (~9-10mo) — standing, first words
  39: [
    { title: "Pull to Stand Practice", category: "motor", duration: 15, icon: "🧍", description: "Help baby pull up on furniture. Place toys on a low couch for motivation.", science: "Pull-to-stand strengthens leg muscles for walking. Encourages bilateral leg coordination.", whoCanDo: "Anyone supervising." },
    { title: "Cruising", category: "motor", duration: 10, icon: "🚶", description: "Encourage baby to walk while holding furniture. Place toys along a couch.", science: "Cruising is pre-walking — builds balance, weight shifting, leg strength.", whoCanDo: "Anyone supervising." },
    { title: "First Words Practice", category: "language", duration: 10, icon: "💬", description: "Say 'mama', 'dada', 'bye-bye' clearly and repeatedly. Encourage imitation.", science: "First words appear around 10-14 months. Repetition and pairing with meaning builds vocabulary.", whoCanDo: "Everyone." },
    { title: "Container Play", category: "cognitive", duration: 10, icon: "🪣", description: "Give baby blocks and a container. Let them put in, take out, repeat.", science: "Container play builds spatial reasoning, problem-solving, and pincer grasp.", whoCanDo: "Anyone." },
    { title: "Wave & Gesture", category: "social", duration: 5, icon: "👋", description: "Wave bye-bye, blow kisses, point. Baby will start copying these gestures.", science: "Gestures are early communication. Baby sign language research: gestures predate words and predict vocabulary growth.", whoCanDo: "Everyone." },
    { title: "Daily Reading", category: "language", duration: 20, icon: "📖", description: "Read multiple books daily. Let baby turn pages, choose books.", science: "By 12 months babies should show interest in books. Daily reading is the strongest predictor of literacy.", whoCanDo: "Everyone." },
    { title: "Pop-Up Toys", category: "cognitive", duration: 10, icon: "📦", description: "Toys that pop up when buttons are pressed. Helps baby understand action-result.", science: "Reinforces cause-and-effect. Builds finger strength for button pressing.", whoCanDo: "Anyone." },
    { title: "Stacking Rings", category: "motor", duration: 10, icon: "🍩", description: "Stacking ring toys. Help baby remove and replace rings on a peg.", science: "Builds grasping precision, hand-eye coordination, and early sequencing.", whoCanDo: "Anyone." },
  ],

  // 46-52 WEEKS (~10-12mo) — first steps
  46: [
    { title: "Walking Practice", category: "motor", duration: 20, icon: "🚶", description: "Hold baby's hands and walk together. Or use a sturdy push toy. Don't use baby walkers.", science: "Walking with support builds confidence and balance. AAP advises against baby walkers (injury risk + can delay walking).", whoCanDo: "Anyone supervising." },
    { title: "Stacking Blocks", category: "motor", duration: 10, icon: "🧱", description: "Help baby stack 2-3 blocks. Let them knock down (this is the fun part).", science: "Stacking builds fine motor control, spatial reasoning, and planning. Knocking down builds cause-effect.", whoCanDo: "Anyone." },
    { title: "Naming Body Parts", category: "language", duration: 10, icon: "👃", description: "Point to and name body parts on baby and yourself. 'Where's your nose?'", science: "Body part naming is an easy receptive language milestone. Builds self-awareness.", whoCanDo: "Everyone." },
    { title: "Pretend Play", category: "cognitive", duration: 10, icon: "🎭", description: "Pretend to drink from a cup, talk on a banana phone, feed a teddy. Encourage imitation.", science: "Symbolic play (one thing represents another) is a cognitive milestone — foundation of imagination and abstract thinking.", whoCanDo: "Everyone." },
    { title: "Following Simple Instructions", category: "cognitive", duration: 5, icon: "👉", description: "'Give it to mama'. 'Find the ball'. Use gestures to support.", science: "Following 1-step commands (around 12 months) is a major receptive language milestone.", whoCanDo: "Everyone." },
    { title: "Daily Reading", category: "language", duration: 20, icon: "📖", description: "Continue daily reading. Ask questions: 'Where is the cat?' Wait for pointing.", science: "Engaging with the story (asking, pointing) is more powerful than passive reading. Builds comprehension.", whoCanDo: "Everyone." },
    { title: "Ball Rolling", category: "social", duration: 10, icon: "⚽", description: "Sit facing baby and roll a ball back and forth.", science: "Turn-taking is a foundational social skill. Ball rolling is a perfect early version.", whoCanDo: "Anyone." },
    { title: "Crayon Scribbling", category: "motor", duration: 10, icon: "🖍️", description: "Let baby hold a chunky crayon and scribble on paper. Their first art!", science: "Builds fine motor strength and grip. Early creative expression.", whoCanDo: "Anyone supervising." },
  ],
};

// HELPERS
export const getActivitiesForWeek = (ageWeeks) => {
  const keys = Object.keys(DEV_ACTIVITIES).map(Number).sort((a, b) => a - b);
  let selectedKey = keys[0];
  for (const k of keys) {
    if (ageWeeks >= k) selectedKey = k;
  }
  return DEV_ACTIVITIES[selectedKey] || DEV_ACTIVITIES[0];
};

export const getAgeBandLabel = (ageWeeks) => {
  if (ageWeeks < 2) return "Newborn (0-2 weeks)";
  if (ageWeeks < 4) return "2-4 weeks";
  if (ageWeeks < 8) return "1 month";
  if (ageWeeks < 12) return "2 months";
  if (ageWeeks < 16) return "3 months";
  if (ageWeeks < 20) return "4 months";
  if (ageWeeks < 26) return "5 months";
  if (ageWeeks < 32) return "6-7 months";
  if (ageWeeks < 39) return "7-8 months";
  if (ageWeeks < 46) return "9-10 months";
  return "11-12 months";
};

// ============================================================
// SMART RECOMMENDATIONS — analyzes activity history
// Returns suggestions based on what's been neglected
// ============================================================
export const getActivityRecommendations = (events, ageWeeks) => {
  const currentActivities = getActivitiesForWeek(ageWeeks);

  // Count completions per category over the last 7 days
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const recentActivities = events.filter(
    (e) => e.type === "activity" && new Date(e.timestamp).getTime() >= sevenDaysAgo
  );

  // Count by category
  const categoryCounts = {};
  Object.keys(ACTIVITY_CATEGORIES).forEach((c) => { categoryCounts[c] = 0; });
  recentActivities.forEach((e) => {
    const cat = e.activityCategory;
    if (cat && categoryCounts.hasOwnProperty(cat)) {
      categoryCounts[cat]++;
    }
  });

  // Count categories present in current age band
  const bandCategories = {};
  currentActivities.forEach((a) => {
    bandCategories[a.category] = (bandCategories[a.category] || 0) + 1;
  });

  // Find under-served categories (in band but rarely done in last 7 days)
  const recommendations = [];
  Object.keys(bandCategories).forEach((cat) => {
    const done = categoryCounts[cat] || 0;
    const expected = bandCategories[cat]; // activities available in this band for this category
    // Expect at least 1 per category per 2 days = 3.5 per week minimum
    if (done < 2 && expected > 0) {
      recommendations.push({
        category: cat,
        done,
        type: "underserved",
      });
    }
  });

  // Find activities never done in last 7 days
  const recentTitles = new Set(recentActivities.map((e) => e.activityTitle));
  const neverDone = currentActivities.filter((a) => !recentTitles.has(a.title));

  // Find streaks — activities done multiple times (positive feedback)
  const titleCounts = {};
  recentActivities.forEach((e) => {
    titleCounts[e.activityTitle] = (titleCounts[e.activityTitle] || 0) + 1;
  });
  const streaks = Object.entries(titleCounts)
    .filter(([_, count]) => count >= 4)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    underserved: recommendations,
    neverDone: neverDone.slice(0, 3),
    streaks,
    totalLast7Days: recentActivities.length,
    categoryCounts,
  };
};
