window.DEFAULT_CHARACTERS = [
  { key: "Camila", role: "Lead astronomer \xB7 main character" },
  { key: "Zoe", role: "Physicist" },
  { key: "Kennedy", role: "Engineer" },
  { key: "Ava", role: "Biologist \xB7 linguist" },
  { key: "Patriya", role: "Deep-sea expert" },
  { key: "Annabelle", role: "Strategist" },
  { key: "Sophia", role: "Architect of the Chaos Plan" },
  { key: "Valen", role: "Fortitude translator" },
  { key: "Webb", role: "The famous doubter (Dr. Marcus Webb)" },
  { key: "Marcus", role: "Webb's first name" },
  { key: "Harper", role: "Cryosleep doctor (and her granddaughter Lila)" },
  { key: "Lila", role: "Dr. Harper's granddaughter" },
  { key: "Osei", role: "President of Ardana" },
  { key: "Ardana", role: "Osei's country" }
];
window.NamesContext = React.createContext({});
window.loadNames = function() {
  const out = {};
  for (const c of window.DEFAULT_CHARACTERS) out[c.key] = c.key;
  try {
    const saved = JSON.parse(localStorage.getItem("book-names") || "{}");
    for (const k of Object.keys(saved)) {
      if (saved[k] && typeof saved[k] === "string") out[k] = saved[k];
    }
  } catch (e) {
  }
  return out;
};
window.applyNames = function(text, names) {
  if (!text || !names) return text;
  let out = text;
  for (const c of window.DEFAULT_CHARACTERS) {
    const replacement = names[c.key];
    if (!replacement || replacement === c.key) continue;
    const re = new RegExp("\\b(" + c.key + ")\\b", "g");
    out = out.replace(re, (match) => {
      if (match === match.toUpperCase()) return replacement.toUpperCase();
      return replacement;
    });
  }
  return out;
};
window.NamesModal = function NamesModal({ names, onSave, onClose }) {
  const [draft, setDraft] = React.useState({ ...names });
  const update = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const handleSave = () => {
    const out = { ...draft };
    for (const c of window.DEFAULT_CHARACTERS) {
      const v = (out[c.key] || "").trim();
      out[c.key] = v.length > 0 ? v : c.key;
    }
    onSave(out);
  };
  const reset = () => {
    const fresh = {};
    for (const c of window.DEFAULT_CHARACTERS) fresh[c.key] = c.key;
    setDraft(fresh);
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "nm-backdrop", onClick: onClose }), /* @__PURE__ */ React.createElement("div", { className: "nm-modal" }, /* @__PURE__ */ React.createElement("button", { className: "nm-close", onClick: onClose }, "\xD7"), /* @__PURE__ */ React.createElement("div", { className: "nm-eyebrow" }, "MAKE IT YOUR OWN"), /* @__PURE__ */ React.createElement("h3", { className: "nm-title" }, "Rename the characters"), /* @__PURE__ */ React.createElement("p", { className: "nm-sub" }, "Type your own names below. They'll appear everywhere \u2014 every chapter, every glossary popup, every quiz. Leave a name blank or unchanged to keep the original."), /* @__PURE__ */ React.createElement("div", { className: "nm-grid" }, window.DEFAULT_CHARACTERS.map((c) => {
    var _a;
    return /* @__PURE__ */ React.createElement("label", { key: c.key, className: "nm-row" }, /* @__PURE__ */ React.createElement("span", { className: "nm-label" }, /* @__PURE__ */ React.createElement("span", { className: "nm-orig" }, c.key), /* @__PURE__ */ React.createElement("span", { className: "nm-role" }, c.role)), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "nm-input",
        type: "text",
        value: draft[c.key] === c.key ? "" : (_a = draft[c.key]) != null ? _a : "",
        placeholder: c.key,
        onChange: (e) => update(c.key, e.target.value)
      }
    ));
  })), /* @__PURE__ */ React.createElement("div", { className: "nm-actions" }, /* @__PURE__ */ React.createElement("button", { className: "nm-reset", onClick: reset }, "Reset to originals"), /* @__PURE__ */ React.createElement("button", { className: "nm-save", onClick: handleSave }, "Save"))));
};
