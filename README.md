# norml. — Let's Go Viral

A social-first creative agency, online in two parts:

| | |
|---|---|
| **`/` (root)** | **The pitch** — a scrollytelling client deck (12 sections, side-nav, premium motion) that tells the norml. story: what we do, how we do it, the **mango that went viral**, and a 0-followers → viral case study. |
| **`/site`** | **The agency website** — a multi-page site in two complete themes (`/site/dark` neon, `/site/light` minimal) with a chooser at `/site`. |

Live: **https://stanish-appalo.github.io/norml/** (pitch) · **/site** (website)

## The pitch (root) — "Mango Drop"

A single scrollable page with a **cinematic, multi-mood** theme: the background shifts between warm cream, deep plum, and vivid mango-sunset gradients as you scroll. Elegant **Fraunces** serif + **Hanken Grotesk** + **Space Mono** for data. Motion is driven by **GSAP + ScrollTrigger** (loaded from CDN); content stays visible if the CDN is unavailable.

```
index.html            # the pitch
css/style.css         # Mango Drop theme (moods, glass, gradients, grain)
js/main.js            # GSAP reveals, parallax, growth chart, scroll-spy, video
media/
  mango.mp4           # the viral mango edit (60MB HEVC .MOV -> 6MB H.264)
  mango_poster.jpg    # video poster frame
  mangoes.jpg banana.jpg play.jpg meeting.jpg   # themed photography (Unsplash)
norml_agency_logo.jpg
```

**Sections:** Intro · The big idea · What we do · The mango · 0 → viral · How we work · Short-form video · Social management · Content & UGC · Influencers · Websites · Let's talk. The left side-nav scroll-spies and jumps to any section.

**Motion:** preloader, custom cursor, staggered pop-in reveals per section, scrubbed parallax on photos/blooms, number counters, a growth curve that draws on scroll, the **mango video autoplaying** in a glowing gradient frame (tap to unmute), magnetic buttons, scroll-progress, scroll-spy side-nav. `prefers-reduced-motion` respected.

## The agency site (`/site`)

Built earlier — see `site/` for the dark and light multi-page versions (Home, About, Services, Work, Contact). The pitch's "Websites" section links to it as a live demo.

## ⚠️ Placeholder content to replace before launch

Honest, clearly-marked samples:

- **Email:** `hello@norml.co`; **social links** point to `#` (LinkedIn is real)
- **Case-study / mango stats** (views, followers, %) are representative, not real
- **Location:** "Remote-first"
- The source mango clip (`media/IMG_3235.MOV`, 60 MB) is git-ignored; only the optimized `mango.mp4` is committed

---

*Static HTML/CSS/JS. Brand: norml. — Let's Go Viral.*
