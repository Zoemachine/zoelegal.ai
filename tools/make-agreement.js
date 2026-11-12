// Builds agreement.js (the returned draft, the inserted § 9.6 and the clause library) from the
// fictional agreement text:
//   node tools/make-agreement.js "<path to the fictional agreement text (markdown)>"
// The text is used as written: straight quotes become typographic ones, and nothing else changes
// except the edits listed in EDITS below.
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(process.argv[2], 'utf8');

// Wording changes against the source, each with its reason.
const EDITS = [
  // The site's word rules keep one capitalised prefix off the page (the original is stored encoded,
  // as tools/shots.spec.js stores its word list, so this file does not carry it either).
  [Buffer.from('UHJvLVNhbmRiYWdnaW5nOyBSZWxpYW5jZSBQcmVzZXJ2ZWQgUmVnYXJkbGVzcyBvZiBLbm93bGVkZ2U=', 'base64').toString(), 'Sandbagging Permitted; Reliance Preserved Regardless of Knowledge'],
];

const curly = (s) => s
  .replace(/(^|[\s(\[—-])"/g, '$1“').replace(/"/g, '”')
  .replace(/'/g, '’');

const part = (a, b) => {
  const i = src.indexOf(a);
  const j = b ? src.indexOf(b, i) : src.length;
  if (i < 0 || j < 0) throw new Error(`missing ${a}`);
  return src.slice(i + a.length, j);
};

// ---------- Part A: the agreement, as blocks ----------
// [type, text, lead?, id?]: title, c (centred), cb (centred, bold), note, rule, h (heading),
// p (paragraph, optional bold lead), sub (lettered paragraph), lines (kept line breaks), sb (signature party).
const blocks = [];
let inTitle = true;
let inSig = false;
for (let para of part('## Part A — Agreement and Plan of Merger', '*End of Part A*').split(/\n\s*\n/)) {
  para = para.trim();
  if (!para) continue;
  para = curly(para);
  const rows = para.split('\n').map((r) => r.trim());
  const bold = (r) => /^\*\*.*\*\*$/.test(r);
  const unb = (r) => r.replace(/^\*\*|\*\*$/g, '');
  if (para === '---') { blocks.push(['rule', '']); inTitle = false; continue; }
  if (para.startsWith('### ')) {
    const t = para.slice(4);
    blocks.push(['h', t, null, /^ARTICLE IX\b/.test(t) ? 'art9' : (/^ARTICLE V\b/.test(t) ? 'art5' : null)]);
    continue;
  }
  if (rows.every(bold)) {
    rows.forEach((r) => {
      const t = unb(r);
      if (/^SIGNATURE PAGE/.test(t)) { inSig = true; blocks.push(['h', t]); }
      else if (inSig) blocks.push(['sb', t]);
      else blocks.push([blocks.length ? 'cb' : 'title', t]);
    });
    continue;
  }
  if (inTitle) { blocks.push([/^Form of/.test(para) ? 'note' : 'c', para]); continue; }
  const lead = para.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
  if (lead && rows.length === 1) {
    // art9end: Article IX's last section, after which the clause lands as Section 9.6 (there is no "[Reserved.]" slot any more).
    const id = /^Section 9\.5\b/.test(lead[1]) ? 'art9end' : null;
    blocks.push(['p', lead[2], lead[1], id]);
    continue;
  }
  if (rows.length > 1) { blocks.push(['lines', rows.join('\n')]); continue; }
  if (/^\([a-z]\)\s/.test(para)) { blocks.push(['sub', para]); continue; }
  const id = /^This AGREEMENT AND PLAN OF MERGER/.test(para) ? 'preamble'
    : /^B\. Parent, as the sole member/.test(para) ? 'recB'
      : /^Except as set out in the disclosure schedule/.test(para) ? 'art4lead'
        : /^(Each of Parent and )?Merger Sub(, jointly and severally,)? represents? and warrants? to the Company as follows/.test(para) ? 'art5lead' : null;
  blocks.push(['p', para, null, id]);
}

// ---------- The cloud AI's fix: the parent joins as a party (insertions only; nothing is struck) ----------
// Its additions are tracked insertions, shown in red: [block test, phrase] (no phrase: the whole block).
// INS_A and INS_B bracket each insertion (characters the agreement never uses); hero.js turns them into spans.
// Article IX is not touched: the parent goes into the parties clause, recital B, Article IV's lead-in, Article V and the signature page.
const INS_A = '\u27e6';
const INS_B = '\u27e7';
const lead = (re) => (x) => x[2] && re.test(x[2]);
const INS = [
  [(x) => x[0] === 'cb' && /^MERIDIAN HOLDINGS LLC/.test(x[1])],
  [(x) => x[3] === 'preamble', 'Meridian Holdings LLC, a Delaware limited liability company (\u201cParent\u201d); '],
  [(x) => x[3] === 'recB'],
  [(x) => x[3] === 'art4lead', 'Parent and '],
  [(x) => x[3] === 'art5', 'PARENT AND '],
  [(x) => x[3] === 'art5lead', 'Each of Parent and '],
  [(x) => x[3] === 'art5lead', ', jointly and severally,'],
  [lead(/^Section 5\.1\b/), 'Each of Parent and '],
  [lead(/^Section 5\.2\b/), 'Each of Parent and '],
  [lead(/^Section 5\.4\b/), 'each of Parent and '],
  [lead(/^Section 5\.5\b/), 'Parent or '],
  // Parent's signature block: its lines first, while the party name above them is still unmarked.
  [(x, i) => x[0] === 'lines' && i > 0 && blocks[i - 1][0] === 'sb' && /^MERIDIAN HOLDINGS LLC/.test(blocks[i - 1][1])],
  [(x) => x[0] === 'sb' && /^MERIDIAN HOLDINGS LLC/.test(x[1])],
];
INS.forEach(([test, phrase]) => {
  const i = blocks.findIndex((x, k) => test(x, k));
  if (i < 0) throw new Error(`no block for insertion ${phrase || test}`);
  const x = blocks[i];
  if (!phrase) { x[1] = INS_A + x[1] + INS_B; return; }
  if (!x[1].includes(phrase)) throw new Error(`not in its block: ${phrase}`);
  x[1] = x[1].replace(phrase, INS_A + phrase + INS_B);
});

// The draft the story shows before the review is a two-party agreement: outside the tracked insertions the word "Parent" is
// used nowhere (only the insertions bring the parent in), Article IX has no "[Reserved.]" slot, and nothing is struck.
// The source text must already read that way (the two-party wording and the renumbered Article IX); stop if it does not.
const visible = blocks.map((x) => `${x[2] || ''} ${x[1]}`).join('\n').replace(new RegExp(`${INS_A}[^${INS_B}]*${INS_B}`, 'g'), '');
if (/\bParent\b/.test(visible.replace(/\(\u201cParent\u201d\)/g, ''))) throw new Error('the source still uses "Parent" outside the tracked insertions');
if (/\[Reserved/.test(visible)) throw new Error('the source still has a [Reserved.] slot');

// ---------- Part B: the clause Bob picks ----------
// It lands as Section 9.6, a plain insertion after Section 9.5 (nothing is struck), in this agreement's own defined terms.
// (The source's Part B is the precedent as the firm's earlier agreement numbers it; the page shows the clause as it lands.)
const insert = {
 "lead": "Section 9.6 Knowledge; No Sandbagging.",
 "text": "Notwithstanding anything in this Agreement to the contrary, no Buyer Indemnified Party may recover any Losses for the breach of a representation or warranty of the Company if Merger Sub had actual knowledge of that breach before the Closing. For this purpose, actual knowledge means the awareness of the facts constituting the breach by any individual named as a member of Merger Sub’s deal team in the Disclosure Schedule. A Buyer Indemnified Party that elects to close with that knowledge waives all claims for that breach. This Section does not limit recovery for Fraud."
};

// ---------- Part C: the clause library's ten results ----------
let lib = part('## Part C — Clause library: top 10 results', '---');
EDITS.forEach(([a, c]) => { lib = lib.split(a).join(c); });
const clauses = lib.split('\n').map((r) => r.match(/^\d+\.\s+(\[BOB'S PICK\]\s+)?(.+?)\s+—\s+(.+)$/)).filter(Boolean)
  .map((m) => ({ title: curly(m[2]), source: curly(m[3]), pick: !!m[1] }));
if (clauses.length !== 10 || clauses.filter((c) => c.pick).length !== 1) throw new Error('expected ten clauses and one pick');

// ---------- What the cloud AI sees ----------
// Names, people and addresses become Party n / Person n / Address n; every date becomes the one token
// [Month_Day_Year]; dollar amounts and the other deal figures are never scrubbed (their mask is their own text),
// so the cloud AI can do the arithmetic. Address 2 is the term sheet's premises. Kept in step with the table in
// agreement.js, which the story reads (hero.js).
const PII = [
  ['Kestrel Robotics Inc.', 'Party 1'], ['KESTREL ROBOTICS INC.', 'Party 1'],
  ['Harborline Trust Company', 'Party 2'], ['Lakeshore Capital Partners LP', 'Party 3'],
  ['Vantage Row Properties LLC', 'Party 4'], ['Meridian Acquisition LLC', 'Party 5'],
  ['MERIDIAN ACQUISITION LLC', 'Party 5'], ['Meridian Holdings LLC', 'Party 6'],
  ['MERIDIAN HOLDINGS LLC', 'Party 6'], ['Dunmore Ketteridge LLP', 'Party 7'], ['Corvane Ashby LLP', 'Party 8'],
  ['Jane R. Okonkwo', 'Person 1'], ['Daniel Park', 'Person 2'], ['James “Jimmy” Calder', 'Person 3'],
  ['James Calder', 'Person 3'], ['1400 Kestrel Lane, Brindlewick, ME', 'Address 1'],
  ['2200 Tallowmere Avenue, Suite 400, Port Halvering, NJ', 'Address 3'],
  ['310 Ferrowick Street, Oxbury Glen, MN', 'Address 4'], ['77 Pellimore Square, Sallowmere, NY', 'Address 5'],
  ['$45,000,000', '$45,000,000'], ['$18,000,000', '$18,000,000'], ['$24,000,000', '$24,000,000'],
  ['$337,500', '$337,500'], ['$250,000', '$250,000'], ['$200,000', '$200,000'], ['$100,000', '$100,000'],
  ['10,000,000', '10,000,000'], ['6,200,000', '6,200,000'], ['84 employees', '84 employees'],
  ['88 Vantage Row, Suite 400', 'Address 2'], ['$4,500,000', '$4,500,000'], ['$6,000,000', '$6,000,000'],
  ['$2,500,000', '$2,500,000'], ['$3,500,000', '$3,500,000'], ['$30,000,000', '$30,000,000'],
  ['$750,000', '$750,000'], ['November 6, 2026', '[Month_Day_Year]'], ['January 15, 2027', '[Month_Day_Year]'],
  ['December 31, 2024', '[Month_Day_Year]'], ['September 30, 2026', '[Month_Day_Year]'],
  ['September 14, 2026', '[Month_Day_Year]'], ['January 1, 2023', '[Month_Day_Year]'],
  ['June 30, 2027', '[Month_Day_Year]'], ['December 31, 2027', '[Month_Day_Year]'],
];
const all = blocks.map((x) => `${x[2] || ''} ${x[1]}`).join('\n').split(INS_A).join('').split(INS_B).join('');
PII.forEach(([real]) => { if (!all.includes(real)) throw new Error(`not in the agreement: ${real}`); });

const words = all.split(/\s+/).filter(Boolean).length;
const out = `// The returned draft: a fictional agreement and plan of merger, the § 9.3 clause Bob picks and
// the clause library's ten results. Every party, figure and term is invented.
// Generated by tools/make-agreement.js from the fictional agreement text; do not edit by hand.
window.ZOE_AGREEMENT = ${JSON.stringify({ blocks, insert, clauses, pii: PII }, null, 1)};
`;
fs.writeFileSync(path.join(__dirname, '..', 'agreement.js'), out);
console.log(`agreement.js: ${blocks.length} blocks, ${words} words, ${clauses.length} clauses, ${PII.length} masks, ${out.length} bytes`);
