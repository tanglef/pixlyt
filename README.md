# 🌸 pixlyt — Your media organizer

A beautiful pastel-themed app to swipe through your phone's photos and videos, keep or delete them, and organize them into tag-based folders.

---

## Features

- **Swipe right** to keep, **swipe left** to delete — or tap the buttons
- **Tag system** — create emoji-labeled folders and assign media instantly
- **Sort options** — by date, date modified, or photos-first
- **Progress tracking** — streaks, milestones, daily counts
- **Motivational messages** — "10 in a row!", "100 sorted — amazing!", etc.
- Pastel pink / light blue / warm beige design

---

## How to install on your phone

### Option A — Expo Go (fastest, no setup needed)

1. Install **Expo Go** on your phone:
   - iPhone: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. On your computer, install Node.js from https://nodejs.org (LTS version)

3. Open Terminal and run:
   ```bash
   cd pixlyt
   npm install
   npx expo start
   ```

4. A QR code will appear. Scan it with:
   - **iPhone**: use the Camera app
   - **Android**: use the Expo Go app

5. The app will open on your phone!

### Option B — Build a real .ipa / .apk (permanent install)

Use EAS Build (Expo's free cloud build service):

```bash
npm install -g eas-cli
eas login
eas build --platform ios   # or android
```

Follow the prompts. You'll get a link to download the built app.

For iOS without App Store, use **TestFlight**:
1. `eas build --platform ios --profile preview`
2. Download the .ipa and upload to TestFlight via App Store Connect

---

## Project structure

```
pixlyt/
├── app/
│   ├── _layout.tsx          # Root layout
│   └── (tabs)/
│       ├── _layout.tsx      # Tab bar
│       ├── index.tsx        # Sort screen (main)
│       ├── tags.tsx         # Tags & folders
│       └── profile.tsx      # Progress & stats
├── components/
│   ├── SwipeCard.tsx        # The swipeable media card
│   ├── TagPicker.tsx        # Bottom sheet for tagging
│   └── Toast.tsx            # Milestone notifications
├── utils/
│   ├── theme.ts             # Colors, typography
│   └── storage.ts           # AsyncStorage persistence
└── app.json                 # Expo config
```

---

## Permissions

- **iOS**: Photo library access (read + write for deletion)
- **Android**: READ_MEDIA_IMAGES, READ_MEDIA_VIDEO

The app only ever accesses your media when you're actively using it. Nothing is uploaded anywhere — everything stays on your device.

---

## Tips

- Swipe speed counts — a fast flick works even without crossing the threshold
- Long-press a tag folder on the Tags screen to delete it
- The skip button (—) moves to the next photo without marking it, so you can come back later
- Your progress is saved automatically and survives app restarts
