# Modulynx

> Modular systems. Feline precision.

The marketing site for **Modulynx** — a modular digital studio building cinematic interfaces, motion-driven products, and systems that feel alive. Centered on a living lynx mascot whose eyes track the cursor, blinks, and reacts to interaction.

**Live site:** _add the Netlify/production URL here once deployed_

## Features

- Interactive lynx hero — cursor-tracking gaze with spring physics, CSS-driven blinking, ear twitches, idle glances
- Cinematic dark theme — amber/ice color grade, film grain, vignette, ambient particle field with cursor parallax
- Scroll-triggered reveals, magnetic buttons, 3D card tilt, animated stat counters
- Selected Work section showcasing live and in-production projects
- Contact form wired to [FormSubmit](https://formsubmit.co) — no backend required
- Fully responsive, respects `prefers-reduced-motion`, degrades gracefully if JavaScript fails to load

## Stack

Plain HTML, CSS, and vanilla JavaScript — no build step, no framework, no dependencies.

```
index.html
css/style.css          — theme, layout, animations
js/main.js              — page interactions (nav, reveals, form, cursor)
js/lynx.js               — the lynx's gaze, blink, and idle behavior
js/lynx-particles.js     — hero particle field
logo/                    — brand mark (SVG)
assets/images/           — favicon, founder photo, profile avatar
```

## Running locally

Any static file server works — the site makes no server-side calls of its own.

```bash
python -m http.server 8734
```

Then open `http://localhost:8734`. Opening `index.html` directly via `file://` will render the layout but breaks the contact form (FormSubmit requires an http/https origin).

## Deployment

Configured for [Netlify](https://netlify.com) via `netlify.toml` (static publish, no build command, security + cache headers). Connect this repository in Netlify and every push to `main` deploys automatically.

## Contact form

The form in the Contact section posts to FormSubmit, which forwards submissions by email — no backend to maintain. The first submission from a new deployment domain triggers a one-time activation email; confirm it once and all future messages deliver automatically.

## License

© Modulynx. All rights reserved.
