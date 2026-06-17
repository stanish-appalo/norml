# norml. — Let's Go Viral

A social-first creative agency, online in two parts:

| | |
|---|---|
| **`/` (root)** | **The pitch** — a scrollytelling client deck (12 sections, side-nav, premium motion) that tells the norml. story: what we do, how we do it, the **mango that went viral**, and a 0-followers → viral case study. |
| **`/site`** | **The agency website** — a multi-page site in two complete themes (`/site/dark` neon, `/site/light` minimal) with a chooser at `/site`. |

Live: **https://stanish-appalo.github.io/norml/** (pitch) · **/site** (website)

## The pitch (root)

A single scrollable page — elegant cream/ink theme, **Bricolage Grotesque** display + **Space Mono** for data, with a mango-gold signature accent on the proof moment. No build step.

```
index.html            # the pitch
css/style.css         # pitch styles (scroll engine, side-nav, pop-in system)
js/main.js            # scroll-spy nav, reveals, counters, growth chart, video
media/
  mango.mp4           # the viral mango edit (web-optimized H.264)
  mango_poster.jpg    # video poster frame
norml_agency_logo.jpg
```

**Sections:** Intro · The big idea · What we do · The mango · 0 → viral · How we work · Short-form video · Social management · Content & UGC · Influencers · Websites · Let's talk. The left side-nav scroll-spies and jumps to any section.

**Motion:** preloader, custom cursor, pop-in reveals (opacity + scale + blur), word stagger, number counters, a growth curve that draws on scroll, the mango in an autoplay phone mockup (tap to unmute), parallax, magnetic buttons, scroll-progress. `prefers-reduced-motion` respected.

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
