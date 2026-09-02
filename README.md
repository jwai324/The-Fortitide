# The Arrival of the Fortitude — Camila's Book

An interactive read of *The Arrival of the Fortitude*, Book One of the Fortitude Chronicles.
Sixteen illustrated chapters with tap-to-define glossary words, phonetic pronunciation
guides, a comprehension check after every chapter, bookmarks, and renameable characters.

**Live:** https://jwai324.github.io/The-Fortitide/

## What the reader can do

| Feature | How it works |
|---|---|
| **Glossary pop-ups** | Gold dotted-underlined words open a card with a *SAY IT* phonetic spelling, a kid-level definition, and a *REMEMBER IT* memory hook. The card scrolls with the page. |
| **Comprehension checks** | Five questions at the end of each chapter — multiple choice plus open-ended. Submitting shows right/wrong per question with an explanation, then unlocks the next chapter. |
| **Bookmarks** | Click any line to drop a gold ribbon. A pill in the top-right jumps back to it; reloading offers "pick up where you left off?". Scroll position auto-saves as a backup. |
| **Rename the characters** | A button in the header opens a modal for all 14 characters and places. New names apply across every chapter, glossary card and quiz, and persist. |
| **Secret passage** | Clicking the last word of a chapter five times skips the quiz and unlocks the next chapter. It glows brighter with each click. |

All progress lives in the reader's own browser (`localStorage`) — nothing is sent anywhere.
The "start over" control in the bottom-right clears it.

## Running it

It's a static site with no build step. Any web server works:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

A server is needed rather than opening `index.html` directly, because browsers block
`file://` pages from loading sibling scripts.

## Layout

```
index.html                 page shell, metadata, script order
styles.css                 all styling
js/data.js                 GLOSSARY, CHAPTERS_META (title/subtitle/art/palette), QUIZ
js/chapters.js             the book itself — 16 chapters as tagged text segments
js/art.js                  per-chapter animated SVG cover art
js/names.js                character-renaming system
js/glossary.js             glossary pop-up + paragraph renderer
js/quiz.js                 end-of-chapter quiz
js/app.js                  top-level app, progress, bookmarks
vendor/                    React 18.3.1 production builds, served from this repo
```

There is no bundler, no `package.json`, and no CDN at runtime — the page loads plain
scripts in order and each attaches itself to `window`. To change something, edit the file
and push; GitHub Pages redeploys.

### Editing the book text

`js/chapters.js` stores each paragraph as an array of segments:

```js
{ "t": "t", "v": "plain text" }                     // ordinary prose
{ "t": "g", "k": "telescope", "v": "Telescope" }    // glossary word: k = key into GLOSSARY
```

To make a new word clickable, split the surrounding `{t:'t'}` segment around it, insert a
`{t:'g'}` segment, and add a matching entry to `GLOSSARY` in `js/data.js` with `phon`,
`def` and `mnemonic`. A `{t:'g'}` segment whose `k` has no glossary entry renders as
styled text whose pop-up never opens, so keep the two in step.

## Relationship to the design prototype

Built from a Claude Design handoff bundle. The prototype compiled its JSX in the browser
via Babel and pulled React from a CDN; here the JSX is pre-compiled to plain JavaScript and
React is vendored, so there is nothing to compile at page load.

Behaviour and appearance match the prototype, with these deliberate departures:

- **Chapter 16 no longer prints its ending twice.** Five trailing paragraphs in the data
  duplicated the styled `.book-end` block the app already renders.
- **The bookmark pill is a pill again.** It had both `top: 16px` and `bottom: 60px` set,
  which stretched the fixed-position element into a full-height bar down the right edge.
- **A bookmarked line keeps its 14px indent** clear of its own gold rule; a later
  `.bp { padding: 4px 0 }` of equal specificity had been overriding it.
- **A bookmarked line's ribbon stays lit when you hover it** — `.bp:hover .bp-mark`
  outranks `.bp-bookmarked .bp-mark` on specificity and was dimming it to 40%.
- **All ten chapter palettes are styled.** Five (`amber`, `dim`, `earth`, `ember`, `warm`)
  were named in the data but had no CSS, so those chapter numbers fell back to gold.
- **Quiz radios are reachable by keyboard.** They were `display: none`, which removes them
  from the tab order and the accessibility tree.
- **`prefers-reduced-motion` is honoured**, for readers who find the drifting starfield
  hard to read against.
- The ~12 CSS rules that had been defined two or three times over are collapsed into one
  rule each, carrying the value the cascade was already producing.

Body text is 48px running the full window width — that is a deliberate choice, not an
oversight. Lines get long on a wide monitor; capping `.reader { max-width }` in
`styles.css` is the one-line change if that ever becomes a problem.

## Known gaps

- Glossary words and bookmarkable lines respond to clicks and taps but not to the keyboard;
  a reader navigating by keyboard alone can take the quizzes but cannot open a definition.
- Chapter cover art animates via SVG SMIL, which `prefers-reduced-motion` cannot switch off
  from CSS. The starfield and all UI motion do stop.
