# Neon Drift

A fast-paced, neon-themed arcade survival game that runs right in your browser. Dodge incoming hazards, collect energy cores, chain combos, and see how long you can survive as the city gets faster.

**Play now:** https://pandamandev.github.io/Neon-Drift/



## Features

- **Endless survival gameplay** — avoid the incoming hazard stream and survive for as long as possible.
- **Three difficulty modes** — Chill, Normal, and Chaos.
- **Energy cores** — collect glowing cores for bonus points.
- **Combo multiplier** — chain core pickups to build your multiplier up to x5.
- **Phase dash** — briefly phase through hazards and escape tight situations.
- **Shield pickups** — collect a shield to survive one collision.
- **Progressive difficulty** — the game gets faster as your score and level increase.
- **Achievements** — unlock milestones as you play.
- **Daily challenges** — rotating missions with a 500-point completion bonus and a daily streak.
- **Pilot career stats** — track completed runs, lifetime cores, flight time, and combined score.
- **Personal best** — your highest score is saved in your browser.
- **Daily signal notifications** — an in-game notification center with daily tips and messages.
- **Sound effects** — lightweight synthesized audio, with an option to turn sound off.
- **Responsive controls** — play on desktop, tablet, or mobile.
- **No account required for solo play** — open the website and play. Online friends and parties require a Neon Drift Online account.

## Online Friends and Parties\n\nNeon Drift includes an optional online social system powered by a dedicated Supabase project. Players can create accounts, add friends by username, see live online presence, create four-player parties, and join parties using an invite code. The party lobby syncs across devices in real time; the arcade run itself remains single-player.\n\nTo activate these features, follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md). The website configuration starts with placeholders until a Supabase project URL and anon/publishable key are added to `supabase-config.js`. Never add a Supabase service-role/secret key to the website.\n\n## How to Play

1. Open [Neon Drift](https://pandamandev.github.io/Neon-Drift/).
2. Choose a difficulty.
3. Select **Start Run**.
4. Dodge pink hazards, collect yellow energy cores, and pick up purple shields.
5. Keep moving and use your phase dash when you need to get through danger.

### Controls

| Action | Desktop | Mobile |
|---|---|---|
| Move left | `A` or `←` | Left arrow button |
| Move right | `D` or `→` | Right arrow button |
| Phase dash | `SHIFT` | Lightning button |
| Pause / resume | `SPACE` or Pause button | Pause button |
| Smooth steering | Move your pointer over the game area | Drag your finger across the game area |

## Game Objects

| Object | Appearance | Effect |
|---|---|---|
| Player ship | Cyan | Your ship — keep it safe |
| Hazard | Pink | Avoid it; a collision ends the run unless protected |
| Energy core | Yellow | Adds 150 points multiplied by your current combo |
| Shield pickup | Purple | Protects you from one collision |

### Combo tips

- Collect energy cores close together to build your combo.
- Your multiplier can reach **x5**.
- The combo timer expires if you wait too long between pickups.
- A phase dash can help you pass through hazards while it is active.

## Daily Challenges

A daily mission rotates between these challenge types:

- **Core Run:** collect 5 energy cores in one run.
- **Score Hunter:** reach 2,000 points in one run.
- **Last Pilot:** survive for 45 seconds in one run.
- **Phase Perfect:** use your phase dash 3 times in one run.

Complete the daily challenge to receive **500 bonus points** and advance your daily streak.

## Achievements

Play to unlock milestones such as:

- First Flight — complete your first run.
- Four Digits — reach 1,000 points in one run.
- Core Collector — collect 10 energy cores in one run.
- One-Minute Pilot — survive for 60 seconds.
- Phase Runner — use your phase dash.
- Regular Pilot — complete 5 runs.
- Core Addict — collect 100 lifetime energy cores.

## Your Saved Progress

Neon Drift uses your browser's local storage to save your solo-game progress. Online account, friend, and party data is stored separately in Supabase when the online system is configured. The local storage saves your:

- Personal best score
- Unlocked achievements
- Pilot career statistics
- Daily challenge completion and streak
- In-game notification history

**Important:** this progress is stored locally in the browser and on the device where you play. It is not currently synced between devices or shared through a global leaderboard. Clearing the browser's site data can erase saved progress. Daily challenges and notifications are shown when you visit the site; they are not push notifications sent while the site is closed.

No license file is currently included in this repository. Unless a license is added, the code remains under the repository owner's default copyright; ask before redistributing or reusing it.

---

**Have fun out there. Stay sharp, pilot.**
