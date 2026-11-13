// ZOE AI hero — the boardroom term sheet, in five acts.
// Act I the ambush and the snap · II open the laptop, pull the plug · III local work, offline
// IV the scrub and the round trip · V ten minutes are up.

// Analytics sink. While empty, events are logged to the console.
const ANALYTICS_ENDPOINT = '';

// ---------- Story content: every name and line in one place ----------
// All parties, numbers, addresses and dates are invented.
// The scrub: names, people and addresses become "Party n" / "Person n" / "Address n"; every date becomes the one
// token [Month_Day_Year]; an identifier number (the EIN, the escrow account) shows as another number of the same
// shape. Dollar amounts are never scrubbed (their mask is the real figure) and never highlighted.
const PARTIES = {
  seller:    { real: 'Kestrel Robotics Inc.',          mask: 'Party 1' },
  escrowCo:  { real: 'Harborline Trust Company',       mask: 'Party 2' },
  lender:    { real: 'Lakeshore Capital Partners LP',  mask: 'Party 3' },
  landlord:  { real: 'Vantage Row Properties LLC',     mask: 'Party 4' },
  buyer:     { real: 'Meridian Acquisition LLC',       mask: 'Party 5' },
  parent:    { real: 'Meridian Holdings LLC',          mask: 'Party 6' },   // never on the sheet: that absence is the catch
  signer:    { real: 'Jane R. Okonkwo',                mask: 'Person 1' },
  cto:       { real: 'Daniel Park',                    mask: 'Person 2' },
  address:   { real: '1400 Kestrel Lane',              mask: 'Address 1' },
  premises:  { real: '88 Vantage Row, Suite 400',      mask: 'Address 2' },
  price:     { real: '$45,000,000',                    mask: '$45,000,000' },
  escrowAmt: { real: '$4,500,000',                     mask: '$4,500,000' },
  earnout:   { real: '$6,000,000',                     mask: '$6,000,000' },
  debt:      { real: '$30,000,000',                    mask: '$30,000,000' },
  retention: { real: '$750,000',                       mask: '$750,000' },
  signing:   { real: 'November 6, 2026',               mask: '[Month_Day_Year]' },
  outside:   { real: 'January 15, 2027',               mask: '[Month_Day_Year]' },
  earnEnd:   { real: 'December 31, 2027',              mask: '[Month_Day_Year]' },
  ein:       { real: '84-2219876',                     mask: '31-7748205' },
  escrow:    { real: '4417-0093-2281',                 mask: '7302-5518-0946' },
};

// The term sheet as it appears on the paper, in the editor and in the inspect view.
// [section, text]; {key} is a party from PARTIES. Everything else is generic deal language and is
// deliberately left as it is when the sheet is masked, so the viewer sees what is not removed.
const TERM_SHEET = [
  ['Parties', 'Seller: {seller}, {address} (EIN {ein}). Buyer: {buyer}, a Delaware limited liability company.'],
  ['Structure', 'Merger of a wholly owned subsidiary of Buyer with and into Seller, with Seller surviving; Seller\u2019s stockholders receive cash at closing.'],
  ['Purchase Price', '{price} in cash at closing, subject to customary working capital adjustments.'],
  ['Escrow', '{escrowAmt} held by {escrowCo} for 18 months as security for indemnification, escrow account {escrow}.'],
  ['Earn-out', 'Up to {earnout} payable on revenue milestones through {earnEnd}.'],
  ['Financing', 'Buyer to deliver a debt commitment letter from {lender} for {debt} before signing.'],
  ['Key Employees', '{cto}, Chief Technology Officer, to sign a new employment agreement with a {retention} retention bonus.'],
  ['Conditions', 'Consent of {landlord} to assignment of the lease at {premises}; customary regulatory approvals.'],
  ['Exclusivity', '45 days from signing of this term sheet.'],
  ['Confidentiality', 'The parties\u2019 existing confidentiality agreement continues to apply.'],
  ['Governing Law', 'Delaware.'],
  ['Non-binding', 'Not binding except Exclusivity, Confidentiality and Governing Law. Target signing {signing}; outside date {outside}.'],
  ['For Buyer', '{signer}'],
];

// The agreement and plan of merger the story drafts and reviews: agreement.js, loaded
// once the workspace is up (the agreement, the knowledge clause Bob picks and the clause library's results).

// The cloud AI models named under the cloud, as their product marks (24×24 paths).
// Marks from simple-icons (CC0): Claude and Google Gemini from v16.34.0; OpenAI (ChatGPT's mark) from v13.21.0;
// Microsoft from v11.15.0, standing in for Copilot because no free Copilot mark exists. Trademarks of their owners.
const PROVIDERS = [
  { name: 'ChatGPT', owner: 'OpenAI', hex: '#10A37F', d: 'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z' },
  { name: 'Claude', owner: 'Anthropic', hex: '#D97757', d: 'm4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z' },
  { name: 'Gemini', owner: 'Google', hex: '#8E75B2', d: 'M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81' },
  { name: 'Copilot', owner: 'Microsoft', hex: '#00A4EF', d: 'M0 0v11.408h11.408V0zm12.594 0v11.408H24V0zM0 12.594V24h11.408V12.594zm12.594 0V24H24V12.594z' },
];

const VAULT_FOUND = 128;     // the files ZOE finds on this client (the cockpit's matter shows this count)

// Spoken lines. *word* pops when it lands; a placeholder (Party n, Person n, Address n) renders as a token.
const LINES = {
  jimmy1:  "Bob. They're buying us out, here's the term sheet, can you throw a draft together?",
  bob1:    "Right now? We're in *THEIR OFFICE*.",
  jimmy2:  'Perfect opportunity with everyone in the same room. You have *10 MINUTES*.',
  snapped: 'Picture taken. Into the laptop.',
  noTrust: "I don't trust their Wi-Fi. Going local.",
  wifiOff: "Wi-Fi off. Let's go.",
  scan:    'Finding critical information in the term sheet.',
  search:  'Searching the vault for relevant information and potential templates.',
  foundTpl: 'Found a potential template.',
  drafting: 'Drafting document.',
  sandbag: 'Not bad for a first draft. But I need an anti-sandbagging clause.',
  findClause: 'Finding the clause.',
  clauseFound: 'Found. Ready for you to insert.',
  scrubSend: 'Scrubbed. Sending to cloud AI.',
  applied: 'Review applied. Names restored.',
  jimmy3:  "Ten minutes. Tell me you've got something.",
  bob3:    "Draft's done. And their shell left the parent off the hook. It's in now.",
  jimmy4:  '…How?',
  bob4:    'ZOE AI.',
};

const UI = {
  template: ['Template', 'Agreement and Plan of Merger (Delaware)'],
  playbook: ['Playbook', 'Seller, conservative'],
  pills: { why: 'Why is ZOE AI different?', replay: 'Replay', back: 'Back', next: 'Next ›' },
  cloudName: 'any cloud AI the firm chooses',
  library: 'Clause library',
};

function track(event, data) {
  const payload = Object.assign({ event, t: Date.now() }, data);
  if (!ANALYTICS_ENDPOINT) {
    console.info('[track]', event, data || '');
    return;
  }
  try {
    navigator.sendBeacon(ANALYTICS_ENDPOINT, JSON.stringify(payload));
  } catch (_) { /* never let analytics break the page */ }
}

