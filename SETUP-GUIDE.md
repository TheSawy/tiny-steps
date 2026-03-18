# 🍼 Tiny Steps — Deployment Guide

## What You'll Have When Done
A baby tracker app on both your iPhones that:
- Syncs in real-time between you and your wife
- Works offline and feels like a native app
- Has AI chat powered by your existing Claude/ChatGPT subscription
- Sends push notifications for feed/sleep/diaper windows
- Costs $0/month to run

## Time Needed: ~30 minutes

---

## STEP 1: Install Tools (5 min)

On your Mac/PC, open Terminal and run:

```bash
# Install Node.js (if not already installed)
# Go to https://nodejs.org and download LTS version

# Verify it's installed
node --version   # should show v18+ or v20+
npm --version    # should show 9+ or 10+

# Install Firebase CLI
npm install -g firebase-tools
```

---

## STEP 2: Create Firebase Project (5 min)

1. Go to https://console.firebase.google.com
2. Click **"Create a project"**
3. Name it `tiny-steps` (or anything you want)
4. Disable Google Analytics (not needed)
5. Click **Create project**

### Enable Authentication:
1. In Firebase Console → **Build** → **Authentication**
2. Click **Get started**
3. Enable **Email/Password** (click it → toggle Enable → Save)
4. Enable **Google** (click it → toggle Enable → select your email → Save)

### Enable Firestore:
1. **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode**
4. Choose location: `europe-west1` (closest to Egypt)
5. Click **Enable**

### Get Your Config:
1. Click the **⚙️ gear icon** next to "Project Overview" → **Project settings**
2. Scroll down to **"Your apps"** → Click the **Web icon** `</>`
3. Name it `tiny-steps-web`
4. **Don't** check "Firebase Hosting" yet
5. Click **Register app**
6. You'll see a config object like this — **copy it**, you'll need it in Step 4:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "tiny-steps-xxxxx.firebaseapp.com",
  projectId: "tiny-steps-xxxxx",
  storageBucket: "tiny-steps-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## STEP 3: Set Up The Project (3 min)

```bash
# Unzip the project
cd ~/Desktop
unzip tiny-steps-project.zip
cd tiny-steps

# Install dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

---

## STEP 4: Add Your Firebase Config (2 min)

```bash
# Create your environment file
cp .env.example .env.local
```

Open `.env.local` in any text editor and fill in the values from Step 2:

```
VITE_FIREBASE_API_KEY=AIza...your-key
VITE_FIREBASE_AUTH_DOMAIN=tiny-steps-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tiny-steps-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=tiny-steps-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Add AI API Key (for the chat feature):

**If you have Claude Pro subscription:**
1. Go to https://console.anthropic.com/settings/keys
2. Click **Create Key** → copy it
3. Add to `.env.local`:
```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

**If you prefer ChatGPT:**
1. Go to https://platform.openai.com/api-keys
2. Click **Create new secret key** → copy it
3. Add to `.env.local`:
```
VITE_OPENAI_API_KEY=sk-xxxxx
```

---

## STEP 5: Deploy to Firebase (5 min)

```bash
# Login to Firebase
firebase login

# Connect to your project
firebase use --add
# Select your project from the list
# Give it an alias like "default"

# Deploy Firestore security rules
firebase deploy --only firestore:rules,firestore:indexes

# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

After deploy, Firebase will show you a URL like:
```
✅ Hosting URL: https://tiny-steps-xxxxx.web.app
```

**This is your app's URL!** Open it on your iPhone.

---

## STEP 6: Install on Both iPhones (2 min)

### On YOUR iPhone:
1. Open Safari → go to `https://tiny-steps-xxxxx.web.app`
2. Tap the **Share button** (square with arrow)
3. Scroll down → tap **"Add to Home Screen"**
4. Name it "Tiny Steps" → tap **Add**
5. Open the app from your home screen
6. Sign up with your email
7. Complete onboarding (your name, baby's name, birth date)
8. Note the **6-digit Family Code** shown in Settings

### On YOUR WIFE'S iPhone:
1. Same steps 1-4 above
2. On the welcome screen, tap **"Join Partner's Account"**
3. Enter her name
4. Enter the **6-digit Family Code** you noted
5. She's now synced with you!

Everything either of you logs will appear on both phones instantly.

---

## STEP 7: Enable Push Notifications (Optional, 3 min)

### Generate VAPID Key:
```bash
# In your terminal
npx web-push generate-vapid-keys
```

Copy the **Public Key** and add to `.env.local`:
```
VITE_FIREBASE_VAPID_KEY=BPxxxxxx...your-public-key
```

### Update the service worker:
Open `public/firebase-messaging-sw.js` and replace the Firebase config with your actual config values from Step 2.

### Redeploy:
```bash
npm run build
firebase deploy --only hosting
```

When you open the app, it will ask for notification permission. Allow it on both phones.

---

## STEP 8: Deploy Cloud Functions (Optional, 5 min)

Cloud Functions enable:
- Partner notifications when the other parent logs an event
- AI chat without exposing API keys in the browser
- Daily pattern analysis
- Appointment reminders

```bash
# Set API keys as secrets
firebase functions:secrets:set ANTHROPIC_API_KEY
# Paste your Claude API key when prompted

firebase functions:secrets:set OPENAI_API_KEY
# Paste your OpenAI API key when prompted

# Deploy functions
firebase deploy --only functions
```

---

## Troubleshooting

**"The app doesn't load"**
→ Make sure you ran `npm run build` before `firebase deploy --only hosting`

**"Authentication error"**
→ Go to Firebase Console → Authentication → Settings → Authorized domains
→ Add your `.web.app` domain if not already there

**"Firestore permission denied"**
→ Make sure you deployed the rules: `firebase deploy --only firestore:rules`

**"AI chat doesn't work"**
→ Check that your API key is correct in `.env.local`
→ Rebuild and redeploy: `npm run build && firebase deploy --only hosting`

**"Push notifications don't work on iPhone"**
→ iOS requires the app to be installed via "Add to Home Screen" first
→ iOS 16.4+ is required for web push notifications
→ Make sure you allowed notifications when prompted

**"I want a custom domain (like tinysteps.app)"**
→ Firebase Console → Hosting → Add custom domain
→ Follow the DNS setup instructions
→ Cost: ~$12/year for the domain

---

## Daily Usage

That's it! The app is now running. Both of you just open Tiny Steps from your home screens and start tracking. Everything syncs automatically.

To update the app later:
```bash
cd tiny-steps
npm run build
firebase deploy --only hosting
```
Both phones will get the update automatically next time they open the app.
