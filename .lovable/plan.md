
# EcoLearn ko Viral banane ka plan (3 months, organic, zero budget)

Core idea: **Har quiz/game ke baad ek beautiful shareable card** banega jo WhatsApp/Instagram pe forward hote-hote naye users laata rahega. Saath mein school competitions + SEO ki layering.

---

## Phase 1 — Viral Loop Foundation (Week 1-3)

### 1. Universal Shareable Score Card (sabse important)
Abhi sirf achievements pe card hai. Har jagah lagana hai:
- Guest Quiz (`/play`) end pe
- GridLock game over pe
- Eco Memory finish pe
- Arcade Hub games (Runner, Tree Planter, etc.) end pe
- Daily streak milestones (3/7/30 din)

Card content:
- Bada score + rank ("Top 5% of India today")
- Player name + auto-generated eco-avatar
- QR code + short link `learn.himsols.com/play?ref=NAME`
- Branded EcoLearn watermark + tagline
- CTA: "Beat my score 👉"
- 1-tap WhatsApp / Instagram Story / Download buttons

### 2. Referral attribution
- `?ref=XYZ` query param capture karo localStorage mein
- Jab koi quiz attempt kare, `referred_by` column save ho `guest_quiz_scores` mein
- Naya page `/refer/:name` → "XYZ ne tumhe challenge kiya hai!" + auto-fill name

### 3. WhatsApp-first sharing
- Pre-filled WhatsApp message with emojis + score + link
- Instagram Story sticker template (1080×1920 PNG export)

---

## Phase 2 — Habit & Competition (Week 4-7)

### 4. Daily Streak System (guest bhi)
- localStorage-based streak counter
- Day 3/7/14/30 milestone → auto card pop karega "Share your streak"
- Daily challenge: aaj ka special quiz, leaderboard reset roz

### 5. School / Class Leaderboards
- Guest quiz form mein optional "School name" + "Class" field
- Naya page `/schools` → top schools by participation + average score
- "Apne school ko #1 banao" CTA — har student WhatsApp pe class group mein share karega

### 6. Weekly Winners
- Har Sunday top 10 winners ka auto-poster generate
- Manual share by admin on Insta/WhatsApp + winners khud bhi share karenge

### 7. Themed Weeks
- "Plastic-Free Week", "Water Week", "Climate Week" — har week naya theme + special quiz pack
- Calendar dates jo already viral hain: 22 April (Earth Day), 5 June, 16 Sep (Ozone), 4 Oct (Animals)

---

## Phase 3 — Distribution & SEO (Week 8-12)

### 8. SEO landing pages (organic Google traffic)
Generate static landing pages for high-volume keywords:
- `/quiz/environment-quiz-for-class-10` (huge search volume)
- `/quiz/world-environment-day-quiz`
- `/quiz/climate-change-quiz-india`
- `/games/free-environment-games-for-kids`

Each page: H1, intro, embedded quiz, FAQ schema, internal links. Sitemap.xml + robots.txt update.

### 9. Teacher / Creator Kit page
- `/teachers` page with: downloadable PDF posters, ready-made WhatsApp message templates, classroom guide, attendance leaderboard
- "Apni class ka custom quiz" → teacher signup (light auth) → custom quiz code "ABCD" → students enter code → class-specific leaderboard

### 10. Embed widget
- "Embed this quiz on your blog" → `<iframe>` snippet
- NGO websites / school websites pe embed = backlinks + traffic

### 11. Open Graph + meta
- Har shareable URL ka proper `og:image` (dynamically generated via edge function using card design)
- Twitter card, WhatsApp preview = clicks badhega

---

## Technical execution order

```text
Week 1   Universal share card component + WhatsApp/IG share util
Week 2   Referral tracking (?ref, localStorage, DB column)
Week 3   Streak system (localStorage based, guest-friendly)
Week 4   School/Class field + /schools leaderboard
Week 5   Themed week framework + weekly winners auto-poster
Week 6   SEO landing pages template (4-6 pages)
Week 7   Sitemap, robots, meta, OG image edge function
Week 8   Teacher kit page + PDF poster generator
Week 9   Class code feature (custom class leaderboards)
Week 10  Embed widget (/embed/quiz route, postMessage resize)
Week 11  Polish: analytics events, A/B card designs
Week 12  Push: collab outreach using built-in tools
```

## Tech notes
- Shareable card: ek reusable `<ShareCard>` component (existing `ShareableAchievementCard` ko generalize karenge with variants: quiz/game/streak/school)
- Image generation: `html2canvas` already installed
- OG dynamic images: Supabase edge function returning PNG via `@vercel/og`-style approach or pre-rendered templates
- Referral: new column `referred_by text` on `guest_quiz_scores`
- School leaderboard: new columns `school_name`, `class_name` + DB function `get_school_leaderboard()`
- Streaks: pure client-side (localStorage) for guests; DB-backed for logged-in users
- Class codes: new table `class_rooms (code, teacher_id, name)` + `class_scores`
- Embed: `/embed/quiz` minimal route, no nav/footer, postMessage for height

## What stays out of scope
- Paid ads (zero budget)
- Native app (web + PWA install banner enough)
- Push notifications (web push later if needed)

## First sprint (agar approve karte ho)
Main start karunga **Week 1 + 2** se: universal share card + referral tracking. Yeh sabse bada viral lever hai — baaki sab iske upar build hota hai.
