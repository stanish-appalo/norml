# norml. — Let's Go Viral

A multi-page marketing website for **norml.**, a social-first creative agency
(social/viral marketing · content · branding · and web/product when a campaign needs it).

The site ships in **two complete looks** — pick one, or keep the chooser:

| | |
|---|---|
| **`dark/`** | Bold dark theme with a lime-neon accent and heavy motion design. |
| **`light/`** | Cream/black minimal theme matching the logo, lime used as a highlighter. |
| **`index.html`** | A split-screen landing page that links to both versions. |

## View it

No build step — it's plain HTML/CSS/JS. Just open `index.html` in a browser
(or `dark/index.html` / `light/index.html` directly).

To serve locally:

```bash
# Python
python -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
.
├─ index.html              # theme chooser
├─ norml_agency_logo.jpg   # brand logo
├─ dark/                   # Version 01 — dark + neon
│  ├─ index.html  about.html  services.html  work.html  contact.html
│  ├─ css/style.css
│  └─ js/main.js
└─ light/                  # Version 02 — light + minimal
   ├─ index.html  about.html  services.html  work.html  contact.html
   ├─ css/style.css        # = dark CSS + light-theme override block
   └─ js/main.js
```

## Pages

`Home` · `About` · `Services` (accordion) · `Work` (case studies) · `Contact` (form)

## Animations

Preloader, custom cursor, scroll reveals, number counters, infinite marquees,
parallax, 3D tilt cards, page transitions, animated nav + mobile menu, live clock.
All vanilla JS, with a `prefers-reduced-motion` fallback.

## ⚠️ Placeholder content to replace

The following are honest, clearly-marked samples — swap in real data before launch:

- **Email:** `hello@norml.co`
- **Social links:** TikTok / Instagram / YouTube currently point to `#` (LinkedIn is real)
- **Case studies, stats, testimonials:** representative examples, not real client results
- **Location:** "Remote-first"

---

*Built as a static site. Brand: norml. — Let's Go Viral.*
