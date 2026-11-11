// ZOE screens: a Mac desktop (menu bar, Word with the ZOE pane, Safari with the ZOE cockpit) that mounts into any
// container. Drawn at a fixed virtual width and scaled with one transform. No dependencies, no network.
// Every name, figure and document below is fictional. Contract: rework/CONTRACT_screens.md.
(function () {
  'use strict';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const node = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;

  // ---------- Icons (drawn here) ----------
  const sv = (d, vb = '0 0 16 16', extra = '') => `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`;
  const I = {
    apple: '<svg class="zs-apple" viewBox="0 0 17 20" aria-hidden="true"><path d="M14.1 10.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8C4.6 5.4 3.1 6.3 2.3 7.8c-1.7 2.9-.4 7.1 1.2 9.4.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2-1.1 2.8-2.2.9-1.3 1.2-2.5 1.2-2.6 0 0-2.3-.9-2.3-3.5zM11.9 3.9c.6-.8 1.1-1.8.9-2.9-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.7-1 2.8 1 .1 2.1-.5 2.8-1.3z"/></svg>',
    wifiOn: '<svg class="zs-w-on" viewBox="0 0 20 15" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><path d="M1.6 5.1a12 12 0 0 1 16.8 0"/><path d="M4.5 8a8 8 0 0 1 11 0"/><path d="M7.3 10.9a4 4 0 0 1 5.4 0"/><circle cx="10" cy="13.4" r="1.15" fill="currentColor" stroke="none"/></svg>',
    wifiOff: '<svg class="zs-w-off" viewBox="0 0 20 15" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><g opacity="0.45"><path d="M1.6 5.1a12 12 0 0 1 16.8 0"/><path d="M4.5 8a8 8 0 0 1 11 0"/><path d="M7.3 10.9a4 4 0 0 1 5.4 0"/><circle cx="10" cy="13.4" r="1.15" fill="currentColor" stroke="none"/></g><path d="M3.2 1.2l13.6 13.2" stroke-width="1.8"/></svg>',
    wifiSmall: '<svg viewBox="0 0 20 15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M1.6 5.1a12 12 0 0 1 16.8 0"/><path d="M4.5 8a8 8 0 0 1 11 0"/><path d="M7.3 10.9a4 4 0 0 1 5.4 0"/><circle cx="10" cy="13.4" r="1.2" fill="currentColor" stroke="none"/></svg>',
    battery: '<svg viewBox="0 0 27 13" aria-hidden="true"><rect x="0.6" y="0.6" width="22.8" height="11.8" rx="3.2" fill="none" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.1"/><rect x="2.3" y="2.3" width="16.2" height="8.4" rx="1.8" fill="currentColor"/><path d="M24.9 4.4v4.2c.9-.3 1.5-1.1 1.5-2.1s-.6-1.8-1.5-2.1z" fill="currentColor" fill-opacity="0.45"/></svg>',
    cc: '<svg viewBox="0 0 17 15" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="0.8" y="1" width="15.4" height="5.6" rx="2.8"/><circle cx="12.6" cy="3.8" r="1.6" fill="currentColor"/><rect x="0.8" y="8.4" width="15.4" height="5.6" rx="2.8"/><circle cx="4.4" cy="11.2" r="1.6" fill="currentColor"/></svg>',
    spot: sv('<circle cx="6.6" cy="6.6" r="4.9"/><path d="M10.3 10.3l4.4 4.4"/>', '0 0 16 16', ' stroke-width="1.6"'),
    search: sv('<circle cx="7" cy="7" r="4.6"/><path d="M10.5 10.5l3.8 3.8"/>'),
    chevD: sv('<path d="M4 6l4 4 4-4"/>', '0 0 16 16', ' class="zs-chev"'),
    chevR: sv('<path d="M6 4l4 4-4 4"/>'),
    chevUD: sv('<path d="M5 6l3-3 3 3M5 10l3 3 3-3"/>'),
    x: sv('<path d="M4 4l8 8M12 4l-8 8"/>'),
    home: sv('<path d="M2.5 7.2L8 2.8l5.5 4.4V13a.7.7 0 0 1-.7.7H10V10H6v3.7H3.2a.7.7 0 0 1-.7-.7z"/>'),
    bell: sv('<path d="M4 11V7a4 4 0 0 1 8 0v4l1.2 1.4H2.8z"/><path d="M6.6 13.8a1.5 1.5 0 0 0 2.8 0"/>'),
    filter: sv('<path d="M2.5 4.5h11M4.5 8h7M6.5 11.5h3"/>'),
    pin: sv('<path d="M9.8 2.2l4 4-2.4 1-2.3 2.3-.3 2.8-5-5 2.8-.3 2.3-2.3z"/><path d="M5.5 10.5l-3.3 3.3"/>'),
    insert: sv('<path d="M13 3.5v4.2a1.8 1.8 0 0 1-1.8 1.8H3.5"/><path d="M6 6.8L3.3 9.5 6 12.2"/>'),
    adapt: sv('<path d="M6.5 2.5l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1zM11.8 8.8l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6z"/>'),
    mark: sv('<path d="M4.2 2.5h7.6v11l-3.8-2.8-3.8 2.8z"/>'),
    check: sv('<path d="M3 8.5l3.2 3L13 4.5"/>'),
    undo: sv('<path d="M5.5 3.5L2.8 6.2l2.7 2.7"/><path d="M3 6.2h6.3a3.7 3.7 0 0 1 0 7.4H6.5"/>'),
    matters: sv('<rect x="2" y="3" width="12" height="10.5" rx="1.6"/><path d="M6 3v10.5M2 6.5h4"/>'),
    diligence: sv('<path d="M2.5 5.5v-2a1 1 0 0 1 1-1h2M10.5 2.5h2a1 1 0 0 1 1 1v2M13.5 10.5v2a1 1 0 0 1-1 1h-2M5.5 13.5h-2a1 1 0 0 1-1-1v-2"/><circle cx="7.6" cy="7.6" r="2.3"/><path d="M9.3 9.3l1.7 1.7"/>'),
    doc: sv('<path d="M4 1.8h5.2L12.5 5v8.5a.8.8 0 0 1-.8.8H4a.8.8 0 0 1-.8-.8V2.6a.8.8 0 0 1 .8-.8z"/><path d="M9 1.8V5.2h3.4M5.6 8.5h4.8M5.6 11h3.4"/>'),
    users: sv('<circle cx="6" cy="5.5" r="2.3"/><path d="M1.8 13.2a4.2 4.2 0 0 1 8.4 0"/><path d="M10.6 3.4a2.2 2.2 0 0 1 0 4.2M12 9.2a4 4 0 0 1 2.2 3.9"/>'),
    user: sv('<circle cx="8" cy="5.4" r="2.6"/><path d="M3.2 13.6a4.8 4.8 0 0 1 9.6 0"/>'),
    tag: sv('<path d="M2.5 2.5h5.3l5.7 5.7-5.3 5.3-5.7-5.7z"/><circle cx="5.4" cy="5.4" r="0.9"/>'),
    cal: sv('<rect x="2.2" y="3" width="11.6" height="10.8" rx="1.6"/><path d="M2.2 6.4h11.6M5.4 1.8v2.4M10.6 1.8v2.4"/>'),
    book: sv('<path d="M8 4.2C6.6 3 4.6 2.6 2.2 2.8v9.8c2.4-.2 4.4.2 5.8 1.4 1.4-1.2 3.4-1.6 5.8-1.4V2.8C11.4 2.6 9.4 3 8 4.2zM8 4.2V14"/>'),
    layers: sv('<path d="M8 2l6 3.2-6 3.2-6-3.2z"/><path d="M2 8.2l6 3.2 6-3.2M2 11l6 3.2 6-3.2"/>'),
    scale: sv('<path d="M8 2.2v11.6M4.5 13.8h7M3 4.2h10"/><path d="M3 4.2L1.2 8.6a2 2 0 0 0 3.6 0zM13 4.2l-1.8 4.4a2 2 0 0 0 3.6 0z"/>'),
    bank: sv('<path d="M2 6l6-3.6L14 6zM3.4 6.2v5.6M6.4 6.2v5.6M9.6 6.2v5.6M12.6 6.2v5.6M2 13.6h12"/>'),
    sparkle: sv('<path d="M8 2l1.4 3.6L13 7l-3.6 1.4L8 12l-1.4-3.6L3 7l3.6-1.4z"/>'),
    shield: sv('<path d="M8 1.8l5 1.9v4c0 3.2-2.1 5.4-5 6.5-2.9-1.1-5-3.3-5-6.5v-4z"/><path d="M5.8 8l1.6 1.6 3-3"/>'),
    eye: sv('<path d="M1.6 8s2.4-4.4 6.4-4.4S14.4 8 14.4 8s-2.4 4.4-6.4 4.4S1.6 8 1.6 8z"/><circle cx="8" cy="8" r="1.9"/>'),
    plus: sv('<path d="M8 3v10M3 8h10"/>'),
    gear: sv('<circle cx="8" cy="8" r="2.2"/><path d="M8 1.6v1.8M8 12.6v1.8M1.6 8h1.8M12.6 8h1.8M3.5 3.5l1.3 1.3M11.2 11.2l1.3 1.3M3.5 12.5l1.3-1.3M11.2 4.8l1.3-1.3"/>'),
    moon: sv('<path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8z"/>'),
    send: sv('<path d="M2.5 8l11-5-4.2 11-1.8-4.4z"/>'),
    bot: sv('<rect x="2.5" y="4.5" width="11" height="8.5" rx="2"/><path d="M8 2v2.5M6 8.5v.5M10 8.5v.5"/>'),
    list: sv('<path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01"/>'),
    pinMap: sv('<path d="M8 14s4.5-4.2 4.5-7.6a4.5 4.5 0 0 0-9 0C3.5 9.8 8 14 8 14z"/><circle cx="8" cy="6.4" r="1.6"/>'),
    arrowR: sv('<path d="M3 8h10M9.5 4.5L13 8l-3.5 3.5"/>'),
    refresh: sv('<path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.5v2.8h-2.8"/>'),
    sidebar: sv('<rect x="1.8" y="2.8" width="12.4" height="10.4" rx="2"/><path d="M6 2.8v10.4"/>'),
    back: sv('<path d="M10 3L5 8l5 5"/>'),
    fwd: sv('<path d="M6 3l5 5-5 5"/>'),
    share: sv('<path d="M8 1.8v8.4M5.2 4.4L8 1.6l2.8 2.8M4.6 6.8H3.6v7.4h8.8V6.8h-1"/>'),
    tabs: sv('<rect x="1.8" y="4.4" width="9.6" height="9.6" rx="1.8"/><path d="M4.6 1.8h7.8a1.8 1.8 0 0 1 1.8 1.8v7.8"/>'),
    save: sv('<path d="M2.5 2.5h8.8L13.5 4.7v8.8h-11z"/><path d="M5 2.5v3.5h5V2.5M5 13.5V9.5h6v4"/>'),
    redo: sv('<path d="M10.5 3.5l2.7 2.7-2.7 2.7"/><path d="M13 6.2H6.7a3.7 3.7 0 0 0 0 7.4h2.8"/>'),
    paste: sv('<rect x="3" y="3" width="10" height="11.5" rx="1.4"/><path d="M6 3V2h4v1M5.5 7h5M5.5 9.5h5M5.5 12h3"/>', '0 0 16 16'),
    mic: sv('<rect x="6" y="1.8" width="4" height="7.6" rx="2"/><path d="M3.6 7.6a4.4 4.4 0 0 0 8.8 0M8 12v2.2"/>'),
    comment: sv('<path d="M2.5 3h11v7.6H7.2L4.2 13v-2.4H2.5z"/>'),
    focus: sv('<path d="M2.5 5.5v-3h3M10.5 2.5h3v3M13.5 10.5v3h-3M5.5 13.5h-3v-3"/>'),
    printL: sv('<rect x="3" y="2" width="10" height="12" rx="1"/><path d="M5 5h6M5 7.5h6M5 10h4"/>'),
    webL: sv('<rect x="2" y="3" width="12" height="10" rx="1.4"/><path d="M2 6h12"/>'),
    readL: sv('<path d="M8 4c-1.6-1.2-3.6-1.4-6-1.2v9.6c2.4-.2 4.4 0 6 1.2 1.6-1.2 3.6-1.4 6-1.2V2.8C11.6 2.6 9.6 2.8 8 4z"/>'),
    proof: sv('<path d="M2.5 11L5 4l2.5 7M3.4 8.8h3.2M9.5 9.5l1.6 1.6 3-3.4"/>'),
    zoeSpark: sv('<path d="M3 3.5h10L3 12.5h10"/>', '0 0 16 16', ' stroke-width="1.8"'),
    help: '<span class="zs-help">?</span>',
  };

  // ---------- Fictional defaults (the Kestrel / Meridian world) ----------
  const MATTER = 'Kestrel / Meridian merger';
  const KNOWLEDGE_TEXT = 'Notwithstanding anything in this Agreement to the contrary, no Buyer Indemnified Party may recover any Losses for the breach of a representation or warranty of the Company if Parent or Merger Sub had actual knowledge of that breach before the Closing. For this purpose, actual knowledge means the awareness of the facts constituting the breach by any individual named as a member of Parent’s deal team in the Disclosure Schedule. A Buyer Indemnified Party that elects to close with that knowledge waives all claims for that breach. This Section does not limit recovery for Fraud.';
  const CLAUSES = [
    { title: '9.3 Knowledge; No Sandbagging.', source: 'Merger Agreement, 2026, Delaware (Project Saltmarsh)', match: 100, text: '9.3 Knowledge; No Sandbagging. ' + KNOWLEDGE_TEXT },
    { title: '8.6 Reliance Preserved.', source: 'Stock Purchase Agreement, 2025, Delaware (Project Cinderwell)', match: 92, text: '8.6 Reliance Preserved. The rights of the Purchaser Indemnitees to indemnification will not be affected by any investigation conducted by or on behalf of Purchaser, or by any knowledge acquired at any time, whether before or after the Closing Date.' },
    { title: '10.4 Known Breaches.', source: 'Asset Purchase Agreement, 2024, Delaware (Project Quillfeather)', match: 88, text: '10.4 Known Breaches. Buyer may not assert any claim for a breach of which Buyer had actual knowledge on the Closing Date, as shown by a writing delivered to Buyer before the Closing.' },
    { title: '7.2 Disclosure Updates.', source: 'Merger Agreement, 2022, Delaware (Project Wickerfield)', match: 81, text: '7.2 Disclosure Updates. Any supplement to the Disclosure Schedule delivered before the Closing will cure any breach it discloses if Parent elects to proceed with the Closing.' },
    { title: '9.5 Deal Team Knowledge.', source: 'Equity Purchase Agreement, 2023, Delaware (Project Thistledown)', match: 77, text: '9.5 Deal Team Knowledge. Knowledge of Buyer means the actual knowledge, after reasonable inquiry, of the individuals listed in Section 9.5 of the Disclosure Schedule.' },
  ];
    const ADAPT_SEGMENTS = [
    'The rights of the ', { from: 'Purchaser Indemnitees', to: 'Buyer Indemnified Parties' }, ' to indemnification will not be affected by any investigation conducted by or on behalf of ',
    { from: 'Purchaser', to: 'Parent or Merger Sub' }, ', or by any knowledge acquired ', { from: 'at any time.', to: 'before the Closing, except as Section 9.3 provides.' },
  ];

  const TERM_SHEET_ROWS = [
    ['Parties', 'Seller: Kestrel Robotics Inc., 1400 Kestrel Lane (EIN 84-2219876). Buyer: Meridian Acquisition LLC, a Delaware limited liability company.'],
    ['Structure', 'Merger of a wholly owned subsidiary of Buyer with and into Seller, with Seller surviving; Seller’s stockholders receive cash at closing.'],
    ['Purchase Price', '$45,000,000 in cash at closing, subject to customary working capital adjustments.'],
    ['Escrow', '$4,500,000 held by Harborline Trust Company for 18 months as security for indemnification, escrow account 4417-0093-2281.'],
    ['Earn-out', 'Up to $6,000,000 payable on revenue milestones through December 31, 2027.'],
    ['Financing', 'Buyer to deliver a debt commitment letter from Lakeshore Capital Partners LP for $30,000,000 before signing.'],
    ['Key Employees', 'Daniel Park, Chief Technology Officer, to sign a new employment agreement with a $750,000 retention bonus.'],
    ['Conditions', 'Consent of Vantage Row Properties LLC to assignment of the lease at 88 Vantage Row, Suite 400; customary regulatory approvals.'],
    ['Exclusivity', '45 days from signing of this term sheet.'],
    ['Governing Law', 'Delaware.'],
    ['Non-binding', 'Not binding except Exclusivity, Confidentiality and Governing Law. Target signing November 6, 2026; outside date January 15, 2027.'],
    ['For Buyer', 'Jane R. Okonkwo'],
  ];
  const TERM_SHEET_HTML = '<h1>TERM SHEET</h1><p class="zs-c">Proposed acquisition of Kestrel Robotics Inc. by Meridian Acquisition LLC</p><p class="zs-c" style="margin-bottom:1.6em">Non-binding summary of principal terms</p>' +
    TERM_SHEET_ROWS.map(([k, v]) => `<p><span class="zs-k">${esc(k)}.</span> ${esc(v)}</p>`).join('');
  const MERGER_TOP = '<h1>AGREEMENT AND PLAN OF MERGER</h1><p class="zs-c">by and among</p><p class="zs-c zs-k">MERIDIAN HOLDINGS LLC,</p><p class="zs-c zs-k">MERIDIAN ACQUISITION LLC</p><p class="zs-c">and</p><p class="zs-c zs-k">KESTREL ROBOTICS INC.</p><p>Form of draft agreement. Proposed signing date: November 6, 2026</p>' +
    '<p>This AGREEMENT AND PLAN OF MERGER (this “Agreement”) is proposed to be made as of November 6, 2026 (the “Signing Date”), by and among Meridian Holdings LLC, a Delaware limited liability company (“Parent”); Meridian Acquisition LLC, a Delaware limited liability company (“Merger Sub” or “Buyer”); and Kestrel Robotics Inc., a Delaware corporation with its principal office at 1400 Kestrel Lane, Brindlewick, ME (the “Company”).</p>';
  const MERGER_REST = '<h2>RECITALS</h2><p>A. The Parties wish to combine their businesses through the merger of Merger Sub with and into the Company, on the terms of this Agreement.</p><p>B. Parent, as the sole member of Merger Sub, has agreed to become a party to this Agreement and to make the representations, warranties and covenants set out in it.</p><p>The Parties therefore agree as follows:</p>' +
    '<h2>ARTICLE I — DEFINITIONS</h2><p><span class="zs-k">Section 1.1 Defined Terms.</span> In this Agreement:</p><p>“Affiliate” means a Person that controls, is controlled by or is under common control with another Person.</p><p>“Buyer Indemnified Party” means Parent, Merger Sub and their Affiliates and Representatives.</p><p>“Escrow Agent” means Harborline Trust Company, or its successor under the Escrow Agreement.</p><p>“Losses” means losses, damages, liabilities, costs and expenses, including reasonable attorneys’ fees.</p>';
  const MERGER_HTML = MERGER_TOP + MERGER_REST;
  const MERGER_TRACKED_HTML = MERGER_TOP + `<p class="zs-ins">Section 9.3 Knowledge; No Sandbagging. ${esc(KNOWLEDGE_TEXT)}</p>` + MERGER_REST;

  const PANE_DEFAULTS = {
    home: {
      docType: 'Agreement and Plan of Merger', parties: ['MERIDIAN HOLDINGS LLC', 'MERIDIAN ACQUISITION LLC', 'KESTREL ROBOTICS INC.'], similar: 3,
      suggestions: [
        { text: 'This Agreement and Plan of Merger is entered into as of the date set out above by and among Parent, Merger Sub and the Company, each a “Party” and together the “Parties”.' },
        { text: 'This Stock Purchase Agreement is made as of the Effective Date by and among the Purchaser, the Seller and the Company, on the terms set out below.', less: true },
        { text: 'The Parties intend that the Merger qualify as a reorganization for federal income tax purposes, and this Agreement is adopted as a plan of reorganization.' },
      ],
    },
    clauses: { query: 'anti-sandbagging', ideas: ['anti-sandbagging'], agreementType: 'Agreement and Plan of Merger', context: 'in Article IX — Indemnification', term: 'Defined term: Buyer Indemnified Party', results: CLAUSES },
    insertPreview: { title: CLAUSES[0].title, source: CLAUSES[0].source, text: 'Section 9.3 Knowledge; No Sandbagging. ' + KNOWLEDGE_TEXT, where: 'Below ¶ this paragraph' },
    afterInsert: { title: CLAUSES[0].title, source: CLAUSES[0].source, text: CLAUSES[0].text, where: 'below ¶ this paragraph' },
    adapt: { title: CLAUSES[1].title, source: CLAUSES[1].source, segments: ADAPT_SEGMENTS },
    check: {
      fix: [{ title: 'Drafting note', para: 41 }, { title: 'Leftover placeholder in square brackets', para: 88 }],
      missing: 2, undefinedTerms: 4, unusedTerms: 3, marks: 6,
    },
  };

  const DOCS = [
    { title: 'Term Sheet — Kestrel / Meridian', file: 'kestrel_term_sheet.docx', added: 'added Nov 9, 2026 9:38 PM', date: 'Nov 2, 2026', type: 'Term Sheet', conf: '', kind: 'Agreement', scrub: 'Approved', sig: 'Signatures read' },
    { title: 'Mutual Confidentiality Agreement', file: 'mutual_nda_signed.pdf', added: 'added Oct 14, 2026', date: 'Sep 14, 2026', type: 'Confidentiality Agreement', conf: '', kind: 'Agreement', scrub: 'Approved', sig: 'Signatures read' },
    { title: 'Certificate of Formation — Meridian Acquisition LLC', file: 'meridian_acq_cert_formation.pdf', added: 'added Oct 14, 2026', date: 'Aug 28, 2026', type: 'Certificate of Formation', conf: '0.97', kind: 'Corporate record', scrub: 'Approved', sig: 'No signatures' },
    { title: 'Letter of Intent', file: 'loi_meridian_holdings.pdf', added: 'added Oct 3, 2026', date: 'Oct 3, 2026', type: 'Letter of Intent', conf: '0.94', kind: 'Correspondence', scrub: 'Awaiting review', sig: 'Signatures read' },
    { title: 'Board Consent — Kestrel Robotics Inc.', file: 'kestrel_board_consent.docx', added: 'added Oct 31, 2026', date: 'Oct 30, 2026', type: 'Written Consent of the Board', conf: '0.91', kind: 'Corporate record', scrub: 'Approved', sig: 'Signatures read' },
    { title: 'Disclosure Schedule (draft)', file: 'disclosure_schedule_v3.docx', added: 'added Nov 5, 2026', date: '—', type: 'Disclosure Schedule', conf: '0.88', kind: 'Schedule', scrub: 'Awaiting review', sig: 'No signatures' },
    { title: 'Lease — 88 Vantage Row, Suite 400', file: 'vantage_row_lease_2021.pdf', added: 'added Oct 14, 2026', date: 'Mar 1, 2021', type: 'Commercial Lease', conf: '', kind: 'Agreement', scrub: 'Approved', sig: 'Signatures read' },
    { title: 'Employment Agreement — Daniel Park', file: 'park_employment_2022.pdf', added: 'added Oct 14, 2026', date: 'Jun 6, 2022', type: 'Employment Agreement', conf: '', kind: 'Agreement', scrub: 'Approved', sig: 'Signatures read' },
  ];

  const SCRUBBED_HTML = '<p><b>TERM SHEET</b></p><p>Proposed acquisition of <mark class="zs-ph">Party 1</mark> by <mark class="zs-ph">Party 5</mark></p>' +
    '<p><b>Parties.</b> Seller: <mark class="zs-ph">Party 1</mark>, <mark class="zs-ph">Address 1</mark> (EIN <mark class="zs-ph">Number 1</mark>). Buyer: <mark class="zs-ph">Party 5</mark>, a Delaware limited liability company.</p>' +
    '<p><b>Structure.</b> Merger of a wholly owned subsidiary of Buyer with and into Seller, with Seller surviving; Seller’s stockholders receive cash at closing.</p>' +
    '<p><b>Purchase Price.</b> $45,000,000 in cash at closing, subject to customary working capital adjustments.</p>' +
    '<p><b>Escrow.</b> $4,500,000 held by <mark class="zs-ph">Party 2</mark> for 18 months as security for indemnification, escrow account <mark class="zs-ph">Account 1</mark>.</p>' +
    '<p><b>Earn-out.</b> Up to $6,000,000 payable on revenue milestones through <mark class="zs-ph">[Month_Day_Year]</mark>.</p>' +
    '<p><b>Financing.</b> Buyer to deliver a debt commitment letter from <mark class="zs-ph">Party 3</mark> for $30,000,000 before signing.</p>' +
    '<p><b>Key Employees.</b> <mark class="zs-ph">Person 2</mark>, Chief Technology Officer, to sign a new employment agreement with a $750,000 retention bonus.</p>' +
    '<p><b>Conditions.</b> Consent of <mark class="zs-ph">Party 4</mark> to assignment of the lease at <mark class="zs-ph">Address 2</mark>; customary regulatory approvals.</p>' +
    '<p><b>Non-binding.</b> Not binding except Exclusivity, Confidentiality and Governing Law. Target signing <mark class="zs-ph">[Month_Day_Year]</mark>; outside date <mark class="zs-ph">[Month_Day_Year]</mark>.</p>' +
    '<p><b>For Buyer.</b> <mark class="zs-ph">Person 1</mark></p>';

  const COCK_DEFAULTS = {
    matters: {
      library: { name: 'Reference Library', init: 'RL', docs: '2,500', active: 'active Nov 9, 2026 8:52 PM', typed: '2,500', searchable: '2,500', scrubbed: '2,500', review: '0' },
      matters: [
        { name: MATTER, init: 'KM', docs: 128, active: 'active Nov 9, 2026 9:41 PM', typed: 128, searchable: 128, scrubbed: 121, review: 7, current: true },
        { name: 'Project Cinderwell', init: 'PC', docs: 214, active: 'active Nov 6, 2026 4:15 PM', typed: 214, searchable: 214, scrubbed: 214, review: 0 },
      ],
      stats: { matters: 9, documents: '35,263', adding: 0, waiting: 7 },
    },
    documents: { matter: MATTER, count: 128, docs: DOCS },
    templates: {
      description: 'anti-sandbagging, buyer’s knowledge bars recovery, Delaware governing law', agreementType: 'merger agreement',
      ideas: ['anti-sandbagging', 'buyer’s knowledge', 'governing law'], jurisdiction: 'Delaware', typeChip: 'Agreement and Plan of Merger', count: 10, library: 'Reference Library',
      results: [
        { file: 'saltmarsh_merger_agreement.docx', match: 100, type: 'Agreement and Plan of Merger', parties: 'ALDERGROVE HOLDINGS LLC (PARENT); ALDERGROVE MERGER SUB LLC (MERGER SUB); TESSERA LABS INC. (COMPANY)', jurisdiction: 'Delaware', covers: [1, 1, 1],
          passage: { idea: 1, heading: '9.3 Knowledge; No Sandbagging.', path: 'ALDERGROVE HOLDINGS LLC › 9.3 Knowledge; No Sandbagging.', text: KNOWLEDGE_TEXT, marks: ['actual knowledge', 'waives all claims'] } },
        { file: 'cinderwell_stock_purchase.docx', match: 86, type: 'Stock Purchase Agreement', parties: 'HOLLOWAY PARTNERS LP (PURCHASER); BRISTOW FAMILY TRUST (SELLER)', jurisdiction: 'Delaware', covers: [1, 0, 1] },
      ],
    },
    diligence: {
      matter: MATTER, query: 'non-compete', count: 6,
      hits: [
        { title: 'Employment Agreement — Daniel Park', file: 'park_employment_2022.pdf', type: 'Employment Agreement', family: 'contract', date: '2022-06-06', law: 'Delaware',
          passages: [{ head: 'Noncompetition.', text: 'During the Employment Period and for twelve months after it ends, the Executive will not work for or provide services to a Competing Business in the Territory.' }, { head: 'Non-Solicitation.', text: 'For the same period the Executive will not solicit any employee of the Company to leave the Company’s employment.' }] },
        { title: 'Disclosure Schedule (draft)', file: 'disclosure_schedule_v3.docx', type: 'Disclosure Schedule', family: 'schedule', date: '2026-11-05', law: 'Delaware',
          passages: [{ head: 'Section 4.12(d) Restrictive Agreements.', text: 'The Company is bound by the non-competition covenant in the Supply Agreement with Ashmere Components Ltd. through June 30, 2027.' }] },
      ],
    },
    scrubbed: { title: 'kestrel_term_sheet.docx', type: 'Term Sheet', html: SCRUBBED_HTML, replacements: 23 },
    verify: {
      title: 'kestrel_term_sheet.docx', type: 'Term Sheet',
      items: [
        ['We read a party name from the signing page that matches none of the names we found there. Check the spelling and the party it belongs to. · p. 2', true],
        ['This person is scrubbed elsewhere in the document but not here (2 places).'],
        ['This address is scrubbed elsewhere in the document but not here (1 place).'],
        ['This organization is scrubbed elsewhere in the document but not here (1 place).'],
        ['This account number is scrubbed elsewhere in the document but not here (1 place).'],
        ['This date is scrubbed elsewhere in the document but not here (2 places).'],
        ['This person is scrubbed elsewhere in the document but not here (1 place).'],
      ],
    },
    signatures: {
      title: 'mutual_nda_signed.pdf', type: 'Confidentiality Agreement',
      rows: [
        { party: 'Meridian Holdings LLC', role: 'PARTY', signatory: 'Jane R. Okonkwo', srole: 'Authorized Signatory', chain: ['Jane R. Okonkwo', 'Meridian Holdings LLC'], status: 'corroborated' },
        { party: 'Meridian Acquisition LLC', role: 'AFFILIATE', signatory: 'not stated in the document', srole: 'not stated in the document', chain: ['Meridian Holdings LLC, its sole member', 'Meridian Acquisition LLC'], status: 'verify on the page' },
        { party: 'Kestrel Robotics Inc.', role: 'PARTY', signatory: 'James Calder', srole: 'Chief Executive Officer', chain: ['James Calder', 'Kestrel Robotics Inc.'], status: 'corroborated' },
      ],
    },
    settings: { mode: 'lockdown' },
  };

  // ---------- Menus ----------
  const MENUS = {
    word: ['Word', 'File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Table', 'Window', 'Help'],
    safari: ['Safari', 'File', 'Edit', 'View', 'History', 'Bookmarks', 'Window', 'Help'],
  };

  // ---------- The ZOE pane views ----------
  const actions = (opts = {}) => `<div class="zs-acts"><span class="zs-act is-boxed${opts.dis ? ' is-dis' : ''}">${I.insert}Insert</span><span class="zs-act">${I.adapt}Adapt</span><span class="zs-act">${I.mark}Mark</span><span class="zs-dots${opts.dot ? ' is-new' : ''}">…</span></div>`;
  const clauseCard = (c, i, extra = '') => `<div class="zs-card"><div class="zs-csrc2">${esc(c.source || '')}</div><div class="zs-ctext">${esc(c.text)}</div>${extra || actions({ dot: i % 2 === 0 })}</div>`;
  const searchBox = (q) => `<div class="zs-search">${I.filter}<div class="zs-field${q ? ' is-filled' : ''}">${I.search}<span>${q ? esc(q) : 'Search clauses'}</span>${q ? `<span class="zs-x">${I.x}</span>` : ''}</div></div>`;
  const scopeRow = (matter) => `<div class="zs-scope">Searching in <span class="zs-pill is-on">${esc(matter)}</span><span class="zs-pill">+ Add a matter</span><span class="zs-pill">All matters</span></div>`;
  const docHead = (d, matter) => `<div class="zs-type"><span class="zs-dot"></span>${esc(d.docType || 'Agreement and Plan of Merger')}</div>` +
    `<div class="zs-disclose">${I.chevR}Parties · ${esc((d.parties || PANE_DEFAULTS.home.parties).join(', '))}</div>` +
    `<div class="zs-disclose">${I.chevR}Similar documents · ${esc(d.similar == null ? 3 : d.similar)}</div>` + scopeRow(matter);

  const PANE = {
    home(d, ctx) {
      d = Object.assign({}, PANE_DEFAULTS.home, d);
      const sug = (d.suggestions || []).map((s, i) => (s.less ? '<div class="zs-less">Less close</div>' : '') + `<div class="zs-card"><div class="zs-ctext">${esc(s.text)}</div>${actions({ dot: i === 0 })}</div>`).join('');
      return { tab: 'home', html: docHead(d, ctx.matter) + searchBox(d.query || '') +
        `<div class="zs-h">From your paragraph <span style="margin-left:auto;display:flex;gap:8px;align-items:center">${I.pin.replace('<svg', '<svg style="width:14px;height:14px;color:#616161"')}<span class="zs-count" style="margin:0">${sug ? (d.suggestions || []).length + 2 : 0}</span></span></div><div class="zs-cap">Suggested clause tags</div>` + sug };
    },
    clauses(d, ctx) {
      d = Object.assign({}, PANE_DEFAULTS.clauses, d);
      const res = (d.results || []).map((c, i) => (i === 3 ? '<div class="zs-less">Less close</div>' : '') + clauseCard(c, i)).join('');
      return { tab: 'home', html: (d.full ? docHead(PANE_DEFAULTS.home, ctx.matter) : '') + searchBox(d.query) +
        `<div class="zs-h">For your search <span class="zs-count">${(d.results || []).length * 2}</span></div>` +
        (d.context ? `<div class="zs-cap">${esc(d.context)}</div>` : '') + (d.term ? `<span class="zs-pill" style="display:inline-block;margin-top:3px">${esc(d.term)}</span>` : '') +
        `<div class="zs-ideas"><div class="zs-row">Ideas: ${(d.ideas || []).map((t, i) => `<span class="zs-idea"><b>${i + 1}</b>${esc(t)}</span>`).join('')}</div>Agreement type:<br><span class="zs-atype">${esc(d.agreementType)}</span></div>` + res };
    },
    insertPreview(d) {
      d = Object.assign({}, PANE_DEFAULTS.insertPreview, d);
      const n = words(d.text);
      return { tab: 'home', html:
        `<div class="zs-card"><div class="zs-csrc2">${esc(d.source)}</div><div class="zs-ctext" style="-webkit-line-clamp:2">${esc(d.text)}</div>${actions({ dis: true, dot: true })}` +
        `<div class="zs-where">Where</div><div class="zs-wtabs2"><span class="is-on">Below ¶ this paragraph</span><span>Replace ¶ this paragraph</span><span>At cursor</span></div>` +
        `<div class="zs-diff"><div class="zs-row zs-between"><b style="font-size:12px">Insert below ¶ this paragraph</b></div><div class="zs-cap">${n} words added</div><div class="zs-cap">The exact text that will be inserted (${d.text.length.toLocaleString('en-US')} characters, byte for byte):</div>` +
        `<div class="zs-exact">${esc(d.text)}</div><div class="zs-row"><span class="zs-btn is-primary">Insert as tracked change</span><span class="zs-btn">Cancel</span></div></div>` +
        `<div class="zs-cap" style="margin-top:6px">Goes in as a tracked change. Undo stays on this card until you dismiss it.</div></div>` +
        clauseCard(CLAUSES[1], 1), focus: '.zs-diff' };
    },
    afterInsert(d) {
      d = Object.assign({}, PANE_DEFAULTS.afterInsert, d);
      const done = `${actions({ dis: true, dot: true })}<div class="zs-ok">${I.check}Inserted ${esc(d.where)} · tracked</div><div class="zs-acts"><span class="zs-act">${I.undo}Undo</span><span class="zs-act" style="padding:0 4px">${I.x}</span></div>`;
      return { tab: 'home', html: searchBox(PANE_DEFAULTS.clauses.query) +
        `<div class="zs-card"><div class="zs-csrc2">${esc(d.source)}</div><div class="zs-ctext" style="-webkit-line-clamp:3">${esc(d.text)}</div>${done}</div>` +
        CLAUSES.slice(1, 3).map((c, i) => clauseCard(c, i + 1)).join('') + '<div class="zs-less">Less close</div>' + CLAUSES.slice(3).map((c, i) => clauseCard(c, i)).join('') };
    },
    adapt(d) {
      d = Object.assign({}, PANE_DEFAULTS.adapt, d);
      let removed = 0, added = 0, kept = 0, out = '';
      (d.segments || []).forEach((s) => {
        if (typeof s === 'string') { kept += words(s); out += `<span class="zs-tok-same">${esc(s)}</span>`; }
        else { removed += words(s.from); added += words(s.to); out += `<span class="zs-tok-del">${esc(s.from)}</span> <span class="zs-tok-add">${esc(s.to)}</span>`; }
      });
      const answer = (d.segments || []).map((s) => (typeof s === 'string' ? s : s.to)).join('').replace(/\s+([,.])/g, '$1');
      return { tab: 'home', html:
        `<div class="zs-row" style="margin-bottom:8px;gap:8px"><span class="zs-act" style="padding:0 2px">${I.back}</span><div style="min-width:0"><b style="font-size:12.5px">${esc(d.title)}</b><div class="zs-cap" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(d.source)}</div></div></div>` +
        `<div class="zs-diff"><div class="zs-row zs-between" style="align-items:baseline;gap:6px"><b style="font-size:12px">Adapt answer against the original clause</b></div><div class="zs-cap">${removed} removed · ${added} added · ${kept} kept</div>` +
        `<div class="zs-tokens">${out}</div><div class="zs-cap" style="margin-top:6px">The exact text that will be inserted (${answer.length.toLocaleString('en-US')} characters, byte for byte):</div><div class="zs-exact" style="max-height:120px">${esc(answer)}</div>` +
        `<div class="zs-row"><span class="zs-btn is-primary">Insert the answer as a tracked change</span><span class="zs-btn">Cancel</span></div></div>`, focus: '.zs-diff' };
    },
    check(d) {
      d = Object.assign({}, PANE_DEFAULTS.check, d);
      const fixN = (d.fix || []).length + (d.missing ? 2 : 0);
      const lookN = (d.undefinedTerms || 0) + (d.unusedTerms || 0);
      const find = (f) => `<div class="zs-find"><span class="zs-q">?</span><span class="zs-ft">${esc(f.title)}</span><span class="zs-fp">¶ ${esc(f.para)}</span><span class="zs-fa"><span>Show</span><span style="font-weight:700;letter-spacing:1px">…</span></span></div>`;
      return { tab: 'bell', badge: fixN + lookN, html:
        `<div class="zs-checkcard"><div class="zs-row zs-between"><span class="zs-cap">Checked just now</span><span class="zs-btn" style="font-weight:400">Check again</span></div>` +
        `<div class="zs-cap" style="margin:8px 0 2px">${esc(d.marks)} marks on the words in the document; they are not saved and vanish when the document closes.</div><div class="zs-cap" style="color:#242424;margin-left:14px">Clear marks</div>` +
        `<div class="zs-sec">Fix before sending <small>${fixN}</small></div><div class="zs-group">${I.chevD}Gaps before sending <span style="color:#616161">${(d.fix || []).length}</span></div>` + (d.fix || []).map(find).join('') +
        (d.missing ? `<div class="zs-group">${I.chevR}Potentially missing sections and schedules<span class="zs-n">${esc(d.missing)}</span></div>` : '') +
        `<div class="zs-sec">Worth a look <small>${lookN}</small></div><div class="zs-group">${I.chevR}Capitalized terms never defined <span style="color:#616161">${esc(d.undefinedTerms)}</span></div><div class="zs-group">${I.chevR}Defined terms never used <span style="color:#616161">${esc(d.unusedTerms)}</span></div>` +
        `<div class="zs-row" style="border-top:1px solid #ececec;margin-top:10px;padding-top:9px;gap:10px"><span class="zs-cap" style="color:#424242">Tracked changes</span><span class="zs-btn" style="font-weight:400">Review changes ${I.chevR.replace('<svg', '<svg style="width:10px;height:10px;margin-left:4px"')}</span></div></div>` };
    },
  };

  // ---------- The cockpit views ----------
  const chip = (cls, text, icon) => `<span class="zs-chip ${String(cls).split(' ').filter(Boolean).map((c) => 'zs-' + c).join(' ')}">${icon || ''}${esc(text)}</span>`;
  const scrubChip = (s) => (s === 'Approved' ? chip('g', s, I.shield) : s === 'Scrubbed' ? chip('g', s, I.shield) : chip('a', s, I.eye));
  const docHeader = (d, tab, matter) => `<div class="zs-doch"><div class="zs-crumbs">Matters ${I.chevR}${esc(matter)} ${I.chevR}Document</div><h1 class="zs-ph1">${esc(d.title)} ${I.help}</h1>` +
    `<div class="zs-row"><span class="zs-dtype">${esc(d.type)}</span>${chip('p', 'typed', I.sparkle)}${chip('w', 'Agreement')}${chip('b', 'Searchable')}${chip('g', 'Scrubbed', I.shield)}${chip('p', 'Signatures read', I.sparkle)}</div></div>` +
    `<div class="zs-tabbar">${[['summary', 'Summary', I.doc], ['details', 'Details', I.book], ['parts', 'Identified parts', I.list, '12'], ['signatures', 'Signatures', I.sparkle]].map(([k, l, ic, n]) => `<span class="${k === tab ? 'is-on' : ''}">${ic}${l}${n ? ` <small>${n}</small>` : ''}</span>`).join('')}</div>`;

  const COCK = {
    matters(d) {
      d = Object.assign({}, COCK_DEFAULTS.matters, d);
      const card = (m, foot) => `<div class="zs-mcard${m.current ? ' is-cur' : ''}"><div class="zs-mtop"><span class="zs-mav">${esc(m.init)}</span><div style="flex:1;min-width:0"><div class="zs-mname">${esc(m.name)}</div><div class="zs-mmeta">${esc(m.docs)} documents · ${esc(m.active)}</div></div><span class="zs-more">•••</span></div>` +
        `<div class="zs-mstats">${chip('p sm', `${m.typed} typed`, I.sparkle)}${chip('b sm', `${m.searchable} searchable`, I.search)}${chip('sm', `${m.scrubbed} scrubbed`, I.shield)}${m.review !== undefined ? chip('a sm', `${m.review} to review`, I.eye) : ''}</div><div class="zs-mfoot">${foot}</div></div>`;
      const s = d.stats;
      return { nav: 'matters', html: `<div class="zs-pg"><div class="zs-phead2"><div><h1 class="zs-ph1">Matters ${I.help}</h1><div class="zs-psub">Each matter holds the documents of one deal or case. Choose one to work in, or start a new one.</div></div><span class="zs-cbtn pri">${I.plus}New matter</span></div>` +
        `<div class="zs-tabbar"><span class="is-on">Matters</span><span>Documents</span></div>` +
        `<div class="zs-stats"><div class="zs-stat"><small>${I.matters}Matters</small><b>${esc(s.matters)}</b></div><div class="zs-stat"><small>${I.doc}Documents</small><b>${esc(s.documents)}</b></div><div class="zs-stat"><small>${I.refresh}Being added now</small><b>${esc(s.adding)} <i>batches</i></b></div><div class="zs-stat"><small>${I.eye}Waiting for you</small><b>${esc(s.waiting)}</b></div></div>` +
        `<div class="zs-sech">${I.book}Reference Library</div><div class="zs-mgrid">${card(d.library, 'Click to open')}</div>` +
        `<div class="zs-sech">${I.matters}Your matters <small>${(d.matters || []).length}</small></div><div class="zs-mgrid">${(d.matters || []).map((m) => card(m, m.current ? 'Current matter' : 'Click to open')).join('')}<div class="zs-mcard is-new"><b>+</b>New matter</div></div></div>` };
    },
    documents(d) {
      d = Object.assign({}, COCK_DEFAULTS.documents, d);
      const rows = (d.docs || []).map((r) => `<tr><td><div class="zs-dn"><span class="zs-di">${I.doc}</span><div><div class="zs-dt">${esc(r.title)}</div><div class="zs-ds">${esc(r.file)} · ${esc(r.added)}</div></div></div></td><td class="zs-ds" style="white-space:nowrap">${esc(r.date)}</td>` +
        `<td><div style="font-size:11.5px;line-height:1.25;margin-bottom:3px">${esc(r.type)}</div>${r.conf ? chip('p sm', `proposed · ${r.conf}`, I.sparkle) : chip('g sm', 'confirmed', I.check)}</td><td>${chip('w sm', r.kind)}</td><td>${scrubChip(r.scrub)}</td><td>${r.sig === 'Signatures read' ? chip('p sm', r.sig, I.sparkle) : chip('sm', r.sig)}</td></tr>`).join('');
      return { nav: 'matters', matter: d.matter, html: `<div class="zs-pg"><div class="zs-crumbs">${esc(d.matter)}</div><div class="zs-phead2"><div><h1 class="zs-ph1">Matters ${I.help}</h1><div class="zs-psub">The documents of this matter: each one’s type, privacy status and checks, and the door to its Summary, Details, Identified parts and Signatures.</div></div><span class="zs-cbtn pri">${I.plus}New matter</span></div>` +
        `<div class="zs-tabbar"><span>Matters</span><span class="is-on">Documents</span></div><div class="zs-filter"><span class="zs-ds" style="font-size:11.5px;flex:1">${esc(d.count)} documents</span><span class="zs-cbtn">${I.refresh}</span><span class="zs-cbtn">${I.sparkle}Read signatures</span><span class="zs-cbtn pri">${I.plus}Add documents</span></div>` +
        `<div class="zs-filter"><div class="zs-in" style="max-width:300px">${I.search}Filter by name, type, identifier or file name</div><span style="margin-left:auto" class="zs-ds">All checks</span></div>` +
        `<div class="zs-tbl"><table><thead><tr><th>Document</th><th>Date</th><th>Type</th><th>Kind</th><th>Privacy scrub</th><th>Signatures</th></tr></thead><tbody>${rows}</tbody></table></div></div>` };
    },
    templates(d) {
      d = Object.assign({}, COCK_DEFAULTS.templates, d);
      const head = `<div class="zs-crumbs">${esc(d.library)}</div><div class="zs-phead2"><div><h1 class="zs-ph1">Templates and clauses ${I.help}</h1><div class="zs-psub">Describe what you need. ZOE finds the templates that fit and the clauses inside them, and shows why each one matched.</div></div><span class="zs-cbtn pri" style="width:30px;justify-content:center;padding:0">${I.plus}</span></div>` +
        `<div class="zs-card2"><div class="zs-twofield"><div><div class="zs-lbl">Description</div><div class="zs-in is-filled" style="height:32px;background:#f4f3ef;border-color:#f4f3ef">${I.search}${esc(d.description)}</div></div><div><div class="zs-lbl">Agreement type</div><div class="zs-in is-filled" style="height:32px;background:#f4f3ef;border-color:#f4f3ef">${I.doc}${esc(d.agreementType)}</div></div></div>` +
        `<div class="zs-scopeline">Searching in <span class="zs-chip zs-b zs-sm">${I.check}${esc(d.library)}</span><span class="zs-chip zs-w zs-sm">+ Add a matter</span><span class="zs-chip zs-w zs-sm">All matters</span><span class="zs-sp">Enter to search · Shift+Enter for a new line</span><span class="zs-cbtn pri">${I.search}Search</span></div></div>`;
      if (d.loading) return { nav: 'templates', matter: d.library, html: `<div class="zs-pg">${head}<div class="zs-skel"></div><div class="zs-skel"></div><div class="zs-skel" style="height:110px"></div></div>` };
      const ideaChip = (t, i, cls = 'b') => `<span class="zs-chip ${cls} sm"><span class="zs-num">${i + 1}</span>&nbsp;${esc(t)}</span>`;
      const cls = ['b', 'p', 'g'];
      const res = (d.results || []).map((r, ri) => {
        const covers = (d.ideas || []).map((t, i) => (r.covers && r.covers[i] ? ideaChip(t, i, cls[i % 3]) : chip('a sm', `not found: ${t}`))).join('');
        const p = r.passage;
        let ptext = p ? esc(p.text) : '';
        if (p && p.marks) p.marks.forEach((m) => { ptext = ptext.replace(esc(m), `<mark>${esc(m)}</mark>`); });
        return `<div class="zs-res"><div class="zs-rhead"><span class="zs-rn">${ri + 1}</span>${I.doc.replace('<svg', '<svg style="width:13px;height:13px;color:#6d6b64"')}<span class="zs-rt">${esc(r.file)}</span><span class="zs-match"><i><b style="width:${r.match}%"></b></i>${r.match}% match</span></div>` +
          `<div class="zs-row" style="gap:5px;margin-bottom:5px">${r.match === 100 ? chip('g sm', 'same type', I.check) : ''}${chip('g sm', `governed by ${r.jurisdiction} law`, I.bank)}</div>` +
          `<div class="zs-kv">Type: <b>${esc(r.type)}</b></div><div class="zs-kv">Signing parties: ${esc(r.parties)}</div><div class="zs-kv">Jurisdiction: <b>${esc(r.jurisdiction)}</b></div>` +
          `<div class="zs-covers">${I.list.replace('<svg', '<svg style="width:12px;height:12px"')}COVERS ${covers}</div>` +
          (p ? `<div class="zs-passage"><div class="zs-ptitle">${ideaChip(d.ideas[p.idea - 1], p.idea - 1)}<b>${esc(p.heading)}</b><span style="color:#6d6b64">${esc(p.path)}</span>${chip('w sm', 'Body')}<span class="zs-open">open in document ›</span></div><div class="zs-ptext">${esc(p.heading)} ${ptext}</div></div>` : '') + '</div>';
      }).join('');
      return { nav: 'templates', matter: d.library, html: `<div class="zs-pg">${head}` +
        `<div class="zs-readas"><div class="zs-lbl">${I.sparkle}ZOE read your search as</div><div class="zs-row">Ideas ${(d.ideas || []).map((t, i) => ideaChip(t, i, cls[i % 3])).join('')}<em>Jurisdiction</em> ${chip('w sm', d.jurisdiction, I.pinMap)}<em>Agreement type</em> ${chip('b sm', d.typeChip)}</div></div>` +
        `<div class="zs-tabbar"><span class="is-on">${I.doc}Templates <small>${esc(d.count)}</small></span><span>${I.list}Clauses <small>${esc(d.count)}</small></span></div>` +
        `<div class="zs-note">${I.pinMap}Jurisdiction recognized: ${esc(d.jurisdiction)}. Matched against each document’s governing law and where its parties are organized.</div>` +
        `<div class="zs-forline">${esc(d.count)} template(s) in <b>${esc(d.library)}</b> for <b>“${esc(d.description)}”</b> · agreement type <b>“${esc(d.agreementType)}”</b></div>${res}</div>` };
    },
    diligence(d) {
      d = Object.assign({}, COCK_DEFAULTS.diligence, d);
      const F = [['Document type', I.doc], ['Party', I.users], ['Signer', I.user], ['Name anywhere', I.diligence], ['Role', I.tag], ['Date', I.cal], ['Section', I.book], ['Family', I.layers], ['Governing law', I.scale], ['Agreement name', I.bank]];
      const set = d.filters || {};
      const cards = F.map(([n, ic]) => `<div class="zs-fcard${set[n] ? ' is-set' : ''}"><span class="zs-fi">${ic}</span><div><b>${esc(n)}</b><small>${esc(set[n] || 'Any')}</small></div>${I.chevD}</div>`).join('');
      const q = d.query;
      const hits = q ? `<div class="zs-flabel" style="margin-bottom:8px">${esc(d.count)} documents match.</div>` + (d.hits || []).map((h, i) => `<div class="zs-hit"><div class="zs-rhead"><span class="zs-rn" style="width:18px;height:18px;border-radius:50%;background:#ebe9e3;display:grid;place-items:center;font-size:10px;font-weight:600">${i + 1}</span><b style="font-size:12.5px">${esc(h.title)}</b></div><div class="zs-ds" style="margin-left:26px">${esc(h.file)}</div>` +
        `<div class="zs-meta"><span>Type <b>${esc(h.type)}</b></span><span>Family <b>${esc(h.family)}</b></span><span>Date <b>${esc(h.date)}</b></span><span>Governing law <b>${esc(h.law)}</b></span></div><div class="zs-why">Why it matched: your words are in the text.</div>` +
        (h.passages || []).map((p) => `<div class="zs-passage"><div class="zs-ptitle"><b>${esc(p.head)}</b><span style="color:#2a46c4">${esc(p.head)}</span></div><div class="zs-ptext">${esc(p.text).replace(/(Competing Business|non-competition|solicit)/i, '<mark>$1</mark>')}</div><span class="zs-cbtn sm">Show more</span></div>`).join('') + '</div>').join('')
        : '<div class="zs-empty"><b>Nothing searched yet</b>Type some words or open a card, then press Search.</div>';
      return { nav: 'diligence', matter: d.matter, html: `<div class="zs-pg zs-wide"><div class="zs-crumbs">${esc(d.matter)}</div><h1 class="zs-ph1">Diligence</h1><div class="zs-psub">Find the documents that answer a diligence question: who signed, who is a party, the type, the date, the section and the governing law.</div>` +
        `<div class="zs-scopechips">Searching in <span class="zs-chip zs-b zs-sm">${I.check}${esc(d.matter)}</span><span class="zs-chip zs-w zs-sm">+ Add a matter</span><span class="zs-chip zs-w zs-sm">All matters</span></div>` +
        `<div class="zs-dsearch"><div class="zs-in${q ? ' is-filled is-focus' : ''}">${I.search}${q ? esc(q) : 'Words to look for, or open a card below'}</div><span class="zs-cbtn pri">${I.search}Search</span></div>` +
        `<div class="zs-prec"><span class="zs-sw"></span><b>Precision</b><small>ON</small><span>Precision is on: answers also use the extra reading stored for each document (who signed, who is a party and in what role, the name and the date).</span></div>` +
        `<div class="zs-flabel">Filters <small>${Object.keys(set).length ? Object.keys(set).length + ' set' : 'No filter is set. Open a card to set one.'}</small></div><div class="zs-fgrid">${cards}</div>${hits}</div>` };
    },
    scrubbed(d, ctx) {
      d = Object.assign({}, COCK_DEFAULTS.scrubbed, d);
      const secs = Array.isArray(d.sections) && d.sections.length ? d.sections : ['TERM SHEET', 'Parties', 'Structure', 'Purchase Price', 'Escrow', 'Earn-out', 'Financing', 'Key Employees', 'Conditions'];
      return { nav: 'matters', html: `<div class="zs-pg zs-wide">${docHeader(d, 'summary', ctx.matter)}` +
        `<div class="zs-docbar"><span class="zs-cbtn pri sm">Open</span><span class="zs-seg"><span>Original</span><span class="is-on">Scrubbed copy</span></span><span>${esc(d.replacements)} of ${esc(d.replacements)} placeholders verified</span></div>` +
        `<div class="zs-docgrid"><div class="zs-paper">${d.html}</div><div><div class="zs-card2"><div class="zs-row zs-between" style="margin-bottom:6px"><b style="font-size:12.5px;display:flex;gap:6px;align-items:center">${I.shield.replace('<svg', '<svg style="width:13px;height:13px"')}Privacy scrub</b>${chip('g sm', 'APPROVED')}</div>` +
        `<div class="zs-steps"><div class="zs-step"><span class="zs-sn ok">✓</span><div><b>Step 1: scrub</b>Finds names, addresses and numbers and scrubs them in a copy, leaving placeholders. ${esc(d.replacements)} placeholder(s), 0 item(s) to check.</div></div><div class="zs-step"><span class="zs-sn ok">✓</span><div><b>Step 2: review and approve</b>Approved by you. Only the scrubbed copy can leave this computer.</div></div></div></div>` +
        `<div class="zs-card2"><div class="zs-row" style="margin-bottom:6px;gap:6px">${I.list.replace('<svg', '<svg style="width:13px;height:13px;color:#6d6b64"')}<b style="font-size:12.5px">Sections</b><span class="zs-ds">${secs.length} section(s), ${secs.length} checked</span></div><div class="zs-secs">${secs.map((s, i) => `<div class="zs-row"><span>${esc(s)}</span><span>${i < 2 ? 'Opening' : 'Body'}</span>${chip('g sm', 'ok')}</div>`).join('')}</div></div></div></div></div>` };
    },
    verify(d, ctx) {
      d = Object.assign({}, COCK_DEFAULTS.verify, d);
      const items = (d.items || []).map((it) => {
        const [t, first] = Array.isArray(it) ? it : [it, false];
        return `<div class="zs-vrow">${chip('o sm', 'verify first')}<span class="zs-vt">${esc(t)}</span><span class="zs-show">${I.arrowR.replace('<svg', '<svg style="width:11px;height:11px"')}Show in text</span><span class="zs-cbtn sm">${first ? 'Looks right' : 'Should be masked'}</span><span class="zs-cbtn sm">${first ? 'Needs fixing' : 'Looks right'}</span></div>`;
      }).join('');
      return { nav: 'matters', html: `<div class="zs-pg zs-wide">${docHeader(d, 'details', ctx.matter)}<div class="zs-card2" style="padding:0;overflow:hidden"><div class="zs-row" style="padding:10px 12px;border-bottom:1px solid #e4e2db;gap:8px">${I.list.replace('<svg', '<svg style="width:13px;height:13px;color:#6d6b64"')}<b style="font-size:12.5px">Verify these first (${(d.items || []).length})</b></div>${items}</div></div>` };
    },
    signatures(d, ctx) {
      d = Object.assign({}, COCK_DEFAULTS.signatures, d);
      const rows = (d.rows || []).map((r) => `<tr><td>${esc(r.party)}</td><td><div style="font-size:10.5px;font-weight:600;letter-spacing:0.03em">${esc(r.role)}</div>${r.status === 'corroborated' ? chip('g sm', 'corroborated') : chip('a sm', r.status)}</td><td>${esc(r.signatory)}</td><td>${esc(r.srole)}</td><td class="zs-chain">${(r.chain || []).map((c, i, a) => (i === a.length - 1 ? `<b>${esc(c)}</b>` : `${esc(c)} &gt;&gt;&gt; `)).join('')}</td></tr>`).join('');
      return { nav: 'matters', html: `<div class="zs-pg zs-wide">${docHeader(d, 'signatures', ctx.matter)}<div class="zs-card2"><div style="font-weight:600;font-size:13.5px;margin-bottom:3px">Who signed, for whom, under what authority</div>` +
        `<div class="zs-ds" style="margin-bottom:10px">Read from the signature pages and the opening paragraph, on this computer. Each line is corroborated by the text or marked for you to verify on the page.</div>` +
        `<div class="zs-tbl zs-sigt"><table><thead><tr><th>party</th><th>party role</th><th>signatory</th><th>signatory role</th><th>chain of authority</th></tr></thead><tbody>${rows}</tbody></table></div>` +
        `<div class="zs-ds" style="margin:10px 0 0">“not stated in the document” means the page does not say it. The chain of authority reads signatory &gt;&gt;&gt; (intermediate &gt;&gt;&gt;) party.</div></div></div>` };
    },
    settings(d) {
      d = Object.assign({}, COCK_DEFAULTS.settings, d);
      const lock = d.mode !== 'hybrid';
      const seg = (a, b, onA) => `<span class="zs-seg"><span class="${onA ? 'is-on' : ''}">${a}</span><span class="${onA ? '' : 'is-on'}">${b}</span></span>`;
      return { nav: 'settings', html: `<div class="zs-pg"><h1 class="zs-ph1">Settings</h1><div class="zs-psub" style="margin-bottom:16px">How ZOE connects, and when it starts work on a new document.</div>` +
        `<div class="zs-set"><h4>Connection</h4><div class="zs-lock">${seg('Lockdown', 'Hybrid', lock)}</div><div class="zs-sd">${lock ? 'Completely offline. Nothing leaves this computer.' : 'Connected to cloud AI. Names and identifying details are scrubbed before anything is sent.'}</div></div>` +
        `<div class="zs-set"><h4>Confirm before sending</h4><span class="zs-cbx"><i></i>Off</span><div class="zs-sd">Off: your request is still checked and names are swapped before it leaves; you are not asked first</div></div>` +
        `<div class="zs-set"><h4>Assistant on this computer</h4>${seg('Standard', 'Local AI', true)}<div class="zs-sd">Documents are processed on this computer; chat uses cloud AI in Hybrid.</div></div>` +
        `<div class="zs-set"><h4>Automatic processing</h4>${seg('On', 'Off', true)}<div class="zs-sd">Process each document as soon as it is added.</div></div></div>` };
    },
  };

  // ---------- Clock ----------
  function clockText(v) {
    if (typeof v === 'string' && v !== 'live') return v;
    const t = v instanceof Date ? v : new Date();
    const day = t.toLocaleDateString('en-US', { weekday: 'short' });
    const md = t.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const tm = t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return { date: `${day} ${md}`, time: tm };
  }

  // ---------- Mount ----------
  function mount(container, options) {
    if (!container) throw new Error('ZoeScreens.mount: no container');
    const o = Object.assign({ app: 'word', wifi: false, width: 1280, clock: 'live', motion: true, matter: MATTER }, options || {});
    if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
    const W = o.width;
    const sizeCls = W <= 800 ? ' zs-w-m zs-w-s zs-w-xs' : W <= 900 ? ' zs-w-m zs-w-s' : W <= 1100 ? ' zs-w-m' : '';
    const root = node(`<div class="zs-root" aria-hidden="true"><div class="zs-desk${sizeCls}${o.motion && !reducedMotion() ? '' : ' zs-nomotion'}">
      <div class="zs-wall"></div>
      <div class="zs-menubar">${I.apple}<div class="zs-menus"></div>
        <div class="zs-status"><span class="zs-batt">${I.battery}</span><span class="zs-wifi">${I.wifiOn}${I.wifiOff}</span><span class="zs-spot">${I.spot}</span><span class="zs-cc">${I.cc}</span><span class="zs-clock"></span></div></div>
      <div class="zs-win zs-word">
        <div class="zs-wtitle"><span class="zs-lights"><i></i><i></i><i></i></span><span class="zs-autosave">AutoSave <span class="zs-toggle"></span><b>OFF</b></span>
          <span class="zs-qat">${I.home}${I.save}${I.undo}${I.redo}<span style="font-weight:700;letter-spacing:1px">…</span></span>
          <span class="zs-doctitle"><span class="zs-dname">Document</span><small>— Saved to my Mac</small></span>
          <span class="zs-wsearch">${I.search}Search</span><span class="zs-avatar"></span></div>
        <div class="zs-wtabs">${['Home', 'Insert', 'Draw', 'Design', 'Layout', 'References', 'Mailings', 'Review', 'View'].map((t, i) => `<span class="${i === 0 ? 'is-on' : ''}">${t}</span>`).join('')}
          <span class="zs-wright"><span class="zs-wbtn">${I.comment}Comments</span><span class="zs-wbtn">Editing ${I.chevD.replace(' class="zs-chev"', '')}</span><span class="zs-wbtn is-blue">${I.share}Share</span></span></div>
        <div class="zs-ribbon">
          <div class="zs-rg"><span class="zs-big">${I.paste}Paste</span></div>
          <div class="zs-rg"><div class="zs-fontrows"><div class="zs-fontrow"><span class="zs-dd" style="width:124px">Times New Roman</span><span class="zs-dd" style="width:44px">12</span><span class="zs-ico" style="font-size:13px">A˄</span><span class="zs-ico" style="font-size:11px">A˅</span><span class="zs-ico" style="font-size:12px">Aa</span></div>
            <div class="zs-fontrow"><span class="zs-ico"><b>B</b></span><span class="zs-ico"><i>I</i></span><span class="zs-ico"><u>U</u></span><span class="zs-ico"><s>ab</s></span><span class="zs-ico" style="font-size:11px">x₂</span><span class="zs-ico" style="font-size:11px">x²</span><span class="zs-ico" style="box-shadow:inset 0 -3px 0 #ffd400">ab</span><span class="zs-ico" style="box-shadow:inset 0 -3px 0 #d00">A</span></div></div></div>
          <div class="zs-rg"><div class="zs-fontrows"><div class="zs-fontrow">${['list', 'list', 'list'].map(() => `<span class="zs-ico">${I.list}</span>`).join('')}<span class="zs-ico" style="font-family:var(--zs-ui);font-size:13px">¶</span></div>
            <div class="zs-fontrow">${[0, 1, 2, 3].map((k) => `<span class="zs-ico"><svg viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M2.5 3.5h11M${k === 1 ? 4.5 : k === 2 ? 5.5 : 2.5} 6.5h${k === 1 ? 7 : k === 2 ? 8 : k === 3 ? 11 : 7}M2.5 9.5h11M${k === 1 ? 4.5 : k === 2 ? 5.5 : 2.5} 12.5h${k === 1 ? 7 : k === 2 ? 8 : k === 3 ? 11 : 7}"/></svg></span>`).join('')}</div></div></div>
          <div class="zs-rg"><div class="zs-styles"><span class="zs-style is-on"><b>AaBbCcDdEe</b><i>Normal</i></span><span class="zs-style"><b>AaBbCcDdEe</b><i>No Spacing</i></span><span class="zs-style h1"><b>AaBbCcDc</b><i>Heading 1</i></span><span class="zs-style h2"><b>AaBbCcDdEe</b><i>Heading 2</i></span><span class="zs-style tt"><b>AaBb</b><i>Title</i></span></div></div>
          <div class="zs-rg"><span class="zs-big">${I.mic}Dictate</span><span class="zs-big">${I.proof}Editor</span></div>
          <div class="zs-rg zs-zoebtn is-on"><span class="zs-big"><span class="zs-zmark">Z</span>ZOE</span></div>
        </div>
        <div class="zs-wbody"><div class="zs-canvas"><div class="zs-pagewrap"><div class="zs-page"></div></div></div>
          <aside class="zs-pane"><div class="zs-phead">ZOE<span class="zs-sp"></span>${I.chevD.replace(' class="zs-chev"', '')}${I.x}</div>
            <div class="zs-ptop"><span class="zs-ptile">Z</span><span class="zs-pmatter"><span class="zs-dot"></span><span class="zs-pmname"></span>${I.chevD}</span><span class="zs-more">…</span></div>
            <div class="zs-ptabs"><span class="zs-ptab zs-pt-home is-on">${I.home}Home</span><span class="zs-ptab zs-pt-bell">${I.bell}<span class="zs-badge">8</span></span></div>
            <div class="zs-pbody"><div class="zs-pview"></div></div>
            <div class="zs-pfoot"><div class="zs-chatline"><span class="zs-dot"></span><span class="zs-cltext"></span></div><div class="zs-ask">Ask ZOE to find or check something</div><div class="zs-askrow"><span class="zs-btn">Ask</span><span class="zs-askwifi">${I.wifiSmall}</span></div></div>
          </aside></div>
        <div class="zs-wstatus"><span class="zs-pages">Page 1 of 3</span><span class="zs-words">612 words</span>${I.proof}<span class="zs-lang">English (United States)</span>
          <span class="zs-sright"><span class="zs-focus" style="display:flex;gap:4px;align-items:center">${I.focus}Focus</span>${I.readL}${I.printL}${I.webL}<span class="zs-slider"><span class="zs-pm">−</span><span class="zs-track"><span class="zs-thumb"></span></span><span class="zs-pm">+</span></span><span class="zs-zpct">100%</span></span></div>
      </div>
      <div class="zs-win zs-safari">
        <div class="zs-stool"><span class="zs-lights"><i></i><i></i><i></i></span><span style="margin-left:14px">${I.sidebar}</span><span class="zs-navg"><span>${I.back}</span><span class="is-dim">${I.fwd}</span></span>
          <div class="zs-addr"><span class="zs-fav">Z</span><span>127.0.0.1:8790</span><span class="zs-reload">${I.refresh}</span></div>
          <span class="zs-tright">${I.share}${I.plus}${I.tabs}</span></div>
        <div class="zs-ck">
          <aside class="zs-side"><div class="zs-brand"><span class="zs-bmark">Z</span><div><div class="zs-bname">ZOE</div><div class="zs-bsub">Legal document workspace</div></div></div>
            <nav class="zs-nav"><span class="zs-nl" data-nav="matters">${I.matters}Matters</span><span class="zs-nl" data-nav="templates">${I.search}Templates and clauses</span><span class="zs-nl" data-nav="diligence">${I.diligence}Diligence</span><span class="zs-nl" data-nav="more">${I.chevR}More</span></nav>
            <div class="zs-assist"><div class="zs-ah">${I.bot}Assistant${I.chevD}</div><div class="zs-ahelp">Ask for what you need and the assistant does the work and takes you to it. As you type a name, ZOE offers the names it knows: pick one and it turns blue. Names you tag are hidden from cloud AI; everything else goes as typed.</div>
              <div class="zs-abox">Ask ZOE to find or check something</div><div class="zs-arow"><span class="zs-abtn">${I.send}Ask</span>${I.wifiSmall}</div><div class="zs-amatter">Matter <span class="zs-amname"></span></div></div>
            <div class="zs-sfoot"><div>${I.shield}Local only on this computer</div><div>ZOE AI v0.1.0</div></div></aside>
          <div class="zs-main"><div class="zs-topbar"><span class="zs-switch"><span class="zs-si">${I.matters}</span><span class="zs-st"><small>Matter</small><b class="zs-swname"></b></span>${I.chevUD}</span>
            <span class="zs-tb-r">${chip('g', 'Models loaded', '<span class="zs-cd"></span>')}${chip('g', 'ZOE is running', '<span class="zs-cd"></span>')}${I.moon}${I.gear}</span></div>
            <div class="zs-content"><div class="zs-cview"></div></div></div>
        </div>
      </div>
    </div></div>`);
    container.appendChild(root);
    const desk = root.firstElementChild;
    const $ = (s) => root.querySelector(s);
    const winWord = $('.zs-word'), winSafari = $('.zs-safari');
    const page = $('.zs-page'), canvas = $('.zs-canvas'), pview = $('.zs-pview'), cview = $('.zs-cview');
    const thumb = $('.zs-thumb'), zpct = $('.zs-zpct');
    let scale = 1, alive = true, clockTimer = 0, clockVal = o.clock;
    let app = null, wifiOn = !!o.wifi, zoom = 100, zoomTok = 0, scrollTok = 0, paneTok = 0, viewTok = 0, matter = o.matter;
    const motion = () => o.motion && !reducedMotion();

    // Crop: show one element of the desktop (e.g. '.zs-pane') filling the container's width; the desk keeps a fixed height.
    function cropRect() {
      const el = o.crop && root.querySelector(o.crop);
      if (!el) return null;
      let x = 0, y = 0, n = el;
      while (n && n !== desk) {
        x += n.offsetLeft; y += n.offsetTop;
        const par = n.offsetParent;
        for (let a = n.parentElement; a && a !== par && a !== desk; a = a.parentElement) { x -= a.scrollLeft; y -= a.scrollTop; }
        if (par && par !== desk) { x -= par.scrollLeft; y -= par.scrollTop; }
        n = par;
      }
      const pad = o.cropPad || 0;
      return { x: x - pad, y: y - pad, w: el.offsetWidth + 2 * pad, h: el.offsetHeight + 2 * pad };
    }
    function fit() {
      const cw = container.clientWidth, ch = container.clientHeight;
      desk.style.width = W + 'px';
      if (o.crop) {
        desk.style.height = (o.deskHeight || 800) + 'px';
        const r = cropRect();
        if (!r || !cw) return;
        if (o.cropAspect !== false) container.style.aspectRatio = (r.w / r.h).toFixed(4);
        scale = cw / r.w;
        desk.style.transform = `translate(${(-r.x * scale).toFixed(2)}px, ${(-r.y * scale).toFixed(2)}px) scale(${scale})`;
        return;
      }
      if (!cw || !ch) return;
      scale = cw / W;
      desk.style.height = Math.round(ch / scale) + 'px';
      desk.style.transform = `scale(${scale})`;
    }
    fit();
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(container);

    function tickClock() {
      clearTimeout(clockTimer);
      const ct = clockText(clockVal);
      if (typeof ct === 'string') $('.zs-clock').textContent = ct;
      else $('.zs-clock').innerHTML = `<span class="zs-cdate">${esc(ct.date)} </span>${esc(ct.time)}`;
      if (clockVal === 'live' && alive) {
        const now = new Date();
        clockTimer = setTimeout(tickClock, (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50);
      }
    }
    tickClock();

    function setMatterName(name) {
      matter = name || matter;
      $('.zs-pmname').textContent = matter;
      $('.zs-swname').textContent = matter;
      $('.zs-amname').textContent = matter;
    }
    setMatterName(matter);

    function reveal(viewEl, sel) {
      viewEl.scrollTop = 0;
      const el = sel && viewEl.querySelector(sel);
      if (el) viewEl.scrollTop = Math.max(0, el.offsetTop + el.offsetHeight - viewEl.clientHeight + 12);
    }
    function swap(viewEl, html, tokenGetter, token, sel) {
      if (!motion()) { viewEl.innerHTML = html; reveal(viewEl, sel); return Promise.resolve(); }
      return new Promise((res) => {
        viewEl.classList.add('zs-fading');
        setTimeout(() => {
          if (tokenGetter() !== token) return res();
          viewEl.innerHTML = html; reveal(viewEl, sel);
          void viewEl.offsetWidth;
          viewEl.classList.remove('zs-fading');
          setTimeout(res, 180);
        }, 140);
      });
    }

    function setApp(a) {
      a = a === 'safari' ? 'safari' : 'word';
      if (a === app) return Promise.resolve();
      app = a;
      $('.zs-menus').innerHTML = MENUS[a].map((m, i) => `<span class="${i === 0 ? 'zs-appname' : ''}">${m}</span>`).join('');
      winWord.classList.toggle('is-front', a === 'word');
      winSafari.classList.toggle('is-front', a === 'safari');
      return new Promise((res) => setTimeout(res, motion() ? 250 : 0));
    }

    function setWifi(on) {
      wifiOn = !!on;
      $('.zs-wifi').classList.toggle('is-off', !wifiOn);
      $('.zs-cltext').textContent = wifiOn ? 'Chat goes to cloud AI (Hybrid): names and numbers stay placeholders' : 'Chat stays on this computer';
      $('.zs-chatline .zs-dot').className = 'zs-dot' + (wifiOn ? '' : ' blue');
      $('.zs-askwifi svg').classList.toggle('is-off', !wifiOn);
      $('.zs-arow > svg').classList.toggle('is-off', !wifiOn);
    }

    // ----- Word -----
    function thumbAt(p) {
      const f = p <= 100 ? ((p - 10) / 90) * 50 : 50 + ((Math.min(p, 500) - 100) / 400) * 50;
      thumb.style.left = Math.max(0, Math.min(100, f)) + '%';
      zpct.textContent = Math.round(p) + '%';
    }
    function applyZoom(p) {
      const ratio = canvas.scrollHeight > canvas.clientHeight ? canvas.scrollTop / (canvas.scrollHeight - canvas.clientHeight || 1) : 0;
      zoom = p;
      page.style.setProperty('--zs-z', (p / 100).toFixed(4));
      thumbAt(p);
      if (ratio) canvas.scrollTop = ratio * (canvas.scrollHeight - canvas.clientHeight);
    }
    function setZoom(p, ms = 0) {
      const tok = ++zoomTok, from = zoom, to = Math.max(10, Math.min(500, +p || 100));
      if (!ms || !motion()) { applyZoom(to); return Promise.resolve(); }
      return new Promise((res) => {
        const t0 = performance.now();
        const step = (now) => {
          if (tok !== zoomTok || !alive) return res();
          const k = Math.min(1, (now - t0) / ms);
          applyZoom(from + (to - from) * ease(k));
          if (k < 1) requestAnimationFrame(step); else res();
        };
        requestAnimationFrame(step);
      });
    }
    function scrollTo(target, ms = 600) {
      const tok = ++scrollTok;
      let y = target;
      if (target && target.nodeType === 1) {
        // Layout offsets (virtual px), so a transform on any ancestor (the hero's camera) cannot skew the target.
        let top = 0, n = target;
        while (n && n !== canvas && canvas.contains(n)) { top += n.offsetTop; n = n.offsetParent; }
        y = top - canvas.clientHeight * 0.25;
      }
      y = Math.max(0, Math.min(+y || 0, canvas.scrollHeight - canvas.clientHeight));
      const from = canvas.scrollTop;
      if (!ms || !motion()) { canvas.scrollTop = y; return Promise.resolve(); }
      return new Promise((res) => {
        const t0 = performance.now();
        const step = (now) => {
          if (tok !== scrollTok || !alive) return res();
          const k = Math.min(1, (now - t0) / ms);
          canvas.scrollTop = from + (y - from) * ease(k);
          if (k < 1) requestAnimationFrame(step); else res();
        };
        requestAnimationFrame(step);
      });
    }
    function setDocument(html, opts) {
      page.innerHTML = html || '';
      const t = (opts && opts.title) || 'Document';
      $('.zs-dname').textContent = /\.docx$/i.test(t) ? t : t + '.docx';
      const n = words(page.textContent || '');
      $('.zs-words').textContent = n.toLocaleString('en-US') + ' words';
      $('.zs-pages').textContent = `Page 1 of ${(opts && opts.pages) || Math.max(1, Math.ceil(n / 350))}`;
      canvas.scrollTop = 0;
    }
    function setPane(view, data, opts) {
      const fn = PANE[view] || PANE.home;
      const r = fn(data || {}, { matter });
      $('.zs-pt-home').classList.toggle('is-on', r.tab !== 'bell');
      $('.zs-pt-bell').classList.toggle('is-on', r.tab === 'bell');
      $('.zs-badge').textContent = r.badge || 8;
      const tok = ++paneTok;
      if (opts && opts.instant) { pview.innerHTML = r.html; reveal(pview, r.focus); return Promise.resolve(); }
      return swap(pview, r.html, () => paneTok, tok, r.focus);
    }
    function setPaneOpen(on) {
      $('.zs-pane').hidden = !on;
      $('.zs-zoebtn').classList.toggle('is-on', !!on);
    }

    // ----- Cockpit -----
    function setView(view, data, opts) {
      const fn = COCK[view] || COCK.matters;
      const r = fn(data || {}, { matter });
      root.querySelectorAll('.zs-nl').forEach((n) => n.classList.toggle('is-on', n.dataset.nav === r.nav));
      $('.zs-swname').textContent = r.matter || matter;
      const tok = ++viewTok;
      if (opts && opts.instant) { cview.innerHTML = r.html; cview.scrollTop = 0; return Promise.resolve(); }
      return swap(cview, r.html, () => viewTok, tok);
    }

    // initial state: drawn at once (no fade on mount)
    desk.classList.add('zs-init');
    setApp(o.app);
    setWifi(wifiOn);
    thumbAt(100);
    setDocument(TERM_SHEET_HTML, { title: 'Term Sheet' });
    setPane('home', {}, { instant: true });
    setView('matters', {}, { instant: true });
    void desk.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => desk.classList.remove('zs-init')));

    const api = {
      el: root,
      get scale() { return scale; },
      get app() { return app; },
      get wifi() { return wifiOn; },
      wifiIconEl: $('.zs-wifi'),
      setApp, setWifi,
      setClock(v) { clockVal = v == null ? 'live' : v; tickClock(); },
      setMatter: setMatterName,
      refit: fit,
      destroy() { alive = false; clearTimeout(clockTimer); if (ro) ro.disconnect(); root.remove(); },
      word: {
        get pageEl() { return page; },
        scrollEl: canvas,
        get paneEl() { return pview; },
        get zoom() { return zoom; },
        setDocument, setZoom, scrollTo, setPane, setPaneOpen,
      },
      cockpit: { get viewEl() { return cview; }, scrollEl: cview, setView },
    };
    return api;
  }

  // ---------- Static frames ----------
  const PRESETS = {
    'word-home': { app: 'word', doc: TERM_SHEET_HTML, title: 'Term Sheet', pane: ['home', { docType: 'Term Sheet', parties: ['KESTREL ROBOTICS INC.', 'MERIDIAN ACQUISITION LLC'], similar: 4 }], zoom: 110 },
    'word-clauses': { app: 'word', doc: MERGER_HTML, title: 'Agreement and Plan of Merger', pane: ['clauses'] },
    'word-insert-preview': { app: 'word', doc: MERGER_HTML, title: 'Agreement and Plan of Merger', pane: ['insertPreview'] },
    'word-tracked': { app: 'word', doc: MERGER_TRACKED_HTML, title: 'Agreement and Plan of Merger', pane: ['afterInsert'], scroll: 300 },
    'word-tracked-page': { app: 'word', doc: MERGER_TRACKED_HTML, title: 'Agreement and Plan of Merger', pane: ['afterInsert'], paneOpen: false, zoom: 190, focus: '.zs-ins' },
    'word-adapt': { app: 'word', doc: MERGER_HTML, title: 'Agreement and Plan of Merger', pane: ['adapt'] },
    'word-check': { app: 'word', doc: MERGER_HTML, title: 'Agreement and Plan of Merger', pane: ['check'] },
    'cockpit-matters': { app: 'safari', view: ['matters'] },
    'cockpit-documents': { app: 'safari', view: ['documents'] },
    'cockpit-templates': { app: 'safari', view: ['templates'] },
    'cockpit-diligence': { app: 'safari', view: ['diligence'] },
    'cockpit-scrubbed': { app: 'safari', view: ['scrubbed'] },
    'cockpit-verify': { app: 'safari', view: ['verify'] },
    'cockpit-verify-short': { app: 'safari', view: ['verify', { items: COCK_DEFAULTS.verify.items.slice(1, 4) }] },
    'cockpit-signatures': { app: 'safari', view: ['signatures'] },
    'cockpit-settings': { app: 'safari', view: ['settings'] },
  };
  function frame(container, preset, opts) {
    const p = PRESETS[preset];
    if (!p) throw new Error('ZoeScreens.frame: unknown preset ' + preset);
    const desk = mount(container, Object.assign({ app: p.app, motion: false, wifi: false }, opts || {}));
    if (p.app === 'word') {
      desk.word.setDocument(p.doc, { title: p.title, pages: p.doc === TERM_SHEET_HTML ? 2 : 13 });
      desk.word.setPane(p.pane[0], p.pane[1] || {}, { instant: true });
      if (p.paneOpen === false) desk.word.setPaneOpen(false);
      if (p.zoom) desk.word.setZoom(p.zoom);
      if (p.scroll) desk.word.scrollTo(p.scroll, 0);
      if (p.focus) desk.word.scrollTo(desk.word.pageEl.querySelector(p.focus), 0);
    } else {
      desk.cockpit.setView(p.view[0], p.view[1] || {}, { instant: true });
      const sel = (opts && opts.focus) || p.focus;
      const cv = desk.cockpit.scrollEl, el = sel && cv.querySelector(sel);
      if (el) { let top = 0, n = el; while (n && n !== cv && cv.contains(n)) { top += n.offsetTop; n = n.offsetParent; } cv.scrollTop = Math.max(0, top - 14); }
    }
    desk.refit();
    return desk;
  }

  window.ZoeScreens = {
    version: '1',
    mount, frame,
    presets: Object.keys(PRESETS),
    documents: { termSheet: TERM_SHEET_HTML, merger: MERGER_HTML, mergerTracked: MERGER_TRACKED_HTML },
    paneViews: Object.keys(PANE),
    cockpitViews: Object.keys(COCK),
    dateToken: '[Month_Day_Year]', // what every date reads in a scrubbed copy
  };
})();
