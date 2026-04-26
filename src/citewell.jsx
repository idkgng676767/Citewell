import { useState } from "react";

/* ─── COLOURS ─────────────────────────────── */
const C = {
  bg:"#f7f3ee",paper:"#fdfaf6",paperDark:"#f0ebe3",
  border:"#ddd3c4",borderLight:"#ede6db",
  ink:"#1e1208",inkMid:"#4a3828",inkLight:"#7a6555",inkFaint:"#a89080",
  toffee:"#8b5e3c",toffeePale:"#f5ede3",
  amber:"#b07020",amberPale:"#fdf3e3",
  green:"#4a7c59",greenPale:"#edf7f1",
  red:"#c0392b",redPale:"#fdf0ee",
  foundBorder:"#a8d5b5",missingBorder:"#f0c070",
};

const STYLES = ["APA 7th","MLA 9th","Chicago 17th","Harvard"];
const SOURCE_TYPES = ["journal","book","website","youtube"];

/* ─── AUTHOR HELPERS ──────────────────────── */
function initials(first = "") {
  return first.trim().split(/\s+/).filter(Boolean).map(p => p[0]?.toUpperCase() + ".").join(" ");
}
function toObj(a) {
  if (typeof a !== "string") return { family: a.family || "", given: a.given || "" };
  const p = a.split(",");
  return p.length >= 2
    ? { family: p[0].trim(), given: p.slice(1).join(",").trim() }
    : { family: a.trim(), given: "" };
}
function formatAPA_auth(authors = []) {
  if (!authors.length) return "";
  const fmt = authors.map(a => {
    const o = toObj(a);
    const g = initials(o.given);
    return g ? `${o.family}, ${g}` : o.family;
  });
  if (fmt.length === 1) return fmt[0];
  if (fmt.length <= 20) return fmt.slice(0, -1).join(", ") + ", & " + fmt[fmt.length - 1];
  return fmt.slice(0, 19).join(", ") + ", . . . " + fmt[fmt.length - 1];
}
function formatMLA_auth(authors = []) {
  const f = (a, i) => {
    const o = toObj(a);
    return i === 0 ? `${o.family}, ${o.given}`.trim().replace(/,\s*$/, "") : `${o.given} ${o.family}`.trim();
  };
  if (!authors.length) return "";
  if (authors.length === 1) return f(authors[0], 0);
  if (authors.length === 2) return `${f(authors[0], 0)}, and ${f(authors[1], 1)}`;
  if (authors.length === 3) return `${f(authors[0], 0)}, ${f(authors[1], 1)}, and ${f(authors[2], 2)}`;
  return `${f(authors[0], 0)}, et al.`;
}
function formatChicago_auth(authors = []) {
  const f = (a, i) => {
    const o = toObj(a);
    return i === 0 ? `${o.family}, ${o.given}`.trim().replace(/,\s*$/, "") : `${o.given} ${o.family}`.trim();
  };
  if (!authors.length) return "";
  if (authors.length === 1) return f(authors[0], 0);
  if (authors.length <= 3) return [f(authors[0], 0), ...authors.slice(1).map((a, i) => f(a, i + 1))].join(", ");
  return `${f(authors[0], 0)} et al.`;
}
function formatHarvard_auth(authors = []) {
  const f = a => {
    const o = toObj(a);
    const g = initials(o.given);
    return g ? `${o.family}, ${g}` : o.family;
  };
  if (!authors.length) return "";
  if (authors.length === 1) return f(authors[0]);
  if (authors.length <= 3) return authors.map(f).join(", ");
  return f(authors[0]) + " et al.";
}

function monthName(n) {
  return ["January","February","March","April","May","June","July","August","September","October","November","December"][n - 1] || "";
}
function parseDate(s) {
  if (!s) return {};
  const p = String(s).split(/[-/]/).map(Number);
  return { year: p[0] || null, month: p[1] || null, day: p[2] || null };
}
function it(t) { return t ? `_${t.trim()}_` : ""; }
function cleanTitle(t = "") { return t.trim().replace(/\.$/, ""); }
function cleanPages(p = "") { return p.replace(/\s*[-–—]+\s*/g, "–"); }

