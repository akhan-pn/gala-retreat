# Photography shot list — Gala Retreat

Every image on the site is currently a **licensed stand-in** from Pexels, not
Gala Retreat. `npm run check:placeholders` fails while any of them remain, so
the site cannot ship to production until these are replaced.

## How to swap a photo

1. Save the real photograph over the file of the same name in `public/images/…`.
2. Update `width` / `height` in `src/content/gallery.ts` if the aspect differs.
3. Delete `placeholder: true` from that entry.
4. Run `npm run check:placeholders` — it lists whatever is still outstanding.

Shoot **landscape unless noted**, in the largest resolution the camera gives.
Do not crop before sending; the site crops per breakpoint.

---

## Hero — 4 shots · 3:2 landscape · `public/images/hero/`

The hero fills the screen, so these need to work as wide crops with the
headline sitting over the lower-left third. Keep that area uncluttered.

| File | What to shoot |
|---|---|
| `hero-01.jpg` | Mandap or stage fully dressed, evening, lighting on |
| `hero-02.jpg` | Wide establishing shot of the property, dusk |
| `hero-03.jpg` | Pool or lawn set for an event, blue hour |
| `hero-04.jpg` | Guests mid-celebration — movement, warm light |

## Convention Hall — 6 shots · `public/images/hall/`

`hall-03.jpg` is used as a tall 2:3 portrait; the rest are landscape.

- Hall wide, empty and clean, house lights up
- Hall wide, dressed for a reception, event lighting
- Round tables laid for a seated dinner
- Stage / LED wall in use
- Chandelier and ceiling detail (portrait, for `hall-03`)
- Entrance or foyer as guests arrive

## The Lawn — 6 shots · `public/images/lawn/`

`lawn-03.jpg` and `lawn-04.jpg` are used as tall 2:3 portraits.

- Lawn empty, daylight — shows the true size
- Lawn dressed for a ceremony, chairs out
- Mandap on the lawn, evening (portrait)
- Entrance archway with florals (portrait)
- String lighting after dark — the shot that sells the space
- Overhead or elevated view of a full setup

## Farm Stay — 4 shots · `public/images/farmstay/`

`farmstay-03.jpg` and `farmstay-04.jpg` are tall portraits.

- Pool lit at night, warm lighting
- Both bedrooms, made up
- Garden and children's play area (portrait)
- The farmhouse exterior at dusk (portrait)

## Events — 6 shots · `public/images/events/`

`events-04.jpg` is a tall portrait.

- Floral mandap or ceremony centrepiece
- Decor detail — garlands, entrance dressing
- Reception tables with centrepieces
- Styling detail, close (portrait)
- Full room during an event
- A guest or couple moment that reads as celebration

---

## Also needed

- **Logo** — SVG preferred, else the largest PNG available. Drop at
  `public/logo.svg`; the header currently uses a typographic wordmark.
- **Open Graph image** — the site falls back to `hero-01.jpg`. A dedicated
  1200×630 crop is better for WhatsApp and Google previews.
- **Favicon** — replace `src/app/favicon.ico`.

---

## Note on replacing a photo locally

Next.js caches optimised images in `.next/cache/images`. If you overwrite a
photo with the same filename during local development, clear that cache so the
new version is served:

```bash
rm -rf .next/cache/images
```

Vercel builds are always fresh, so this only affects local work.
