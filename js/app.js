const { useState, useEffect, useRef } = React;
function ChapterCover({ ch, meta }) {
  const names = React.useContext(window.NamesContext);
  const A = (s) => window.applyNames(s, names);
  return /* @__PURE__ */ React.createElement("div", { className: `chapter-cover palette-${meta.palette}` }, /* @__PURE__ */ React.createElement("div", { className: "cc-art" }, /* @__PURE__ */ React.createElement(window.ChapterArt, { kind: meta.art })), /* @__PURE__ */ React.createElement("div", { className: "cc-content" }, /* @__PURE__ */ React.createElement("div", { className: "cc-num" }, "CHAPTER ", String(ch.num).padStart(2, "0")), /* @__PURE__ */ React.createElement("h2", { className: "cc-title" }, A(ch.title)), /* @__PURE__ */ React.createElement("div", { className: "cc-sub" }, A(meta.subtitle))));
}
function withSecretLastWord(segs) {
  const out = segs.map((s) => ({ ...s }));
  for (let i = out.length - 1; i >= 0; i--) {
    const s = out[i];
    if (s.t !== "t") break;
    const m = s.v.match(/^([\s\S]*?)(\S+)(\s*)$/);
    if (!m) continue;
    const rep = [];
    if (m[1]) rep.push({ t: "t", v: m[1] });
    rep.push({ t: "s", v: m[2] });
    if (m[3]) rep.push({ t: "t", v: m[3] });
    out.splice(i, 1, ...rep);
    return out;
  }
  return out;
}
function ChapterBody({ ch, onGlossary, bookmark, onToggleBookmark, onSecret, secretCount }) {
  const last = ch.paragraphs.length - 1;
  return /* @__PURE__ */ React.createElement("div", { className: "chapter-body" }, ch.paragraphs.map((segs, i) => /* @__PURE__ */ React.createElement(
    window.Paragraph,
    {
      key: i,
      segments: i === last && onSecret ? withSecretLastWord(segs) : segs,
      onSecret: i === last ? onSecret : void 0,
      secretCount: i === last ? secretCount : 0,
      onGlossary,
      chapterNum: ch.num,
      paraIdx: i,
      isBookmarked: bookmark && bookmark.ch === ch.num && bookmark.p === i,
      onToggleBookmark
    }
  )));
}
function App() {
  const CHAPTERS = window.CHAPTERS;
  const META = window.CHAPTERS_META;
  const [names, setNames] = useState(() => window.loadNames());
  const [namesOpen, setNamesOpen] = useState(false);
  const isCustom = window.DEFAULT_CHARACTERS.some((c) => names[c.key] !== c.key);
  const [unlocked, setUnlocked] = useState(() => {
    const saved = parseInt(localStorage.getItem("book-unlocked") || "1");
    return Math.min(16, Math.max(1, saved));
  });
  const [showQuizFor, setShowQuizFor] = useState(null);
  const [glossary, setGlossary] = useState(null);
  const [bookmark, setBookmark] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("book-bookmark") || "null");
    } catch (e) {
      return null;
    }
  });
  const [showResume, setShowResume] = useState(false);
  const [secretClicks, setSecretClicks] = useState({});
  const [toast, setToast] = useState(null);
  const containerRef = useRef(null);
  const restoredRef = useRef(false);
  useEffect(() => {
    localStorage.setItem("book-unlocked", String(unlocked));
  }, [unlocked]);
  useEffect(() => {
    if (bookmark) localStorage.setItem("book-bookmark", JSON.stringify(bookmark));
    else localStorage.removeItem("book-bookmark");
  }, [bookmark]);
  useEffect(() => {
    let t;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        localStorage.setItem("book-scroll", String(window.scrollY));
      }, 250);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, []);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (bookmark) {
      setShowResume(true);
    } else {
      const sy = parseInt(localStorage.getItem("book-scroll") || "0");
      if (sy > 200) {
        setTimeout(() => window.scrollTo({ top: sy, behavior: "auto" }), 50);
      }
    }
  }, []);
  const jumpToBookmark = () => {
    if (!bookmark) return;
    setShowResume(false);
    if (bookmark.ch > unlocked) {
      setUnlocked(bookmark.ch);
      setTimeout(() => scrollToBookmark(), 200);
    } else {
      scrollToBookmark();
    }
  };
  const scrollToBookmark = () => {
    if (!bookmark) return;
    const el = document.querySelector(`[data-ch="${bookmark.ch}"][data-p="${bookmark.p}"]`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };
  const toggleBookmark = (ch, p) => {
    setBookmark((prev) => {
      if (prev && prev.ch === ch && prev.p === p) {
        showToast("Bookmark removed");
        return null;
      }
      showToast("Bookmark saved \xB7 click again to remove");
      return { ch, p };
    });
  };
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };
  const handleSecret = (chNum) => {
    setSecretClicks((prev) => {
      const n = (prev[chNum] || 0) + 1;
      if (n >= 5) {
        setUnlocked((u) => Math.max(u, Math.min(16, chNum + 1)));
        setShowQuizFor(null);
        showToast("Secret passage \xB7 Chapter " + (chNum + 1) + " unlocked");
        setTimeout(() => {
          const el = document.getElementById(`ch-${chNum + 1}`);
          if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
        }, 120);
        return { ...prev, [chNum]: 0 };
      }
      if (n === 3) showToast("Something is loosening\u2026");
      return { ...prev, [chNum]: n };
    });
  };
  const handleQuizComplete = () => {
    const next = Math.min(16, showQuizFor + 1);
    setUnlocked((u) => Math.max(u, next));
    const sq = showQuizFor;
    setShowQuizFor(null);
    setTimeout(() => {
      const el = document.getElementById(`ch-${sq + 1}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };
  const saveNames = (next) => {
    setNames(next);
    localStorage.setItem("book-names", JSON.stringify(next));
    setNamesOpen(false);
    showToast("Names saved across the whole book");
  };
  return /* @__PURE__ */ React.createElement(window.NamesContext.Provider, { value: names }, /* @__PURE__ */ React.createElement("div", { className: "reader", ref: containerRef }, /* @__PURE__ */ React.createElement("div", { className: "starfield" }, Array.from({ length: 80 }).map((_, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "star", style: {
    left: `${i * 37 % 100}%`,
    top: `${i * 53 % 100}%`,
    animationDelay: `${i % 7 * 0.5}s`,
    animationDuration: `${3 + i % 5}s`
  } }))), /* @__PURE__ */ React.createElement("header", { className: "book-header" }, /* @__PURE__ */ React.createElement("button", { className: "names-btn", onClick: () => setNamesOpen(true), title: "Rename the characters" }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ React.createElement("path", { d: "M12 14c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5z" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "8", r: "4" })), /* @__PURE__ */ React.createElement("span", null, isCustom ? "Edit character names" : "Rename the characters")), /* @__PURE__ */ React.createElement("div", { className: "book-eyebrow" }, (names.Camila || "Camila").toUpperCase(), "'S BOOK \xB7 BOOK ONE OF THE FORTITUDE CHRONICLES"), /* @__PURE__ */ React.createElement("h1", { className: "book-title" }, "The Arrival of the ", /* @__PURE__ */ React.createElement("em", null, "Fortitude")), /* @__PURE__ */ React.createElement("div", { className: "book-byline" }, "An interactive read \xB7 click ", /* @__PURE__ */ React.createElement("span", { className: "gword inline-demo" }, "underlined words"), " for the glossary \xB7 click any line to bookmark"), /* @__PURE__ */ React.createElement("div", { className: "progress-track" }, /* @__PURE__ */ React.createElement("div", { className: "progress-fill", style: { width: `${unlocked / 16 * 100}%` } }), /* @__PURE__ */ React.createElement("div", { className: "progress-label" }, unlocked, " of 16 chapters unlocked"))), CHAPTERS.slice(0, unlocked).map((ch) => {
    const meta = META[ch.num - 1];
    return /* @__PURE__ */ React.createElement("section", { key: ch.num, id: `ch-${ch.num}`, className: "chapter" }, /* @__PURE__ */ React.createElement(ChapterCover, { ch, meta }), /* @__PURE__ */ React.createElement(ChapterBody, { ch, onGlossary: (term, anchor) => setGlossary({ term, anchor }), bookmark, onToggleBookmark: toggleBookmark, onSecret: ch.num < 16 && unlocked === ch.num ? () => handleSecret(ch.num) : void 0, secretCount: secretClicks[ch.num] || 0 }), /* @__PURE__ */ React.createElement("div", { className: "chapter-end" }, showQuizFor === ch.num ? /* @__PURE__ */ React.createElement(window.Quiz, { chapterNum: ch.num, onComplete: handleQuizComplete }) : ch.num < 16 && unlocked === ch.num ? /* @__PURE__ */ React.createElement("button", { className: "next-chapter-btn", onClick: () => setShowQuizFor(ch.num) }, /* @__PURE__ */ React.createElement("span", { className: "ncb-eyebrow" }, "END OF CHAPTER ", ch.num), /* @__PURE__ */ React.createElement("span", { className: "ncb-title" }, "Take the comprehension check \u2192"), /* @__PURE__ */ React.createElement("span", { className: "ncb-sub" }, "5 quick questions, then on to Chapter ", ch.num + 1)) : ch.num === 16 && unlocked === 16 && showQuizFor !== 16 ? /* @__PURE__ */ React.createElement("button", { className: "next-chapter-btn", onClick: () => setShowQuizFor(16) }, /* @__PURE__ */ React.createElement("span", { className: "ncb-eyebrow" }, "END OF BOOK ONE"), /* @__PURE__ */ React.createElement("span", { className: "ncb-title" }, "Take the final comprehension check \u2192")) : null, ch.num === 16 && showQuizFor === null && unlocked === 16 && /* @__PURE__ */ React.createElement("div", { className: "book-end" }, /* @__PURE__ */ React.createElement("div", { className: "be-line" }, "\u2014 THE END OF BOOK ONE \u2014"), /* @__PURE__ */ React.createElement("div", { className: "be-tease" }, names.Camila || "Camila", "'s story continues in"), /* @__PURE__ */ React.createElement("div", { className: "be-next" }, "The Voice Beneath the Sea"), /* @__PURE__ */ React.createElement("div", { className: "be-next-sub" }, "Book Two of the Fortitude Chronicles"))));
  }), glossary && /* @__PURE__ */ React.createElement(window.GlossaryPopup, { term: glossary.term, anchor: glossary.anchor, onClose: () => setGlossary(null) }), bookmark && /* @__PURE__ */ React.createElement("div", { className: "bookmark-pill", onClick: jumpToBookmark, title: "Jump to your bookmark" }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "18", viewBox: "0 0 14 20", fill: "currentColor" }, /* @__PURE__ */ React.createElement("path", { d: "M0 0 L14 0 L14 20 L7 15 L0 20 Z" })), /* @__PURE__ */ React.createElement("div", { className: "bp-pill-text" }, /* @__PURE__ */ React.createElement("span", { className: "bp-pill-eyebrow" }, "YOUR BOOKMARK"), /* @__PURE__ */ React.createElement("span", { className: "bp-pill-title" }, "Chapter ", bookmark.ch, " \xB7 line ", bookmark.p + 1)), /* @__PURE__ */ React.createElement("span", { className: "bp-pill-jump" }, "jump \u2192")), showResume && bookmark && /* @__PURE__ */ React.createElement("div", { className: "resume-banner" }, /* @__PURE__ */ React.createElement("div", { className: "resume-eyebrow" }, "WELCOME BACK"), /* @__PURE__ */ React.createElement("div", { className: "resume-title" }, "Pick up where you left off?"), /* @__PURE__ */ React.createElement("div", { className: "resume-sub" }, "You bookmarked Chapter ", bookmark.ch, " \xB7 line ", bookmark.p + 1), /* @__PURE__ */ React.createElement("div", { className: "resume-actions" }, /* @__PURE__ */ React.createElement("button", { className: "resume-btn-primary", onClick: jumpToBookmark }, "Jump to bookmark"), /* @__PURE__ */ React.createElement("button", { className: "resume-btn-ghost", onClick: () => setShowResume(false) }, "Stay at the top"))), toast && /* @__PURE__ */ React.createElement("div", { className: "bp-toast" }, toast), /* @__PURE__ */ React.createElement("div", { className: "reset-bar" }, /* @__PURE__ */ React.createElement("button", { onClick: () => {
    if (!confirm("Clear progress and bookmark?")) return;
    localStorage.removeItem("book-unlocked");
    localStorage.removeItem("book-bookmark");
    localStorage.removeItem("book-scroll");
    setUnlocked(1);
    setBookmark(null);
    window.scrollTo(0, 0);
  } }, "start over")), namesOpen && /* @__PURE__ */ React.createElement(window.NamesModal, { names, onSave: saveNames, onClose: () => setNamesOpen(false) })));
}
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