/* ─── CITATION FORMATTERS ─────────────────── */
function buildCitation(style, d) {
  const {
    authors = [], year, publishDate, journal, volume, issue, doi, url,
    publisher, city, edition, siteName, type, uploader, accessDate,
  } = d;
  const title = cleanTitle(d.title || "");
  const pages = cleanPages(d.pages || "");
  const dt = parseDate(publishDate);
  const yr = (year && String(year).trim()) || (dt.year ? String(dt.year) : "n.d.");
  const u = doi ? `https://doi.org/${doi}` : (url || "");

  if (style === "APA 7th") {
    const auth = formatAPA_auth(authors);
    if (type === "book") {
      const ed = edition ? ` (${edition} ed.)` : "";
      return `${auth || publisher || "Author, A. A."} (${yr}). ${it(title)}${ed}. ${publisher || "Publisher"}.${doi ? ` https://doi.org/${doi}` : ""}`;
    }
    if (type === "journal") {
      return [
        `${auth} (${yr}). ${title}. ${it(journal)}`,
        volume ? (issue ? `${it(volume)}(${issue})` : it(volume)) : (issue ? `(${issue})` : ""),
        pages ? pages : "",
        u,
      ].filter(Boolean).join(", ").replace(/,\s*\.$/, ".");
    }
    if (type === "youtube") {
      return `${uploader || auth || "Channel"} (${yr}). ${it(title)} [Video]. YouTube. ${u}`;
    }
    const dateStr = dt.year
      ? `(${dt.year}${dt.month ? `, ${monthName(dt.month)}${dt.day ? ` ${dt.day}` : ""}` : ""})`
      : `(${yr})`;
    const acc = accessDate ? ` Retrieved ${accessDate}, from ` : " ";
    return `${auth ? auth + " " : ""}${dateStr}. ${it(title)}. ${siteName || publisher || "Website"}.${acc}${u}`;
  }

  if (style === "MLA 9th") {
    const auth = formatMLA_auth(authors);
    if (type === "book") {
      const ed = edition ? ` ${edition} ed.,` : "";
      return `${auth ? auth + ". " : ""}${it(title)}.${ed} ${publisher || "Publisher"}, ${yr}.`;
    }
    if (type === "journal") {
      const parts = [
        auth ? auth + "." : "",
        `"${title}."`,
        it(journal) + (volume ? `, vol. ${volume}` : "") + (issue ? `, no. ${issue}` : "") + (yr ? `, ${yr}` : "") + (pages ? `, pp. ${pages}` : "") + ".",
        u ? u + "." : "",
      ];
      return parts.filter(Boolean).join(" ");
    }
    if (type === "youtube") {
      return `${uploader || auth || "Channel"}. "${title}." YouTube, ${yr}, ${u}.`;
    }
    const dateStr = dt.day ? `${dt.day} ${monthName(dt.month)} ${dt.year}` : yr;
    const acc = accessDate ? ` Accessed ${accessDate}.` : "";
    const parts = [
      auth ? auth + "." : "",
      `"${title}."`,
      it(siteName || publisher || "Website") + ", " + dateStr + ", " + u + ".",
      acc,
    ];
    return parts.filter(Boolean).join(" ");
  }

  if (style === "Chicago 17th") {
    const auth = formatChicago_auth(authors);
    if (type === "book") {
      const loc = city ? `${city}: ` : "";
      return `${auth ? auth + ". " : ""}${it(title)}${edition ? `. ${edition} ed.` : ""} ${loc}${publisher || "Publisher"}, ${yr}.`;
    }
    if (type === "journal") {
      return [
        auth ? auth + "." : "",
        `"${title}."`,
        it(journal) + (volume ? ` ${volume}` : "") + (issue ? `, no. ${issue}` : "") + ` (${yr})` + (pages ? `: ${pages}` : "") + ".",
        u ? u + "." : "",
      ].filter(Boolean).join(" ");
    }
    if (type === "youtube") {
      return `${uploader || auth || "Channel"}. "${title}." YouTube video. ${yr}. ${u}`;
    }
    const dateStr = dt.day ? `${monthName(dt.month)} ${dt.day}, ${dt.year}` : yr;
    const acc = accessDate ? ` Accessed ${accessDate}.` : "";
    const parts = [
      auth ? auth + "." : "",
      `"${title}."`,
      (siteName || publisher || "Website") + "." + acc,
      dateStr + ".",
      u ? u + "." : "",
    ];
    return parts.filter(Boolean).join(" ");
  }

  if (style === "Harvard") {
    const auth = formatHarvard_auth(authors);
    if (type === "book") {
      return `${auth ? auth + " " : ""}(${yr}) ${it(title)}${edition ? ` (${edition} edn)` : ""} ${city ? city + ": " : ""}${publisher || "Publisher"}.`;
    }
    if (type === "journal") {
      return [
        auth ? auth + " " : "",
        `(${yr}) `,
        `'${title}', `,
        it(journal),
        volume ? `, ${volume}` : "",
        issue ? `(${issue})` : "",
        pages ? `, pp. ${pages}` : "",
        u ? `. ${u}` : "",
      ].join("").replace(/\s+/g, " ").trim();
    }
    if (type === "youtube") {
      return `${uploader || auth || "Channel"} (${yr}) ${it(title)} [Online video]. Available at: ${u}${accessDate ? ` [Accessed: ${accessDate}]` : ""}`;
    }
    return `${auth ? auth + " " : ""}(${yr}) ${it(title)} [Online]. ${siteName || publisher || ""}. Available at: ${u}${accessDate ? ` [Accessed: ${accessDate}]` : ""}`;
  }

  return "Style not implemented.";
}