(() => {
  'use strict';

  // ---------- Tuning ----------
  const FRAMES = 45;
  const DRAG_FULL_PX = 320;    // upward travel for a full open: a real lid's lift, not a switch
  const DRAG_FOLLOW = 0.25;    // per frame, the lid closes this share of the gap to the finger
  const SNAP_AT = 0.4;         // release past this opens, below shuts
  const MOUSE_COMMIT_AT = 0.5; // mouse or trackpad: past this (about 45 degrees) the lid opens without a release
  const PLAY_MS = 1800;        // tap / click / wheel / key: frames 1 -> 45, ease-in-out
  const RELEASE_MS = 1200;     // after a drag: finish opening, or settle shut, ease-out
  const IDLE_FIRST_MS = 18000; // gesture 1 auto-performs after this long with no input
  const IDLE_LATER_MS = 12000; // the hand-over to the laptop, and gestures 2-4
  const TAP_SLOP_PX = 8;
  const FLICK_PX_PER_MS = 0.6; // upward release speed that opens regardless of distance
  // Pacing: the reading side (typing, holds, pauses) runs at half speed; the animations keep their durations.
  const TYPE_MS = 24;          // per character
  const PAGE_FLIGHT_MS = 700;  // a page's trip to the cloud (styles.css .page6.is-flying)
  const PAGE_FLY_GAP_MS = 100; // the redacted pages leave one after another
  const HOLD = 2;              // reading time: every spoken line and the pauses between beats
  const MOTION = 1;            // the page runs, the streams, the card flight, the clause typing in
  // Portrait round trip: where the screen's top edge sits, the cloud's height, and the gap for the stream.
  const PORTRAIT_CLOUD_Y = 28;     // the cloud's top edge during the round trip
  const PORTRAIT_CLOUD_H = 150;
  const PORTRAIT_OUT = 0.62;       // the upload: the camera pulls back to this share of the reading zoom
  const PORTRAIT_OUT_GAP = 72;     // the upload: room for the rising stream and its label
  const PORTRAIT_SCREEN_UP = 282;  // the returning draft: the screen's top edge, back at reading zoom
  const LAPTOP_BASE = 0.86;    // the open laptop's base, as a share of the frame height (lid_45)
  const SHEET_TYPE = 0.025;    // the paper's type size, as a share of its width: a full page of small type
  const HANDOVER_BEAT_MS = 400; // after the laptop lands, before the phone moves to it
  const READ_W = 0.66;           // desktop reading camera: the screen's share of the viewport width
  const INSERT_MS = 1500;        // the clause (§ 9.6) appearing line by line in Word
  const CAPTURE_HOLD_MS = 1100; // the captured page shows in the phone before the laptop comes in
  const LAPTOP_IN_MS = 1100;    // the laptop's slide in from the right (the .scene translate in styles.css)

  // Height of the lid's bright top edge per frame, % of frame height from the top
  // (measured on the 1280 set; 100 = lid still flat). Mid-swing the edge rises
  // into the tagline, so the tagline dims while the two overlap.
  const LID_EDGE = [
    100, 100, 100, 100, 100, 57.9, 55.1, 52.4, 49.4, 47.4, 45.3, 43.5, 41.8, 40.3, 38.9,
    37.2, 36.0, 34.9, 34.0, 33.2, 32.5, 31.8, 31.3, 30.7, 30.4, 30.3, 30.0, 30.0, 30.0, 30.1,
    30.4, 30.7, 31.1, 31.7, 32.2, 32.9, 33.8, 34.0, 34.4, 34.7, 35.0, 35.3, 35.4, 35.7, 35.8,
  ];

  // The baked wordmark's O, per frame: [dx, dy] from its frame-1 centre in frame widths, and its
  // scale, from a circle fit on all 45 frames (smoothed over five). Moves .logo-o with the drift.
  const LOGO_O = [[0.0,0.0,1.0],[-0.0,-0.0,1.0],[-1e-05,-0.0,1.0],[-1e-05,-1e-05,0.9999],[-1e-05,-1e-05,0.9998],[-2e-05,-1e-05,0.9998],[-2e-05,-1e-05,0.9997],[-2e-05,-0.0,0.9997],[-2e-05,0.0,0.9997],[-2e-05,1e-05,0.9997],[-2e-05,1e-05,0.9997],[-5e-05,1e-05,0.9995],[-0.0001,-2e-05,0.9993],[-0.00021,-8e-05,0.9991],[-0.00033,-0.00017,0.9988],[-0.00049,-0.00027,0.9985],[-0.00066,-0.0004,0.9982],[-0.00083,-0.00052,0.9979],[-0.001,-0.00065,0.9977],[-0.00117,-0.00078,0.9975],[-0.00135,-0.0009,0.9971],[-0.00154,-0.00104,0.9969],[-0.00172,-0.00117,0.9967],[-0.0019,-0.00131,0.9964],[-0.00208,-0.00145,0.996],[-0.00225,-0.0016,0.9958],[-0.0024,-0.00173,0.9955],[-0.00257,-0.00187,0.9949],[-0.00274,-0.002,0.9945],[-0.00291,-0.00215,0.994],[-0.0031,-0.00228,0.9936],[-0.00328,-0.00243,0.9932],[-0.00345,-0.00256,0.993],[-0.00362,-0.00271,0.9926],[-0.0038,-0.00283,0.9925],[-0.00397,-0.00297,0.9922],[-0.00415,-0.00312,0.992],[-0.00432,-0.00328,0.9915],[-0.00449,-0.00342,0.9911],[-0.00466,-0.00356,0.9906],[-0.00481,-0.00368,0.99],[-0.00496,-0.00381,0.9894],[-0.00511,-0.00394,0.989],[-0.00518,-0.004,0.9887],[-0.00525,-0.00407,0.9884]];

  // Screen rectangle on lid_45 as fractions of the frame (matches --screen-* in styles.css).
  const SCR = { x: 0.3068, y: 0.3602, w: 0.3839, h: 0.3963 };

  const $ = (sel, root = document) => root.querySelector(sel);
  const stage = $('.stage');
  const scene = $('.scene', stage);
  const poster = $('#lid-poster');
  const canvas = $('.lid', stage);
  const ctx2d = canvas.getContext('2d', { alpha: false });
  const lidHit = $('.lid-hit', stage);
  const tagline = $('.tagline', stage);
  const logoO = $('.logo-o', stage);
  const logoOB = $('.logo-o-b', stage);
  const rim = $('.rim', stage);
  const screen = $('.screen', stage);
  const strip = $('.strip', stage);
  const brand = $('.brand', stage);
  const sheet = $('.sheet', stage);
  const phone = $('.phone', stage);
  const transfer = $('.transfer', stage);
  const fly = $('.fly', stage);
  const zoe = $('.zoe', stage);
  const cloud = $('.cloud', stage);
  const stream = $('.stream', stage);
  const label = $('.stream-label', stage);
  const fan = $('.fan', stage);
  const pills = $('.pills', stage);
  const inspect = $('.inspect', stage);
  const dots = Array.from(stage.querySelectorAll('.progress li'));
  const live = $('#live');

  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- The hero is its own screen ----------
  // While the story runs the page does not scroll: not by wheel, trackpad, touch, keys or scrollbar.
  // It unlocks when the visitor presses `Why is ZOE AI different?`. Reduced motion and no-JS never lock,
  // nor does a visit that arrives at a section below the hero (a link from the other pages).
  const LAND_GAP = 24;           // the comparison's heading lands this far below the top of the viewport
  const root = document.documentElement;
  const deepLink = /^#(?!$)/.test(location.hash) && !/^#(privacy|terms)$/.test(location.hash);
  let heroLocked = false;
  // When the hero never locks (reduced motion, a link to a section below), the site's navigation
  // shows from the start: <html> gets `intro-done` and keeps it.
  const neverLocks = RM || deepLink;
  if (neverLocks) root.classList.add('intro-done');
  function lockHero() {
    if (neverLocks) return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    heroLocked = true;
    root.classList.add('hero-lock');
  }
  function unlockHero() {
    heroLocked = false;
    root.classList.remove('hero-lock');
  }
  lockHero();
  // Belt and braces for engines that still scroll an overflow-hidden page: one-finger swipes,
  // wheels and scrolling keys do nothing while locked (the phone and the lid handle their own drags).
  document.addEventListener('touchmove', (e) => {
    if (heroLocked && e.touches.length === 1) e.preventDefault();
  }, { passive: false });
  window.addEventListener('wheel', (e) => { if (heroLocked) e.preventDefault(); }, { passive: false, capture: true });
  document.addEventListener('keydown', (e) => {
    if (!heroLocked) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName))) return;
    if ([' ', 'PageDown', 'PageUp', 'End', 'Home', 'ArrowDown', 'ArrowUp'].includes(e.key) && !e.defaultPrevented) {
      // Arrow keys still open the lid (handled below); they just never scroll.
      e.preventDefault();
    }
  }, { capture: true });
  window.addEventListener('scroll', () => { if (heroLocked && window.scrollY !== 0) window.scrollTo(0, 0); }, { passive: true });
  const portraitMQ = window.matchMedia('(orientation: portrait)');
  const frameSet = window.matchMedia('(min-width: 900px)').matches ? 1920 : 1280;
  const frameUrl = (i) => `assets/frames/${frameSet}/lid_${String(i + 1).padStart(2, '0')}.webp`;

  // ---------- Text helpers ----------

  const kept = (k) => PARTIES[k].mask === PARTIES[k].real;   // dollar amounts: never scrubbed, never highlighted
  const fill = (tpl, which) => tpl.replace(/\{(\w+)\}/g, (_, k) => PARTIES[k][which]);
  const plain = (s) => s.replace(/\*/g, '');
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // {key} → a span that can flare amber, swap to its mask and snap back.
  function piiHtml(tpl, start = 'real') {
    return esc(tpl).replace(/\{(\w+)\}/g, (_, k) => (kept(k) ? esc(PARTIES[k].real) :
      `<span class="pii${start === 'mask' ? ' is-masked' : ''}" data-k="${k}">${esc(PARTIES[k][start])}</span>`));
  }

  // Splits a line into typed segments: plain text, *emphasis* and placeholders ("Party 5").
  const PH_SPLIT = /(\*[^*]+\*|\b(?:Party|Person|Address) \d+\b)/;
  const PH_WHOLE = /^(?:Party|Person|Address) \d+$/;
  function segments(line) {
    const out = [];
    line.split(PH_SPLIT).forEach((part) => {
      if (!part) return;
      if (part[0] === '*') out.push({ text: part.slice(1, -1), cls: 'em' });
      else if (PH_WHOLE.test(part)) out.push({ text: part, cls: 'pii is-masked' });
      else {
        // Punctuation straight after an emphasis stays on its line (it is typed as its own piece).
        const prev = out[out.length - 1];
        const tail = prev && prev.cls === 'em' ? part.match(/^[,.;:!?]+/) : null;
        if (tail) {
          out.push({ text: tail[0], cls: 'tail' });
          if (part.length > tail[0].length) out.push({ text: part.slice(tail[0].length), cls: '' });
        } else out.push({ text: part, cls: '' });
      }
    });
    return out;
  }

  // ---------- Runs, waits and cancellation (Replay cancels the running story) ----------

  let run = { id: 0, cancelled: false, timers: new Set() };
  class Cancelled extends Error {}

  function check(r = run) {
    if (r.cancelled) throw new Cancelled();
  }

  let step = 0;                                     // the act, or 4.5 for the clause-library beat
  // Story timers (cancelled with the run on Replay or on leaving the introduction).
  const pendingLater = new Set();
  function later(fn, ms) {
    const job = { fn, t: 0 };
    job.t = setTimeout(() => { pendingLater.delete(job); fn(); }, ms);
    pendingLater.add(job);
    return job.t;
  }

  function wait(ms, instantOk = true) {
    const r = run;
    if (RM && instantOk) return Promise.resolve().then(() => check(r));
    return new Promise((resolve, reject) => {
      const done = () => {
        clearTimeout(t);
        r.timers.delete(t);
        if (r.cancelled) reject(new Cancelled());
        else resolve();
      };
      const t = setTimeout(done, ms);
      r.timers.add(t);
    });
  }

  function cancelRun() {
    pendingLater.forEach((j) => clearTimeout(j.t));
    pendingLater.clear();
    run.cancelled = true;
    run.timers.forEach(clearTimeout);
    run.timers.clear();
    clearTimeout(idleTimer);
    gestureNow = null;
    if (pills) pills.innerHTML = '';
    if (typeof clearCta === 'function') clearCta();
  }

  function animate(el, keyframes, opts) {
    if (RM || !el.animate) return Promise.resolve();
    return el.animate(keyframes, opts).finished.catch(() => {});
  }

  // ---------- Speech ----------

  const AVATARS = {
    jimmy: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#f2994a"/><circle cx="20" cy="23" r="11" fill="#ffd8b5"/><path d="M8 18c1-8 7-12 13-11 5-3 11 1 12 6l-3-1 1 4-4-3-1 3-3-3-2 3-2-3-3 3-1-3-4 4z" fill="#5a3214"/><circle cx="16" cy="22" r="1.4" fill="#2a1a0e"/><circle cx="24" cy="22" r="1.4" fill="#2a1a0e"/><path d="M14.5 27c3 3.5 8 3.5 11 0" stroke="#2a1a0e" stroke-width="1.6" fill="#fff" stroke-linecap="round"/></svg>',
    bob: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#3d6fb6"/><circle cx="20" cy="23" r="11" fill="#f1c9a5"/><path d="M9 20c0-8 6-12 11-12 6 0 11 4 11 10-4-1-9-3-11-6-2 4-6 6-11 8z" fill="#3a2a1f"/><rect x="12.5" y="19.5" width="6.5" height="5" rx="1.5" fill="none" stroke="#1b2430" stroke-width="1.2"/><rect x="21" y="19.5" width="6.5" height="5" rx="1.5" fill="none" stroke="#1b2430" stroke-width="1.2"/><path d="M19 21.5h2" stroke="#1b2430" stroke-width="1.2"/><path d="M16.5 28.5h7" stroke="#1b2430" stroke-width="1.5" stroke-linecap="round"/></svg>',
  };

  const NAMES = { jimmy: 'Jimmy', bob: 'Bob', zoe: 'ZOE AI', cloud: 'Cloud AI' };

  function announce(who, line, thinking) {
    live.textContent = `${NAMES[who]}${thinking ? ' (thinking)' : ''}: ${plain(line)}`;
  }

  // Types a line into el; *emphasis* pops when it lands.
  function typeInto(el, line) {
    const r = run;
    el.textContent = '';
    let wrap = null;
    const segs = segments(line).map((s, i, all) => {
      const span = document.createElement('span');
      if (s.cls && s.cls !== 'tail') span.className = s.cls;
      // An emphasis and the punctuation after it share a no-wrap wrapper.
      if (s.cls === 'em' && all[i + 1] && all[i + 1].cls === 'tail') {
        wrap = document.createElement('span');
        wrap.className = 'nowrap';
        el.appendChild(wrap);
        wrap.appendChild(span);
      } else if (s.cls === 'tail' && wrap) {
        wrap.appendChild(span);
        wrap = null;
      } else {
        el.appendChild(span);
      }
      return { s, span };
    });
    const all = () => segs.forEach(({ s, span }) => {
      span.textContent = s.text;
      if (s.cls === 'em') span.classList.add('is-pop');
    });
    if (RM) {
      all();
      if (stripMode === 'centre') placeStrip();
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      let i = 0;
      let c = 0;
      const tick = () => {
        if (r.cancelled) { reject(new Cancelled()); return; }
        const seg = segs[i];
        if (!seg) { resolve(); return; }
        // Tokens land whole.
        if (seg.s.cls.startsWith('pii')) { seg.span.textContent = seg.s.text; c = seg.s.text.length; }
        else { c += 1; seg.span.textContent = seg.s.text.slice(0, c); }
        if (stripMode === 'centre') placeStrip();
        if (c >= seg.s.text.length) {
          if (seg.s.cls === 'em') seg.span.classList.add('is-pop');
          i += 1;
          c = 0;
        }
        const t = setTimeout(tick, TYPE_MS);
        r.timers.add(t);
      };
      tick();
    });
  }

  // Reading time after a line has typed.
  const dwell = (line) => HOLD * (220 + plain(line).length * 8);
  const beat = (ms) => wait(ms * HOLD);
  const motion = (ms) => wait(ms * MOTION);

  const maxMsgs = () => (portraitMQ.matches ? 3 : 4);

  function addMsg(who, thinking) {
    const msgs = strip.querySelectorAll('.msg:not(.is-out)');
    if (msgs.length >= maxMsgs()) msgs[0].remove();
    const m = document.createElement('div');
    m.className = `msg ${who}${thinking ? ' think' : ''}`;
    m.innerHTML = `<span class="avatar">${AVATARS[who]}</span><p class="bubble">${thinking ? '<span class="who">Bob, thinking</span>' : ''}<span class="txt"></span></p>`;
    strip.appendChild(m);
    placeStrip();
    void m.offsetWidth;
    m.classList.add('is-in');
    return m.querySelector('.txt');
  }

  // Chat bubble (Jimmy and Bob while Jimmy is in the room).
  async function say(who, key, hold = true) {
    const line = LINES[key];
    announce(who, line);
    await typeInto(addMsg(who, false), line);
    if (hold) await wait(dwell(line));
  }

  // Bob's thought bubble: one at a time, replacing the last.
  const THOUGHT_LINGER_MS = 2500;   // a thought stays this long after its reading time, then fades
  async function think(key, hold = true) {
    const line = LINES[key];
    strip.querySelectorAll('.msg.think').forEach((m) => m.remove());
    announce('bob', line, true);
    const txt = addMsg('bob', true);
    const m = txt.closest('.msg');
    await typeInto(txt, line);
    if (!RM) {
      later(() => {
        if (!m.isConnected) return;
        m.classList.add('is-out');
        later(() => m.remove(), 320);
      }, dwell(line) + THOUGHT_LINGER_MS);
    }
    if (hold) await wait(dwell(line));
  }
  const clearThoughts = () => clearStrip('.msg.think');

  function clearStrip(selector = '.msg') {
    strip.querySelectorAll(selector).forEach((m) => {
      m.classList.add('is-out');
      const t = later(() => m.remove(), RM ? 0 : 320);
      run.timers.add(t);
    });
  }

  // The strip's place in Act I: 'centre' while the chat types, 'top' once the paper comes, null afterwards.
  let stripMode = null;
  const stripK = () => parseFloat(getComputedStyle(strip).getPropertyValue('--strip-k')) || 1;
  const brandFoot = () => brand.offsetTop + brand.offsetHeight;

  function stripTo(mode) {
    stripMode = mode;
    strip.classList.toggle('is-act1', !!mode);
    strip.classList.toggle('is-centre', mode === 'centre');
    placeStrip();
  }

  function placeStrip() {
    if (!stripMode) {
      strip.style.transform = '';
      return;
    }
    const V = stage.clientWidth;
    const VH = stage.clientHeight;
    const w = strip.offsetWidth;
    const h = strip.offsetHeight;
    let tx = 0;
    let ty = 0;
    let s = 1;
    if (stripMode === 'centre') {
      // Dead centre, unless that would crowd the small wordmark.
      tx = (V - w) / 2 - strip.offsetLeft;
      ty = Math.max(brandFoot() + 16, (VH - h) / 2) - strip.offsetTop;
    } else {
      // Desktop: the strip's own top-left corner. Portrait: centred under the small wordmark.
      s = 1 / stripK();
      if (portraitMQ.matches) {
        tx = (V - w * s) / 2 - strip.offsetLeft;
        ty = brandFoot() + 6 - strip.offsetTop;
      }
    }
    strip.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;
  }

  // While it is centred, the strip re-centres as each bubble grows (typeInto also calls it per character).
  if ('ResizeObserver' in window) new ResizeObserver(() => { if (stripMode) placeStrip(); }).observe(strip);

  // While ZOE talks, its O grows and turns; it settles back once the line has been read.
  let talkTimer = 0;
  async function zoeSay(key, hold = true) {
    const line = LINES[key];
    announce('zoe', line);
    clearTimeout(talkTimer);
    zoe.classList.add('is-talking');
    await typeInto($('.zoe-say', zoe), line);
    const settle = () => zoe.classList.remove('is-talking');
    if (hold) {
      await wait(dwell(line));
      settle();
    } else {
      talkTimer = later(settle, RM ? 0 : dwell(line));
      run.timers.add(talkTimer);
    }
  }

  const zoeWorking = (on) => zoe.classList.toggle('is-working', on);

  // ---------- Acts and progress ----------

  let act = 0;

  function setStep(n) {
    step = n;
  }

  function setAct(n) {
    act = n;
    setStep(n);
    // The skip button fades in once the lid is open and the workspace is up (Act III) and stays.
    skipBtn.classList.toggle('is-in', n >= 3 && n < 6 && !introDone);
    stage.dataset.act = String(n);
    dots.forEach((d, i) => {
      d.classList.toggle('is-on', i === n - 1);
      d.classList.toggle('is-done', i < n - 1);
    });
  }

  // ---------- Layout and camera ----------
  // Positions are set once per act change or resize (never animated); all motion is transform and opacity.

  let camMode = 'home';
  let geo = null;

  function sceneBox() {
    return { x: scene.offsetLeft, y: scene.offsetTop, w: scene.offsetWidth, h: scene.offsetHeight };
  }

  function place(el, x, y, w, h) {
    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;
    if (w != null) el.style.width = `${Math.round(w)}px`;
    if (h != null) el.style.height = `${Math.round(h)}px`;
  }

  // 'return' is the round trip's last beat: the camera comes in on the screen so the returned draft can
  // be read. On phones it is the reading zoom again; on desktop it is 'read', the screen large on the left.
  function camera(mode) {
    camMode = mode === 'return' && !portraitMQ.matches ? 'read' : mode;
    layout();
  }

  // Act I: the paper centred and large, the phone docked beside it (below right on portrait), and the
  // 'arrive' camera that brings the closed laptop in next to them once the picture is taken.
  function actOneGeometry(g) {
    const { S, V, VH } = g;
    const top = brandFoot();
    if (g.portrait) {
      const stripB = top + 6 + strip.offsetHeight / stripK() + 16;
      const floor = VH - 58;
      const sh = Math.min(0.64 * V * 1.29, 0.64 * (floor - stripB));
      const sw = sh / 1.29;
      g.sheet = { x: (V - sw) / 2, y: stripB, w: sw, h: sh };
      const pw = 0.55 * sw;
      const ph = pw * 2.05;
      g.phone = { x: V - 12 - pw, y: floor - ph, w: pw, h: ph };
      g.enter = { x: V - g.phone.x + 24, y: VH - g.phone.y + 24 };
      // The laptop comes in below the paper: frame rows 0.11 (its wordmark) to 0.75 (its base) fit above the dots.
      const zone = stripB + sh + 10;
      const cs = Math.max(0.45, Math.min(0.9, (floor - 6 - zone) / (0.64 * S.h)));
      g.arrive = { cs, cx: V / 2 - S.x - cs * 0.5 * S.w, cy: zone - S.y - cs * 0.11 * S.h };
    } else {
      const sh = Math.min(0.4 * VH, 0.3 * V * 1.29);
      const sw = sh / 1.29;
      const y = Math.max(top + 18, (VH - sh) / 2);
      g.sheet = { x: (V - sw) / 2, y, w: sw, h: sh };
      const pw = 0.62 * sw;
      const ph = pw * 2.05;
      g.phone = { x: g.sheet.x + sw + Math.max(96, 0.075 * V), y: y + sh / 2 - ph / 2, w: pw, h: ph };
      g.enter = { x: V - g.phone.x + 30, y: 0 };
      // The laptop settles centre-right, in the space right of the paper, its middle level with the page.
      const x0 = g.sheet.x + sw + 0.045 * V;
      const x1 = 0.97 * V;
      const cs = Math.min(0.66, (x1 - x0) / (0.57 * S.w));
      g.arrive = { cs, cx: (x0 + x1) / 2 - S.x - cs * 0.5 * S.w, cy: y + sh * 0.55 - S.y - cs * 0.65 * S.h };
    }
  }

  // The paper's type scales with it: large enough to read as a page, too small to read the terms.
  // A fuller page shrinks it further until everything fits; the title keeps its size. The viewfinder's
  // copy and the card that flies to the laptop use the same sizes, so all three stay the same page.
  function fitPaper(w) {
    const title = `${(w * 0.05).toFixed(2)}px`;
    const floor = w * 0.012;
    let fs = w * SHEET_TYPE;
    const set = () => [sheet, phone, fly].forEach((el) => {
      el.style.setProperty('--sheet-fs', `${fs.toFixed(2)}px`);
      el.style.setProperty('--sheet-title', title);
    });
    set();
    for (let i = 0; i < 5 && fs > floor && sheet.scrollHeight > sheet.clientHeight + 1; i += 1) {
      fs = Math.max(floor, fs * (sheet.clientHeight / sheet.scrollHeight) * 0.98);
      set();
    }
  }

  function layout() {
    const S = sceneBox();
    const V = stage.clientWidth;
    const VH = stage.clientHeight;
    const portrait = portraitMQ.matches;
    const g = { S, V, VH, portrait };
    // On a phone, when the site's navigation shows during the story (reduced motion, a deep link), the
    // story's pieces start below the bar.
    const navOff = portrait && root.classList.contains('intro-done') && camMode !== 'post' && camMode !== 'arrive'
      ? (parseFloat(getComputedStyle(root).getPropertyValue('--nav-h')) || 60) : 0;
    actOneGeometry(g);
    let cx = 0;
    let cy = 0;
    let cs = 1;

    const stripR = parseFloat(getComputedStyle(stage).getPropertyValue('--strip-r')) || 200;
    if (camMode === 'arrive') {
      ({ cx, cy, cs } = g.arrive);
    } else if (camMode === 'post') {
      // After the introduction: under the headline, the laptop drawn smaller on the right and the selected
      // ability's description on its left; on a phone the laptop at full width and the description under it.
      const top = postHero.offsetTop + postHero.offsetHeight + (portrait ? 14 : 30);
      const ratio = (SCR.h * S.h) / (SCR.w * S.w);
      const bodyW = 0.57 / SCR.w;                              // the laptop's body, in screen widths
      const below = (LAPTOP_BASE - SCR.y - SCR.h) / SCR.h;     // the base under the screen, in screen heights
      const post = { top, ratio, below };
      let midX = V / 2;
      let sw = V - 16;
      if (!portrait) {
        post.panelW = Math.round(Math.min(440, Math.max(320, 0.27 * V)));
        const left = 40 + post.panelW + 48;
        sw = Math.min((V - left - 32) / bodyW, (VH - top - 12) / (ratio * (1 + below)));
        midX = left + (V - left - 32) / 2;
        post.panelX = Math.max(32, midX - (bodyW * sw) / 2 - 40 - post.panelW);
      }
      post.sw = sw;
      g.post = post;
      cs = sw / (SCR.w * S.w);
      cx = midX - S.x - cs * (SCR.x + SCR.w / 2) * S.w;
      cy = top - S.y - cs * SCR.y * S.h;
    } else if (portrait) {
      const zoomS = (V - 16) / (SCR.w * S.w);
      const screenTop = 112;
      if (camMode === 'center') {
        cy = Math.max(110, (VH - S.h) / 2) - S.y;
      } else if (camMode === 'zoom' || camMode === 'slide' || camMode === 'return') {
        // Act III reads the screen at full zoom. The upload (slide) pulls back so the laptop is smaller
        // and ZOE speaks in the room under it; the returning draft (return) zooms back in to be read.
        cs = camMode === 'slide' ? zoomS * PORTRAIT_OUT : zoomS;
        const top = camMode === 'zoom' ? screenTop
          : (camMode === 'slide' ? PORTRAIT_CLOUD_Y + PORTRAIT_CLOUD_H + PORTRAIT_OUT_GAP : PORTRAIT_SCREEN_UP);
        cx = V / 2 - S.x - cs * (SCR.x + SCR.w / 2) * S.w;
        cy = top - S.y - cs * SCR.y * S.h;
      } else if (camMode === 'end') {
        const top = stripR;
        cs = Math.min(1, (VH - top - 150) / S.h);
        cx = (V - cs * S.w) / 2 - S.x;
        cy = top - S.y;
      }
      cy += navOff;
    } else if (camMode === 'slide') {
      // Laptop left and a little smaller, so the cloud fits on the right and the strip clears the logo.
      cs = 0.92;
      cx = -0.19 * S.w;
      cy = 0.05 * S.h;
    } else if (camMode === 'read') {
      // The screen large, left of centre, ZOE beside it on the right: the agreement's type reads at 13 px or more.
      cs = Math.min((READ_W * V) / (SCR.w * S.w), (0.78 * VH) / (SCR.h * S.h));
      cx = 0.04 * V - S.x - cs * SCR.x * S.w;
      cy = 0.54 * VH - S.y - cs * (SCR.y + SCR.h / 2) * S.h;
    }
    stage.classList.toggle('is-reading', !portrait && camMode === 'read');
    stage.classList.toggle('is-zoomed', portrait && (camMode === 'zoom' || camMode === 'slide' || camMode === 'return'));
    stage.classList.toggle('is-up', portrait && (camMode === 'slide' || camMode === 'return'));
    // The veil over the cropped wordmark stops just above the screen.
    stage.style.setProperty('--veil', `${Math.max(0, Math.round(S.y + cy + cs * SCR.y * S.h - 10))}px`);

    scene.style.setProperty('--cam-x', `${cx}px`);
    scene.style.setProperty('--cam-y', `${cy}px`);
    scene.style.setProperty('--cam-s', String(cs));

    // Scene-local point → stage point under the current camera.
    const at = (fx, fy) => ({ x: S.x + cx + cs * fx * S.w, y: S.y + cy + cs * fy * S.h });
    const scr = { tl: at(SCR.x, SCR.y), br: at(SCR.x + SCR.w, SCR.y + SCR.h) };
    Object.assign(g, { cs, scr });

    // The closed laptop under this camera (frame 1: body 0.215-0.785 across, 0.555-0.75 down),
    // and where the phone bumps it: its left edge on desktop, its top edge on portrait.
    g.laptop = { x0: at(0.215, 0).x, x1: at(0.785, 0).x, y0: at(0, 0.555).y, y1: at(0, 0.75).y };
    g.bump = portrait
      ? { x: (g.laptop.x0 + g.laptop.x1) / 2, y: g.laptop.y0 - g.phone.h * 0.36 }
      : { x: g.laptop.x0 - g.phone.w * 0.3, y: (g.laptop.y0 + g.laptop.y1) / 2 };

    if (portrait) {
      // ZOE speaks below the laptop, never over it; on short screens it keeps clear of the dots.
      const base = at(0, LAPTOP_BASE).y;
      const below = scr.br.y + 12;
      g.zoe = { x: 12, y: (camMode === 'zoom' || camMode === 'slide' || camMode === 'return') ? Math.min(base + 6, VH - 120) : below, w: V - 24 };
      g.labelFs = 13;   // "SCRUBBED INFORMATION · NO PII" on one line, left of the Wi-Fi pill
      // The round trip goes up: the cloud above the laptop, the stream rising from the screen's top
      // edge to the cloud, the label across the middle of the stream.
      const cloudY = PORTRAIT_CLOUD_Y + navOff;
      g.cloud = { x: 12, y: cloudY, w: V - 24, h: PORTRAIT_CLOUD_H };
      const s0 = scr.tl.y - 6;
      const s1 = cloudY + PORTRAIT_CLOUD_H + 6;
      g.stream = { x: V / 2, y: s0, len: Math.max(30, s0 - s1), rot: -90 };
      // The label keeps left of the Wi-Fi callout, which stands at the right edge above the screen.
      g.label = { x: 8, y: (s0 + s1) / 2 - 12, w: V - 16 - 92 };
      g.fan = { x: V / 2, y: scr.tl.y };
      // During the story (reduced motion's Next pill) the pills stand above the skip control.
      g.pills = { x: 12, y: camMode === 'end' ? stripR + cs * S.h * 0.93 : VH - 160, w: V - 24 };
    } else {
      const x0 = scr.br.x + 0.012 * S.w;
      const x1 = S.x + 0.79 * S.w;
      const y = at(0, 0.5).y;
      if (camMode === 'slide') g.zoe = { x: scr.br.x + 0.015 * S.w, y: y + 46, w: 0.21 * S.w };
      else if (camMode === 'read') g.zoe = { x: scr.br.x + 0.025 * V, y: scr.tl.y + 0.3 * (scr.br.y - scr.tl.y), w: Math.min(0.26 * V, V - scr.br.x - 0.05 * V) };
      else g.zoe = { x: S.x + 0.775 * S.w, y: S.y + 0.36 * S.h, w: 0.205 * S.w };
      g.stream = { x: x0, y, len: x1 - x0, rot: 0 };
      g.labelFs = Math.max(16, Math.min(26, (x1 - x0 + 40) / 19));
      g.label = { x: x0 - 20, y: y - g.labelFs * 2.3, w: x1 - x0 + 40 };
      g.cloud = { x: x1 + 0.005 * S.w, y: y - 0.17 * S.h, w: 0.195 * S.w, h: 0.32 * S.h };
      g.fan = { x: scr.br.x, y: (scr.tl.y + scr.br.y) / 2 };
      g.pills = { x: 0, y: S.y + 0.905 * S.h, w: V };
    }

    place(sheet, g.sheet.x, g.sheet.y, g.sheet.w, g.sheet.h);
    fitPaper(g.sheet.w);
    place(phone, g.phone.x, g.phone.y, g.phone.w, g.phone.h);
    if (portrait) aimCue();
    phone.style.setProperty('--enter-x', `${Math.round(g.enter.x)}px`);
    phone.style.setProperty('--enter-y', `${Math.round(g.enter.y)}px`);
    // Viewfinder offset: the paper's position relative to the phone's screen at the dock (see .phone-view).
    phone.style.setProperty('--vx', `${(g.sheet.x - g.phone.x - 0.06 * g.phone.w).toFixed(1)}px`);
    phone.style.setProperty('--vy', `${(g.sheet.y - g.phone.y - 0.045 * g.phone.h).toFixed(1)}px`);
    phone.style.setProperty('--vw', `${g.sheet.w.toFixed(1)}px`);
    phone.style.setProperty('--vh', `${g.sheet.h.toFixed(1)}px`);
    place(zoe, g.zoe.x, g.zoe.y, g.zoe.w);
    place(cloud, g.cloud.x, g.cloud.y, g.cloud.w, g.cloud.h);
    place(stream, g.stream.x, g.stream.y, g.stream.len);
    stream.style.transform = g.stream.rot ? `rotate(${g.stream.rot}deg)` : '';
    place(label, g.label.x, g.label.y, g.label.w);
    label.style.setProperty('--label-fs', `${g.labelFs.toFixed(1)}px`);
    place(fan, g.fan.x, g.fan.y);
    place(pills, g.pills.x, g.pills.y, g.pills.w);
    placeAbilities(g);
    geo = g;
    // The Wi-Fi callout follows at once (reduced motion has no frame loop; the camera jumps).
    if (!callout.hidden) {
      calloutKey = '';
      placeCallout();
    }
    return g;
  }

  // ---------- Builders (fresh DOM on every run, so Replay starts clean) ----------

  function buildSheet() {
    sheet.className = 'sheet paper';
    sheet.innerHTML = `<h4>TERM SHEET</h4>` +
      TERM_SHEET.map(([k, v]) => `<p><b>${esc(k)}.</b> ${esc(fill(v, 'real'))}</p>`).join('') +
      '<div class="type"></div>';
  }

  function buildPhone() {
    phone.className = 'phone';
    phone.hidden = false;
    phone.style.removeProperty('--px');
    phone.style.removeProperty('--py');
    phone.innerHTML = '<span class="phone-halo" aria-hidden="true"></span><div class="phone-body" aria-hidden="true"><div class="phone-screen"><div class="phone-view paper"></div><div class="phone-grid"></div><div class="phone-shutter"></div><div class="phone-flash"></div></div><div class="phone-island"></div></div><span class="phone-cue" aria-hidden="true"></span>';
    phone.setAttribute('tabindex', '-1');
    // The viewfinder: a copy of the paper that stays aligned with the real one as the phone moves over it.
    $('.phone-view', phone).innerHTML = sheet.innerHTML;
    // The same page is what flies into the laptop.
    fly.className = 'fly paper';
    fly.innerHTML = sheet.innerHTML;
  }

  function buildZoe() {
    zoe.className = 'zoe';
    zoe.innerHTML = '<div class="zoe-mark"><span class="zl">Z</span><span class="o-wrap"><svg viewBox="0 0 24 24"><g class="o-turn"><circle cx="12" cy="12" r="9" fill="none" stroke="#cfe0f5" stroke-width="3" stroke-dasharray="44 13"/><circle cx="12" cy="13" r="3.6" fill="#cfe0f5"/><circle cx="10.2" cy="7.6" r="1.1" fill="#cfe0f5"/><circle cx="13.4" cy="7.2" r="1.1" fill="#cfe0f5"/></g></svg></span><span class="zl zl-e">E</span><span class="zl zl-ai">AI</span></div><p class="zoe-say"></p>';
  }

  function buildCloud() {
    cloud.className = 'cloud';
    const marks = PROVIDERS.map((p) =>
      `<li class="mark" style="--brand:${p.hex}" role="img" aria-label="${esc(p.name)}" data-name="${esc(p.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${p.d}"/></svg></li>`).join('');
    cloud.innerHTML = `<div class="cloud-glow"></div><p class="cloud-name">${esc(UI.cloudName)}</p><ul class="cloud-marks">${marks}</ul><p class="cloud-say" aria-hidden="true"></p>`;
  }

  // Six pages for the redaction beat: lines of type (no words), each with a grey and a blue layer.
  const PAGE_LINES = 8;
  function buildFan() {
    const lines = Array.from({ length: PAGE_LINES }, (_, i) => `<i style="--w:${[92, 78, 88, 64, 90, 72, 84, 58][i]}%"></i>`).join('');
    fan.innerHTML = Array.from({ length: 6 }, () => `<span class="page6"><span class="page6-lines">${lines}</span><span class="page6-bar"></span></span>`).join('');
  }

  function resetStage() {
    stage.classList.add('is-resetting');
    strip.innerHTML = '';
    stripTo('centre');
    // A bare stage: the laptop waits off the right edge, the small wordmark shows.
    stage.classList.remove('laptop-in');
    stage.dataset.open = 'chat';
    laptopReady = false;
    arrival = Promise.resolve();
    transferDone = Promise.resolve();
    live.textContent = '';
    buildSheet();
    buildPhone();
    buildZoe();
    buildCloud();
    buildFan();
    transfer.style.opacity = '0';
    screen.hidden = true;
    screen.classList.remove('is-on');
    if (desk) desk.destroy();
    desk = null;
    screen.innerHTML = '';
    hidePost();
    hideCallout();
    wifiOn = null;
    stream.className = 'stream';
    label.className = 'stream-label';
    pills.innerHTML = '';
    inspect.hidden = true;
    inspect.className = 'inspect';
    inspect.innerHTML = '';
    stage.classList.add('cue-off');
    stage.classList.remove('lid-armed');
    setLidArmed(false);
    resetLid();
    camMode = 'arrive';
    setAct(0);
    layout();
    void stage.offsetWidth;
    requestAnimationFrame(() => stage.classList.remove('is-resetting'));
  }

  // ---------- Gestures: the moments the story waits for the visitor ----------

  let gestureNow = null;   // { name, perform, resolve, idleMs }
  let idleTimer = 0;

  function gesture(name, idleMs, perform, el) {
    return new Promise((resolve, reject) => {
      const r = run;
      if (RM) {
        // Reduced motion: each act is a still; the Next pill (or the gesture's own button) performs it instantly.
        let done = false;
        const go = async () => {
          if (done) return;
          done = true;
          pills.innerHTML = '';
          try { await perform('next'); resolve('next'); } catch (e) { reject(e); }
        };
        nextPill(go);
        if (el) {
          el.setAttribute('tabindex', '0');
          el.addEventListener('click', go, { once: true });
        }
        return;
      }
      gestureNow = {
        name,
        idleMs,
        r,
        busy: false,
        perform: async (method) => {
          const gn = gestureNow;
          if (!gn || gn.name !== name || gn.busy) return;
          gn.busy = true;
          clearTimeout(idleTimer);
          try {
            await perform(method);
            if (gestureNow === gn) gestureNow = null;
            if (r.cancelled) reject(new Cancelled()); else resolve(method);
          } catch (e) { reject(e); }
        },
      };
      if (el) {
        el.setAttribute('tabindex', '0');
        if (el.tagName === 'BUTTON') {
          el.addEventListener('click', (e) => {
            noteInput(e);
            if (gestureNow) gestureNow.perform(e.detail === 0 ? 'key' : 'click');
          }, { once: true });
        }
        // Keep keyboard users on the story: the next gesture takes focus if the last one had it.
        const ae = document.activeElement;
        if (keyboardMode && ae !== el && (!ae || ae === document.body || stage.contains(ae))) el.focus({ preventScroll: true });
      }
      armIdle();
    });
  }

  function armIdle() {
    clearTimeout(idleTimer);
    const g = gestureNow;
    if (!g || g.busy) return;
    idleTimer = setTimeout(() => {
      if (gestureNow !== g || g.busy) return;
      const inView = stage.getBoundingClientRect().bottom > window.innerHeight * 0.5;
      if (!drag && !phoneDrag && document.visibilityState === 'visible' && inView && !inspectOpen) g.perform('auto');
      else armIdle();
    }, g.idleMs);
  }

  let keyboardMode = false;
  function noteInput(e) {
    if (e && e.type === 'keydown') keyboardMode = true;
    if (e && e.type === 'pointerdown') keyboardMode = false;
    if (gestureNow && !gestureNow.busy) armIdle();
  }

  // ---------- Act I: the phone, and the laptop that arrives for it ----------

  let phoneStage = 0;      // 0 needs the snap, 1 needs the bump, 2 done
  let locked = false;      // on the page, waiting for the shutter to be pressed
  let phoneDrag = null;
  let phoneOff = { x: 0, y: 0 };
  let laptopReady = false; // the laptop has slid in and can take the phone
  let arrival = Promise.resolve();
  let transferDone = Promise.resolve();
  let capturedScale = 0.3; // the captured page's scale inside the phone

  function setPhoneOff(x, y) {
    phoneOff = { x, y };
    phone.style.setProperty('--px', `${x}px`);
    phone.style.setProperty('--py', `${y}px`);
  }

  function phoneCenter() {
    return { x: geo.phone.x + geo.phone.w / 2 + phoneOff.x, y: geo.phone.y + geo.phone.h / 2 + phoneOff.y };
  }

  // On portrait the paper sits up and to the left of the phone: the cue's arrow is drawn (glyph arrows
  // render as emoji on some phones) and turned to point at the paper's middle.
  const CUE_ARROW = '<span class="cue-arrow" aria-hidden="true"><svg viewBox="0 0 12 16"><path d="M6 15V2.5M1.5 7 6 2.5 10.5 7"/></svg></span>';
  function aimCue() {
    const cue = $('.phone-cue', phone);
    if (!cue || !geo || !geo.portrait) return;
    const dx = (geo.sheet.x + geo.sheet.w / 2) - (geo.phone.x + geo.phone.w / 2);
    const dy = (geo.sheet.y + geo.sheet.h / 2) - (geo.phone.y + geo.phone.h / 2);
    const deg = Math.max(-80, Math.min(0, (Math.atan2(dx, -dy) * 180) / Math.PI));
    cue.style.setProperty('--cue-a', `${deg.toFixed(1)}deg`);
  }

  function setCue() {
    const cue = $('.phone-cue', phone);
    if (!cue) return;
    const p = geo.portrait;
    // The one cue is the first drag; after the shutter the phone moves on its own.
    if (p) cue.innerHTML = `Drag ${CUE_ARROW}`;
    else cue.textContent = 'Drag ←';
    cue.classList.toggle('is-aimed', p);
    aimCue();
    phone.classList.toggle('cue-on', false);
  }

  async function glideTo(pt, ms = 420) {
    phone.style.setProperty('--glide', `${ms}ms`);
    phone.classList.add('is-gliding');
    setPhoneOff(pt.x - (geo.phone.x + geo.phone.w / 2), pt.y - (geo.phone.y + geo.phone.h / 2));
    await wait(ms);
    phone.classList.remove('is-gliding');
  }

  // The phone settles onto the page: it lines up, the detection box brightens, then the shutter lights up
  // and waits to be pressed (a click or tap on the phone, Enter, or the idle clock).
  async function lockOn() {
    if (phoneStage !== 0 || locked) return;
    locked = true;
    phoneDrag = null;
    phone.classList.remove('is-dragging');
    stage.dataset.open = 'locked';
    await glideTo(sheetMid(), 380);
    phone.classList.add('is-locked');
    $('.phone-body', phone).classList.add('is-settle');
    const t = later(() => phone.classList.add('shutter-armed'), RM ? 0 : 300);
    run.timers.add(t);
    const g = gestureNow;
    if (g && g.name === 'phone' && !g.busy) {
      g.idleMs = IDLE_LATER_MS;
      armIdle();
    }
  }

  // The shutter: the picture, then the phone carries it to the laptop by itself.
  function pressShutter() {
    if (!locked || phoneStage !== 0) return;
    noteInput();
    snap();
    if (gestureNow && gestureNow.name === 'phone') gestureNow.perform('shutter');
  }

  function snap() {
    if (phoneStage !== 0) return;
    phoneStage = 1;
    locked = false;
    phone.classList.remove('shutter-armed');
    // The shutter: a flash, then the page in the viewfinder straightens and settles in the middle of the screen.
    const view = $('.phone-view', phone);
    const scr = $('.phone-screen', phone);
    const w = view.offsetWidth;
    const h = view.offsetHeight;
    capturedScale = Math.min((scr.clientWidth * 0.8) / w, (scr.clientHeight * 0.68) / h);
    view.style.transform = getComputedStyle(view).transform;
    void view.offsetWidth;
    view.classList.add('is-captured');
    view.style.transform = `translate(${((scr.clientWidth - w) / 2).toFixed(1)}px, ${(scr.clientHeight * 0.43 - h / 2).toFixed(1)}px) scale(${capturedScale.toFixed(3)})`;
    phone.classList.add('is-snapped', 'cue-wait');
    $('.phone-flash', phone).classList.add('is-on');
    $('.phone-body', phone).classList.add('is-settle');
    sheet.classList.add('is-flash');
    setCue();
    stage.dataset.open = 'snapped';
    track('phone_snapped');
    arrival = laptopArrives();
    arrival.catch(() => {});
  }

  // After the picture: the captured page holds in the phone, then the closed laptop slides in from the right
  // and its baked wordmark takes over from the small one.
  async function laptopArrives() {
    await wait(CAPTURE_HOLD_MS);
    stage.classList.add('laptop-in');
    stage.dataset.open = 'laptop';
    await wait(LAPTOP_IN_MS);
    laptopReady = true;
    stage.dataset.open = 'laptop-ready';
    phone.classList.remove('cue-wait');
  }

  async function bump() {
    phoneStage = 2;
    stage.dataset.open = 'transfer';
    phone.classList.add('is-bumped');
    const body = $('.phone-body', phone);
    body.classList.remove('is-settle');
    body.classList.add('is-shake');
    const from = phoneCenter();
    const to = { x: (geo.laptop.x0 + geo.laptop.x1) / 2, y: (geo.laptop.y0 + geo.laptop.y1) / 2 };
    // The captured page flies out of the phone into the laptop, under the label; the rim flashes as it lands.
    const cw = geo.sheet.w;
    const ch = geo.sheet.h;
    const k = capturedScale;
    const fromY = geo.phone.y + phoneOff.y + geo.phone.h * (0.045 + 0.91 * 0.43);
    fly.style.width = `${cw}px`;
    fly.style.height = `${ch}px`;
    const f0 = `translate(${from.x - cw / 2}px, ${fromY - ch / 2}px) scale(${k.toFixed(3)})`;
    const f1 = `translate(${to.x - cw / 2}px, ${to.y - ch / 2 + 6}px) scale(${(k * 0.45).toFixed(3)}) rotate(-6deg)`;
    animate(fly, [
      { transform: f0, opacity: 1 },
      { transform: f1, opacity: 1, offset: 0.8 },
      { transform: f1, opacity: 0 },
    ], { duration: 900 * MOTION, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' });
    const t = later(() => {
      rim.classList.remove('is-glowing');
      void rim.offsetWidth;
      rim.classList.add('is-glowing');
    }, RM ? 0 : 650 * MOTION);
    run.timers.add(t);
    // The local hand-over label: phone → laptop centre.
    const tw = transfer.offsetWidth;
    const th = transfer.offsetHeight;
    const p0 = `translate(${from.x - tw / 2}px, ${from.y - th / 2 - 30}px)`;
    const p1 = `translate(${to.x - tw / 2}px, ${to.y - th / 2 - 30}px)`;
    transfer.style.transform = p1;
    // Fades in on the phone, crosses to the laptop, and holds there long enough to read.
    const pulse = animate(transfer, [
      { transform: p0, opacity: 0 },
      { transform: p0, opacity: 1, offset: 0.1 },
      { transform: p1, opacity: 1, offset: 0.4 },
      { transform: p1, opacity: 1, offset: 0.85 },
      { transform: p1, opacity: 0 },
    ], { duration: 1900 * MOTION, easing: 'ease-in-out' });
    transferDone = pulse.then(() => { phone.hidden = true; });
    await wait(340 * MOTION);
    phone.classList.add('is-dropping');
    // The paper fades: it is in the laptop now.
    const t2 = later(() => sheet.classList.add('is-gone'), 380 * MOTION);
    run.timers.add(t2);
    await wait(500 * MOTION);
  }

  async function phoneAuto(method) {
    if (RM) {
      phoneStage = 2;
      phone.hidden = true;
      sheet.classList.add('is-gone');
      stage.classList.add('laptop-in');
      laptopReady = true;
      track('phone_snapped', { method });
      return;
    }
    if (phoneStage === 0) {
      if (!locked) {
        const s = geo.sheet;
        await glideTo({ x: s.x + s.w / 2, y: s.y + s.h / 2 }, 650);
        await lockOn();
        await wait(700);  // the shutter lights up, then the picture
      }
      snap();
    }
    // The laptop arrives, then the phone glides to it and bumps it.
    await arrival;
    await wait(HANDOVER_BEAT_MS);
    await glideTo(geo.bump, 600);
    await bump();
  }

  const insideXY = (p, b, px, py) => p.x > b.x0 - px && p.x < b.x1 + px && p.y > b.y0 - py && p.y < b.y1 + py;
  const sheetMid = () => ({ x: geo.sheet.x + geo.sheet.w / 2, y: geo.sheet.y + geo.sheet.h / 2 });
  const pageBox = () => ({ x0: geo.sheet.x, x1: geo.sheet.x + geo.sheet.w, y0: geo.sheet.y, y1: geo.sheet.y + geo.sheet.h });
  // The shutter fires once the phone is well over the page, so the viewfinder is seen first.
  const overPage = (c) => insideXY(c, pageBox(), -0.26 * geo.sheet.w, -0.22 * geo.sheet.h);

  phone.addEventListener('pointerdown', (e) => {
    if (!gestureNow || gestureNow.name !== 'phone' || gestureNow.busy) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    noteInput(e);
    phoneDrag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, ox: phoneOff.x, oy: phoneOff.y, moved: false };
    try { phone.setPointerCapture(e.pointerId); } catch (_) { /* best-effort */ }
  });

  phone.addEventListener('pointermove', (e) => {
    const d = phoneDrag;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < TAP_SLOP_PX) return;
      d.moved = true;
      phone.classList.add('is-dragging');
    }
    setPhoneOff(d.ox + dx, d.oy + dy);
    const c = phoneCenter();
    if (phoneStage === 0 && !locked && overPage(c)) lockOn();
  });

  function endPhoneDrag(e, cancelled) {
    const d = phoneDrag;
    if (!d || e.pointerId !== d.id) return;
    phoneDrag = null;
    phone.classList.remove('is-dragging');
    noteInput(e);
    if (!gestureNow || gestureNow.name !== 'phone') return;
    if (!d.moved) {
      // On the page, a tap anywhere on the phone presses the shutter; before that, a tap does all of Act I.
      if (!cancelled) {
        if (locked) pressShutter();
        else gestureNow.perform('tap');
      }
      return;
    }
    const c = phoneCenter();
    const s = sheetMid();
    if (phoneStage === 0 && locked) {
      glideTo(s, 300).catch(() => {});  // dragged off while waiting for the shutter: it settles back
    } else if (phoneStage === 0) {
      // Forgiving: let go near the page and the phone lines up and locks on.
      if (Math.hypot(c.x - s.x, c.y - s.y) < 0.75 * Math.max(geo.sheet.w, geo.sheet.h)) lockOn().catch(() => {});
      else glideTo({ x: geo.phone.x + geo.phone.w / 2, y: geo.phone.y + geo.phone.h / 2 }, 450).catch(() => {});
    }
  }

  phone.addEventListener('pointerup', (e) => endPhoneDrag(e, false));
  phone.addEventListener('pointercancel', (e) => endPhoneDrag(e, true));
  phone.addEventListener('contextmenu', (e) => e.preventDefault());

  // Tapping the laptop while the phone is waiting nudges the phone's cue.
  scene.addEventListener('pointerdown', () => {
    if (gestureNow && gestureNow.name === 'phone') animate($('.phone-body', phone), [{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }], { duration: 360, fill: 'none' });
  });

  // ---------- Act II: the lid ----------

  const frames = new Array(FRAMES).fill(null);
  let settled = 0;
  let allReady = RM;
  let progress = 0;
  let shownFrame = -1;
  let renderRaf = 0;
  let tweenRaf = 0;
  let drag = null;
  let pendingOpen = null;
  let wheelGuardUntil = 0;
  let lidArmed = false;
  let lidDone = null;

  canvas.width = frameSet;
  canvas.height = Math.round(frameSet * 0.5625);
  frames[0] = poster;

  function loadOrder(n) {
    const out = [0, n - 1];
    const queue = [[0, n - 1]];
    while (queue.length) {
      const [a, b] = queue.shift();
      if (b - a < 2) continue;
      const m = (a + b) >> 1;
      out.push(m);
      queue.push([a, m], [m, b]);
    }
    return out;
  }

  function onSettled() {
    settled += 1;
    if (settled < FRAMES) return;
    allReady = true;
    stage.classList.add('frames-ready');
    if (pendingOpen) {
      const method = pendingOpen;
      pendingOpen = null;
      playOpen(method);
    }
  }

  function loadFrame(i) {
    if (i === 0 && frameSet === 1280) {
      // The inline poster is lid_01 of this set already.
      (poster.decode ? poster.decode() : Promise.resolve()).catch(() => {}).then(() => {
        requestRender();
        onSettled();
      });
      return;
    }
    const img = new Image();
    img.decoding = 'async';
    img.src = frameUrl(i);
    img.decode()
      .then(() => {
        frames[i] = img;
        if (i === 0 || shownFrame !== Math.round(progress * (FRAMES - 1))) requestRender();
      })
      .catch(() => { /* a missing frame falls back to its nearest neighbour */ })
      .then(onSettled);
  }

  // Reduced motion never fetches the frames: the <picture> already shows lid_45.
  if (!RM) loadOrder(FRAMES).forEach(loadFrame);

  function nearestFrame(i) {
    for (let d = 0; d < FRAMES; d += 1) {
      if (i - d >= 0 && frames[i - d]) return i - d;
      if (i + d < FRAMES && frames[i + d]) return i + d;
    }
    return 0;
  }

  function render() {
    renderRaf = 0;
    if (RM) return;
    const f = nearestFrame(Math.round(progress * (FRAMES - 1)));
    if (f === shownFrame && canvas.classList.contains('is-live')) return;
    const img = frames[f];
    if (!img || !img.complete) return;
    ctx2d.drawImage(img, 0, 0, canvas.width, canvas.height);
    shownFrame = f;
    dimTagline(f);
    placeLogoO(f);
    canvas.classList.add('is-live');
  }

  let taglineBottom = 0; // % of scene height
  function measureTagline() {
    taglineBottom = ((tagline.offsetTop + tagline.offsetHeight) / scene.offsetHeight) * 100;
  }
  function dimTagline(f) {
    const clearance = LID_EDGE[f] - taglineBottom;
    tagline.style.opacity = String(Math.min(1, Math.max(0, (clearance + 1.5) / 3)));
  }
  measureTagline();

  function requestRender() {
    if (!renderRaf) renderRaf = requestAnimationFrame(render);
  }

  // The live O follows the baked one; the frame-45 crop fades in as the lid opens.
  function placeLogoO(f) {
    const [dx, dy, s] = LOGO_O[f];
    logoO.style.setProperty('--odx', String(dx));
    logoO.style.setProperty('--ody', String(dy));
    logoO.style.setProperty('--os', String(s));
    logoOB.style.opacity = String(Math.pow(f / (FRAMES - 1), 2).toFixed(3));
  }
  if (RM) placeLogoO(FRAMES - 1); // the open frame is shown from the start

  const easeOutCubic = (k) => 1 - Math.pow(1 - k, 3);
  const easeInOutCubic = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

  function cancelTween() {
    if (tweenRaf) cancelAnimationFrame(tweenRaf);
    tweenRaf = 0;
    if (followRaf) cancelAnimationFrame(followRaf);
    followRaf = 0;
  }

  // While dragging, the lid trails the finger: each frame it closes a quarter of the gap.
  let dragTarget = 0;
  let followRaf = 0;
  function follow() {
    followRaf = 0;
    const gap = dragTarget - progress;
    progress = Math.abs(gap) < 0.002 ? dragTarget : progress + gap * DRAG_FOLLOW;
    render();
    if (drag && progress >= 1 && frames[FRAMES - 1]) {
      const method = drag.type === 'mouse' ? 'drag-mouse' : 'drag';
      drag = null;
      lidDone = 'opening';
      if (gestureNow && gestureNow.name === 'lid') gestureNow.perform(method);
      return;
    }
    if (progress !== dragTarget) followRaf = requestAnimationFrame(follow);
  }

  function tweenTo(target, ms, done, ease = easeOutCubic) {
    cancelTween();
    if (RM) {
      progress = target;
      render();
      if (done) Promise.resolve().then(done);
      return;
    }
    const from = progress;
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      progress = from + (target - from) * ease(k);
      render();
      if (k < 1) {
        tweenRaf = requestAnimationFrame(step);
      } else {
        tweenRaf = 0;
        if (done) done();
      }
    };
    tweenRaf = requestAnimationFrame(step);
  }

  function resetLid() {
    cancelTween();
    drag = null;
    pendingOpen = null;
    lidDone = null;
    progress = 0;
    shownFrame = -1;
    render();
  }

  function setLidArmed(on) {
    lidArmed = on;
    stage.classList.toggle('lid-armed', on);
    lidHit.setAttribute('aria-disabled', on ? 'false' : 'true');
    if (!on) lidHit.setAttribute('tabindex', '-1');
  }

  function playOpen(method) {
    if (!lidArmed || lidDone === 'opening') return;
    if (!allReady) {
      // The chevrons keep drifting; the lid opens the moment the last frame decodes.
      pendingOpen = pendingOpen || method;
      return;
    }
    lidDone = 'opening';
    stage.classList.add('cue-off');
    const r = run;
    const done = () => { if (!r.cancelled) landed(method); };
    // After a drag the lid finishes the lift it was given; a tap, click, wheel or key plays it whole.
    if (/drag/.test(method) && progress > 0.02) tweenTo(1, RELEASE_MS, done, easeOutCubic);
    else tweenTo(1, Math.max(400, PLAY_MS * (1 - progress)), done, easeInOutCubic);
  }

  function snapShut() {
    tweenTo(0, Math.max(400, RELEASE_MS * progress), () => {
      if (lidArmed) stage.classList.remove('cue-off');
      armIdle();
    }, easeOutCubic);
  }

  // Frame 45 has landed.
  function landed(method) {
    progress = 1;
    render();
    pendingOpen = null;
    wheelGuardUntil = performance.now() + 600;
    setLidArmed(false);
    if (document.activeElement === lidHit) stage.focus({ preventScroll: true });
    track('lid_opened', { method });
    if (lidResolve) { const r = lidResolve; lidResolve = null; r(method); }
  }

  let lidResolve = null;
  function lidGesture(method) {
    if (RM) return Promise.resolve();
    return new Promise((resolve) => {
      lidResolve = resolve;
      if (progress >= 1) landed(method);   // the finger took it all the way
      else playOpen(method);
    });
  }

  lidHit.addEventListener('pointerdown', (e) => {
    if (!lidArmed || drag || lidDone) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    noteInput(e);
    cancelTween();
    dragTarget = progress;
    drag = {
      id: e.pointerId, y0: e.clientY, x0: e.clientX, p0: progress, moved: false, type: e.pointerType,
      lastY: e.clientY, lastT: performance.now(), vy: 0,
    };
    try { lidHit.setPointerCapture(e.pointerId); } catch (_) { /* capture is best-effort */ }
  });

  lidHit.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id || !lidArmed) return;
    const dy = drag.y0 - e.clientY;
    if (!drag.moved) {
      if (Math.hypot(dy, e.clientX - drag.x0) < TAP_SLOP_PX) return;
      drag.moved = true;
      stage.classList.add('cue-off');
    }
    // The slop is subtracted so the lid starts from rest, but a fast first move keeps its distance.
    const travel = dy > 0 ? Math.max(0, dy - TAP_SLOP_PX) : dy;
    dragTarget = Math.min(1, Math.max(0, drag.p0 + travel / DRAG_FULL_PX));
    const now = performance.now();
    drag.vy = (drag.lastY - e.clientY) / Math.max(1, now - drag.lastT); // px/ms, + is upward
    drag.lastY = e.clientY;
    drag.lastT = now;
    if (!followRaf) followRaf = requestAnimationFrame(follow);
    // A mouse or trackpad held past about 45 degrees: the lid finishes opening by itself, as if released
    // there (some visitors never let go). Touch keeps the release rule.
    if (drag.type === 'mouse' && dragTarget >= MOUSE_COMMIT_AT) commitDrag(e);
  });

  function commitDrag(e) {
    drag = null;
    if (followRaf) cancelAnimationFrame(followRaf);
    followRaf = 0;
    try { lidHit.releasePointerCapture(e.pointerId); } catch (_) { /* capture is best-effort */ }
    gestureNow && gestureNow.name === 'lid' && gestureNow.perform('drag-mouse');
  }

  function endDrag(e, cancelled) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    if (followRaf) cancelAnimationFrame(followRaf);
    followRaf = 0;
    noteInput(e);
    if (!d.moved) {
      if (!cancelled) gestureNow && gestureNow.name === 'lid' && gestureNow.perform(d.type === 'mouse' ? 'click' : 'tap');
      return;
    }
    // A quick upward flick opens even if it ends short of 40%.
    const flick = performance.now() - d.lastT < 100 && d.vy > FLICK_PX_PER_MS;
    // The finger's position decides (the lid trails it slightly).
    if (dragTarget >= SNAP_AT || flick) gestureNow && gestureNow.name === 'lid' && gestureNow.perform(d.type === 'mouse' ? 'drag-mouse' : 'drag');
    else snapShut();
  }

  lidHit.addEventListener('pointerup', (e) => endDrag(e, false));
  lidHit.addEventListener('pointercancel', (e) => endDrag(e, true));
  lidHit.addEventListener('contextmenu', (e) => e.preventDefault());

  // Desktop: a scroll tick or an arrow key opens the lid while it is the gesture.
  window.addEventListener('wheel', (e) => {
    if (performance.now() < wheelGuardUntil) {
      // Swallow trackpad momentum left over from the tick that opened the lid.
      e.preventDefault();
      return;
    }
    if (!lidArmed || window.scrollY > 4 || Math.abs(e.deltaY) < 1) return;
    e.preventDefault();
    noteInput(e);
    gestureNow && gestureNow.name === 'lid' && gestureNow.perform('wheel');
  }, { passive: false });

  document.addEventListener('keydown', (e) => {
    noteInput(e);
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (inspectOpen && e.key === 'Escape') { closeInspect(); return; }
    if (!gestureNow || gestureNow.busy) return;
    const activate = e.key === 'Enter' || e.key === ' ';
    if (gestureNow.name === 'phone' && t === phone && activate) {
      e.preventDefault();
      if (locked) pressShutter();
      else gestureNow.perform('key');
    } else if (gestureNow.name === 'lid' && ((t === lidHit && activate) ||
      ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && window.scrollY <= 4))) {
      e.preventDefault();
      gestureNow.perform('key');
    }
  });

  window.addEventListener('scroll', () => noteInput(), { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') armIdle();
  });

  // ---------- The laptop's screen: a Mac desktop (screens.js) ----------
  // Word with the ZOE pane, and Safari with the ZOE cockpit. Each beat below sets the screen it needs
  // on entry, so the beats can be put in another order by reordering their calls in story().

  const CLOCK = window.__ZOE_CLOCK || 'live';   // the menu-bar clock; tests may freeze it
  const ZOOM_READ = 140;     // Word's zoom for the scrub: the document text grows, never the chrome
  const ZOOM_DRAFT = 120;    // the draft running past
  const ZOOM_CLAUSE = 130;   // the clause landing, and the fix
  let desk = null;
  // Every size shows the same picture: the Mac window with Word and the ZOE pane open on the right, the
  // whole time. A phone draws that same desk scaled down to its laptop's screen, at the desktop's zoom;
  // small text is accepted.
  const POST_DESK_W = 1100;  // after the introduction: the laptop is drawn smaller
  function readingLayout(on, zoom) {
    desk.word.setPaneOpen(true);
    return desk.word.setZoom(zoom, RM ? 0 : 700);
  }

  const noop = () => Promise.resolve();
  function stubDesk() {
    // Only if screens.js failed to load: the story still runs, over an empty screen.
    const el = document.createElement('div');
    return {
      el, wifiIconEl: null, setApp: noop, setWifi: noop, destroy() {},
      word: { pageEl: el, scrollEl: el, paneEl: el, setDocument: noop, setZoom: noop, scrollTo: noop, setPane: noop, setPaneOpen: noop },
      cockpit: { viewEl: el, scrollEl: el, setView: noop },
    };
  }

  function mountDesk(width) {
    if (desk) desk.destroy();
    screen.innerHTML = '';
    screen.hidden = false;
    desk = window.ZoeScreens ? window.ZoeScreens.mount(screen, { app: 'word', wifi: false, clock: CLOCK, motion: !RM, width: width || 1280 }) : stubDesk();
    void screen.offsetWidth;
    screen.classList.add('is-on');
    return desk;
  }

  // ---------- The documents on the screen ----------

  // The term sheet in Word: each {key} is an identifier the scrub finds and switches.
  const idSpan = (k) => (kept(k) ? esc(PARTIES[k].real) : `<span data-k="${k}">${esc(PARTIES[k].real)}</span>`);
  function termSheetDoc() {
    return `<h1>TERM SHEET</h1><p class="zs-c">Proposed acquisition of ${idSpan('seller')} by ${idSpan('buyer')}</p>` +
      '<p class="zs-c" style="margin-bottom:1.6em">Non-binding summary of principal terms</p>' +
      TERM_SHEET.map(([k, v]) => `<p><span class="zs-k">${esc(k)}.</span> ${esc(v).replace(/\{(\w+)\}/g, (_, key) => idSpan(key))}</p>`).join('');
  }

  // The firm's merger template filled in from the term sheet (agreement.js). The deal's names, figures and
  // dates start as [●] and fill in as the page runs past. The parent's later addition (agreement.js's ⟦⟧
  // passages) is in the page but hidden until the fix, where it lands as a red tracked change whose names
  // arrive as placeholders and are restored on the laptop.
  const AG_TAG = { title: ['h1', ''], c: ['p', 'zs-c'], cb: ['p', 'zs-c zs-k'], note: ['p', 'zs-c'], h: ['h2', ''], p: ['p', ''], sub: ['p', 'b-sub'], lines: ['p', ''], sb: ['p', 'zs-k'] };
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let piiCache = null;
  function piiTable() {
    const { pii } = agreement();
    if (!piiCache || piiCache.n !== pii.length) {
      piiCache = {
        n: pii.length,
        re: pii.length ? new RegExp(pii.map(([real]) => real).sort((a, b) => b.length - a.length).map(reEsc).join('|'), 'g') : null,
        masks: new Map(pii),
      };
    }
    return piiCache;
  }
  // Escapes text; wrap(real, mask) gives the html for each identifier in it.
  function wrapPii(text, wrap) {
    const { re, masks } = piiTable();
    if (!re) return esc(text);
    let out = '';
    let last = 0;
    text.replace(re, (m, at) => {
      out += esc(text.slice(last, at)) + wrap(m, masks.get(m));
      last = at + m.length;
      return m;
    });
    return out + esc(text.slice(last));
  }
  // A dollar amount or deal figure (its mask is itself) fills in like the rest but is never highlighted or scrubbed.
  const fillSpan = (real, mask) => `<span class="b-fill"${mask === real ? ' data-keep' : ''} data-v="${esc(real)}" data-m="${esc(mask)}">[●]</span>`;
  const nameSpan = (real, mask) => `<span class="b-name zs-ph" data-v="${esc(real)}">${esc(mask)}</span>`;
  function agText(text) {
    return String(text).split(/(⟦[^⟧]*⟧)/).map((part) => (part[0] === '⟦'
      ? `<span class="zs-ins b-fix" hidden>${wrapPii(part.slice(1, -1), nameSpan)}</span>`
      : wrapPii(part, fillSpan))).join('').replace(/\n/g, '<br>');
  }
  function agreementDoc() {
    return agreement().blocks.map(([type, text, lead, id]) => {
      if (type === 'rule') return '<hr>';
      const [tag, cls] = AG_TAG[type] || ['p', ''];
      const only = !lead && /^⟦[^⟧]*⟧$/.test(String(text));   // a passage that is all addition
      const attrs = `${cls ? ` class="${cls}"` : ''}${id ? ` data-id="${id}"` : ''}${only ? ' data-fixonly hidden' : ''}`;
      return `<${tag}${attrs}>${lead ? `<span class="zs-k">${agText(lead)}</span>${text ? ' ' : ''}` : ''}${agText(text)}</${tag}>`;
    }).join('');
  }

  // The firm's template and playbook, as the cockpit's template search finds them.
  const TEMPLATE_SEARCH = {
    description: 'cash merger, earn-out, escrow for indemnification, seller-friendly, Delaware',
    agreementType: 'merger agreement',
    ideas: ['cash merger', 'earn-out', 'seller-friendly'],
    jurisdiction: 'Delaware',
    typeChip: 'Agreement and Plan of Merger',
    count: 12,
    library: 'Reference Library',
    results: [
      { file: 'firm_merger_agreement_template_delaware.docx', match: 100, type: 'Agreement and Plan of Merger', parties: 'PARENT; MERGER SUB; COMPANY', jurisdiction: 'Delaware', covers: [1, 1, 1] },
      { file: 'playbook_seller_conservative.docx', match: 94, type: 'Playbook', parties: 'SELLER', jurisdiction: 'Delaware', covers: [1, 1, 1] },
    ],
  };

  // The knowledge clause. The precedent is another of the firm's merger agreements on the same template, so
  // it already speaks this agreement's defined terms: it goes in word for word, and nothing in it is edited
  // later. The precedent added it at the same place, as the last section of its Article IX, so it is § 9.6
  // there too: the cards, the preview and the page all number it 9.6.
  const CLAUSE_TEXT = 'Notwithstanding anything in this Agreement to the contrary, no Buyer Indemnified Party may recover any Losses for the breach of a representation or warranty of the Company if Merger Sub had actual knowledge of that breach before the Closing. For this purpose, actual knowledge means the awareness of the facts constituting the breach by any individual named as a member of Merger Sub’s deal team in the Disclosure Schedule. A Buyer Indemnified Party that elects to close with that knowledge waives all claims for that breach. This Section does not limit recovery for Fraud.';
  const CLAUSE_LEAD = 'Section 9.6 Knowledge; No Sandbagging.';            // in the precedent and on the page
  const CLAUSE_SOURCE = 'Merger Agreement, 2026, Delaware (Project Saltmarsh)';
  const CLAUSE_TITLE = '9.6 Knowledge; No Sandbagging.';
  const CLAUSE_RESULTS = [
    { title: CLAUSE_TITLE, source: CLAUSE_SOURCE, match: 100, text: `${CLAUSE_TITLE} ${CLAUSE_TEXT}` },
    { title: '8.6 Reliance Preserved.', source: 'Stock Purchase Agreement, 2025, Delaware (Project Cinderwell)', match: 92, text: '8.6 Reliance Preserved. The rights of the Purchaser Indemnitees to indemnification will not be affected by any investigation conducted by or on behalf of Purchaser, or by any knowledge acquired at any time, whether before or after the Closing Date.' },
    { title: '10.4 Known Breaches.', source: 'Asset Purchase Agreement, 2024, Delaware (Project Quillfeather)', match: 88, text: '10.4 Known Breaches. Buyer may not assert any claim for a breach of which Buyer had actual knowledge on the Closing Date, as shown by a writing delivered to Buyer before the Closing.' },
    { title: '7.2 Disclosure Updates.', source: 'Merger Agreement, 2022, Delaware (Project Wickerfield)', match: 81, text: '7.2 Disclosure Updates. Any supplement to the Disclosure Schedule delivered before the Closing will cure any breach it discloses if Parent elects to proceed with the Closing.' },
    { title: '9.5 Deal Team Knowledge.', source: 'Equity Purchase Agreement, 2023, Delaware (Project Thistledown)', match: 77, text: '9.5 Deal Team Knowledge. Knowledge of Buyer means the actual knowledge, after reasonable inquiry, of the individuals listed in Section 9.5 of the Disclosure Schedule.' },
  ];
  // The pane's suggestions beside the two-party draft (the library's default first card names the parent).
  const TWO_PARTY_SUGGESTIONS = [
    { text: 'This Agreement and Plan of Merger is entered into as of the date set out above by and among Merger Sub and the Company, each a “Party” and together the “Parties”.' },
    { text: 'This Stock Purchase Agreement is made as of the Effective Date by and among the Purchaser, the Seller and the Company, on the terms set out below.', less: true },
    { text: 'The Parties intend that the Merger qualify as a reorganization for federal income tax purposes, and this Agreement is adopted as a plan of reorganization.' },
  ];
  const clauseCard = () => ({ title: CLAUSE_TITLE, source: CLAUSE_SOURCE, text: `${CLAUSE_LEAD} ${CLAUSE_TEXT}` });

  // The screen once the introduction is over: the finished draft in Word, Wi-Fi off, no callout.
  let restingReady = Promise.resolve();
  function restingScreen() {
    mountDesk(POST_DESK_W);
    desk.setApp('word');
    desk.word.setPane('afterInsert', Object.assign(clauseCard(), { where: 'below ¶ this paragraph' }), { instant: true });
    const d = desk;
    const fillIn = () => {
      if (desk !== d) return;
      desk.word.setDocument(agreementDoc(), { title: 'Agreement and Plan of Merger', pages: 13 });
      desk.word.pageEl.querySelectorAll('.b-fill').forEach((el) => fillOne(el, false));
      insertClause(true);
      const fixes = Array.from(desk.word.pageEl.querySelectorAll('.b-fix'));
      showFixes(fixes);
      restoreNames(fixes, false);
      const p = desk.word.pageEl.querySelector('[data-id="s93new"]');
      if (p) wordScrollTo(p, 0.2, 0);
    };
    if (window.ZOE_AGREEMENT) { fillIn(); restingReady = Promise.resolve(); } else restingReady = loadAgreement().then(fillIn);
    setWifi(false, { callout: false });
  }

  // ---------- Wi-Fi: the menu-bar icon and its enlarged callout, one state ----------
  // setWifi is the only switch: it sets the small icon on the screen and the callout outside it.
  // The callout is a dotted box around the icon, a dotted tie, and a pill just outside the screen's
  // top-right corner (on portrait, pinned to the right edge in the black gap above the screen, clear
  // of the chat column). It is placed from the icon's live position every frame while it shows, so
  // it rides the camera's moves.
  const WIFI_SVG = '<svg class="wc-icon" viewBox="0 0 24 20" aria-hidden="true"><path d="M2.6 7.6a13.4 13.4 0 0 1 18.8 0"/><path d="M6.1 11.2a8.4 8.4 0 0 1 11.8 0"/><path d="M9.5 14.7a3.5 3.5 0 0 1 5 0"/><circle cx="12" cy="17.7" r="1.4"/><path class="wc-slash" d="M3.5 1.8 20.5 19"/></svg>';
  const callout = document.createElement('div');
  callout.className = 'wifi-callout';
  callout.setAttribute('aria-hidden', 'true');
  callout.hidden = true;
  callout.innerHTML = `<svg class="wc-lines"><rect class="wc-box" rx="4"/><line class="wc-tie"/></svg><span class="wc-pill">${WIFI_SVG}<b class="wc-text"></b></span>`;
  stage.appendChild(callout);
  const wcBox = $('.wc-box', callout);
  const wcTie = $('.wc-tie', callout);
  const wcPill = $('.wc-pill', callout);
  let wifiOn = null;
  let calloutRaf = 0;
  let calloutKey = '';

  function setWifi(on, opts = {}) {
    const changed = wifiOn !== on;
    wifiOn = on;
    if (desk) desk.setWifi(on);
    if (opts.callout === false) { hideCallout(); return; }
    callout.classList.toggle('is-on', on);
    callout.classList.toggle('is-off', !on);
    $('.wc-text', callout).textContent = on ? 'Wi-Fi ON' : 'Wi-Fi OFF';
    const wasHidden = callout.hidden;
    callout.hidden = false;
    stage.classList.add('has-callout');
    calloutKey = '';
    placeCallout();
    if (changed || wasHidden) {
      wcPill.classList.remove('is-pulse');
      void wcPill.offsetWidth;
      wcPill.classList.add('is-pulse');
    }
    if (!calloutRaf && !RM) calloutRaf = requestAnimationFrame(followCallout);
  }

  function hideCallout() {
    callout.hidden = true;
    stage.classList.remove('has-callout');
    cancelAnimationFrame(calloutRaf);
    calloutRaf = 0;
  }

  function followCallout() {
    calloutRaf = 0;
    if (callout.hidden) return;
    placeCallout();
    calloutRaf = requestAnimationFrame(followCallout);
  }

  const wifiAnchor = () => desk && desk.wifiIconEl;

  function placeCallout() {
    const a = wifiAnchor();
    if (callout.hidden || !a) return;
    const st = stage.getBoundingClientRect();
    const ar = a.getBoundingClientRect();
    const sr = screen.getBoundingClientRect();
    if (!ar.width || !sr.width) return;
    const key = [ar.left, ar.top, ar.width, sr.top, sr.right, st.width, st.height, wifiOn].map((n) => (typeof n === 'number' ? n.toFixed(1) : n)).join();
    if (key === calloutKey) return;
    calloutKey = key;
    const V = st.width;
    const pad = 2;
    const bx = ar.left - st.left - pad;
    const by = ar.top - st.top - pad;
    const bw = ar.width + 2 * pad;
    const bh = ar.height + 2 * pad;
    const pw = wcPill.offsetWidth;
    const ph = wcPill.offsetHeight;
    let px;
    let py;
    if (portraitMQ.matches) {
      px = V - 8 - pw;
      py = sr.top - st.top - ph - 8;
    } else {
      px = sr.right - st.left + 10;
      py = sr.top - st.top - ph - 14;
    }
    px = Math.max(8, Math.min(V - pw - 8, px));
    py = Math.max(8, py);
    wcPill.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
    wcBox.setAttribute('x', bx.toFixed(1));
    wcBox.setAttribute('y', by.toFixed(1));
    wcBox.setAttribute('width', bw.toFixed(1));
    wcBox.setAttribute('height', bh.toFixed(1));
    // The tie runs between the nearest points of the box and the pill.
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const pc = { x: px + pw / 2, y: py + ph / 2 };
    const bc = { x: bx + bw / 2, y: by + bh / 2 };
    wcTie.setAttribute('x1', clamp(pc.x, bx, bx + bw).toFixed(1));
    wcTie.setAttribute('y1', clamp(pc.y, by, by + bh).toFixed(1));
    wcTie.setAttribute('x2', clamp(bc.x, px, px + pw).toFixed(1));
    wcTie.setAttribute('y2', clamp(bc.y, py, py + ph).toFixed(1));
  }

  function offsetIn(el, root) {
    let x = 0;
    let y = 0;
    let n = el;
    while (n && n !== root) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = n.offsetParent;
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  }

  // Layout position from the page top, untouched by transforms (the camera's or the desk's own scale).
  const absTop = (el) => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };

  // Brings a point of the Word page to `frac` of the way down the window.
  function wordScrollTo(el, frac = 0.25, ms = 700) {
    const sc = desk.word.scrollEl;
    if (!el || !sc) return Promise.resolve();
    const y = Math.max(0, absTop(el) - absTop(sc) - frac * sc.clientHeight);
    return desk.word.scrollTo(y, RM ? 0 : ms * MOTION);
  }

  // Runs Word's page from where it is to `to()` (re-read every frame: the page may reflow), calling
  // pass(line) with the screen y of a line 80 % of the way down the window, so items light as they arrive.
  function runPage(ms, to, pass) {
    const sc = desk.word.scrollEl;
    const from = sc.scrollTop;
    const r = run;
    if (RM) {
      sc.scrollTop = to();
      pass(Infinity);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const t0 = performance.now();
      const frame = (now) => {
        if (r.cancelled) { resolve(); return; }
        const k = Math.min(1, (now - t0) / (ms * MOTION));
        sc.scrollTop = from + (to() - from) * easeInOutCubic(k);
        const box = sc.getBoundingClientRect();
        pass(box.top + box.height * 0.8);
        if (k < 1) requestAnimationFrame(frame); else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // The scrub: the page runs down the term sheet and each identifier lights warm yellow as it arrives;
  // back at the top, ZOE announces it and they all switch at once.
  const SCRUB_RUN_MS = 1500;
  const docIds = () => Array.from(desk.word.pageEl.querySelectorAll('[data-k]'));
  async function findIdentifiers() {
    const ids = docIds();
    const sc = desk.word.scrollEl;
    const lit = new Set();
    await runPage(SCRUB_RUN_MS, () => Math.max(0, sc.scrollHeight - sc.clientHeight), (line) => {
      ids.forEach((el) => {
        if (!lit.has(el) && el.getBoundingClientRect().top < line) {
          lit.add(el);
          el.classList.add('zs-hl');
        }
      });
    });
    check();
    ids.forEach((el) => el.classList.add('zs-hl'));
    await wait(200);
    await wordScrollTo(ids[0], 0.1, 500);
  }

  // The review's scrub, on the draft: every identified term turns at once into its placeholder.
  const draftTerms = () => Array.from(desk.word.pageEl.querySelectorAll('.b-filled:not([data-keep])'));
  function scrubDraft() {
    draftTerms().forEach((el) => {
      el.classList.remove('zs-hl', 'b-back');
      el.classList.add('zs-ph');
      el.textContent = el.dataset.m;
    });
  }

  // And back: every placeholder (the scrubbed terms and the names in the review's changes) turns back into
  // the real name, address or date, a brief green flash settling in the same yellow as before the scrub.
  function restoreAll(flash) {
    desk.word.pageEl.querySelectorAll('.b-filled.zs-ph, .b-name.zs-ph').forEach((el) => {
      el.textContent = el.dataset.v;
      el.classList.remove('zs-ph');
      el.classList.add('zs-hl');
      if (flash) {
        el.classList.remove('b-back');
        void el.offsetWidth;
        el.classList.add('b-back');
      }
    });
  }

  // A [●] in the template becomes the term sheet's value; in the story it shows highlighted yellow and stays
  // so (the identified terms are marked until the review's scrub).
  function fillOne(el, hl = true) {
    el.textContent = el.dataset.v;
    el.classList.remove('b-fill');
    el.classList.add('b-filled');
    if (hl && !el.hasAttribute('data-keep')) el.classList.add('zs-hl');
  }

  // Where the stack of pages sits beside the screen.
  const pageStart = () => (geo.portrait ? { x: 0, y: -46 } : { x: 52, y: -22 });

  // The scrubbed copy, as a small stack of pages beside the screen, ready to go out.
  function stackPages() {
    const start = pageStart();
    Array.from(fan.querySelectorAll('.page6')).forEach((page, n) => {
      page.style.transform = `translate(${start.x + n * 3}px, ${start.y - n * 3}px)`;
      page.classList.add('is-in');
      page.querySelectorAll('.page6-lines i').forEach((ln) => ln.classList.add('is-on'));
    });
  }

  // Then, with Wi-Fi on, the masked pages travel to the cloud one after another under the label.
  async function flyPages() {
    const pages = Array.from(fan.querySelectorAll('.page6'));
    const end = geo.portrait
      ? { x: geo.stream.x, y: geo.stream.y - geo.stream.len }
      : { x: geo.stream.x + geo.stream.len, y: geo.stream.y };
    const flight = { x: end.x - geo.fan.x, y: end.y - geo.fan.y };
    for (const page of pages) {
      page.classList.add('is-flying');
      page.style.transform = `translate(${flight.x}px, ${flight.y}px) scale(0.55)`;
      await wait(PAGE_FLY_GAP_MS);
    }
    await wait(PAGE_FLIGHT_MS);
  }

  // ---------- The agreement (agreement.js, loaded when the laptop opens) ----------

  let agreementLoad = null;
  function loadAgreement() {
    if (!agreementLoad) {
      agreementLoad = window.ZOE_AGREEMENT ? Promise.resolve() : new Promise((resolve) => {
        const el = document.createElement('script');
        el.src = 'agreement.js';
        el.onload = resolve;
        el.onerror = resolve;
        document.head.appendChild(el);
      });
    }
    return agreementLoad;
  }
  const agreement = () => window.ZOE_AGREEMENT || { blocks: [], insert: { lead: '', text: '' }, clauses: [], pii: [] };

  // ---------- The clause and the fix, in the page ----------

  // § 9.6 goes in as a new section at the end of Article IX (after § 9.5), a red tracked insertion, line by
  // line. Nothing is struck. (Its id is "s93new", the name the tests look for.)
  async function insertClause(instant) {
    const page = desk.word.pageEl;
    const after = page.querySelector('[data-id="art9end"]');
    if (!after || page.querySelector('[data-id="s93new"]')) return;
    const fast = instant || RM;
    const words = (t) => t.split(/(\s+)/).map((w) => (!w || /^\s+$/.test(w) ? w : `<span class="b-w">${esc(w)}</span>`)).join('');
    const p = document.createElement('p');
    p.className = 'zs-ins';
    p.dataset.id = 's93new';
    p.innerHTML = `<span class="zs-k">${words(CLAUSE_LEAD)}</span> ${words(CLAUSE_TEXT)}`;
    if (!fast) p.classList.add('is-typing');   // in place but unseen, so the camera can frame it first
    after.after(p);
    if (fast) return;
    await wordScrollTo(p, 0.3, 700);
    const lines = [];
    let top = null;
    p.querySelectorAll('.b-w').forEach((w) => {
      if (w.offsetTop !== top) { lines.push([]); top = w.offsetTop; }
      lines[lines.length - 1].push(w);
    });
    lines.forEach((ln, i) => later(() => ln.forEach((w) => w.classList.add('is-on')), (i / lines.length) * INSERT_MS * MOTION));
    await motion(INSERT_MS + 150);
    p.classList.remove('is-typing');
  }

  function showFixes(els) {
    els.forEach((f) => {
      f.hidden = false;
      const only = f.closest('[data-fixonly]');
      if (only) only.hidden = false;
    });
  }

  // The names in the fix arrive as placeholders; on the laptop they turn back into the real names, in green.
  function restoreNames(els, flash = true) {
    els.forEach((f) => f.querySelectorAll('.b-name').forEach((n) => {
      n.textContent = n.dataset.v;
      n.classList.remove('zs-ph');
      if (flash) n.classList.add('b-back');
    }));
  }

  // ---------- The beats, in story order ----------
  // A beat that waited on the screen library goes on only if its own run is still live (a skip or the
  // story's end cancels it, and the screen it would touch may already be the post-intro one).
  let storyRun = null;
  const alive = () => check(storyRun);
  // Local work first; one masked cloud review at the end; the cloud never speaks.

  // 1. The laptop opens on Word and the term sheet. Wi-Fi off, and ZOE recognises the document.
  async function beatOpen() {
    mountDesk();
    loadAgreement();
    desk.setApp('word');
    desk.word.setDocument(termSheetDoc(), { title: 'Term Sheet', pages: 2 });
    desk.word.setZoom(100);
    desk.word.setPane('home', { docType: 'Term Sheet', parties: [PARTIES.seller.real.toUpperCase(), PARTIES.buyer.real.toUpperCase()], similar: 4 }, { instant: true });
    await beat(250);
    setWifi(false);                                // OFF before any ZOE line; the callout comes up and stays
    await beat(200);
    camera(geo.portrait ? 'zoom' : 'read');
    await think('wifiOff', false);
    zoe.classList.add('is-in');
    await readingLayout(true, ZOOM_READ);
    alive();
  }

  // 2. The term sheet: the page runs down and the critical terms light up yellow. One line, no list.
  async function beatIdentify() {
    setAct(3);
    zoeWorking(true);
    const scan = zoeSay('scan', false);
    await findIdentifiers();
    await scan;
    zoeWorking(false);
    track('identified');
    if (RM) await gesture('identified', 0, async () => {});
    readingLayout(false, 100);
  }

  // 3. The vault, then the template search, a second each under one line; then the one template found,
  // and the visitor chooses it.
  const TEMPLATE_ONE = Object.assign({}, TEMPLATE_SEARCH, { results: TEMPLATE_SEARCH.results.slice(0, 1) });
  async function beatVault() {
    clearThoughts();
    zoeWorking(true);
    desk.cockpit.setView('documents', { count: VAULT_FOUND }, { instant: true });
    await desk.setApp('safari');
    alive();
    const searching = zoeSay('search', false);
    await beat(450);
    desk.cockpit.setView('templates', { loading: true });
    await beat(450);
    await searching;
    zoeWorking(false);
    await desk.cockpit.setView('templates', Object.assign({}, TEMPLATE_ONE, { choose: true }));
    alive();
    cockpitShow(ctaTarget('template'));
    await zoeSay('foundTpl', false);
    await clickGate('template', 'Choose template');
  }

  // 4. Drafting: one spinner turn, then Word with the draft already filled in (its terms yellow).
  async function beatDraft() {
    desk.cockpit.setView('templates', Object.assign({}, TEMPLATE_ONE, { choose: 'drafting' }));
    zoeWorking(true);
    const drafting = zoeSay('drafting', false);
    await loadAgreement();
    check();
    desk.word.setDocument(agreementDoc(), { title: 'Agreement and Plan of Merger', pages: 13 });
    desk.word.pageEl.querySelectorAll('.b-fill').forEach((el) => fillOne(el));
    desk.word.setZoom(ZOOM_DRAFT);
    desk.word.setPaneOpen(true);
    desk.word.setPane('home', { docType: 'Agreement and Plan of Merger', parties: [PARTIES.buyer.real.toUpperCase(), PARTIES.seller.real.toUpperCase()], similar: 3, suggestions: TWO_PARTY_SUGGESTIONS }, { instant: true });
    await motion(900);
    await drafting;
    zoeWorking(false);
    await desk.setApp('word');
    alive();
    await beat(100);
  }

  // 5. The anti-sandbagging clause: found at once, and the visitor inserts it; it lands at the end of
  // Article IX as a red tracked insertion.
  async function beatClause() {
    const asking = think('sandbag', false);
    const page = desk.word.pageEl;
    await readingLayout(true, ZOOM_CLAUSE);
    alive();
    await wordScrollTo(page.querySelector('[data-id="art9end"]'), 0.3, 700);
    alive();
    await asking;
    zoeWorking(true);
    await zoeSay('findClause', false);
    await beat(250);
    zoeWorking(false);
    desk.word.setPane('clauseFound', Object.assign(clauseCard(), { where: 'Below ¶ this paragraph' }));
    await zoeSay('clauseFound', false);
    await clickGate('insert', 'Insert');
    await insertClause(false);
    desk.word.setPane('afterInsert', Object.assign(clauseCard(), { where: 'below ¶ this paragraph' }));
    await beat(100);
  }

  // 6. One cloud review: a dialog over Word with one button, and the visitor scrubs and sends.
  async function beatPropose() {
    clearThoughts();
    zoe.classList.remove('is-in');                 // the dialog speaks for itself
    if (desk.word.setDialog) desk.word.setDialog({ title: 'Cloud AI review', body: 'Send this draft to cloud AI for review.', button: 'Scrub and send to cloud' });
    await clickGate('scrub', 'Scrub and send to cloud');
    if (desk.word.setDialog) desk.word.setDialog(null);
  }

  // 7. The scrub plays at the top of the draft (yellow terms to placeholders), the scrubbed copy goes out and
  // the answer comes back, with Wi-Fi on only for the exchange.
  async function beatReview() {
    setAct(4);
    await topOfDraft(500);
    alive();
    scrubDraft();
    track('scrubbed');
    $('.zoe-say', zoe).textContent = '';
    zoe.classList.add('is-in');
    const scrubbed = zoeSay('scrubSend', false);
    await motion(600);
    await scrubbed;
    if (!geo.portrait) {
      zoe.classList.remove('is-in');
      await beat(100);
    }
    clearStrip();
    camera('slide');                               // the cloud waits on the right (above, on phones), silent
    zoe.classList.add('is-in');
    cloud.classList.add('is-in');
    stackPages();
    await beat(100);
    setWifi(true);                                 // ON for the exchange only
    await beat(80);
    stream.classList.add('is-on', 'is-out');
    label.classList.add('is-on');
    track('reached_cloud');
    await flyPages();
    if (RM) await gesture('review', 0, async () => {});
    stream.classList.remove('is-out');
    cloud.classList.add('is-busy');
    await motion(700);                             // the review: silent
    stream.classList.add('is-back');
    await motion(600);
    stream.classList.remove('is-back');
    setWifi(false);                                // OFF again the moment the answer is in
    cloud.classList.remove('is-busy');
    cloud.classList.add('is-out');
    stream.classList.remove('is-on');
    label.classList.remove('is-on');
    camera(geo.portrait ? 'zoom' : 'read');
    await beat(100);
  }

  // 8. The review's change lands, still in placeholders: the parent joins as a party (the parties clause,
  // then Article V). Every edit is a red tracked insertion; Article IX is not in view from here on.
  async function beatApply() {
    setStep(4.5);
    await desk.setApp('word');
    alive();
    const page = desk.word.pageEl;
    const fixes = Array.from(page.querySelectorAll('.b-fix'));
    const art5 = page.querySelector('[data-id="art5"]');
    // The cover, the parties clause and recital B; Article IV's lead-in; Article V; the signature page.
    const art4lead = page.querySelector('[data-id="art4lead"]');
    const before = (a, f) => a && (a.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_PRECEDING);
    const early = fixes.filter((f) => before(art4lead, f));
    const art4 = fixes.filter((f) => art4lead && art4lead.contains(f));
    const five = fixes.filter((f) => !early.includes(f) && !art4.includes(f) && f.closest('[data-id^="art5"]'));
    const rest = fixes.filter((f) => !early.includes(f) && !art4.includes(f) && !five.includes(f));
    desk.word.setPane('home', { docType: 'Agreement and Plan of Merger', parties: [PARTIES.parent.mask, PARTIES.buyer.mask, PARTIES.seller.mask], similar: 3 });
    showFixes(early);
    await motion(700);
    if (art5) {
      showFixes(art4);                             // "to Parent and Merger Sub", passed on the way down
      await wordScrollTo(art5, 0.15, 600);
      alive();
      showFixes(five);
      await motion(700);
    }
    showFixes(rest);                               // the signature page, off camera
  }

  // The parties clause in view: the top of the agreement, the cover and the preamble.
  function topOfDraft(ms) {
    return desk.word.scrollTo(0, RM ? 0 : ms * MOTION);
  }

  // 9. The names come back: every placeholder turns back into the real name, address or date, a brief green
  // flash settling in the same yellow as before the scrub.
  async function beatRestore() {
    await topOfDraft(500);
    alive();
    desk.word.setPane('home', { docType: 'Agreement and Plan of Merger', parties: [PARTIES.parent.real.toUpperCase(), PARTIES.buyer.real.toUpperCase(), PARTIES.seller.real.toUpperCase()], similar: 3 });
    restoreAll(true);
    track('restored');
    await zoeSay('applied', false);
    await motion(600);
    if (RM) await gesture('act5', 0, async () => {});
  }

  // Brings an element of the cockpit's page well into view (the desk is drawn scaled, so screen pixels are
  // converted back to the page's own).
  function cockpitShow(el) {
    const sc = desk.cockpit.scrollEl;
    if (!el || !sc) return;
    const box = sc.getBoundingClientRect();
    const k = box.height / (sc.clientHeight || 1) || 1;
    const r = el.getBoundingClientRect();
    if (r.bottom <= box.bottom - 0.15 * box.height) return;
    sc.style.scrollBehavior = 'auto';
    sc.scrollTop += (r.bottom - box.bottom) / k + 0.3 * sc.clientHeight;
    sc.style.scrollBehavior = '';
  }

  // ---------- The visitor's three clicks ----------
  // The story stops on a glowing button in the screen (screens.js draws it, marked data-cta) and goes on
  // when the visitor clicks or taps it, or presses Enter or Space. The click lands on a real <button> laid
  // over the drawn one, at least 44 px each way, so a phone's small screen still has a fair target. After
  // CLICK_IDLE_MS without a click a pointer glides to the button and clicks it, about 3 s after it showed.
  const CLICK_IDLE_MS = 2200;
  const CTA_MIN = 44;
  let ctaGate = null;   // { name, btn, raf }
  const ctaTarget = (name) => (desk && desk.el ? desk.el.querySelector(`[data-cta="${name}"]`) : null);
  function placeCta() {
    const g = ctaGate;
    if (!g) return;
    const t = ctaTarget(g.name);
    const sr = stage.getBoundingClientRect();
    const r = t && t.getBoundingClientRect();
    const has = !!(r && r.width && r.height);
    g.btn.classList.toggle('is-standalone', !has);   // no drawn button: the proxy shows itself
    if (has) {
      const w = Math.max(CTA_MIN, r.width);
      const h = Math.max(CTA_MIN, r.height);
      g.btn.style.width = `${w}px`;
      g.btn.style.height = `${h}px`;
      g.btn.style.transform = `translate(${(r.left - sr.left + (r.width - w) / 2).toFixed(1)}px, ${(r.top - sr.top + (r.height - h) / 2).toFixed(1)}px)`;
    } else {
      const s = screen.getBoundingClientRect();
      g.btn.style.width = '';
      g.btn.style.height = '';
      g.btn.style.transform = `translate(${(s.left - sr.left + s.width / 2).toFixed(1)}px, ${(s.top - sr.top + s.height / 2).toFixed(1)}px) translate(-50%, -50%)`;
    }
    g.raf = requestAnimationFrame(placeCta);
  }
  function clearCta() {
    if (!ctaGate) return;
    cancelAnimationFrame(ctaGate.raf);
    ctaGate.btn.remove();
    ctaGate = null;
    ctaPointer.classList.remove('is-on');
  }
  const ctaPointer = document.createElement('div');
  ctaPointer.className = 'cta-pointer';
  ctaPointer.setAttribute('aria-hidden', 'true');
  ctaPointer.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M5 2.5v17.2l4.6-4.3 3.1 6.9 2.9-1.3-3.1-6.8h6.3z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  stage.appendChild(ctaPointer);
  // The unattended click: the pointer comes in from below right, rests on the button, presses.
  async function autoPointer() {
    const g = ctaGate;
    if (!g) return;
    const sr = stage.getBoundingClientRect();
    const r = g.btn.getBoundingClientRect();
    const to = { x: r.left - sr.left + r.width / 2 - 4, y: r.top - sr.top + r.height / 2 - 3 };
    const from = { x: to.x + 70, y: to.y + 90 };
    ctaPointer.style.transform = `translate(${from.x}px, ${from.y}px)`;
    ctaPointer.classList.add('is-on');
    await animate(ctaPointer, [{ transform: `translate(${from.x}px, ${from.y}px)` }, { transform: `translate(${to.x}px, ${to.y}px)` }], { duration: 650, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' });
    ctaPointer.style.transform = `translate(${to.x}px, ${to.y}px)`;
    await animate(ctaPointer, [{ transform: `translate(${to.x}px, ${to.y}px) scale(1)` }, { transform: `translate(${to.x}px, ${to.y}px) scale(0.82)` }, { transform: `translate(${to.x}px, ${to.y}px) scale(1)` }], { duration: 220 });
  }
  async function clickGate(name, label) {
    clearCta();
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cta-hit';
    btn.dataset.gate = name;
    btn.setAttribute('aria-label', label);
    btn.innerHTML = `<span class="cta-label">${esc(label)}</span>`;
    stage.appendChild(btn);
    ctaGate = { name, btn, raf: 0 };
    placeCta();
    try {
      await gesture(name, CLICK_IDLE_MS, async (method) => {
        if (method === 'auto') await autoPointer();
        const t = ctaTarget(name);
        if (t) t.classList.add('is-pressed');
        track('cta', { gate: name, method });
        await wait(160, false);
      }, btn);
    } finally {
      clearCta();
    }
  }

  // ---------- Pills, inspect, replay ----------

  let inspectOpen = false;

  function pill(text, cls, onClick, href) {
    const el = document.createElement(href ? 'a' : 'button');
    el.className = `pill ${cls || ''}`;
    el.textContent = text;
    if (href) el.href = href; else el.type = 'button';
    el.addEventListener('click', onClick);
    pills.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-in'));
    return el;
  }

  function nextPill(onNext) {
    pills.innerHTML = '';
    const el = pill(UI.pills.next, 'is-main', () => {
      el.remove();
      onNext();
    });
    if (keyboardMode) el.focus({ preventScroll: true });
  }

  // ---------- Leaving the introduction: the skip control, or the story's own end ----------
  // The story stops wherever it is; every act piece is put away, the laptop stays open with its screen
  // up, the page scrolls again, and <html> gets `intro-done` (the site's navigation keys off it).
  // Replay (start) removes it.
  let introDone = false;
  function exitIntro(reason) {
    if (introDone) return;
    introDone = true;
    track('intro_exit', { reason, act });
    // The run stays cancelled: a story step still waiting on the screen library must not resume on the
    // new screen (Replay, via start(), begins a fresh run).
    cancelRun();
    if (!storyEndedAt) storyEndedAt = performance.now();
    stage.classList.add('is-resetting');
    // The act pieces: chat, phone, paper, ZOE, the cloud and the stream.
    strip.innerHTML = '';
    stripTo(null);
    [fly, transfer].forEach((el) => el.getAnimations && el.getAnimations().forEach((a) => a.cancel()));
    transfer.style.opacity = '0';
    phone.hidden = true;
    sheet.classList.add('is-gone');
    buildZoe();
    buildCloud();
    buildFan();
    stream.className = 'stream';
    label.className = 'stream-label';
    if (inspectOpen) { inspectOpen = false; inspect.hidden = true; inspect.className = 'inspect'; inspect.innerHTML = ''; }
    // The laptop: in, open, its screen on.
    phoneStage = 2;
    laptopReady = true;
    stage.classList.add('laptop-in', 'cue-off');
    stage.dataset.open = 'done';
    setLidArmed(false);
    cancelTween();
    drag = null;
    pendingOpen = null;
    lidDone = 'opening';
    progress = 1;
    shownFrame = -1;
    render();
    restingScreen();
    setAct(6);
    unlockHero();
    root.classList.add('intro-done');
    watchCompare();
    const hadFocus = document.activeElement === skipBtn;
    showPost();
    if (hadFocus || keyboardMode) {
      const h = $(`.ability[data-id="${abilityNow}"] h3`, abilitiesEl);
      if (h) h.focus({ preventScroll: true });
    }
    void stage.offsetWidth;
    requestAnimationFrame(() => stage.classList.remove('is-resetting'));
  }

  function openInspect() {
    track('pill_inspect');
    inspectOpen = true;
    const realDoc = TERM_SHEET.map(([k, v]) => `<p><b>${esc(k)}:</b> ${piiHtml(v)}</p>`).join('');
    const maskDoc = TERM_SHEET.map(([k, v]) => `<p><b>${esc(k)}:</b> ${piiHtml(v, 'mask')}</p>`).join('');
    inspect.innerHTML = `
      <h2 class="insp-h">What left the laptop</h2>
      <div class="insp-cols">
        <section class="insp-col">
          <h3>On the laptop · the real term sheet</h3>
          <div class="insp-doc">${realDoc}</div>
        </section>
        <section class="insp-col is-out">
          <h3>Received by the cloud AI</h3>
          <div class="insp-doc">${maskDoc}</div>
          <ul class="insp-list">
            <li><b>Also sent:</b> ${esc(UI.template[0])} · ${esc(UI.template[1])}; ${esc(UI.playbook[0])} · ${esc(UI.playbook[1])}</li>
            <li><b>Request:</b> Review this draft.</li>
          </ul>
        </section>
      </div>
      <ol class="timeline" aria-label="Wi-Fi timeline">
        <li class="off">Wi-Fi OFF · Air-gapped</li>
        <li class="off">Critical information found</li>
        <li class="off">Scrubbed</li>
        <li class="on">Wi-Fi ON</li>
        <li class="on">Scrubbed draft sent</li>
        <li class="on">Review returned · names restored on the laptop</li>
      </ol>
      <div class="insp-back"></div>`;
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'pill is-main is-in';
    back.textContent = UI.pills.back;
    back.addEventListener('click', closeInspect);
    $('.insp-back', inspect).appendChild(back);
    inspect.hidden = false;
    void inspect.offsetWidth;
    inspect.classList.add('is-in');
    back.focus({ preventScroll: true });
  }

  function closeInspect() {
    inspectOpen = false;
    inspect.classList.remove('is-in');
    const t = setTimeout(() => { inspect.hidden = true; inspect.innerHTML = ''; }, RM ? 0 : 360);
    run.timers.add(t);
    const p = pills.querySelector('.pill:nth-child(2)');
    if (p) p.focus({ preventScroll: true });
  }

  // ---------- The story ----------

  // beat() is reading time (the gaps between lines and beats); wait() and motion() let an animation finish.
  async function story() {
    storyRun = run;
    // Act I — the ambush and the snap. A bare stage: the chat types dead centre, then makes room for the paper.
    setAct(1);
    await beat(200);
    await say('jimmy', 'jimmy1');
    await say('bob', 'bob1');
    await say('jimmy', 'jimmy2', false);
    await beat(300);
    stripTo('top');
    stage.dataset.open = 'sheet';
    layout();                                      // on portrait the paper sits under the strip's new place
    await wait(520);                               // the strip has mostly cleared the middle
    sheet.classList.add('is-in');
    await wait(1000);
    phone.classList.add('is-in');
    stage.dataset.open = 'phone';
    setCue();
    // Each gesture is armed as soon as its prompt appears; its idle clock starts then.
    await gesture('phone', IDLE_FIRST_MS, phoneAuto, phone);
    phone.setAttribute('tabindex', '-1');
    clearStrip('.msg:not(.think)');

    // Act II — open the laptop, pull the plug
    setAct(2);
    await wait(360);
    stripTo(null);                                 // the chat has gone; the strip is back to its own size
    const thoughts = think('snapped').then(() => think('noTrust', false));
    await transferDone;
    stage.dataset.open = 'done';
    camera('center');                              // the laptop glides to dead centre
    await wait(450);
    let g2 = Promise.resolve();
    if (!RM) {
      setLidArmed(true);
      stage.classList.remove('cue-off');
      g2 = gesture('lid', IDLE_LATER_MS, lidGesture, lidHit);
    }
    await Promise.all([thoughts, g2]);
    await beatOpen();      // 1. Word, the term sheet, Wi-Fi off
    await beatIdentify();  // 2. the critical terms light up yellow
    await beatVault();     // 3. vault and template search; click one: Choose template
    await beatDraft();     // 4. drafted: Word with the draft filled in
    await beatClause();    // 5. the clause found; click two: Insert
    await beatPropose();   // 6. click three: Scrub and send to cloud
    await beatReview();    // 7. the scrub, out and back, Wi-Fi on only for the exchange
    await beatApply();     // 8. the review's change lands, in placeholders
    await beatRestore();   // 9. the names come back, yellow

    // Act V — ten minutes are up
    setAct(5);
    cloud.classList.add('is-out');
    stream.classList.remove('is-on');
    label.classList.remove('is-on');
    zoe.classList.remove('is-in');
    clearStrip();
    camera(geo.portrait ? 'end' : 'home');
    await beat(300);
    await say('jimmy', 'jimmy3');
    await say('bob', 'bob3');
    await say('jimmy', 'jimmy4');
    await say('bob', 'bob4');
    await beat(600);
    storyEndedAt = performance.now();
    exitIntro('complete');
  }

  let storyStartedAt = 0;
  let storyEndedAt = 0;
  let storyStartedOnce = false;

  // ---------- After the introduction: the hero's own page ----------
  // The headline and subhead, and beside the laptop the description of the selected product ability, with
  // one screen per ability.
  const postHero = $('.post-hero', stage);
  const abilitiesEl = $('.abilities', stage);
  const abilityEls = Array.from(stage.querySelectorAll('.ability'));
  const ABILITY_IDS = ['word', 'templates', 'diligence', 'privacy'];

  const inWord = (pane, opts = {}) => async () => {
    const d = desk;
    await restingReady;
    if (desk !== d) return;
    desk.word.setPaneOpen(true);                  // the ZOE pane always shows beside Word
    desk.word.setZoom(opts.zoom || 100);
    if (pane) desk.word.setPane(pane, pane === 'insertPreview' ? Object.assign(clauseCard(), { where: 'Below \u00b6 this paragraph' }) : {}, { instant: true });
    const p = desk.word.pageEl.querySelector('[data-id="s93new"]');
    if (p) wordScrollTo(p, 0.2, 0);
    return desk.setApp('word');
  };
  const inCockpit = (view, focus) => () => {
    desk.cockpit.setView(view, {}, { instant: true });
    const el = focus && desk.cockpit.viewEl.querySelector(focus);
    if (el) desk.cockpit.scrollEl.scrollTop = Math.max(0, absTop(el) - absTop(desk.cockpit.scrollEl) - 12);
    return desk.setApp('safari');
  };
  // One screen per ability: Word on the tracked § 9.6 with the ZOE pane beside it; the
  // template search read as ideas with the 100% match; the diligence filters and matched passages; the
  // scrubbed copy.
  const ABILITY_VIEWS = {
    word: inWord(null, { zoom: ZOOM_CLAUSE }),   // the clause at the story's zoom, the pane open beside it
    templates: inCockpit('templates', '.zs-readas'),
    diligence: inCockpit('diligence'),
    privacy: inCockpit('scrubbed'),
  };

  let abilityNow = 'word';
  function showAbility(id) {                                  // a second argument (an old view index) is ignored
    if (!ABILITY_VIEWS[id]) return;
    abilityNow = id;
    if (!introDone) { exitIntro('ability'); return; }        // exitIntro shows this ability
    root.setAttribute('data-ability-current', id);
    abilityEls.forEach((sec) => { sec.hidden = sec.dataset.id !== id; });
    if (desk) ABILITY_VIEWS[id]();
    if (camMode === 'post') layout();
  }

  function placeAbilities(g) {
    if (camMode !== 'post' || !g.post) {
      stage.style.height = '';
      return;
    }
    const p = g.post;
    if (!g.portrait) {
      abilitiesEl.style.width = `${p.panelW}px`;
      const h = abilitiesEl.offsetHeight;
      const sh = p.sw * p.ratio;
      place(abilitiesEl, p.panelX, Math.max(p.top, p.top + (sh - h) / 2));
      stage.style.height = '';
    } else {
      const y = p.top + p.sw * p.ratio * (1 + p.below) + 6;
      place(abilitiesEl, 16, y, g.V - 32);
      // The description may run past the first screen on a phone: the stage grows to hold it.
      const need = y + abilitiesEl.offsetHeight + 48;   // clear of the stage's footnote
      stage.style.height = '';
      if (need > stage.offsetHeight) stage.style.height = `${Math.ceil(need)}px`;
    }
  }
  // Its height can change after it is placed (text wrapping, a different ability): place it again.
  if ('ResizeObserver' in window) new ResizeObserver(() => { if (camMode === 'post' && geo) placeAbilities(geo); }).observe(abilitiesEl);

  function showPost() {
    postHero.hidden = false;
    stage.classList.add('is-post');
    showAbility(abilityNow);
    camera('post');
  }

  function hidePost() {
    postHero.hidden = true;
    stage.classList.remove('is-post');
    stage.style.height = '';
    root.removeAttribute('data-ability-current');
  }

  // Any element with data-ability (the navigation's menu, "Next") selects that ability: no jump, the hero
  // comes into view, and the address shows #wf-<id> without a new history entry.
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('[data-ability]');
    if (!a || !ABILITY_VIEWS[a.dataset.ability]) return;
    e.preventDefault();
    const id = a.dataset.ability;
    track('ability', { ability: id });
    showAbility(id);
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
    try { history.replaceState(null, '', `#wf-${id}`); } catch (_) { /* file: or sandboxed */ }
    if (keyboardMode || e.detail === 0) {
      const h = $(`.ability[data-id="${id}"] h3`, abilitiesEl);
      if (h) h.focus({ preventScroll: true });
    }
  });

  // #wf-word, #wf-templates, #wf-diligence, #wf-privacy: the post-intro page with that ability selected.
  const wfHash = () => {
    const m = /^#wf-(word|templates|diligence|privacy)$/.exec(location.hash);
    return m ? m[1] : null;
  };
  window.addEventListener('hashchange', () => {
    const id = wfHash();
    if (id) {
      showAbility(id);
      window.scrollTo(0, 0);
    }
  });

  function start() {
    cancelRun();
    run = { id: run.id + 1, cancelled: false, timers: new Set() };
    introDone = false;
    if (!neverLocks) root.classList.remove('intro-done');
    phoneStage = 0;
    locked = false;
    phoneDrag = null;
    phoneOff = { x: 0, y: 0 };
    inspectOpen = false;
    storyStartedAt = performance.now();
    storyEndedAt = 0;
    resetStage();
    const wf = !storyStartedOnce && wfHash();
    storyStartedOnce = true;
    if (wf) {
      abilityNow = wf;
      exitIntro('link');
      return;
    }
    story().catch((e) => { if (!(e instanceof Cancelled)) console.error(e); });
  }

  // ---------- Go ----------

  window.addEventListener('resize', () => {
    measureTagline();
    if (shownFrame >= 0) dimTagline(shownFrame);
    placeStrip();
    layout();
  });

  // Deep-dive reached: the drawer below the hero scrolls into view.
  if ('IntersectionObserver' in window) {
    const below = document.getElementById('dataflow');
    const io = new IntersectionObserver((entries) => {
      if (!heroLocked && entries.some((en) => en.isIntersecting)) {
        track('deep_dive_reached');
        io.disconnect();
      }
    }, { threshold: 0.3 });
    if (below) io.observe(below);
  }

  // The comparison's script loads when the visitor heads there (or, when the page is not locked,
  // when its section comes near), so it never competes with first paint.
  const flow = document.getElementById('dataflow');
  let compareLoad = null;
  function loadCompare() {
    if (!compareLoad) {
      compareLoad = new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = 'compare.js';
        s.onload = resolve;
        s.onerror = resolve;
        document.body.appendChild(s);
      });
    }
    return compareLoad;
  }
  // The comparison loads as its section comes near, once the page can scroll: at load when the hero
  // never locks (reduced motion, a deep link), otherwise when the introduction is left (exitIntro).
  let compareWatched = false;
  function watchCompare() {
    if (!flow || compareWatched) return;
    compareWatched = true;
    if ('IntersectionObserver' in window) {
      const cmpIo = new IntersectionObserver((entries) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        cmpIo.disconnect();
        loadCompare();
      }, { rootMargin: '800px 0px' });
      cmpIo.observe(flow);
    } else {
      loadCompare();
    }
  }
  if (!heroLocked) watchCompare();

  // `Why is ZOE AI different?`: unlock the page and land on the comparison, heading at the top,
  // with Standard cloud AI chosen and playing.
  async function toComparison() {
    unlockHero();
    const heading = document.getElementById('flow-h');
    if (heading) {
      const navH = parseFloat(getComputedStyle(root).getPropertyValue('--nav-h')) || 60;
      const gap = root.classList.contains('intro-done') ? Math.max(LAND_GAP, navH + 16) : LAND_GAP;
      const top = heading.getBoundingClientRect().top + window.scrollY - gap;
      window.scrollTo({ top, behavior: RM ? 'auto' : 'smooth' });
    }
    await loadCompare();
    if (window.__zoeCompare) window.__zoeCompare.pick('cloud');
  }

  // Privacy and Terms are :target modals; Escape closes them.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && /^#(privacy|terms)$/.test(location.hash)) location.hash = 'site-footer';
  });

  // "Skip introductory illustration": it shows once the lid is open and the local work begins (see
  // setAct), and one press leaves the introduction for the site.
  const skipBtn = $('.skip-step', stage);
  skipBtn.addEventListener('click', (e) => {
    e.preventDefault();
    exitIntro('skip');
  });

  start();

  // Exposed for tools/shots.spec.js and for tuning in the console.
  window.__zoeHero = {
    get act() { return act; },
    get step() { return step; },
    get gesture() { return gestureNow ? gestureNow.name : (RM && pills.querySelector('.pill') ? 'next' : null); },
    get progress() { return progress; },
    get framesReady() { return allReady; },
    get frameSet() { return frameSet; },
    get ended() { return storyEndedAt ? Math.round(storyEndedAt - storyStartedAt) : 0; },
    get camera() { return camMode; },
    get opening() { return stage.dataset.open || ''; },
    perform: (method = 'debug') => gestureNow && gestureNow.perform(method),
    inspect: () => openInspect(),
    toComparison: () => toComparison(),
    get locked() { return heroLocked; },
    get introDone() { return introDone; },
    skip: () => exitIntro('debug'),
    get shutterArmed() { return locked; },
    replay: start,
    showAbility: (id) => showAbility(id),
    get ability() { return introDone ? abilityNow : null; },
  };
})();
