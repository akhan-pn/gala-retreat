# Gala Retreat — logo

**The Marigold.** Eight discs on a ring, unioned with a centre disc, with the
eye punched out.

The genda marigold is the flower every Indian wedding is strung with — the
garland at the gate, the mandap, the car, the threshold. It is the one object
that is present at literally every function this venue hosts, from a haldi to a
corporate inauguration.

**It is built, not drawn.** Eight circles on an exact ring, unioned with a core
disc, with a reverse-wound circle punching the eye. That construction is what
keeps a flower out of clipart territory: the geometry is precise and repeatable,
so it reads as a made mark rather than an illustration. It also means the whole
form is described by four numbers — petal radius, ring radius, core radius, eye
radius — which is what makes the optical small cut possible.

Winding is load-bearing. The petals and core wind one way so the default
non-zero fill rule unions them; the eye winds the other way, which punches the
hole. Even-odd would cancel every overlap and produce a rosette of slivers.

Two optical cuts. Below 26px the eye is opened and the ring pulled in slightly,
the way a type family's caption cut is adjusted — at 16px the primary cut's eye
closes to under two pixels and fills in.

### What was rejected, and why

Seven other territories were drawn and discarded, all committed under
`docs/brand/`: a Qutb Shahi khatim star (strong, and it offered a pattern
system, but colder and less obviously a wedding venue), a pierced jaali screen
(the most Deccan of the set, but mush below 24px), a diya (instantly understood
and the most common mark in the category), a shamiana canopy (read as a
mushroom), a toran garland (read as a comb), a GR monogram (says "an estate",
not this one), and an ogee threshold arch (well drawn in the end, but a doorway
is a doorway).

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
| `mark-small.svg` · `-light` · `-on-nightfall` | **24px and below.** The optical small cut, opened eye. |
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
| Mark, primary cut | **26px** | Below this the eye closes up. |
| Mark, small cut | **16px** | Hard floor. Do not go smaller — use the wordmark instead. |

**Use `mark-small.svg` at 24px and below.** The eye is the first thing to close
on a pixel grid, and a rosette with a filled-in centre is just a blob.

## Clear space

Keep clear space equal to **the radius of one petal** on all four sides — about
one seventh of the mark's width. Nothing sits inside that: no rule, no photo
edge, no other logo, no caption.

On photography, the clear space is also a legibility requirement. Place the
lockup over an area of even tone; if the image is busy, put it on a solid panel
rather than adding a drop shadow.

## Colour

| | Hex | Use |
|---|---|---|
| Nightfall | `#14110D` | The arch and wordmark on light grounds. |
| Ivory | `#EDE6DA` | The arch and wordmark on dark grounds. |
| Champagne | `#C6A15B` | The mark on dark grounds; the subline on dark grounds only. |
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
- Don't redraw it as an outline, add a stem, or add leaves. It is a geometric rosette, not a botanical illustration.
- Don't change the petal count. Eight is the construction.
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
