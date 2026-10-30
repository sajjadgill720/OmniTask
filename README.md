# OmniSticky — Motion Sticky Notes & Productivity Suite

> A **sticky note motion graphics interface** combining the strengths of **Google Keep**, **Trello**, **Notezilla**, and **Things 3** — with tactile paper physics, interactive widgets, natural language parsing, and Web/OS permissions.

---

## 🌟 Competitor Analysis & Synthesis

Based on audits of user reviews across Reddit (`r/productivity`, `r/googlekeep`, `r/trello`, `r/thingsapp`), G2, and Capterra:

| Reference App | What Users Love (Strengths Kept) | What Users Complain About (Weaknesses Fixed) | OmniSticky Synthesis |
| :--- | :--- | :--- | :--- |
| **Google Keep** | Visual wall of pastel color-coded sticky notes, instant checklists. | No deadlines, messy drag-and-drop, no workflow stages. | **Sticky Wall View** with pastel palettes, direct in-card checklists, plus calendar deadlines and pinned notes. |
| **Trello** | Visual workflow stages (To Do, In Progress, Done), cards moved across columns. | Heavyweight, clunky for simple daily notes, slow onboarding. | **Kanban Sticky Board** with 1-click status advancement and zero setup overhead. |
| **Notezilla** | Digital post-it notes, washi tape aesthetics, pinned notes on desktop. | Outdated 90s Windows look, sync issues. | **Motion Graphics Sticky Notes** with frosted washi tape, organic tilt jitter (-1.5°), peelable dog-ear corner fold, and smooth spring physics. |
| **Things 3** | Pure typography, "Today" & "This Evening" distinction, circular progress rings. | $80+ price tag, strictly Apple-only. | **Things 3 Clean List Mode**, circular SVG progress rings, and frictionless NLP quick-add. |

---

## 🎨 Three Motion Graphics View Modes

Switch instantly between 3 layouts using the header pill bar or sidebar:
1. 📌 **Sticky Wall (Google Keep + Notezilla):**
   - Tactile sticky notes with frosted washi tape headers.
   - Organic rotation jitter (-1.5° to +1.5°) that levels out on hover.
   - Dog-ear peelable paper corner folds.
   - Pinned notes shelf at the top.
   - Inline color palette picker (Canary Yellow, Soft Mint, Warm Peach, Sky Blue, Lavender Mist, Blush Rose, Classic White).
   - Direct in-card checklist additions and toggles with strikethrough.
2. 📋 **Kanban Board (Trello):**
   - Three dynamic columns: *To Do*, *In Progress*, and *Completed*.
   - 1-click stage advancement right from each sticky note.
3. 📑 **Clean List (Things 3):**
   - Minimalist, distraction-free rows with "This Evening" moon indicator and circular progress rings.

---

## 🚀 Live Demo & How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Visit: **[http://localhost:5173/](http://localhost:5173/)**

---

## 📱 Key Features

### 1. Motion Graphics & Tactile Physics
* **Theme Switcher with Ambient White Hue:** 1-click toggle between Light and Dark mode. In Dark Mode, an atmospheric luminous white radial aura illuminates the background, translucent frosted washi tape, and card borders.
* **Paper Spring Physics:** Smooth lift (`translateY(-4px) scale(1.02)`) and spring bounce on hover.
* **Washi Tape & Dog-Ear Fold:** Authentic physical post-it feel with responsive corner peel.
* **Stopwatch Focus Timer:** Track focus time directly on any sticky note with a live ticking timer.
* **Celebratory Audio & Confetti:** Web Audio API chime sound + canvas confetti explosion on task completion.

### 2. "Magic Plus" Floating Action Button & NLP
* Tap the floating action button in the bottom right corner (or press `N`).
* Type naturally: `Buy supplies tomorrow at 3pm p1 #Office` — automatically detects dates, priorities, and tags.
* Pick note colors directly during quick capture.

### 3. Interactive Widgets Hub
* **Today Focus Widget:** Compact desk widget to check off daily notes with sound.
* **Standby Desk Clock:** Fullscreen desk clock overlay with live focus tracking.

### 4. Web & OS Permissions Hub
* 🔔 **Browser Notifications:** Reminders for overdue notes and completed focus sessions.
* 🏷️ **PWA Icon Badge:** Badges pending notes on phone home screens and desktop docks.
* 🔊 **Synthesized Web Audio:** Pure browser chime without heavy audio files.
* 💾 **Persistent Storage:** Protects notes from browser cache cleanup.

---

## 🔒 100% Private & Open Data
* Fully offline-first with instant `localStorage` synchronization.
* 1-click **Export to Markdown (`.md`)** and **Export to JSON** backup with zero lock-in.