/* ─── INPUT DETECTION & FETCHING ──────────── */
function detectType(raw) {
  const s = raw.trim();
  if (/^10\.\d{4,}\/\S+/.test(s) || /doi\.org/.test(s)) return "doi";
  if (/youtu(be\.com|\.be)/.test(s)) return "youtube";
  if (/isbn:?\s*[\d\-X]{10,17}/i.test(s) || /^[\d\-X]{10,13}$/i.test(s.replace(/\s/g, ""))) return "isbn";
  if (/^https?:\/\//.test(s)) return "url";
  return "search";
}
function cleanDOI(raw) { const m = raw.match(/10\.\d{4,}\/\S+/); return m ? m[0] : raw.trim(); }
function cleanISBN(raw) { return raw.replace(/isbn:?\s*/i, "").replace(/[^0-9X]/gi, ""); }

async function fetchDOI(doi) {
  const r = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  if (!r.ok) throw new Error("DOI not found in CrossRef");
  const j = await r.json();
  const w = j.message;
  const dp = w["published-print"] || w["published-online"] || w.issued;
  const parts = dp?.["date-parts"]?.[0] || [];
  const found = new Set();
  const titleVal = (w.title || [""])[0]; if (titleVal) found.add("title");
  const authVal = w.author || []; if (authVal.length) found.add("authors");
  const journalVal = (w["container-title"] || [""])[0]; if (journalVal) found.add("journal");
  if (w.volume) found.add("volume");
  if (w.issue) found.add("issue");
  if (w.page) found.add("pages");
  if (parts[0]) found.add("year");
  if (w.DOI || doi) found.add("doi");
  if (w.publisher) found.add("publisher");
  return {
    type: "journal",
    title: titleVal,
    authors: authVal.map(a => ({ family: a.family || "", given: a.given || "" })),
    journal: journalVal,
    volume: w.volume || "", issue: w.issue || "", pages: w.page || "",
    year: parts[0]?.toString() || "", doi: w.DOI || doi, url: w.URL || "",
    publisher: w.publisher || "",
    _found: found,
  };
}

async function fetchISBN(isbn) {
  const olR = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
  const olJ = await olR.json();
  const key = Object.keys(olJ)[0];
  if (key) {
    const b = olJ[key];
    const authors = (b.authors || []).map(a => {
      const p = (a.name || "").trim().split(/\s+/);
      return p.length > 1 ? { family: p[p.length - 1], given: p.slice(0, -1).join(" ") } : { family: a.name || "", given: "" };
    });
    const pub = (b.publish_date || "").match(/\d{4}/)?.[0] || "";
    const publisher = (b.publishers || []).map(p => p.name).join(", ");
    const city = (b.publish_places || []).map(p => p.name).join(", ");
    const found = new Set();
    if (b.title) found.add("title");
    if (authors.length) found.add("authors");
    if (publisher) found.add("publisher");
    if (city) found.add("city");
    if (pub) found.add("year");
    if (b.edition_name) found.add("edition");
    return { type: "book", title: b.title || "", authors, publisher, city, year: pub, edition: b.edition_name || "", isbn, _found: found };
  }
  const gbR = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
  const gbJ = await gbR.json();
  const vol = gbJ.items?.[0]?.volumeInfo;
  if (!vol) throw new Error("ISBN not found in Open Library or Google Books");
  const authors = (vol.authors || []).map(name => {
    const p = name.trim().split(/\s+/);
    return p.length > 1 ? { family: p[p.length - 1], given: p.slice(0, -1).join(" ") } : { family: name, given: "" };
  });
  const found = new Set();
  if (vol.title) found.add("title");
  if (authors.length) found.add("authors");
  if (vol.publisher) found.add("publisher");
  if (vol.publishedDate) found.add("year");
  return { type: "book", title: vol.title || "", authors, publisher: vol.publisher || "", city: "", year: (vol.publishedDate || "").slice(0, 4), edition: "", isbn, _found: found };
}

async function fetchYouTube(url) {
  const r = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
  const j = await r.json();
  if (!j.title) throw new Error("YouTube video not found via noembed");
  const dm = j.upload_date?.match(/(\d{4})(\d{2})(\d{2})/);
  const found = new Set(["url"]);
  if (j.title) found.add("title");
  if (j.author_name) found.add("uploader");
  if (dm) { found.add("year"); found.add("publishDate"); }
  return {
    type: "youtube", title: j.title || "", uploader: j.author_name || "", url,
    publishDate: dm ? `${dm[1]}-${dm[2]}-${dm[3]}` : "", year: dm ? dm[1] : "",
    _found: found,
  };
}

async function fetchURL(url) {
  const cleanedUrl = url.replace(/#:~:text=[^#]*$/, "");
  const r = await fetch(`https://api.microlink.io?url=${encodeURIComponent(cleanedUrl)}`);
  const j = await r.json();
  const d = j.data || {};
  const authorStr = (d.author || "").trim();
  let authors = [];
  if (authorStr) {
    if (authorStr.includes(",")) {
      authors = [authorStr];
    } else {
      const p = authorStr.split(/\s+/);
      authors = p.length > 1 ? [`${p[p.length - 1]}, ${p.slice(0, -1).join(" ")}`] : [authorStr];
    }
  }
  const pubDate = d.date || d.published_time || "";
  const yr = pubDate ? String(parseDate(pubDate).year || "") : "";
  let rawTitle = d.title || "";
  let siteNameVal = d.publisher || d.site || "";
  // Strip site name from pipe-separated HTML <title> tags
  const pipeParts = rawTitle.split(/\s*[|–—]\s*/);
  if (pipeParts.length > 1) {
    rawTitle = pipeParts[0].trim();
    if (!siteNameVal || siteNameVal === new URL(cleanedUrl).hostname.replace(/^www\./, "")) {
      siteNameVal = pipeParts[pipeParts.length - 1].trim() || siteNameVal;
    }
  }
  if (!siteNameVal) { try { siteNameVal = new URL(cleanedUrl).hostname.replace(/^www\./, ""); } catch { siteNameVal = ""; } }
  const found = new Set();
  if (rawTitle) found.add("title");
  if (authors.length) found.add("authors");
  if (siteNameVal) found.add("siteName");
  if (pubDate) found.add("publishDate");
  if (yr) found.add("year");
  found.add("url");
  return { type: "website", title: rawTitle, authors, siteName: siteNameVal, publishDate: pubDate, year: yr, url: cleanedUrl, _found: found };
}

async function fetchSearch(query) {
  const r = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`);
  const j = await r.json();
  const vol = j.items?.[0]?.volumeInfo;
  if (!vol) throw new Error("No results found for that title — try pasting a URL, DOI, or ISBN instead");
  const authors = (vol.authors || []).map(name => {
    const p = name.trim().split(/\s+/);
    return p.length > 1 ? { family: p[p.length - 1], given: p.slice(0, -1).join(" ") } : { family: name, given: "" };
  });
  const found = new Set();
  if (vol.title) found.add("title");
  if (authors.length) found.add("authors");
  if (vol.publisher) found.add("publisher");
  if (vol.publishedDate) found.add("year");
  return {
    type: "book", title: vol.title || "", authors, publisher: vol.publisher || "",
    year: (vol.publishedDate || "").slice(0, 4), edition: "", city: "",
    _note: "Found via Google Books — please verify these details.",
    _found: found,
  };
}

/* ─── FIELD META ──────────────────────────── */
const FM = {
  authors:     { label: "Author(s)",     hint: "Last, First M.",      multi: true },
  title:       { label: "Title",         hint: "Full title" },
  journal:     { label: "Journal Name",  hint: "e.g. Nature" },
  volume:      { label: "Volume",        hint: "e.g. 12" },
  issue:       { label: "Issue",         hint: "e.g. 3" },
  pages:       { label: "Pages",         hint: "e.g. 45–67" },
  year:        { label: "Year",          hint: "e.g. 2023" },
  doi:         { label: "DOI",           hint: "10.xxxx/xxxxx" },
  publisher:   { label: "Publisher",     hint: "Publisher name" },
  city:        { label: "City",          hint: "City of publication" },
  edition:     { label: "Edition",       hint: "e.g. 3rd" },
  isbn:        { label: "ISBN",          hint: "978-xxx" },
  siteName:    { label: "Website Name",  hint: "e.g. BBC News" },
  publishDate: { label: "Published Date",hint: "e.g. 2024-03-15" },
  accessDate:  { label: "Date Accessed", hint: "e.g. 2026-03-10" },
  url:         { label: "URL",           hint: "https://…" },
  uploader:    { label: "Channel Name",  hint: "YouTube channel" },
};
const FIELDS_BY_TYPE = {
  journal: ["authors","title","journal","volume","issue","pages","year","doi","publisher"],
  book:    ["authors","title","edition","publisher","city","year","isbn"],
  website: ["authors","title","siteName","publishDate","year","url","accessDate"],
  youtube: ["uploader","title","year","publishDate","url"],
  default: ["authors","title","year","publisher","url"],
};

/* ─── RENDER ITALICS ─────────────────────── */
function RC({ text }) {
  if (!text) return null;
  return (
    <>
      {text.split(/(_[^_]+_)/g).map((p, i) =>
        p.startsWith("_") && p.endsWith("_") && p.length > 2
          ? <em key={i}>{p.slice(1, -1)}</em>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

/* ─── BASE STYLES ─────────────────────────── */
const inp = {
  padding: "9px 12px", background: "#fff", border: `1.5px solid ${C.border}`,
  borderRadius: 7, color: C.ink, fontSize: 14, outline: "none",
  fontFamily: "'DM Sans',sans-serif", width: "100%", boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};
const ghostBtn = {
  padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`,
  background: C.paper, color: C.inkMid, fontSize: 13, cursor: "pointer",
  fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
};

/* ─── FIELD ROW ───────────────────────────── */
function FieldRow({ id, value, found, onChange }) {
  const meta = FM[id] || { label: id, hint: "" };
  if (meta.multi) {
    const authors = Array.isArray(value) ? value : [""];
    const updateA = (i, v) => { const n = [...authors]; n[i] = v; onChange(n); };
    return (
      <div style={{ borderLeft: `3px solid ${found ? C.foundBorder : C.missingBorder}`, background: found ? "#edf6f0" : "#fef6ec", borderRadius: "0 8px 8px 0", padding: "10px 14px", marginBottom: 3 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.inkMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'DM Sans',sans-serif" }}>{meta.label}</label>
          {found
            ? <span style={{ fontSize: 11, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>✓ found</span>
            : <span style={{ fontSize: 11, color: C.amber, fontFamily: "'DM Sans',sans-serif" }}>● fill in</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {authors.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 6 }}>
              <input value={a} onChange={e => updateA(i, e.target.value)} placeholder="Last, First M." style={{ ...inp, flex: 1 }} />
              {authors.length > 1 && (
                <button onClick={() => onChange(authors.filter((_, j) => j !== i))}
                  style={{ padding: "6px 10px", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, cursor: "pointer", color: C.red, fontSize: 12 }}>✕</button>
              )}
            </div>
          ))}
          <button onClick={() => onChange([...authors, ""])}
            style={{ background: "none", border: `1px dashed ${C.border}`, borderRadius: 7, color: C.inkLight, padding: "6px 12px", fontSize: 12, cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans',sans-serif" }}>
            + Add author
          </button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ borderLeft: `3px solid ${found ? C.foundBorder : C.missingBorder}`, background: found ? "#edf6f0" : "#fef6ec", borderRadius: "0 8px 8px 0", padding: "10px 14px", marginBottom: 3 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: C.inkMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'DM Sans',sans-serif" }}>{meta.label}</label>
        {found
          ? <span style={{ fontSize: 11, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>✓ found</span>
          : <span style={{ fontSize: 11, color: C.amber, fontFamily: "'DM Sans',sans-serif" }}>● fill in</span>}
      </div>
      <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder={meta.hint} style={inp}
        onFocus={e => { e.target.style.borderColor = C.toffee; e.target.style.boxShadow = `0 0 0 3px rgba(139,94,60,0.1)`; }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }} />
    </div>
  );
}

/* ─── MAIN ────────────────────────────────── */
export default function Citewell() {
  const [query, setQuery]       = useState("");
  const [citStyle, setCitStyle] = useState("APA 7th");
  const [phase, setPhase]       = useState("search");
  const [err, setErr]           = useState("");
  const [srcData, setSrcData]   = useState({});
  const [foundSet, setFoundSet] = useState(new Set());
  const [formVals, setFormVals] = useState({});
  const [citation, setCitation] = useState("");
  const [copied, setCopied]     = useState(false);
  const [saved, setSaved]       = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  const normaliseAuthors = authors =>
    (Array.isArray(authors) ? authors : [])
      .filter(Boolean)
      .map(a => {
        if (typeof a === "string") return a;
        const o = { family: a.family || "", given: a.given || "" };
        return o.given ? `${o.family}, ${o.given}` : o.family;
      });

  const lookup = async () => {
    if (!query.trim()) return;
    setPhase("loading"); setErr("");
    try {
      const kind = detectType(query);
      let result;
      if (kind === "doi")     result = await fetchDOI(cleanDOI(query));
      else if (kind === "isbn")    result = await fetchISBN(cleanISBN(query));
      else if (kind === "youtube") result = await fetchYouTube(query.trim());
      else if (kind === "url")     result = await fetchURL(query.trim());
      else                         result = await fetchSearch(query.trim());
      const found = result._found instanceof Set ? result._found : new Set(result._found || []);
      setSrcData(result);
      setFoundSet(found);
      const norm = { ...result, authors: normaliseAuthors(result.authors) };
      setFormVals(norm);
      setPhase("filling");
    } catch (e) {
      setErr(e.message || "Couldn't fetch that source.");
      setPhase("search");
    }
  };

  const generate = (overrideStyle, overrideVals) => {
    const s = overrideStyle || citStyle;
    const vals = overrideVals || formVals;
    const authors = (vals.authors || []).filter(Boolean).map(toObj);
    const cit = buildCitation(s, { ...vals, authors, type: srcData.type });
    setCitation(cit);
    setPhase("result");
  };

  const switchStyle = s => {
    setCitStyle(s);
    if (phase === "result") {
      const authors = (formVals.authors || []).filter(Boolean).map(toObj);
      setCitation(buildCitation(s, { ...formVals, authors, type: srcData.type }));
    }
  };

  const changeType = newType => {
    setSrcData(d => ({ ...d, type: newType }));
    const newFields = FIELDS_BY_TYPE[newType] || FIELDS_BY_TYPE.default;
    const newFound = new Set(newFields.filter(f => {
      const v = formVals[f];
      return Array.isArray(v) ? v.filter(Boolean).length > 0 : !!v;
    }));
    setFoundSet(newFound);
  };

  const reset = () => {
    setQuery(""); setPhase("search"); setErr(""); setSrcData({});
    setFoundSet(new Set()); setFormVals({}); setCitation("");
  };
  const copy = () => {
    navigator.clipboard.writeText(citation.replace(/_([^_]+)_/g, "$1"));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const save = () => {
    if (!citation) return;
    setSaved(s => [{ id: Date.now(), text: citation, style: citStyle, type: srcData.type }, ...s]);
  };
  const setVal = (k, v) => setFormVals(f => ({ ...f, [k]: v }));

  const fieldList = FIELDS_BY_TYPE[srcData.type] || FIELDS_BY_TYPE.default;
  const sorted = [
    ...fieldList.filter(f => !foundSet.has(f)),
    ...fieldList.filter(f => foundSet.has(f)),
  ];

  const SRC_ICON  = { journal: "📄", book: "📖", website: "🌐", youtube: "▶️" };
  const SRC_LABEL = { journal: "Journal Article", book: "Book", website: "Website", youtube: "YouTube Video" };

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: C.bg, fontFamily: "'Lora',Georgia,serif", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after{box-sizing:border-box;}
        html, body, #root{margin:0;padding:0;width:100%;min-height:100vh;}
        ::placeholder{color:${C.inkFaint};}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp 0.3s ease forwards;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .sp{animation:spin 0.85s linear infinite;display:inline-block;}
        button:hover{opacity:0.82;transition:opacity 0.12s;}
        input:focus{outline:none;}
        select{font-family:'DM Sans',sans-serif;font-size:13px;color:${C.inkMid};background:${C.paper};border:1.5px solid ${C.border};border-radius:7px;padding:6px 10px;cursor:pointer;}
        select:focus{outline:none;border-color:${C.toffee};}
      `}</style>

      {/* ── Topbar ── */}
      <div style={{ borderBottom: `1px solid ${C.borderLight}`, background: C.paper, width: "100%" }}>
        <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 700 }}>Citewell</span>
            <span style={{ fontSize: 11, color: C.inkFaint, fontFamily: "'DM Sans',sans-serif", borderLeft: `1px solid ${C.border}`, paddingLeft: 10 }}>Free · No ads · No AI</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {phase !== "search" && (
              <button onClick={reset} style={{ ...ghostBtn, fontSize: 12 }}>← New</button>
            )}
            <button onClick={() => setShowSaved(!showSaved)}
              style={{ ...ghostBtn, fontSize: 12, color: saved.length ? C.toffee : C.inkFaint, borderColor: saved.length ? C.toffee : C.border }}>
              {saved.length ? `📚 ${saved.length} saved` : "Saved"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 740, margin: "0 auto", padding: "44px 24px 90px" }}>

        {/* ── SEARCH ── */}
        {phase === "search" && (
          <div className="fu">
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ display: "inline-block", background: C.toffeePale, border: `1px solid ${C.border}`, borderRadius: 24, padding: "4px 14px", fontSize: 11, color: C.toffee, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, marginBottom: 18, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Paste a link — metadata fetched automatically
              </div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 700, lineHeight: 1.1, marginBottom: 14 }}>
                Citations without<br /><em>the headache.</em>
              </h1>
              <p style={{ color: C.inkLight, fontSize: 15, fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}>
                Paste any URL, DOI, ISBN, or YouTube link.
              </p>
            </div>

            {/* Style picker */}
            <div style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 22, flexWrap: "wrap" }}>
              {STYLES.map(s => (
                <button key={s} onClick={() => setCitStyle(s)} style={{ padding: "7px 16px", borderRadius: 20, border: "1.5px solid", borderColor: citStyle === s ? C.toffee : C.border, background: citStyle === s ? C.toffeePale : C.paper, color: citStyle === s ? C.toffee : C.inkLight, cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Search bar */}
            <div style={{ position: "relative", marginBottom: 10 }}>
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && lookup()}
                placeholder="https://… · 10.1038/… · 978-0-… · youtu.be/…"
                style={{ width: "100%", padding: "16px 148px 16px 18px", border: `2px solid ${C.border}`, borderRadius: 12, background: C.paper, color: C.ink, fontSize: 15, fontFamily: "'DM Sans',sans-serif", boxShadow: "0 2px 16px rgba(139,94,60,0.07)", outline: "none", transition: "border-color 0.15s" }}
                onFocus={e => e.target.style.borderColor = C.toffee}
                onBlur={e => e.target.style.borderColor = C.border}
              />
              <button onClick={lookup} style={{ position: "absolute", right: 8, top: 8, bottom: 8, padding: "0 18px", borderRadius: 8, background: C.toffee, border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 2px 8px rgba(139,94,60,0.3)" }}>
                Look up →
              </button>
            </div>

            {err && (
              <div style={{ padding: "10px 14px", background: C.redPale, border: "1px solid #f5c0bb", borderRadius: 8, fontSize: 13, color: C.red, fontFamily: "'DM Sans',sans-serif", marginBottom: 12 }}>
                ⚠ {err}
              </div>
            )}

            <p style={{ fontSize: 12, color: C.inkFaint, fontFamily: "'DM Sans',sans-serif", textAlign: "center", marginBottom: 24 }}>
              Supports DOIs (CrossRef) · ISBNs (Open Library) · URLs (Microlink) · YouTube · book titles (Google Books)
            </p>

            {/* Example buttons */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { l: "DOI",     v: "10.1038/s41586-020-2649-2" },
                { l: "ISBN",    v: "9780141990347" },
                { l: "URL",     v: "https://www.bbc.com/news/science-environment-68497967" },
                { l: "YouTube", v: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
              ].map(ex => (
                <button key={ex.l} onClick={() => setQuery(ex.v)}
                  style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.paper, color: C.inkLight, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  {ex.l} example
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {phase === "loading" && (
          <div className="fu" style={{ textAlign: "center", padding: "90px 0" }}>
            <div className="sp" style={{ fontSize: 28, color: C.toffee, marginBottom: 18 }}>⟳</div>
            <p style={{ color: C.inkMid, fontFamily: "'DM Sans',sans-serif", fontSize: 15 }}>Fetching metadata…</p>
            <p style={{ color: C.inkFaint, fontFamily: "'DM Sans',sans-serif", fontSize: 13, marginTop: 6 }}>
              {detectType(query) === "doi"     && "Querying CrossRef API"}
              {detectType(query) === "isbn"    && "Querying Open Library & Google Books"}
              {detectType(query) === "youtube" && "Fetching video details via noembed"}
              {detectType(query) === "url"     && "Reading page metadata via Microlink"}
              {detectType(query) === "search"  && "Searching Google Books"}
            </p>
          </div>
        )}

        {/* ── FILLING ── */}
        {phase === "filling" && (
          <div className="fu">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "13px 16px", background: C.paper, border: `1px solid ${C.border}`, borderRadius: 11, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: 26 }}>{SRC_ICON[srcData.type] || "📋"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: C.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'DM Sans',sans-serif" }}>Source type</div>
                <select value={srcData.type || "default"} onChange={e => changeType(e.target.value)} style={{ marginTop: 4 }}>
                  {SOURCE_TYPES.map(t => <option key={t} value={t}>{SRC_LABEL[t]}</option>)}
                </select>
                {srcData._note && <div style={{ fontSize: 12, color: C.amber, fontFamily: "'DM Sans',sans-serif", marginTop: 4 }}>{srcData._note}</div>}
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: C.green, fontFamily: "'DM Sans',sans-serif", background: C.greenPale, padding: "3px 10px", borderRadius: 20 }}>✓ {foundSet.size} found</span>
                {sorted.filter(f => !foundSet.has(f)).length > 0 && (
                  <span style={{ fontSize: 12, color: C.amber, fontFamily: "'DM Sans',sans-serif", background: C.amberPale, padding: "3px 10px", borderRadius: 20 }}>
                    {sorted.filter(f => !foundSet.has(f)).length} to fill
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {STYLES.map(s => (
                <button key={s} onClick={() => setCitStyle(s)} style={{ padding: "5px 14px", borderRadius: 20, border: "1.5px solid", borderColor: citStyle === s ? C.toffee : C.border, background: citStyle === s ? C.toffeePale : "transparent", color: citStyle === s ? C.toffee : C.inkLight, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}>
                  {s}
                </button>
              ))}
            </div>

            <div style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 13, padding: 16, marginBottom: 16 }}>
              {sorted.filter(f => !foundSet.has(f)).length > 0 && (
                <div style={{ marginBottom: 14, padding: "10px 14px", background: C.amberPale, border: "1px solid #f0c070", borderRadius: 8, fontSize: 13, color: C.inkMid, fontFamily: "'DM Sans',sans-serif" }}>
                  <strong style={{ color: C.amber }}>A few fields need your input</strong> — we couldn't find them automatically.
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {sorted.map(f => (
                  <FieldRow key={f} id={f} value={formVals[f]} found={foundSet.has(f)} onChange={v => setVal(f, v)} />
                ))}
              </div>
            </div>

            <button onClick={() => generate()} style={{ width: "100%", padding: 14, borderRadius: 10, background: C.toffee, border: "none", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 3px 12px rgba(139,94,60,0.28)" }}>
              Format {citStyle} citation →
            </button>
          </div>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && (
          <div className="fu">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                <span style={{ background: C.toffeePale, color: C.toffee, border: `1px solid ${C.border}`, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.04em" }}>{citStyle}</span>
                <span style={{ fontSize: 13, color: C.inkFaint, fontFamily: "'DM Sans',sans-serif" }}>{SRC_ICON[srcData.type]} {SRC_LABEL[srcData.type]}</span>
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                <button onClick={save} style={{ ...ghostBtn, fontSize: 12 }}>♡ Save</button>
                <button onClick={copy} style={{ ...ghostBtn, fontSize: 12, background: copied ? C.greenPale : C.paper, borderColor: copied ? C.green : C.border, color: copied ? C.green : C.inkMid, transition: "all 0.2s" }}>
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div style={{ background: C.paper, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.toffee}`, borderRadius: 11, padding: "26px 28px", marginBottom: 20, boxShadow: "0 2px 16px rgba(139,94,60,0.08)", overflowWrap: "break-word", wordBreak: "break-word" }}>
              <p style={{ fontSize: 17, lineHeight: 1.9, margin: 0 }}><RC text={citation} /></p>
            </div>

            <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: C.inkFaint, fontFamily: "'DM Sans',sans-serif" }}>Other styles:</span>
              {STYLES.filter(s => s !== citStyle).map(s => (
                <button key={s} onClick={() => switchStyle(s)} style={{ ...ghostBtn, fontSize: 12 }}>{s}</button>
              ))}
            </div>
            <button onClick={() => setPhase("filling")} style={{ ...ghostBtn, width: "100%", textAlign: "center", padding: 11, fontSize: 13 }}>✎ Edit fields</button>
          </div>
        )}

        {/* ── SAVED ── */}
        {showSaved && (
          <div className="fu" style={{ marginTop: 44, borderTop: `2px solid ${C.border}`, paddingTop: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700 }}>Saved Citations</h2>
              {saved.length > 0 && (
                <button onClick={() => navigator.clipboard.writeText(saved.map(c => c.text.replace(/_([^_]+)_/g, "$1")).join("\n\n"))}
                  style={{ ...ghostBtn, fontSize: 12 }}>Copy all</button>
              )}
            </div>
            {saved.length === 0
              ? <p style={{ color: C.inkFaint, fontFamily: "'DM Sans',sans-serif", textAlign: "center", padding: "36px 0" }}>No saved citations yet.</p>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {saved.map(c => (
                    <div key={c.id} style={{ background: C.paper, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.toffee}`, borderRadius: 10, padding: "14px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{ background: C.toffeePale, color: C.toffee, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>{c.style}</span>
                          <span style={{ color: C.inkFaint, fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>{SRC_LABEL[c.type] || c.type}</span>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => navigator.clipboard.writeText(c.text.replace(/_([^_]+)_/g, "$1"))} style={{ ...ghostBtn, fontSize: 11, padding: "3px 10px" }}>Copy</button>
                          <button onClick={() => setSaved(s => s.filter(x => x.id !== c.id))} style={{ ...ghostBtn, fontSize: 11, padding: "3px 10px", color: C.red, borderColor: "#f5c0bb" }}>Delete</button>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, overflowWrap: "break-word", wordBreak: "break-word" }}><RC text={c.text} /></p>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

      </div>
    </div>
  );
}