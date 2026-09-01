# Gala Retreat — logo

**The Threshold.** A tall pointed arch over a ground line, with a single gold
point of light beneath it.

The arch is the gateway form of Golconda and the Qutb Shahi tombs — local to
Hyderabad rather than to hospitality in general — and it is the shape of the
sandstone entrance in the venue's own photography. Every celebration held here
begins by walking through a dressed threshold. The rule beneath the arch is the
ground: eleven acres of it. The gold dot is the light under the arch, which is
what the property actually sells — evenings.

Six arch constructions were tested at 104 / 40 / 24 / 16px before this one was
chosen. The cusped and ogee forms are more decorative and more obviously Deccan,
but they develop a notch at 40px and turn to mush below 24px. This is the plain
tall pointed form, which survives.

---

## Files — `public/brand/`

| File | Use |
|---|---|
| `logo-horizontal.svg` | **Primary.** Dark ink on light grounds. |
| `logo-horizontal-light.svg` | Primary, reversed for dark grounds. |
| `logo-stacked.svg` | Where the horizontal is too wide — square formats, signage, print. |
| `logo-stacked-light.svg` | Stacked, reversed. |
| `mark.svg` | Icon only, two-colour, transparent. |
| `mark-light.svg` | Icon only, reversed. |
| `mark-on-nightfall.svg` | Icon on a solid `#14110D` tile — social avatar. |
| `mark-small.svg` · `-light` · `-on-nightfall` | **24px and below.** No dot, heavier stroke. |
| `logo-mono-black.svg` / `-white.svg` | Single-colour lockups for photography, embossing, fax-grade print. |
| `mark-mono-black.svg` / `-white.svg` | Single-colour icon. |

All type is **outlined** — there are no `<text>` elements and no font
dependency. The files render identically on a machine with no fonts installed.

---

## Minimum sizes

| Asset | Minimum | Why |
|---|---|---|
| Horizontal lockup | **120px wide** / 32mm print | Below this "RESORT & CONVENTION" fills in. |
| Stacked lockup | **90px wide** / 24mm print | Same limit, subline first to fail. |
| Mark, with dot | **28px** | The dot closes up below this. |
| Mark, small variant | **16px** | Hard floor. Do not go smaller — use the wordmark instead. |

**Use `mark-small.svg` at 24px and below.** The dot is the first thing to
disappear on a pixel grid, and a half-rendered dot reads as dirt on the mark.

## Clear space

Keep clear space equal to **the width of the arch opening** on all four sides —
about one third of the mark's height. Nothing sits inside that: no rule, no
photo edge, no other logo, no caption.

On photography, the clear space is also a legibility requirement. Place the
lockup over an area of even tone; if the image is busy, put it on a solid panel
rather than adding a drop shadow.

## Colour

| | Hex | Use |
|---|---|---|
| Nightfall | `#14110D` | The arch and wordmark on light grounds. |
| Ivory | `#EDE6DA` | The arch and wordmark on dark grounds. |
| Champagne | `#C6A15B` | The dot; the subline on dark grounds only. |
| Lawn | `#1E2B22` | An approved background, not a logo colour. |

The champagne subline does not have enough contrast on white — on light grounds
the subline is `#8A7F6D`. This is already handled in the files; use the right
file rather than recolouring.

## Do

- Use the supplied files unaltered.
- Reverse to the light version on anything darker than about 40% tone.
- Use single-colour versions over photography, embossing and one-colour print.
- Let it sit small and quiet. The mark does not need to be large to work.

## Don't

- Don't retype the wordmark. It is outlined and letter-spaced specifically; set
  type will not match.
- Don't recolour, add a gradient, add a shadow, or outline it.
- Don't stretch, rotate, or skew. Scale proportionally only.
- Don't put the two-colour mark on a busy photograph — use mono white.
- Don't rebuild the arch. The proportion is the identity; a wider or shorter
  arch becomes a generic doorway.
- Don't pair it with another display face. Prata for the name, Jost for
  everything else.

## Still outstanding

The wordmark is set from **Prata**, an open-source Google font, converted to
outlines. That is legitimate and licence-clean, but it means the letterforms are
not exclusive to Gala Retreat. If the client wants a genuinely proprietary
wordmark, the next step is redrawing the `G`, `A` and `R` by hand — tightening
the joins and giving the `R` a distinctive leg. That is a separate piece of work
and is not required for launch.
