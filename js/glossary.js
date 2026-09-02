const GlossaryPopup = ({ term, anchor, onClose }) => {
  const names = React.useContext(window.NamesContext);
  const entry = window.GLOSSARY[term];
  if (!entry || !anchor) return null;
  const A = (s) => window.applyNames(s, names);
  const r = anchor.getBoundingClientRect();
  const W = 320;
  const sx = window.scrollX || window.pageXOffset;
  const sy = window.scrollY || window.pageYOffset;
  let left = r.left + sx + r.width / 2 - W / 2;
  left = Math.max(12 + sx, Math.min(sx + window.innerWidth - W - 12, left));
  let top = r.bottom + sy + 10;
  let arrowDown = false;
  if (r.bottom + 240 > window.innerHeight) {
    top = r.top + sy - 240 - 10;
    arrowDown = true;
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { position: "fixed", inset: 0, zIndex: 90 } }), /* @__PURE__ */ React.createElement("div", { className: "glossary-pop", style: { position: "absolute", top, left, width: W, zIndex: 91 } }, /* @__PURE__ */ React.createElement("div", { className: "gp-arrow", style: { [arrowDown ? "bottom" : "top"]: -6, left: r.left + sx + r.width / 2 - left - 6 } }), /* @__PURE__ */ React.createElement("div", { className: "gp-label" }, "GLOSSARY"), /* @__PURE__ */ React.createElement("div", { className: "gp-term" }, term), entry.phon && /* @__PURE__ */ React.createElement("div", { className: "gp-phon" }, /* @__PURE__ */ React.createElement("span", { className: "gp-phon-tag" }, "SAY IT"), /* @__PURE__ */ React.createElement("span", { className: "gp-phon-text" }, entry.phon)), /* @__PURE__ */ React.createElement("div", { className: "gp-def" }, A(entry.def)), /* @__PURE__ */ React.createElement("div", { className: "gp-mnem-label" }, "REMEMBER IT"), /* @__PURE__ */ React.createElement("div", { className: "gp-mnem" }, A(entry.mnemonic)), /* @__PURE__ */ React.createElement("button", { className: "gp-close", onClick: onClose }, "\xD7")));
};
const Paragraph = ({ segments, onGlossary, chapterNum, paraIdx, isBookmarked, onToggleBookmark, onSecret, secretCount = 0 }) => {
  const handleClick = (e) => {
    if (e.target.closest(".gword")) return;
    const sel = window.getSelection && window.getSelection();
    if (sel && sel.toString().length > 0) return;
    onToggleBookmark(chapterNum, paraIdx);
  };
  return /* @__PURE__ */ React.createElement(
    "p",
    {
      className: `bp ${isBookmarked ? "bp-bookmarked" : ""}`,
      "data-ch": chapterNum,
      "data-p": paraIdx,
      onClick: handleClick,
      title: isBookmarked ? "Click to remove bookmark" : "Click to bookmark this line"
    },
    /* @__PURE__ */ React.createElement("span", { className: "bp-mark", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "20", viewBox: "0 0 14 20", fill: "currentColor" }, /* @__PURE__ */ React.createElement("path", { d: "M0 0 L14 0 L14 20 L7 15 L0 20 Z" }))),
    /* @__PURE__ */ React.createElement(NamedSegments, { segments, onGlossary, onSecret, secretCount })
  );
};
function NamedSegments({ segments, onGlossary, onSecret, secretCount = 0 }) {
  const names = React.useContext(window.NamesContext);
  return segments.map((s, i) => {
    if (s.t === "t") return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, window.applyNames(s.v, names));
    if (s.t === "s") return /* @__PURE__ */ React.createElement("span", { key: i, className: `sword${secretCount > 0 ? " sword-armed sword-s" + Math.min(4, secretCount) : ""}`, onClick: (e) => {
      e.stopPropagation();
      onSecret && onSecret();
    } }, window.applyNames(s.v, names));
    return /* @__PURE__ */ React.createElement("span", { key: i, className: "gword", onClick: (e) => {
      e.stopPropagation();
      onGlossary(s.k, e.currentTarget);
    } }, s.v);
  });
}
window.GlossaryPopup = GlossaryPopup;
window.Paragraph = Paragraph;
window.NamedSegments = NamedSegments;
