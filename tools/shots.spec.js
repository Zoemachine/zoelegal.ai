// Drives the five-act hero at both viewports: screenshots into shots/<project>-<name>.png,
// measurements into shots/<project>-metrics.json, a WebM of the untouched run, and
// the acceptance rows that can be checked in emulation.
const fs = require('fs');
const path = require('path');
const base = require('@playwright/test');
const { expect } = base;

// No test may send a real message. Every request to the form relay (formsubmit.co) and to the Google Apps Script
// host is answered here and never leaves the machine; `blocked` lists what was caught, so a test that reaches a
// submit can assert the request was blocked. Applied to every context the tests create.
const LIVE_FORMS = /(^|\/\/|\.)(formsubmit\.co|script\.google\.com|script\.googleusercontent\.com)(\/|:|$)/;
async function blockLiveForms(ctx) {
  const blocked = [];
  await ctx.route(LIVE_FORMS, (r) => {
    const req = r.request();
    blocked.push({ url: req.url(), method: req.method(), body: req.postData() || '' });
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: 'true', message: 'Blocked by the test.' }) });
  });
  return blocked;
}
// The default context of every `page` fixture is guarded; tests that open their own context call newGuardedContext().
const test = base.test.extend({
  context: async ({ context }, use) => {
    context.blockedForms = await blockLiveForms(context);
    await use(context);
    expect(context.blockedForms, 'a test submitted a form: the request was blocked, but no test should reach a submit').toEqual([]);
  },
});
async function newGuardedContext(browser, options) {
  const ctx = await browser.newContext(options);
  ctx.blockedForms = await blockLiveForms(ctx);
  return ctx;
}

const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(ROOT, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8000/';

const shot = (page, info, name) =>
  page.screenshot({ path: path.join(SHOTS, `${info.project.name}-${name}.png`) });
const hero = (page, prop) => page.evaluate((p) => window.__zoeHero[p], prop);
const isWide = (info) => info.project.name === 'wide';

// Restricted words for the page, its CSS, its JS and their comments, kept out of the public repo in an untracked file.
// tools/restricted-words.local.json (listed in .gitignore): a JSON array of {"re": "<regex source>", "cs": <true if case-sensitive>}.
const RESTRICTED_FILE = path.join(__dirname, 'restricted-words.local.json');
const RESTRICTED = fs.existsSync(RESTRICTED_FILE) ? JSON.parse(fs.readFileSync(RESTRICTED_FILE, 'utf8')) : null;
// The hero's one device: allowed in the hero's Act I text (its no-JS line), forbidden below the hero and on the other pages.
const PHONE = JSON.parse(Buffer.from('eyJyZSI6ICJcXGJwaG9uZXM/XFxiIiwgImFsbG93ZWRUZXh0IjogWyJ0aGUgcGhvbmUgaGFuZHMgaXQgdG8gdGhlIGxhcHRvcCJdfQ==', 'base64').toString());
// Product names: the four frontier products under the cloud, in hero.js's PROVIDERS block and nowhere else.
const PRODUCTS = JSON.parse(Buffer.from('eyJhbGxvd2VkSW4iOiAiaGVyby5qcyIsICJmcm9tIjogIi8vIFRoZSBjbG91ZCBBSSBtb2RlbHMgbmFtZWQgdW5kZXIgdGhlIGNsb3VkIiwgInRvIjogIl07IiwgImFsbG93ZWQiOiBbIkNoYXRHUFQiLCAiQ2xhdWRlIiwgIkdlbWluaSIsICJDb3BpbG90Il0sICJmb3JiaWRkZW4iOiBbIlxcYkdQVC0/XFxkIiwgIlxcYkxsYW1hXFxiIiwgIlxcYk1pc3RyYWxcXGIiLCAiXFxiR3Jva1xcYiIsICJcXGJCYXJkXFxiIiwgIlxcYkRlZXBTZWVrXFxiIl19', 'base64').toString());
// Allowed in the comparison's Standard cloud AI panel and nowhere else: its layout block
// in compare.js, from PANEL_FROM to PANEL_TO, is the one place they may appear.
const PANEL_ONLY = JSON.parse(Buffer.from('W3sicmUiOiAiXFxiUkFHXFxiIiwgImNzIjogdHJ1ZX0sIHsicmUiOiAiXFxiTExNXFxiIiwgImNzIjogdHJ1ZX0sIHsicmUiOiAiXFxiSVNQXFxiIiwgImNzIjogdHJ1ZX0sIHsicmUiOiAic3VicHJvY2Vzc29yIiwgImNzIjogZmFsc2V9XQ==', 'base64').toString());
const PANEL_FROM = '// Standard cloud AI: the chain';
const PANEL_TO = 'const ZOE = {';
// The clause is a plain insertion (Section 9.6, after Article IX's last section); nothing is ever struck.
const CLAUSE_TEXT = 'Section 9.6 Knowledge; No Sandbagging. Notwithstanding anything in this Agreement to the contrary, no Buyer Indemnified Party may recover any Losses for the breach of a representation or warranty of the Company if Merger Sub had actual knowledge of that breach before the Closing. For this purpose, actual knowledge means the awareness of the facts constituting the breach by any individual named as a member of Merger Sub\'s deal team in the Disclosure Schedule. A Buyer Indemnified Party that elects to close with that knowledge waives all claims for that breach. This Section does not limit recovery for Fraud.';
// The spoken lines after the laptop opens, in order (the product's lines carry the label "ZOE AI"), then the unchanged close.
const STORY_AFTER_LID = [
  'ZOE AI: Finding critical information in the term sheet.',
  'ZOE AI: Searching the vault for relevant information and potential templates.',
  'ZOE AI: Found a potential template.',
  'ZOE AI: Drafting document.',
  'Bob (thinking): Not bad for a first draft. But I need an anti-sandbagging clause.',
  'ZOE AI: Finding the clause.',
  'ZOE AI: Found. Ready for you to insert.',
  'ZOE AI: Scrubbed. Sending to cloud AI.',
  'ZOE AI: Review applied. Names restored.',
  "Jimmy: Ten minutes. Tell me you've got something.", "Bob: Draft's done. And their shell left the parent off the hook. It's in now.", 'Jimmy: …How?', 'Bob: ZOE AI.',
];
// Wording that no shipped file may carry any more (apostrophes normalised before the search).
const DELETED_WORDING = [
  'Looks like a term sheet. Finding the names, addresses, dates and ID numbers.', 'Key terms identified.', 'Searching 35,263 vault files',
  'Found 128 files on this client in your vault.', "Searching 2,500 of your firm's golden templates", "Loaded your firm's merger agreement template and the conservative seller playbook.",
  "Conservative to start. We'll see what they come back with.", "Filling in your firm's template from the term sheet.", 'Searching your local secure clause library',
  'Top 10 matches.', "That's the one. Perfect.", 'Inserting now.', 'One last check before it goes out', 'Scrubbing the draft first.',
  'Nothing has left this laptop yet', 'Adding 25 paragraphs from 6 vault files', "Wi-Fi no longer needed", 'The review flags:', 'Your vault agrees:',
  "Applying the review's change", 'Putting the real names back, on this laptop.', 'Caught it.',
];
// Dates are scrubbed to one token (and only while scrubbed); dollar amounts are never touched or highlighted.
const DATE_TOKEN = '[Month_Day_Year]';
const REAL_DATES = ['November 6, 2026', 'January 15, 2027', 'December 31, 2027'];
const AMOUNT_RE = /\$\d[\d,]*/g;
const SITE_FILES = ['index.html', 'styles.css', 'hero.js', 'agreement.js', 'compare.js', 'drawer.css', 'nav.css', 'pages.css', 'book-demo.html', 'nda.html',
  'tools/playwright.config.js', 'tools/make-site-images.js', 'tools/make-agreement.js', 'tools/record-gif.js'];
// Below the hero, in order: the comparison first.
const SECTIONS = ['triage', 'dataflow', 'evidence', 'why', 'how', 'founder', 'advisory', 'contact', 'site-footer'];

// All-caps words allowed on screen: AI and PII, plus names, mask tokens and emphasis that are not acronyms.
const CAPS_OK = new Set(['AI', 'PII', 'ZOE', 'LLC', 'LP', 'EIN', 'ORG', 'PERSON', 'ADDRESS', 'ON', 'OFF', 'NO',
  'THEIR', 'OFFICE', 'MINUTES', 'TERM', 'SHEET', 'MASKED', 'INFORMATION', 'MATTER',
  'ZE', 'ZEAI', 'IP', 'SCRUBBED', 'ID']); // ZE / ZEAI: the Z and the E either side of the turning O in ZOE's mark, and the "AI" under it, read as one run; IP: the subhead ("law firm IP"); ID: "ID numbers" (line 7)

async function open(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.__zoeHero && window.__zoeHero.act >= 1);
}

const waitGesture = (page, name, timeout = 30000) =>
  page.waitForFunction((n) => window.__zoeHero.gesture === n, name, { timeout });

// Performs gestures (as a tap or click) until the story reaches `name` or the end.
async function runTo(page, name) {
  for (;;) {
    const g = await hero(page, 'gesture');
    if (name && g === name) return;
    if (await hero(page, 'ended')) return;
    if (g) {
      if (g === 'lid') await page.waitForFunction(() => window.__zoeHero.framesReady, null, { timeout: 20000 });
      await page.evaluate(() => window.__zoeHero.perform('tap'));
    }
    await page.waitForTimeout(120);
  }
}

async function runToEnd(page) {
  await runTo(page, null);
  await page.waitForFunction(() => window.__zoeHero.ended > 0, null, { timeout: 120000 });
}

async function center(page, sel) {
  const b = await page.locator(sel).first().boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

// A touch drag on the touch viewport (real touch events through CDP), a mouse drag on the wide one.
async function startDrag(page, info, p) {
  if (info.project.use.hasTouch) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: p.x, y: p.y }] });
    return {
      move: (x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }),
      end: () => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
    };
  }
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  return { move: (x, y) => page.mouse.move(x, y), end: () => page.mouse.up() };
}

async function dragPath(d, from, to, steps) {
  for (let i = 1; i <= steps; i += 1) {
    await d.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
  }
}

async function tapAt(page, p) {
  if (await page.evaluate(() => matchMedia('(hover: none)').matches)) await page.touchscreen.tap(p.x, p.y);
  else await page.mouse.click(p.x, p.y);
}

async function lidPoint(page) {
  const box = await page.locator('.scene').boundingBox();
  return { x: box.x + box.width * 0.5, y: box.y + box.height * 0.66 };
}

async function toLid(page) {
  await open(page);
  await runTo(page, 'lid');
  await page.waitForFunction(() => window.__zoeHero.framesReady, null, { timeout: 20000 });
  await page.waitForTimeout(900); // the camera settles on the laptop
}

// Collects requestAnimationFrame intervals until stop() is called.
async function startFpsProbe(page) {
  await page.evaluate(() => {
    window.__fps = [];
    let last = performance.now();
    const tick = (now) => {
      window.__fps.push(now - last);
      last = now;
      if (window.__fpsOn) requestAnimationFrame(tick);
    };
    window.__fpsOn = true;
    requestAnimationFrame(tick);
  });
  return async () => page.evaluate(() => {
    window.__fpsOn = false;
    const d = window.__fps.slice(1);
    const avg = d.reduce((a, b) => a + b, 0) / d.length;
    const sorted = d.slice().sort((a, b) => a - b);
    return {
      frames: d.length,
      avg_fps: +(1000 / avg).toFixed(1),
      worst_frame_ms: +sorted[sorted.length - 1].toFixed(1),
      p95_frame_ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1),
    };
  });
}

// The lid: perform the phone gesture, then the lid's (a tap), the way runTo() does; the story then runs by itself.
async function openLid(page) {
  await runTo(page, 'lid');
  await page.waitForFunction(() => window.__zoeHero.framesReady, null, { timeout: 20000 });
  await page.evaluate(() => window.__zoeHero.perform('tap'));
}

// The laptop is open and the work has begun: Act III (the skip control appears here).
const waitWorking = (page, timeout = 15000) => page.waitForFunction(() => window.__zoeHero.act >= 3, null, { timeout });

// Samples the document and the Word window every 100 ms for the whole story: struck text and "[Reserved",
// the clause's text and whether it is in Word's window, and whether the ZOE pane is open inside the Word window.
async function startWatch(page) {
  await page.evaluate(() => {
    window.__watch = [];
    setInterval(() => {
      const bar = document.querySelector('.screen .zs-menubar');
      const pg = document.querySelector('.screen .zs-page');
      if (!bar || !pg) return;
      const word = /^Word /.test(bar.innerText.replace(/\s+/g, ' '));
      const win = document.querySelector('.screen .zs-word');
      const pane = document.querySelector('.screen .zs-pane');
      const canvas = document.querySelector('.screen .zs-canvas');
      const w = win && win.getBoundingClientRect();
      const pr = pane && pane.getBoundingClientRect();
      const cl = pg.querySelector('[data-id="s93new"]');
      const cr = cl && cl.getBoundingClientRect();
      const kr = canvas && canvas.getBoundingClientRect();
      const lit = (document.querySelector('.screen .zs-zpct') || {}).textContent;
      window.__watch.push({
        t: performance.now(), word,
        struck: pg.querySelectorAll('.zs-del, del, s, strike').length,
        reserved: /\[Reserved/.test(pg.textContent),
        clause: cl ? cl.textContent : null,
        typing: !!(cl && cl.classList.contains('is-typing')),
        inView: !!(cr && kr && cr.height > 0 && cr.bottom > kr.top + 1 && cr.top < kr.bottom - 1),
        back: pg.querySelectorAll('.b-back').length,
        ph: Array.from(pg.querySelectorAll('.zs-ph')).filter((e) => !e.closest('[hidden]')).length,
        fixVis: Array.from(pg.querySelectorAll('.b-fix')).filter((e) => !e.hidden && !e.closest('[hidden]')).length,
        pane: !!(pane && !pane.hidden && w && pr.width > 0.15 * w.width && pr.height > 0.4 * w.height), // relative: the phone draws the same desk scaled down
        paneIn: !!(pr && w && pr.left >= w.left - 1 && pr.right <= w.right + 1 && pr.top >= w.top - 1 && pr.bottom <= w.bottom + 1),
        zoom: lit,
        pinfo: pane ? { h: pane.hidden, d: getComputedStyle(pane).display, w: Math.round(pr.width), ht: Math.round(pr.height), l: Math.round(pr.left), r: Math.round(pr.right), ww: w ? [Math.round(w.left), Math.round(w.right)] : null } : null,
      });
    }, 100);
  });
}

// A click gate: a real button laid over the drawn glowing one. Checks its name, size and that nothing competes with it.
async function gateCheck(page, name, label) {
  await page.waitForFunction((n) => window.__zoeHero.gesture === n, name, { timeout: 40000 });
  const gate = page.locator(`.stage .cta-hit[data-gate="${name}"]`);
  await expect(gate).toBeVisible();
  expect(await gate.evaluate((e) => e.tagName)).toBe('BUTTON');
  expect(await gate.evaluate((e) => (e.getAttribute('aria-label') || e.textContent).trim())).toBe(label);
  const box = await gate.boundingBox();
  expect(box.width, `${name} gate width`).toBeGreaterThanOrEqual(43.5);
  expect(box.height, `${name} gate height`).toBeGreaterThanOrEqual(43.5);
  const seen = await page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]'); };
    return { hits: Array.from(document.querySelectorAll('.stage .cta-hit')).filter(vis).map((e) => e.dataset.gate), drawn: Array.from(document.querySelectorAll('.screen [data-cta]')).filter(vis).map((e) => e.dataset.cta) };
  });
  expect(seen.hits, 'one button at the gate').toEqual([name]);
  expect(seen.drawn, 'one drawn button at the gate').toEqual([name]);
  return gate;
}

// With nobody clicking, the gate lets the story go on by itself within a few seconds, a pointer pressing the button.
async function gateAuto(page, name) {
  const r = await page.evaluate((n) => new Promise((res) => {
    const t0 = performance.now();
    let pointer = false;
    const iv = setInterval(() => {
      if (document.querySelector('.cta-pointer.is-on')) pointer = true;
      if (window.__zoeHero.gesture !== n) { clearInterval(iv); res({ ms: performance.now() - t0, pointer }); }
    }, 40);
  }), name);
  expect(r.ms, `${name} gate presses itself after 6 to 11 s`).toBeGreaterThan(6000);
  expect(r.ms, `${name} gate presses itself after 6 to 11 s`).toBeLessThan(11000);
  expect(r.pointer, `${name}: the pointer pressed the button`).toBe(true);
  return r;
}

// Waits until the journal holds a spoken line containing `frag`.
const said = (page, frag, timeout = 60000) =>
  page.waitForFunction((f) => window.__journal.some((e) => e.k === 'line' && e.v.includes(f)), frag, { timeout });

const screenText = (page) => page.locator('.screen').innerText().then((t) => t.replace(/\s+/g, ' '));

// Collects page errors and console errors for the whole test.
function watchErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

// Logs Wi-Fi state changes (the enlarged callout) and spoken lines with timestamps.
async function startJournal(page) {
  await page.evaluate(() => {
    window.__journal = [];
    const log = (k, v) => window.__journal.push({ t: performance.now(), k, v });
    const live = document.getElementById('live');
    new MutationObserver(() => log('line', live.textContent)).observe(live, { childList: true, characterData: true, subtree: true });
    const callout = document.querySelector('.wifi-callout');
    let last = '';
    new MutationObserver(() => {
      const v = callout.classList.contains('is-on') ? 'on' : (callout.classList.contains('is-off') ? 'off' : '');
      if (v && v !== last) { last = v; log('wifi', v); }
    }).observe(callout, { attributes: true, attributeFilter: ['class'] });
  });
}

const metrics = {};
test.afterAll(async ({}, info) => {
  const file = path.join(SHOTS, `${info.project.name}-metrics.json`);
  const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  fs.writeFileSync(file, JSON.stringify(Object.assign(prev, metrics), null, 2));
});

test('restricted words: none in the page, CSS, JS or comments', async ({}, info) => {
  test.skip(!isWide(info), 'checked once');
  expect(RESTRICTED, 'tools/restricted-words.local.json is missing: copy tools/restricted-words.example.json and fill it in').not.toBeNull();
  const hits = [];
  for (const f of SITE_FILES) {
    let text = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/data:image\/webp;base64,[^"]+/, '');
    if (f === 'compare.js') {
      const a = text.indexOf(PANEL_FROM);
      const b = text.indexOf(PANEL_TO, a);
      expect(a).toBeGreaterThan(-1);
      text = text.slice(0, a) + text.slice(b);
    }
    RESTRICTED.concat(PANEL_ONLY).forEach(({ re, cs }) => {
      const m = text.match(new RegExp(re, cs ? 'g' : 'gi'));
      if (m) hits.push(`${f}: ${m[0]}`);
    });
  }
  expect(hits).toEqual([]);
  // "SPAC" names the wrong kind of deal for the demo: the agreement is a merger.
  // The founder's biography, below the hero, describes his own practice and is not part of the demo.
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const demo = [html.slice(0, html.indexOf('<!-- ============ Below the hero ============ -->')),
    ...['hero.js', 'agreement.js', 'compare.js'].map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8'))].join('\n');
  expect(demo.match(/\bSPAC\b/g)).toBeNull();
});

test('product names: the four under the cloud, there and nowhere else', async ({}, info) => {
  test.skip(!isWide(info), 'checked once');
  const hits = [];
  for (const f of SITE_FILES) {
    let text = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/data:image\/webp;base64,[^"]+/, '');
    if (f === PRODUCTS.allowedIn) {
      const a = text.indexOf(PRODUCTS.from);
      const b = text.indexOf(PRODUCTS.to, a);
      expect(a).toBeGreaterThan(-1);
      text = text.slice(0, a) + text.slice(b);
    }
    PRODUCTS.allowed.concat(PRODUCTS.forbidden).forEach((w) => {
      const re = new RegExp(w.startsWith('\\') ? w : `\\b${w}\\b`, 'g');
      const m = text.match(re);
      if (m) hits.push(`${f}: ${m[0]}`);
    });
  }
  expect(hits).toEqual([]);
});

test('phone: named in the hero\'s Act I text and nowhere else', async ({}, info) => {
  test.skip(!isWide(info), 'checked once');
  const re = new RegExp(PHONE.re, 'gi');
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const below = html.slice(html.indexOf('<section class="sec" id="how"'));
  expect(below.match(re) || []).toEqual([]);
  for (const f of ['book-demo.html', 'nda.html', 'pages.css']) {
    expect(fs.readFileSync(path.join(ROOT, f), 'utf8').match(re) || []).toEqual([]);
  }
  // In the page's text and labels (class names and code aside), the allowed lines are the only mentions.
  const text = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/\sclass="[^"]*"/g, '').replace(/<[^>]*?>/g, (tag) => (tag.match(/(?:aria-label|alt|title)="[^"]*"/g) || []).join(' '));
  let rest = text;
  PHONE.allowedText.forEach((t) => { rest = rest.split(t).join(''); });
  expect(rest.match(re) || []).toEqual([]);
});

const opacity = (page, sel) => page.$eval(sel, (el) => parseFloat(getComputedStyle(el).opacity));

test('Act I: a bare stage, the chat dead centre, then the strip moves and the paper and phone arrive', async ({ page }, info) => {
  await page.goto('/');
  const t0 = await page.evaluate(() => performance.now());
  const vp = page.viewportSize();
  // First paint: the small wordmark and no laptop.
  await page.waitForTimeout(300);
  expect(await opacity(page, '.scene')).toBe(0);
  expect(await opacity(page, '.brand')).toBe(1);
  await page.waitForFunction(() => {
    const m = document.querySelectorAll('.strip .msg');
    return m.length === 3 && m[2].textContent.endsWith('You have 10 MINUTES.');
  }, null, { timeout: 12000 });
  metrics.act1_chat_ms = Math.round((await page.evaluate(() => performance.now())) - t0);
  // The longer Act I lines of 2026-10-22 type in about 8.8 s at the same speed; the limit moved, not the pace.
  expect(metrics.act1_chat_ms).toBeLessThan(10000);
  const pops = await page.$$eval('.strip .em.is-pop', (els) => els.map((e) => e.textContent));
  expect(pops).toEqual(['THEIR OFFICE', '10 MINUTES']);
  // Dead centre, and larger than the strip's own size.
  await page.waitForTimeout(450);
  const c = await page.locator('.strip').boundingBox();
  expect(Math.abs(c.x + c.width / 2 - vp.width / 2)).toBeLessThan(24);
  expect(Math.abs(c.y + c.height / 2 - vp.height / 2)).toBeLessThan(90);
  metrics.act1_centre_bubble_px = await page.$eval('.strip .bubble', (el) => parseFloat(getComputedStyle(el).fontSize));
  expect(metrics.act1_centre_bubble_px).toBeGreaterThanOrEqual(isWide(info) ? 19 : 16.5);
  expect(await opacity(page, '.scene')).toBe(0);
  await shot(page, info, 'act1-chat-centre');
  // The strip shrinks to the top (top-left on desktop) and the paper comes down into the middle, the biggest thing there.
  await page.waitForFunction(() => window.__zoeHero.opening === 'sheet', null, { timeout: 4000 });
  await page.waitForTimeout(1400);
  const st = await page.locator('.strip').boundingBox();
  expect(st.y).toBeLessThan(isWide(info) ? 40 : 100);
  if (isWide(info)) expect(st.x).toBeLessThan(40);
  const sh = await page.locator('.sheet').boundingBox();
  expect(Math.abs(sh.x + sh.width / 2 - vp.width / 2)).toBeLessThan(30);
  if (isWide(info)) expect(sh.height).toBeGreaterThan(vp.height * 0.33);
  else expect(sh.width).toBeGreaterThan(vp.width * 0.5);
  await shot(page, info, 'act1-strip-moved');
  // The phone slides in, glowing, and the laptop is still not on stage.
  await page.waitForFunction(() => window.__zoeHero.opening === 'phone', null, { timeout: 4000 });
  await page.waitForTimeout(1300);
  await expect(page.locator('.phone')).toHaveClass(/is-in/);
  expect(await page.$eval('.phone-halo', (el) => el.getAnimations().length)).toBeGreaterThan(0);
  const ph = await page.locator('.phone').boundingBox();
  expect(sh.width * sh.height).toBeGreaterThan(ph.width * ph.height);
  expect(await opacity(page, '.scene')).toBe(0);
  await shot(page, info, 'act1-phone-in');
  await shot(page, info, 'act1');
  // The drag cue: on phones its arrow points at the paper, up and to the left; desktop's reads "Drag ←".
  if (info.project.use.hasTouch) {
    const a = await page.$eval('.phone-cue', (el) => parseFloat(el.style.getPropertyValue('--cue-a')));
    expect(a).toBeLessThan(-10);
    expect(a).toBeGreaterThan(-80);
    expect(await page.locator('.phone-cue').textContent()).toBe('Drag ');
    await expect(page.locator('.phone-cue .cue-arrow svg')).toHaveCount(1);
  } else {
    await expect(page.locator('.phone-cue')).toHaveText('Drag ←');
  }
  await page.locator('.phone').screenshot({ path: path.join(SHOTS, `${info.project.name}-act1-cue.png`) }).catch(() => {});
  // The term sheet describes the same deal as the agreement: a merger, not a stock purchase.
  await expect(page.locator('.sheet')).toContainText('Structure. Merger of a wholly owned subsidiary of Buyer with and into Seller, with Seller surviving; Seller\u2019s stockholders receive cash at closing.');
  await page.locator('.sheet').screenshot({ path: path.join(SHOTS, `${info.project.name}-act1-sheet-structure.png`) });
});

test('Act I: drag the phone onto the term sheet, press the shutter; the phone hands over by itself', async ({ page }, info) => {
  await open(page);
  await waitGesture(page, 'phone');
  await page.waitForTimeout(700);
  const from = await center(page, '.phone');
  const sheetC = await center(page, '.sheet');
  const sheetBox = await page.locator('.sheet').boundingBox();
  const d = await startDrag(page, info, from);
  // Half over the page's edge: the viewfinder shows the paper beneath, 1:1 and aligned with the real one.
  const edge = isWide(info)
    ? { x: sheetBox.x + sheetBox.width - 6, y: sheetC.y + 10 }
    : { x: sheetC.x + 8, y: sheetBox.y + sheetBox.height - 4 };
  await dragPath(d, from, edge, 16);
  await expect(page.locator('.phone')).not.toHaveClass(/is-snapped/);
  const viewBox = await page.locator('.phone-view').boundingBox();
  expect(Math.abs(viewBox.x - sheetBox.x)).toBeLessThan(3);
  expect(Math.abs(viewBox.y - sheetBox.y)).toBeLessThan(3);
  expect(Math.abs(viewBox.width - sheetBox.width)).toBeLessThan(3);
  await shot(page, info, 'act1-viewfinder');
  // Record whether the captured card flies on the bump.
  await page.evaluate(() => {
    const f = document.querySelector('.fly');
    window.__flew = false;
    const tick = () => { if (f.getAnimations().length) window.__flew = true; else requestAnimationFrame(tick); };
    tick();
  });
  await dragPath(d, edge, sheetC, 8);
  // Locked on: no picture yet; the phone settles, the box brightens, the shutter lights up.
  await page.waitForFunction(() => window.__zoeHero.shutterArmed && document.querySelector('.phone').classList.contains('shutter-armed'), null, { timeout: 3000 });
  await expect(page.locator('.phone')).not.toHaveClass(/is-snapped/);
  await d.end();
  await page.waitForTimeout(300);
  await shot(page, info, 'act1-locked');
  // Press the shutter.
  const shutter = await center(page, '.phone-shutter');
  await tapAt(page, shutter);
  await expect(page.locator('.phone')).toHaveClass(/is-snapped/);
  // The photo settles inside the phone, fully within its screen.
  await page.waitForTimeout(700);
  const shotBox = await page.locator('.phone-view').boundingBox();
  const scr2 = await page.locator('.phone-screen').boundingBox();
  expect(shotBox.x).toBeGreaterThanOrEqual(scr2.x - 1);
  expect(shotBox.x + shotBox.width).toBeLessThanOrEqual(scr2.x + scr2.width + 1);
  expect(shotBox.y + shotBox.height).toBeLessThanOrEqual(scr2.y + scr2.height + 1);
  await page.waitForTimeout(150);
  await shot(page, info, 'act1-snap');
  // Still holding the phone: the captured page shows in it, then the laptop slides in and the small wordmark goes.
  await page.waitForFunction(() => window.__zoeHero.opening === 'laptop-ready', null, { timeout: 5000 });
  await page.waitForTimeout(300);
  const scr = await page.locator('.phone-screen').boundingBox();
  const cap = await page.locator('.phone-view').boundingBox();
  expect(cap.x).toBeGreaterThan(scr.x);
  expect(cap.x + cap.width).toBeLessThan(scr.x + scr.width);
  expect(cap.width).toBeGreaterThan(scr.width * 0.6);
  expect(await opacity(page, '.phone-view')).toBe(1);
  expect(await opacity(page, '.scene')).toBe(1);
  expect(await opacity(page, '.brand')).toBeLessThan(0.05);
  await shot(page, info, 'act1-laptop-in');
  // No second drag: the phone goes to the laptop and bumps it by itself, and there is no `Drag` cue for it.
  expect(await opacity(page, '.phone-cue')).toBeLessThan(0.05);
  await page.waitForFunction(() => parseFloat(getComputedStyle(document.querySelector('.transfer')).opacity) > 0.95, null, { timeout: 4000 });
  await page.waitForTimeout(300);
  const px = await page.$eval('.transfer', (el) => parseFloat(getComputedStyle(el).fontSize));
  expect(px).toBeGreaterThanOrEqual(13);
  await shot(page, info, 'act1-transfer');
  await waitGesture(page, 'lid', 8000);
  await expect(page.locator('.phone')).toBeHidden({ timeout: 3000 });
  expect(await page.evaluate(() => window.__flew)).toBe(true);
});

test('Act I: locked on the page, Enter presses the shutter; left alone, the idle clock does', async ({ page }, info) => {
  test.setTimeout(240000);
  test.skip(!isWide(info), 'keyboard and idle checked once');
  for (const how of ['key', 'idle']) {
    await open(page);
    await waitGesture(page, 'phone');
    await page.waitForTimeout(700);
    const from = await center(page, '.phone');
    const to = await center(page, '.sheet');
    const d = await startDrag(page, info, from);
    await dragPath(d, from, to, 16);
    await d.end();
    await page.waitForFunction(() => window.__zoeHero.shutterArmed, null, { timeout: 3000 });
    const t0 = Date.now();
    if (how === 'key') {
      await page.locator('.phone').focus();
      await page.keyboard.press('Enter');
    }
    await page.waitForFunction(() => document.querySelector('.phone').classList.contains('is-snapped'), null, { timeout: 20000 });
    if (how === 'idle') {
      metrics.shutter_idle_ms = Date.now() - t0;
      expect(metrics.shutter_idle_ms).toBeGreaterThan(11000);
    }
  }
});

test('Act I: a tap on the phone performs both moves', async ({ page }) => {
  await open(page);
  await waitGesture(page, 'phone');
  await page.waitForTimeout(700);
  await tapAt(page, await center(page, '.phone'));
  await waitGesture(page, 'lid', 15000);
});

test('Act II: the lid scrubs under the finger, mid-scrub and open', async ({ page }, info) => {
  await toLid(page);
  await shot(page, info, 'act2');
  const p = await lidPoint(page);
  const d = await startDrag(page, info, p);
  const stop = await startFpsProbe(page);
  // Touch: 160 px past the slop = 50% of 320. A mouse opens the lid by itself from 50%, so it holds at 45%.
  const lift = info.project.use.hasTouch ? 160 : 144;
  await dragPath(d, p, { x: p.x, y: p.y - 8 }, 2);
  await dragPath(d, { x: p.x, y: p.y - 8 }, { x: p.x, y: p.y - 8 - lift }, 40);
  metrics.lid_scrub = await stop();
  const lag = await hero(page, 'progress');
  await page.waitForTimeout(400); // the lid catches up with the finger
  metrics.lid_trail = +lag.toFixed(3);
  const mid = await hero(page, 'progress');
  expect(mid).toBeGreaterThan(lift / 320 - 0.05);
  expect(mid).toBeLessThan(lift / 320 + 0.05);
  await shot(page, info, 'act2-midscrub');
  await d.end();
  await waitWorking(page);
  await page.waitForTimeout(1000);
  await shot(page, info, 'act2-open');
});

test('Act II, mouse: held past half the lift, the lid opens without a release; held below, it waits', async ({ page }, info) => {
  test.skip(!isWide(info), 'touch keeps the release rule');
  await toLid(page);
  const p = await lidPoint(page);
  const d = await startDrag(page, info, p);
  // Below the commit point, held: the lid stays where the hand left it.
  await dragPath(d, p, { x: p.x, y: p.y - 8 - 112 }, 20); // 35%
  await page.waitForTimeout(1500);
  expect(await hero(page, 'progress')).toBeLessThan(0.45);
  expect(await hero(page, 'gesture')).toBe('lid');
  // On to 55% and still held: it finishes opening by itself.
  await dragPath(d, { x: p.x, y: p.y - 8 - 112 }, { x: p.x, y: p.y - 8 - 176 }, 12);
  const t0 = Date.now();
  await page.waitForFunction(() => window.__zoeHero.progress === 1, null, { timeout: 4000 });
  metrics.lid_mouse_commit_ms = Date.now() - t0;
  await shot(page, info, 'act2-mouse-commit');
  await d.end();
  await waitWorking(page);
});

test('Act II: release below 40% snaps shut; a quick flick opens', async ({ page }, info) => {
  await toLid(page);
  const p = await lidPoint(page);
  let d = await startDrag(page, info, p);
  await dragPath(d, p, { x: p.x, y: p.y - 68 }, 14);
  await page.waitForTimeout(400);
  await d.end();
  await page.waitForTimeout(1400);
  expect(await hero(page, 'progress')).toBe(0);
  expect(await hero(page, 'gesture')).toBe('lid');
  d = await startDrag(page, info, p);
  await dragPath(d, p, { x: p.x, y: p.y - 75 }, 3);
  await d.end();
  await waitWorking(page);
});

test('Act II: tap opens the lid in about 1.8 s', async ({ page }) => {
  await toLid(page);
  const p = await lidPoint(page);
  const t0 = Date.now();
  await tapAt(page, p);
  await page.waitForFunction(() => window.__zoeHero.progress === 1, null, { timeout: 4000 });
  metrics.lid_play_ms = Date.now() - t0;
});

test('Act II, desktop: a wheel tick opens the lid without scrolling; so does ArrowUp', async ({ page }, info) => {
  test.skip(!isWide(info));
  await toLid(page);
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, 100);
  await page.waitForFunction(() => window.__zoeHero.progress === 1, null, { timeout: 4000 });
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await toLid(page);
  await page.keyboard.press('ArrowUp');
  await page.waitForFunction(() => window.__zoeHero.progress === 1, null, { timeout: 4000 });
});

// The scrub-less opening: the term sheet's key terms are identified (yellow) and STAY yellow; nothing is scrubbed yet.
test('Acts II-III: Mac Word, Wi-Fi OFF before ZOE speaks, the key terms light up yellow and stay yellow, nothing is scrubbed', async ({ page }, info) => {
  test.setTimeout(150000);
  const errors = watchErrors(page);
  await open(page);
  await startJournal(page);
  await openLid(page);
  // The laptop's screen is a Mac desktop: the Apple logo, Word's menus, no Dock. Wi-Fi goes OFF before ZOE speaks.
  await page.waitForFunction(() => window.__journal.some((e) => e.k === 'wifi' && e.v === 'off'), null, { timeout: 40000 });
  await expect(page.locator('.screen .zs-root')).toBeVisible();
  await expect(page.locator('.screen .zs-menubar .zs-apple')).toHaveCount(1);
  expect(await page.locator('.screen .zs-menubar').innerText().then((t) => t.replace(/\s+/g, ' '))).toMatch(/^Word File Edit View Insert Format Tools Table Window Help/);
  expect(await page.locator('.screen [class*="dock" i]').count()).toBe(0);
  await expect(page.locator('.wifi-callout')).toBeVisible();
  await expect(page.locator('.wifi-callout')).toHaveClass(/is-off/);
  await expect(page.locator('.wifi-callout .wc-text')).toHaveText('Wi-Fi OFF');
  // No Mark or Scrub button and no sweep, and no gesture to perform.
  expect(await page.locator('.btn-mark, .btn-scrub, .sweep').count()).toBe(0);
  const total = await page.locator('.screen .zs-page [data-k]').count();
  expect(total).toBeGreaterThanOrEqual(14); // names, addresses, the EIN, the escrow account and three dates: not the dollar amounts
  await shot(page, info, 'act3-word');
  // Only the document text zooms (Word's own zoom): the status bar's percent moves up from 100 (the same on the phone as on the desktop), and the ZOE pane is open inside the Word window.
  await page.waitForFunction(() => /\b(1[4-9]\d|[2-9]\d\d)%/.test(document.querySelector('.screen').innerText), null, { timeout: 15000 });
  await expect(page.locator('.screen .zs-word .zs-pane')).toBeVisible();
  expect(await page.evaluate(() => { const w = document.querySelector('.screen .zs-word').getBoundingClientRect(); const r = document.querySelector('.screen .zs-pane').getBoundingClientRect(); return r.width > 0.15 * w.width && r.height > 0.4 * w.height && r.left >= w.left - 1 && r.right <= w.right + 1 && r.bottom <= w.bottom + 1; })).toBe(true);
  expect(await page.evaluate(() => document.querySelectorAll('.zs-root.b-web, .b-web').length)).toBe(0); // the phone has no web layout any more
  expect(await hero(page, 'gesture')).toBeNull();
  // The page runs down the sheet and every key term is yellow.
  await page.waitForFunction(() => {
    const pg = document.querySelector('.screen .zs-page');
    return pg.querySelectorAll('[data-k].zs-hl').length === pg.querySelectorAll('[data-k]').length;
  }, null, { timeout: 20000 });
  const yellow = await page.locator('.screen .zs-page [data-k].zs-hl').first().evaluate((el) => getComputedStyle(el).backgroundColor.match(/[\d.]+/g).map(Number));
  expect(yellow[0]).toBeGreaterThan(200); // warm yellow: strong red and green, weak blue
  expect(yellow[1]).toBeGreaterThan(150);
  expect(yellow[2]).toBeLessThan(yellow[0] - 60);
  await shot(page, info, 'act3-highlight');
  // ZOE's one line over the sweep; the terms STAY yellow, and nothing switches to a placeholder.
  await said(page, 'Finding critical information in the term sheet.', 30000);
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => {
    const pg = document.querySelector('.screen .zs-page');
    return { hl: pg.querySelectorAll('[data-k].zs-hl').length, keys: pg.querySelectorAll('[data-k]').length, ph: pg.querySelectorAll('.zs-ph').length, texts: Array.from(pg.querySelectorAll('[data-k]')).map((e) => e.textContent) };
  });
  expect(after.ph).toBe(0);
  expect(after.hl).toBe(after.keys);
  expect(after.keys).toBe(total);
  const text = await page.$eval('.screen .zs-page', (el) => el.textContent);
  expect(text).toMatch(/Kestrel|Meridian/); // the real names are still there
  expect(text).not.toMatch(/\bParty \d\b|\bPerson \d\b|\bAddress \d\b|\[(ORG|PERSON|ADDRESS)_\d+\]/);
  // Dates: the three real dates are on the sheet and yellow, and no token exists before the scrub.
  expect(text).not.toContain(DATE_TOKEN);
  const sheet = await page.evaluate(() => {
    const pg = document.querySelector('.screen .zs-page');
    return { hl: Array.from(pg.querySelectorAll('.zs-hl')).map((e) => e.textContent), text: pg.textContent };
  });
  REAL_DATES.forEach((d) => { expect(sheet.hl, `${d} is yellow`).toContain(d); });
  // Dollar amounts: the five figures are on the sheet as plain text, never highlighted, never in a chip.
  expect((text.match(AMOUNT_RE) || []).length).toBeGreaterThanOrEqual(5);
  ['$45,000,000', '$4,500,000', '$6,000,000', '$30,000,000', '$750,000'].forEach((a) => expect(text, a).toContain(a));
  expect(sheet.hl.filter((t) => /\$\d/.test(t))).toEqual([]);
  expect(await page.locator('.screen .zs-page [data-k]').evaluateAll((els) => els.filter((e) => /\$\d/.test(e.textContent)).length)).toBe(0);
  await shot(page, info, 'act3-identified');
  // The skip control is there from here on, with its label.
  await expect(page.locator('.skip-step')).toHaveClass(/is-in/);
  await expect(page.locator('.skip-step')).toHaveText('Skip introductory illustration');
  // The order of the lines, and the Wi-Fi: OFF before the first ZOE line; no scrub line yet.
  const j = await page.evaluate(() => window.__journal);
  const lines = j.filter((e) => e.k === 'line').map((e) => e.v);
  const order = ['Bob (thinking): Picture taken. Into the laptop.', "Bob (thinking): I don't trust their Wi-Fi. Going local.", "Bob (thinking): Wi-Fi off. Let's go.",
    'ZOE AI: Finding critical information in the term sheet.'];
  const at = order.map((l) => lines.indexOf(l));
  if (!at.every((i) => i >= 0)) console.log('[journal]', JSON.stringify(lines));
  expect(at.every((i) => i >= 0)).toBe(true);
  expect(at).toEqual([...at].sort((a, b) => a - b));
  expect(lines.some((l) => /Scrubb/i.test(l))).toBe(false);
  const firstZoe = j.find((e) => e.k === 'line' && e.v.startsWith('ZOE AI:'));
  const firstOff = j.find((e) => e.k === 'wifi' && e.v === 'off');
  expect(firstOff.t).toBeLessThan(firstZoe.t);
  expect(errors).toEqual([]);
});

test('Acts III-V: three click gates, one line over the vault and templates, the draft kept yellow, the clause a plain insertion, the scrub, the parent added, the flip back', async ({ page }, info) => {
  test.setTimeout(300000);
  const errors = watchErrors(page);
  await open(page);
  await startJournal(page);
  await startWatch(page);
  await openLid(page);
  const wifi = () => page.evaluate(() => window.__journal.filter((e) => e.k === 'wifi').map((e) => e.v));
  // Tracked changes are red, as in real Word: the text itself computes to red.
  const red = (el) => {
    const m = getComputedStyle(el).color.match(/[\d.]+/g).map(Number);
    return m[0] > 150 && m[1] < 80 && m[2] < 80;
  };
  // Counts of the marks in Word's page, visible ones only (the parent's passages wait in a hidden state).
  const marks = () => page.evaluate(() => {
    const pg = document.querySelector('.screen .zs-page');
    const vis = (q) => Array.from(pg.querySelectorAll(q)).filter((e) => !e.closest('[hidden]'));
    return { ph: vis('.zs-ph').length, hl: vis('.zs-hl').length, del: vis('.zs-del').length, filled: vis('.b-filled').length };
  });
  const filledTexts = () => page.evaluate(() => Array.from(document.querySelectorAll('.screen .zs-page .b-filled')).map((e) => e.textContent));
  // Which filled-in terms are kept as they are (dollar amounts and the other deal figures): never yellow, never scrubbed.
  const keptFlags = () => page.evaluate(() => Array.from(document.querySelectorAll('.screen .zs-page .b-filled')).map((e) => e.hasAttribute('data-keep')));
  // No amount sits inside a highlight, a chip or an edit mark, at any moment.
  const amountsMarked = () => page.evaluate(() => Array.from(document.querySelectorAll('.screen .zs-page .zs-hl, .screen .zs-page .zs-ph, .screen .zs-page [data-k]')).filter((e) => /\$\d/.test(e.textContent)).map((e) => e.textContent));

  // The term sheet's figures (read at the end of the identification, while the term sheet is still on screen).
  await said(page, 'Finding critical information in the term sheet.');
  await page.waitForFunction(() => { const pg = document.querySelector('.screen .zs-page'); return pg.querySelectorAll('[data-k].zs-hl').length === pg.querySelectorAll('[data-k]').length; }, null, { timeout: 20000 });
  const termSheet = await page.evaluate(() => Array.from(document.querySelectorAll('.screen .zs-page [data-k]')).map((e) => e.textContent));
  // The term sheet's dollar amounts are plain text now (not marked terms): read them from the page.
  const termFigures = Array.from(new Set(await page.$eval('.screen .zs-page', (el) => el.textContent.match(/\$\d[\d,]*/g) || [])));
  expect(termFigures.length).toBeGreaterThanOrEqual(5);
  expect(termSheet.filter((t) => /\$\d/.test(t))).toEqual([]);
  expect(await amountsMarked()).toEqual([]);

  // Beat 3: Safari and the cockpit: one line over two quick screens (the vault, then the template search), all with the Wi-Fi OFF.
  await said(page, 'Searching the vault for relevant information and potential templates.');
  await page.waitForFunction(() => /^Safari File Edit View History Bookmarks Window Help/.test(document.querySelector('.screen .zs-menubar').innerText.replace(/\s+/g, ' ')), null, { timeout: 5000 });
  expect(await screenText(page)).toContain('localhost');
  expect(await wifi()).toEqual(['off']);

  // Click one: the one template, with a real "Choose template" button over the glowing drawn one. A click goes on.
  await said(page, 'Found a potential template.');
  const gate1 = await gateCheck(page, 'template', 'Choose template');
  const tpl = await screenText(page);
  expect(tpl).toMatch(/ZOE read your search as/i); // the screen sets it in capitals
  expect(tpl).toContain('firm_merger_agreement_template_delaware.docx');
  expect(tpl).not.toContain('playbook_seller_conservative.docx'); // one choice only
  await shot(page, info, 'act4-templates');
  await gate1.click();
  await page.waitForFunction(() => window.__zoeHero.gesture !== 'template', null, { timeout: 3000 });

  // Beat 4: one line, one spinner turn, and Word shows the draft already filled in; every filled-in term is yellow and stays yellow.
  await said(page, 'Drafting document.');
  await page.waitForFunction(() => /^Word File Edit View Insert Format Tools Table Window Help/.test(document.querySelector('.screen .zs-menubar').innerText.replace(/\s+/g, ' ')), null, { timeout: 8000 });
  expect(await screenText(page)).toContain('Agreement and Plan of Merger.docx');
  await page.waitForFunction(() => !document.querySelector('.screen .zs-page .b-fill') && document.querySelectorAll('.screen .zs-page .b-filled').length > 20, null, { timeout: 20000 });
  await page.waitForTimeout(800);
  let m = await marks();
  expect(m.filled).toBeGreaterThanOrEqual(40);
  expect(m.ph).toBe(0); // no placeholder anywhere before the review
  // Every filled-in term is yellow, except the kept figures (dollar amounts), which are plain.
  expect(await page.evaluate(() => document.querySelectorAll('.screen .zs-page .b-filled:not(.zs-hl):not([data-keep])').length)).toBe(0);
  expect(await page.evaluate(() => document.querySelectorAll('.screen .zs-page .b-filled[data-keep].zs-hl').length)).toBe(0);
  const draftTexts = await filledTexts();
  const kept = await keptFlags();
  const nonKept = draftTexts.filter((t, i) => !kept[i]);
  expect(nonKept.length).toBeGreaterThanOrEqual(30);
  // The draft carries the term sheet's figures unchanged (it has others of its own, which the term sheet does not show).
  const draftFigures = draftTexts.filter((t) => /^\$[\d,]+/.test(t));
  termFigures.forEach((f) => expect(draftFigures, `the term sheet's ${f} is in the draft`).toContain(f));
  expect(draftFigures.every((t, i) => kept[draftTexts.indexOf(t)])).toBe(true);
  // The dates: real and yellow in the draft; no token yet.
  const draftDates = draftTexts.filter((t) => REAL_DATES.includes(t));
  expect(draftDates.length).toBeGreaterThanOrEqual(3);
  expect(await amountsMarked()).toEqual([]);
  const draftKept = await page.evaluate(() => Array.from(document.querySelectorAll('.screen .zs-page .b-filled[data-keep]')).map((e) => e.textContent));
  await shot(page, info, 'act4-draft');

  // Beat 5: ZOE finds the clause; one clause, a real Insert button; Enter on it lands Section 9.6 as red inserted text after Article IX's last section. Nothing is struck.
  await said(page, 'Finding the clause.');
  await said(page, 'Found. Ready for you to insert.');
  const gate2 = await gateCheck(page, 'insert', 'Insert');
  expect(await screenText(page)).toContain('Knowledge; No Sandbagging');
  expect(await page.locator('.screen .zs-page [data-id="s93new"]').count()).toBe(0); // not in until it is pressed
  expect(await page.locator('.screen .zs-pane').isVisible()).toBe(true);
  await shot(page, info, 'act4-insert-gate');
  await gate2.focus();
  await page.keyboard.press('Enter'); // the keyboard goes on too
  await page.waitForFunction(() => document.querySelector('.screen .zs-page [data-id="s93new"]'), null, { timeout: 10000 });
  await page.waitForFunction(() => !document.querySelector('.screen .zs-page [data-id="s93new"]').classList.contains('is-typing'), null, { timeout: 10000 });
  await page.waitForTimeout(600);
  const ins = page.locator('.screen .zs-page [data-id="s93new"]');
  await expect(ins).toHaveClass(/zs-ins/);
  expect(await ins.evaluate(red)).toBe(true); // tracked insertions are red, as in real Word
  expect(await ins.textContent()).toMatch(/^Section 9\.6 Knowledge; No Sandbagging\./);
  expect((await ins.textContent()).replace(/\u2019/g, "'")).toBe(CLAUSE_TEXT);
  // A plain insertion: no slot, no "[Reserved", nothing struck; it follows Article IX's last section and Article X comes next.
  expect(await page.locator('.screen .zs-page [data-id="s93"]').count()).toBe(0);
  expect(await page.evaluate(() => { const pg = document.querySelector('.screen .zs-page'); const a = pg.querySelector('[data-id="art9end"]'); const c = pg.querySelector('[data-id="s93new"]'); return !!a && !!c && a.nextElementSibling === c && /^ARTICLE X\b/.test(c.nextElementSibling.textContent); })).toBe(true);
  expect(await page.$eval('.screen .zs-page', (el) => el.textContent)).not.toMatch(/\[Reserved|Section 9\.3 \[/);
  expect(await page.locator('.screen .zs-page .b-to').count()).toBe(0);
  m = await marks();
  expect(m.del).toBe(0); // nothing struck
  expect(m.ph).toBe(0);
  expect(m.hl).toBeGreaterThanOrEqual(nonKept.length); // still yellow through the clause
  await shot(page, info, 'act4-inserted');

  // Beat 6: a dialog offers the review with one button; THEN the scrub: every yellow item turns into its placeholder, all at once.
  m = await marks();
  expect(m.del).toBe(0); // still nothing struck
  await page.evaluate(() => {
    window.__sw = [];
    const pg = document.querySelector('.screen .zs-page');
    new MutationObserver(() => {
      const n = pg.querySelectorAll('.b-filled.zs-ph').length;
      if (n) window.__sw.push(n);
    }).observe(pg, { subtree: true, attributes: true, childList: true, characterData: true });
  });
  await gateCheck(page, 'scrub', 'Scrub and send to cloud');
  const dialog = await screenText(page);
  expect(dialog).toContain('Scrub and send to cloud');
  expect(await page.locator('.screen .zs-pane').isVisible()).toBe(true);
  m = await marks();
  expect(m.ph).toBe(0); // nothing is scrubbed before the button is pressed
  await shot(page, info, 'act4-scrub-gate');
  await gateAuto(page, 'scrub'); // nobody clicks: the pointer does
  await page.waitForFunction(() => document.querySelectorAll('.screen .zs-page .b-filled.zs-ph').length > 0, null, { timeout: 15000 });
  const sw = await page.evaluate(() => window.__sw);
  expect(sw[0]).toBe(nonKept.length); // the first visible change already covers every scrubbed term (the kept figures do not change)
  await page.waitForTimeout(800);
  m = await marks();
  expect(m.ph).toBeGreaterThanOrEqual(nonKept.length);
  expect(await page.evaluate(() => document.querySelectorAll('.screen .zs-page .b-filled.zs-hl').length)).toBe(0); // yellow became blue
  const scrubbedTexts = await filledTexts();
  scrubbedTexts.forEach((t, i) => {
    if (kept[i]) expect(t, `kept figure ${i} is exactly as it was`).toBe(draftTexts[i]);
    else expect(t, `term ${i} is scrubbed`).not.toBe(draftTexts[i]);
  });
  // Dates: every date is the one token, in a chip (no numbering); no real date is left on the page.
  const dateIdx = draftTexts.map((t, i) => (REAL_DATES.includes(t) ? i : -1)).filter((i) => i >= 0);
  dateIdx.forEach((i) => expect(scrubbedTexts[i], `date ${i} is the token`).toBe(DATE_TOKEN));
  const scrubbedPage = await page.$eval('.screen .zs-page', (el) => el.textContent);
  REAL_DATES.forEach((d) => expect(scrubbedPage, `${d} is gone while scrubbed`).not.toContain(d));
  expect(await page.locator('.screen .zs-page .zs-ph', { hasText: DATE_TOKEN }).count()).toBeGreaterThanOrEqual(dateIdx.length);
  expect(await page.evaluate(() => Array.from(document.querySelectorAll('.screen .zs-page .zs-ph')).filter((e) => /^\[.*\]$/.test(e.textContent.trim()) && e.textContent.trim() !== '[Month_Day_Year]').length)).toBe(0);
  expect(scrubbedPage).not.toMatch(/\bDate \d/);
  // Dollar amounts: the same figures, in the same places, in no mark and no chip.
  const scrubbedKept = await page.evaluate(() => Array.from(document.querySelectorAll('.screen .zs-page .b-filled[data-keep]')).map((e) => e.textContent));
  expect(scrubbedKept).toEqual(draftKept);
  expect(await amountsMarked()).toEqual([]);
  termFigures.forEach((f) => expect(scrubbedPage, `${f} is still on the page while scrubbed`).toContain(f));
  // The chip fits its line (no horizontal overflow of the page, no chip wider than the paper).
  expect(await page.evaluate(() => {
    const pg = document.querySelector('.screen .zs-page').getBoundingClientRect();
    return Array.from(document.querySelectorAll('.screen .zs-page .zs-ph')).filter((e) => !e.closest('[hidden]') && e.getBoundingClientRect().right > pg.right + 1).length;
  })).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await said(page, 'Scrubbed. Sending to cloud AI.');
  await shot(page, info, 'act4-scrubbed');

  // Beat 7: the scrubbed draft goes out and the review comes back: the Wi-Fi is ON only for the exchange; the cloud never speaks.
  await page.waitForFunction(() => window.__journal.some((e) => e.k === 'wifi' && e.v === 'on'), null, { timeout: 15000 });
  await expect(page.locator('.wifi-callout')).toHaveClass(/is-on/);
  await expect(page.locator('.wifi-callout .wc-text')).toHaveText('Wi-Fi ON');
  await expect(page.locator('.stream-label')).toHaveText('SCRUBBED INFORMATION · NO PII');
  await expect(page.locator('.stream-label')).toHaveClass(/is-on/);
  expect(await page.locator('.stream-label').evaluate((e) => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(isWide(info) ? 16 : 12);
  expect(await page.locator('.cloud-say').textContent()).toBe(''); // the cloud never speaks
  expect(await page.locator('.cloud-name').textContent()).toBe('any cloud AI the firm chooses');
  await shot(page, info, 'act4-packet');
  await page.waitForFunction(() => document.querySelector('.wifi-callout').classList.contains('is-off') && window.__journal.filter((e) => e.k === 'wifi').length === 3, null, { timeout: 15000 });
  expect(await wifi()).toEqual(['off', 'on', 'off']);

  // Beat 8: the review's change lands in the document, still in placeholders: the parent joins as a party (insertions only).
  await page.waitForFunction(() => /^Word /.test(document.querySelector('.screen .zs-menubar').innerText.replace(/\s+/g, ' ')), null, { timeout: 20000 });
  await page.waitForFunction(() => Array.from(document.querySelectorAll('.screen .zs-page .b-fix')).some((f) => !f.hidden && f.querySelector('.b-name.zs-ph')), null, { timeout: 15000 });
  const fix = page.locator('.screen .zs-page .b-fix:not([hidden])').first();
  expect(await fix.evaluate(red)).toBe(true);
  expect(await fix.textContent()).toContain('Party 6');
  // Once the camera has been through Article V, every insertion is in: the parties clause, the recital, Article IV's lead-in,
  // Article V and the signature page, and the cover; none in Articles VI to X (so none near the clause).
  await page.waitForFunction(() => Array.from(document.querySelectorAll('.screen .zs-page [data-id="art5lead"] .b-fix')).some((f) => !f.hidden), null, { timeout: 20000 });
  expect(await amountsMarked()).toEqual([]);
  await shot(page, info, 'act5-changes');

  // Beat 9: everything flips back: the placeholders become the real text, in yellow, with a green flash.
  await said(page, 'Review applied. Names restored.');
  await page.waitForTimeout(500);
  // Every insertion is in (and stays, now yellow): the parties clause, the recital, Article IV's lead-in, Article V, the signature page and the cover; none in Articles VI to X.
  const fixes = await page.evaluate(() => {
    const pg = document.querySelector('.screen .zs-page');
    const kids = Array.from(pg.children);
    const idx = (re) => kids.findIndex((k) => re.test(k.textContent.trim()) && /^(ARTICLE|SIGNATURE)/.test(k.textContent.trim()));
    const a6 = idx(/^ARTICLE VI\b/), sig = idx(/^SIGNATURE PAGE/);
    const live = Array.from(pg.querySelectorAll('.b-fix')).filter((e) => !e.hidden && !e.closest('[hidden]'));
    const at = live.map((e) => { let b = e; while (b.parentElement !== pg) b = b.parentElement; return kids.indexOf(b); });
    return { n: live.length, outside: at.filter((i) => !(i < a6 || i >= sig)).length, inArt9: live.filter((e) => e.closest('[data-id="s93new"], [data-id="art9end"]')).length, a6, sig,
      text: (pg.querySelector('[data-id="art5lead"]') || {}).textContent || '', head: (pg.querySelector('[data-id="art5"]') || {}).textContent || '', pre: (pg.querySelector('[data-id="preamble"]') || {}).textContent || '' };
  });
  expect(fixes.a6).toBeGreaterThan(0);
  expect(fixes.sig).toBeGreaterThan(fixes.a6);
  expect(fixes.n).toBeGreaterThanOrEqual(10);
  expect(fixes.outside, 'insertions outside the parties clause, the recital, Article IV and V, the cover and the signature page').toBe(0);
  expect(fixes.inArt9).toBe(0);
  expect(fixes.text.trim()).toBe('Each of Parent and Merger Sub, jointly and severally, represents and warrants to the Company as follows:');
  expect(fixes.head).toMatch(/REPRESENTATIONS AND WARRANTIES OF PARENT AND MERGER SUB/);
  expect(fixes.pre).toMatch(/(Party 6|Meridian Holdings LLC), a Delaware limited liability company \(“Parent”\)/); // a chip until the flip back, then the real name
  m = await marks();
  expect(m.ph).toBe(0);
  expect(m.del).toBe(0);
  expect(await page.evaluate(() => document.querySelectorAll('.screen .zs-page .b-filled:not(.zs-hl):not([data-keep])').length)).toBe(0);
  expect(await page.evaluate(() => Array.from(document.querySelectorAll('.screen .zs-page .b-name')).filter((e) => !e.closest('[hidden]') && !e.classList.contains('zs-hl')).length)).toBe(0);
  // The draft's figures equal the term sheet's again, and the text is the one before the scrub, not the scrubbed one.
  const restoredTexts = await filledTexts();
  expect(restoredTexts).toEqual(draftTexts);
  expect(restoredTexts).not.toEqual(scrubbedTexts);
  const restoredFigures = restoredTexts.filter((t) => /^\$[\d,]+/.test(t));
  termFigures.forEach((f) => expect(restoredFigures, `the term sheet's ${f} is back in the draft`).toContain(f));
  // The amounts are identical before, during and after the scrub, and never marked; the dates are real again, yellow, with no token left.
  expect(await page.evaluate(() => Array.from(document.querySelectorAll('.screen .zs-page .b-filled[data-keep]')).map((e) => e.textContent))).toEqual(draftKept);
  expect(await amountsMarked()).toEqual([]);
  REAL_DATES.forEach((d) => expect(restoredTexts, `${d} is back`).toContain(d));
  expect(await page.$eval('.screen .zs-page', (el) => el.textContent)).not.toContain(DATE_TOKEN);
  const agreementText = await page.$eval('.screen .zs-page', (el) => el.textContent);
  expect(agreementText).toContain('Meridian Holdings LLC, a Delaware limited liability company (“Parent”)');
  expect(await page.$eval('.screen .zs-page [data-id="art5lead"]', (el) => el.textContent.trim())).toBe('Each of Parent and Merger Sub, jointly and severally, represents and warrants to the Company as follows:');
  expect(agreementText).not.toMatch(/\bParty \d\b|\[(ORG|PERSON|ADDRESS)_\d+\]/);
  await shot(page, info, 'act5-restored');

  // The ending, and the whole order of the lines.
  await page.waitForFunction(() => window.__zoeHero.ended > 0, null, { timeout: 40000 });
  const j = await page.evaluate(() => window.__journal);
  const lines = j.filter((e) => e.k === 'line').map((e) => e.v);
  // After the laptop opens the spoken lines are exactly these, in this order (nothing else is said).
  const afterWifi = lines.slice(lines.indexOf("Bob (thinking): Wi-Fi off. Let's go.") + 1);
  if (JSON.stringify(afterWifi) !== JSON.stringify(STORY_AFTER_LID)) console.log('[journal]', JSON.stringify(lines));
  expect(afterWifi).toEqual(STORY_AFTER_LID);
  // The watcher (every 100 ms from the opening of the lid to the end): nothing struck, no "[Reserved", the clause's text one and the same
  // from its insertion to the end, the clause out of Word's window from beat 8 on, and the ZOE pane open inside Word's window whenever Word is up.
  const watch = await page.evaluate(() => window.__watch);
  expect(watch.length).toBeGreaterThan(300);
  expect(watch.filter((w) => w.struck > 0).length, 'samples with struck text').toBe(0);
  expect(watch.some((w) => w.back > 0), 'the green flash of the flip back').toBe(true);
  expect(watch.some((w) => w.fixVis > 0 && w.ph >= nonKept.length), "the review's change lands while everything is still a placeholder").toBe(true);
  expect(watch.filter((w) => w.reserved).length, 'samples showing [Reserved').toBe(0);
  const done = watch.filter((w) => w.clause !== null && !w.typing).map((w) => w.clause.replace(/\u2019/g, "'"));
  expect(done.length).toBeGreaterThan(50);
  expect(Array.from(new Set(done))).toEqual([CLAUSE_TEXT]);
  const t28 = j.find((e) => e.k === 'line' && e.v === 'ZOE AI: Scrubbed. Sending to cloud AI.').t;
  const tEnd = j.find((e) => e.k === 'line' && e.v === 'Bob: ZOE AI.').t; // the story's last line; after it the page unlocks and the Full Word Support picture (clause in view) is the hero's own page
  const seen = watch.map((w, i) => ({ i, dt: Math.round(w.t - t28), w })).filter((x) => x.w.t >= t28 && x.w.t < tEnd && x.w.word && x.w.inView);
  if (seen.length) console.log('[clause in view]', JSON.stringify(seen.map((x) => ({ dt: x.dt, prev: watch[x.i - 1] && { dt: Math.round(watch[x.i - 1].t - t28), word: watch[x.i - 1].word, inView: watch[x.i - 1].inView }, next: watch[x.i + 1] && { dt: Math.round(watch[x.i + 1].t - t28), word: watch[x.i + 1].word, inView: watch[x.i + 1].inView } }))));
  expect(seen.length, 'samples with the clause in Word\'s window from beat 8 on').toBe(0);
  const wordUp = watch.filter((w) => w.word);
  expect(wordUp.length).toBeGreaterThan(100);
  const noPane = wordUp.filter((w) => !w.pane || !w.paneIn);
  { const grp = []; noPane.forEach((w) => { const l = grp[grp.length - 1]; if (l && w.t - l.e < 350) { l.e = w.t; l.n += 1; } else grp.push({ s: w.t, e: w.t, n: 1, z: w.zoom, pane: w.pane, paneIn: w.paneIn, pinfo: w.pinfo }); }); console.log('[no pane groups]', JSON.stringify(grp.map((g) => ({ s: Math.round(g.s - t28), e: Math.round(g.e - t28), n: g.n, z: g.z, pane: g.pane, paneIn: g.paneIn, pinfo: g.pinfo })))); }
  if (noPane.length) console.log('[no pane]', JSON.stringify({ n: noPane.length, first: Math.round(noPane[0].t - t28), last: Math.round(noPane[noPane.length - 1].t - t28), pane: noPane.filter((w) => !w.pane).length, paneIn: noPane.filter((w) => !w.paneIn).length, tEnd: Math.round(tEnd - t28), zoomSet: Array.from(new Set(noPane.map((w) => w.zoom))) }));
  expect(noPane.length, 'Word on screen without the pane open inside its window').toBe(0);
  // One name: every spoken line from the product carries the label "ZOE AI", and none says a bare "ZOE".
  expect(lines.filter((l) => /\bZOE\b(?! AI)/.test(l))).toEqual([]);
  // The cloud does not speak, and no line says "frontier", "Adapt" or "morph".
  expect(lines.filter((l) => l.startsWith('Frontier AI'))).toEqual([]);
  expect(lines.filter((l) => /frontier|adapting|morph/i.test(l))).toEqual([]);
  // Wi-Fi: ON only between the scrub line and the review's return.
  const lineAt = (l) => j.find((e) => e.k === 'line' && e.v.includes(l)).t;
  const onAt = j.find((e) => e.k === 'wifi' && e.v === 'on').t;
  const offAt = j.filter((e) => e.k === 'wifi' && e.v === 'off').pop().t;
  expect(onAt).toBeGreaterThan(lineAt('Scrubbed. Sending to cloud AI.'));
  expect(offAt).toBeGreaterThan(onAt);
  expect(offAt).toBeLessThan(lineAt('Review applied. Names restored.'));
  expect(await page.evaluate(() => document.documentElement.classList.contains('intro-done'))).toBe(true);
  expect(errors).toEqual([]);
});

test('the end: the page unlocks by itself, the abilities page, a reload replays, analytics', async ({ page }, info) => {
  test.setTimeout(600000);
  const events = [];
  page.on('console', (m) => { const t = m.text(); if (t.startsWith('[track]')) events.push(t.split(' ')[1]); });
  const errors = watchErrors(page);
  await open(page);
  await runToEnd(page);
  await page.waitForTimeout(700);
  await shot(page, info, 'act5');
  // The story's own end is the skip's state: <html> has intro-done, the page scrolls, the callout is gone, the navigation is in.
  const end = await page.evaluate(() => ({
    introDoneClass: document.documentElement.classList.contains('intro-done'),
    introDone: window.__zoeHero.introDone,
    locked: window.__zoeHero.locked,
    heroLock: document.documentElement.classList.contains('hero-lock'),
    calloutHidden: document.querySelector('.wifi-callout').hidden,
    nav: getComputedStyle(document.querySelector('.site-nav-bar')).visibility,
  }));
  expect(end).toEqual({ introDoneClass: true, introDone: true, locked: false, heroLock: false, calloutHidden: true, nav: 'visible' });
  // The hero's own page: the headline and the abilities, Full Word Support first (the details are in the abilities tests).
  await expect(page.locator('.post-hero')).toBeVisible();
  await expect(page.locator('.ability[data-id="word"]')).toBeVisible();
  expect(await hero(page, 'ability')).toBe('word');
  expect(await page.locator('.post-book, .post-replay, .post-tab').count()).toBe(0);
  await page.mouse.move(8, info.project.use.viewport.height / 2); // over the page itself, not the laptop's own scrolling page
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  // The inspect view is no longer offered, but its code still works (through the test hook).
  // The agreement is left out: a legal document as written, with its headings and parties in capitals; so is the
  // screens library's desktop, whose text belongs to its own tests.
  const stageText = await page.evaluate(() => {
    const c = document.querySelector('.stage').cloneNode(true);
    c.querySelectorAll('.screen').forEach((el) => el.remove());
    return c.textContent;
  });
  await page.evaluate(() => window.__zoeHero.inspect());
  await page.waitForTimeout(600);
  await expect(page.locator('.insp-col.is-out')).toContainText('Party 1');
  const inspectText = await page.evaluate(() => document.querySelector('.inspect').textContent);
  const caps = Array.from(new Set(`${stageText} ${inspectText}`.match(/\b[A-Z]{2,}\b/g) || [])).filter((w) => !CAPS_OK.has(w));
  expect(caps).toEqual([]);
  await page.locator('.insp-back .pill').click();
  await page.waitForTimeout(500);
  // There is no Replay on the page: reloading plays the introduction again, locked, with the navigation hidden.
  await page.reload();
  await page.waitForFunction(() => window.__zoeHero && window.__zoeHero.act >= 1);
  await page.waitForTimeout(500);
  const fresh = await page.evaluate(() => ({
    act: window.__zoeHero.act,
    locked: window.__zoeHero.locked,
    introDone: window.__zoeHero.introDone,
    introDoneClass: document.documentElement.classList.contains('intro-done'),
    ability: window.__zoeHero.ability,
    nav: getComputedStyle(document.querySelector('.site-nav-bar')).visibility,
    scrollY: window.scrollY,
  }));
  expect(fresh).toEqual({ act: 1, locked: true, introDone: false, introDoneClass: false, ability: null, nav: 'hidden', scrollY: 0 });
  await page.goto('/#evidence'); // a deep link: the hero's page, the navigation in, no story
  await page.waitForFunction(() => window.__zoeHero && window.__zoeHero.introDone);
  // Scrolling down to the page below the hero (the old "Why is ZOE AI different?" button, which unlocked the page and
  // landed on the comparison, no longer exists): the deep-dive event fires. The comparison itself is checked below.
  await page.locator('#dataflow').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500); // the page scrolls smoothly
  await shot(page, info, 'landing');
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(8, info.project.use.viewport.height / 2); // over the page itself, not an inner scroller
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 100);
  for (const ev of ['phone_snapped', 'lid_opened', 'identified', 'scrubbed', 'reached_cloud', 'restored', 'intro_exit', 'deep_dive_reached']) {
    expect(events).toContain(ev);
  }
  expect(errors).toEqual([]);
});

test('after the introduction, scrolling down to the comparison starts it, Standard cloud AI first', async ({ page }, info) => {
  await open(page);
  await page.evaluate(() => window.__zoeHero.skip());
  await page.locator('#dataflow').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => window.__zoeCompare && window.__zoeCompare.running, null, { timeout: 8000 });
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.__zoeCompare.picked)).toBe('cloud');
  await expect(page.locator('.flow-pick[data-pick="cloud"]')).toHaveAttribute('aria-selected', 'true');
  await shot(page, info, 'after-intro-comparison');
});

test('skip: hidden until the laptop works; "Skip introductory illustration" leaves the introduction in one click', async ({ page }, info) => {
  test.setTimeout(240000);
  const events = [];
  page.on('console', (m) => { const t = m.text(); if (t.startsWith('[track] intro_exit')) events.push(t); });
  const errors = watchErrors(page);
  const hidden = () => page.$eval('.skip-step', (e) => !e.classList.contains('is-in')
    && getComputedStyle(e).opacity === '0' && getComputedStyle(e).visibility === 'hidden');
  await open(page);
  const btn = page.locator('.skip-step');
  // Its visible words are its label (no other accessible name).
  await expect(btn).toHaveText('Skip introductory illustration');
  expect(await btn.getAttribute('aria-label')).toBeNull();
  // Acts I and II, past the old 10 s mark: no skip.
  await page.waitForTimeout(11000);
  expect(await hero(page, 'act')).toBeLessThan(3);
  expect(await hidden()).toBe(true);
  await runTo(page, 'lid');
  await page.waitForFunction(() => window.__zoeHero.framesReady, null, { timeout: 20000 });
  expect(await hidden()).toBe(true);
  await page.evaluate(() => window.__zoeHero.perform('tap'));
  await page.waitForFunction(() => window.__zoeHero.progress === 1, null, { timeout: 4000 });
  expect(await hidden()).toBe(true);
  // Once the laptop works (Act III) it fades in, large and plain.
  await waitWorking(page);
  await expect(btn).toHaveClass(/is-in/);
  await page.waitForTimeout(900);
  const look = await btn.evaluate((e) => { const s = getComputedStyle(e); return { px: parseFloat(s.fontSize), weight: parseInt(s.fontWeight, 10), opacity: parseFloat(s.opacity) }; });
  expect(look.px).toBeGreaterThanOrEqual(14);
  expect(look.weight).toBeGreaterThanOrEqual(600);
  expect(look.opacity).toBe(1);
  await page.locator('.stage').screenshot({ path: path.join(SHOTS, `${info.project.name}-skip-button.png`) });
  // One click leaves the introduction entirely: the post-introduction page, unlocked, nothing left on the stage.
  await btn.click({ force: true });
  await page.waitForFunction(() => window.__zoeHero.introDone, null, { timeout: 3000 });
  const state = () => page.evaluate(() => ({
    introDoneClass: document.documentElement.classList.contains('intro-done'),
    locked: window.__zoeHero.locked,
    heroLock: document.documentElement.classList.contains('hero-lock'),
    act: window.__zoeHero.act,
    ended: window.__zoeHero.ended > 0,
    calloutHidden: document.querySelector('.wifi-callout').hidden,
    cloud: document.querySelector('.cloud').classList.contains('is-in'),
    zoe: document.querySelector('.zoe').classList.contains('is-in'),
    strip: document.querySelector('.strip').children.length,
    phoneHidden: document.querySelector('.phone').hidden,
    skipShown: document.querySelector('.skip-step').classList.contains('is-in'),
    nav: getComputedStyle(document.querySelector('.site-nav-bar')).visibility,
    postHero: !document.querySelector('.post-hero').hidden,
    ability: window.__zoeHero.ability,
    current: document.documentElement.getAttribute('data-ability-current'),
  }));
  const expected = { introDoneClass: true, locked: false, heroLock: false, act: 6, ended: true, calloutHidden: true, cloud: false, zoe: false, strip: 0, phoneHidden: true, skipShown: false, nav: 'visible', postHero: true, ability: 'word', current: 'word' };
  expect(await state()).toEqual(expected);
  await page.mouse.move(8, info.project.use.viewport.height / 2); // over the page itself, not the laptop's own scrolling page
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  // Still so three seconds later: the story does not resume behind the page.
  await page.waitForTimeout(3000);
  expect(await state()).toEqual(expected);
  expect(events.length).toBe(1);
  await shot(page, info, 'skip-end');
  // Reloading replays the introduction: the skip control is gone again until the laptop works, then Enter on it works too.
  await page.reload();
  await page.waitForFunction(() => window.__zoeHero && window.__zoeHero.act >= 1);
  await page.waitForTimeout(1200);
  expect(await hidden()).toBe(true);
  expect(await page.evaluate(() => document.documentElement.classList.contains('intro-done'))).toBe(false);
  await runTo(page, 'lid');
  await page.waitForFunction(() => window.__zoeHero.framesReady, null, { timeout: 20000 });
  await page.evaluate(() => window.__zoeHero.perform('tap'));
  await waitWorking(page, 25000);
  await expect(btn).toHaveClass(/is-in/);
  await btn.focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__zoeHero.introDone, null, { timeout: 3000 });
  expect(await page.evaluate(() => document.documentElement.classList.contains('intro-done'))).toBe(true);
  expect(errors).toEqual([]);
});

test('skip in the middle of the review, with the Wi-Fi ON: one click and nothing is left behind', async ({ page }, info) => {
  test.skip(!isWide(info), 'checked once');
  test.setTimeout(240000);
  const errors = watchErrors(page);
  await open(page);
  await startJournal(page);
  await openLid(page);
  await page.waitForFunction(() => window.__journal.some((e) => e.k === 'wifi' && e.v === 'on'), null, { timeout: 150000 });
  await expect(page.locator('.wifi-callout')).toHaveClass(/is-on/);
  await shot(page, info, 'skip-mid-review-before');
  await page.locator('.skip-step').click({ force: true });
  await page.waitForFunction(() => window.__zoeHero.introDone, null, { timeout: 3000 });
  await page.waitForTimeout(800);
  const left = await page.evaluate(() => ({
    callout: document.querySelector('.wifi-callout').hidden,
    cloud: document.querySelector('.cloud').classList.contains('is-in'),
    stream: document.querySelector('.stream').classList.contains('is-on'),
    label: document.querySelector('.stream-label').classList.contains('is-on'),
    zoe: document.querySelector('.zoe').classList.contains('is-in'),
    locked: window.__zoeHero.locked,
  }));
  expect(left).toEqual({ callout: true, cloud: false, stream: false, label: false, zoe: false, locked: false });
  await page.waitForTimeout(3000);
  expect(await page.evaluate(() => document.querySelector('.wifi-callout').hidden)).toBe(true);
  await shot(page, info, 'skip-mid-review-after');
  expect(errors).toEqual([]);
});

test('the hero is its own screen: wheel, touch and keys do not scroll it', async ({ page }, info) => {
  await open(page);
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => document.documentElement.classList.contains('hero-lock'))).toBe(true);
  await page.mouse.move(info.project.use.viewport.width / 2, info.project.use.viewport.height - 60);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  if (info.project.use.hasTouch) {
    const cdp = await page.context().newCDPSession(page);
    const x = 40;
    const y = info.project.use.viewport.height - 80;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 10; i += 1) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - i * 40 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else {
    await page.keyboard.press('PageDown');
    await page.keyboard.press('End');
    await page.keyboard.press('Space');
  }
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator('.skip')).toHaveCount(0);
  await shot(page, info, 'hero-locked');
});

// Nobody touches anything: the opening's gestures wait for their idle clock, and the three click gates press themselves.
const UNTOUCHED_LIMIT_MS = 200000;
// From the lid's opening to the close, with nobody clicking (the three automatic clicks included).
const AFTER_LID_LIMIT_MS = 80000;
// The same, for a visitor who presses each button as soon as it shows.
const PROMPT_LIMIT_MS = 55000;

test('untouched: the story plays through by itself (recorded), with the opening timed', async ({ browser }, info) => {
  test.setTimeout(360000);
  const { viewport, isMobile, hasTouch } = info.project.use;
  const dir = path.join(SHOTS, `video-${info.project.name}`);
  // The recording needs Playwright's ffmpeg (npx playwright install ffmpeg): RECORD_VIDEO=1 turns it on.
  const record = !!process.env.RECORD_VIDEO;
  const ctx = await newGuardedContext(browser, Object.assign({ viewport, isMobile, hasTouch, deviceScaleFactor: 1 }, record ? { recordVideo: { dir, size: viewport } } : {}));
  const page = await ctx.newPage();
  // The opening's beats, timed from navigation: act changes, Act I stages, the lid landing.
  await page.addInitScript(() => {
    window.__beats = [];
    document.addEventListener('DOMContentLoaded', () => {
      const st = document.querySelector('.stage');
      const note = (k) => window.__beats.push([k, Math.round(performance.now())]);
      new MutationObserver(() => note(`act${st.dataset.act}:${st.dataset.open || ''}`)).observe(st, { attributes: true, attributeFilter: ['data-act', 'data-open'] });
      const poll = () => { if (window.__zoeHero && window.__zoeHero.progress === 1) note('lid-open'); else requestAnimationFrame(poll); };
      requestAnimationFrame(poll);
    });
  });
  await page.goto(BASE);
  await page.waitForFunction(() => window.__zoeHero.ended > 0, null, { timeout: 300000 });
  metrics.untouched_ms = await hero(page, 'ended');
  const beats = await page.evaluate(() => window.__beats);
  const fcp = await page.evaluate(() => Math.round((performance.getEntriesByName('first-contentful-paint')[0] || {}).startTime || 0));
  const first = (k) => (beats.find(([b]) => b === k || b.endsWith(`:${k}`)) || [])[1];
  metrics.opening = {
    first_contentful_paint_ms: fcp,
    chat_starts_ms: first('act1:chat'),
    strip_moves_ms: first('sheet'),
    phone_in_ms: first('phone'),
    snapped_ms: first('snapped'),
    laptop_slides_in_ms: first('laptop'),
    laptop_ready_ms: first('laptop-ready'),
    transfer_ms: first('transfer'),
    laptop_centred_ms: first('done'),
    lid_open_ms: first('lid-open'),
  };
  await page.waitForTimeout(1500);
  const video = page.video();
  await ctx.close();
  if (record) {
    fs.renameSync(await video.path(), path.join(SHOTS, `${info.project.name}-run-untouched.webm`));
    fs.rmSync(dir, { recursive: true, force: true });
  }
  expect(metrics.untouched_ms).toBeGreaterThan(40000);
  expect(metrics.untouched_ms).toBeLessThan(UNTOUCHED_LIMIT_MS);
  const lidOpen = first('lid-open');
  metrics.after_lid_ms = Math.round(metrics.untouched_ms - lidOpen);
  expect(metrics.after_lid_ms, 'from the lid opening to the close, unattended').toBeLessThan(AFTER_LID_LIMIT_MS);
});

test('keyboard: Tab reaches each gesture and Enter performs it; the skip control takes Enter', async ({ page }, info) => {
  test.skip(!isWide(info));
  await open(page);
  await waitGesture(page, 'phone');
  await page.keyboard.press('Tab');
  await expect(page.locator('.phone')).toBeFocused();
  await page.keyboard.press('Enter');
  await waitGesture(page, 'lid', 15000);
  await page.waitForFunction(() => window.__zoeHero.framesReady);
  await expect(page.locator('.lid-hit')).toBeFocused();
  await page.keyboard.press('Enter');
  // The story goes on by itself from here: no Mark or Scrub button to reach.
  await waitWorking(page, 25000);
  expect(await page.locator('.btn-mark, .btn-scrub').count()).toBe(0);
  await expect(page.locator('#live')).toHaveAttribute('aria-live', 'polite');
  expect((await page.locator('#live').textContent()).length).toBeGreaterThan(0);
  await page.locator('.skip-step').focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__zoeHero.introDone, null, { timeout: 3000 });
  await expect(page.locator('.post-hero')).toBeVisible();
  expect(await hero(page, 'ability')).toBe('word');
});

test('reduced motion: seven stops, advanced by the Next pill (the three gates included), ending on the hero\'s own page', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  const stops = [];
  const gates = [];
  for (let i = 1; i <= 10; i += 1) {
    await page.waitForFunction(() => document.querySelector('.pills .pill') || window.__zoeHero.introDone, null, { timeout: 20000 });
    await page.waitForTimeout(300);
    await shot(page, info, `reduced-motion-${i}`);
    const next = page.locator('.pill', { hasText: 'Next' });
    if (!(await next.count())) break;
    stops.push(await page.locator('#live').textContent());
    gates.push(await page.evaluate(() => Array.from(document.querySelectorAll('.stage .cta-hit')).filter((e) => !e.hidden && e.getBoundingClientRect().width > 0).map((e) => e.dataset.gate)));
    await next.click();
  }
  // Stops: the ambush, the one line over the term sheet, the template gate, the clause gate, the scrub gate, the scrub and send, the flip back.
  expect(stops.length).toBe(7);
  [/Perfect opportunity/, /Finding critical information in the term sheet\./, /Found a potential template\./, /Found\. Ready for you to insert\./, /Found\. Ready for you to insert\./, /Scrubbed\. Sending to cloud AI\./, /Review applied\. Names restored\./].forEach((re, i) => expect(stops[i]).toMatch(re));
  // The three click gates stand at stops 3, 4 and 5, and the Next pill goes through each.
  expect(gates.slice(2, 5)).toEqual([['template'], ['insert'], ['scrub']]);
  // The Next path ends in the same state as the skip: the hero's own page. Reduced motion never locks the page.
  expect(await hero(page, 'act')).toBe(6);
  expect(await hero(page, 'introDone')).toBe(true);
  await expect(page.locator('.post-hero')).toBeVisible();
  expect(await hero(page, 'ability')).toBe('word');
  expect(await page.evaluate(() => document.documentElement.classList.contains('hero-lock'))).toBe(false);
  expect(await page.evaluate(() => document.documentElement.classList.contains('intro-done'))).toBe(true);
});

test('no JavaScript: open laptop and the five acts as text, matching hero.js', async ({ browser }, info) => {
  const { viewport, deviceScaleFactor, isMobile, hasTouch } = info.project.use;
  const ctx = await newGuardedContext(browser, { viewport, deviceScaleFactor, isMobile, hasTouch, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-noscript.png`), fullPage: true });
  const noscript = await page.evaluate(() => Array.from(document.querySelectorAll('noscript')).map((n) => n.textContent).join(' '));
  const src = fs.readFileSync(path.join(ROOT, 'hero.js'), 'utf8');
  const start = src.indexOf('const LINES = {');
  const block = src.slice(start, src.indexOf('};', start));
  const lines = Array.from(block.matchAll(/^\s+\w+:\s+(['"])(.*)\1,$/gm)).map((m) => m[2].replace(/\*/g, '').replace(/\\'/g, "'"));
  // Every spoken line has its own key (a repeated key silently replaces an earlier line).
  const keys = Array.from(block.matchAll(/^\s+(\w+):\s+['"]/gm)).map((m) => m[1]);
  expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
  expect(lines.length).toBeGreaterThan(15);
  lines.forEach((l) => expect(noscript).toContain(l));
  // The four abilities' descriptions are real text in the page without JavaScript.
  const abilities = await page.evaluate(() => document.querySelector('.abilities').textContent);
  ABILITIES.forEach((a) => { expect(abilities).toContain(a.name); a.text.forEach((t) => expect(abilities.replace(/\u2019/g, "'")).toContain(t)); });
  // One name in the text version too: a bare "ZOE" nowhere, the speaker label "ZOE AI", and the last line.
  expect(noscript.match(/\bZOE\b(?! AI)/g)).toBeNull();
  expect(noscript).toContain('ZOE AI: Finding critical information in the term sheet.');
  ['the Choose template button', 'the Insert button', 'the Scrub and send to cloud button'].forEach((t) => expect(noscript).toContain(t));
  expect(noscript).toContain('Bob: ZOE AI.');
  const head = await page.evaluate(() => [document.title, ...Array.from(document.querySelectorAll('meta[name=description],meta[property^="og:"],meta[name^="twitter:"]')).map((m) => m.content)]);
  head.forEach((t) => expect(t).not.toMatch(/\bZOE\b(?! AI)/));
  // The buyer reads as an ordinary company on paper: the shell is found only through the related files.
  for (const f of ['hero.js', 'index.html', 'agreement.js']) {
    expect(fs.readFileSync(path.join(ROOT, f), 'utf8')).not.toMatch(/newly formed|formed for the merger/i);
  }
  await ctx.close();
});

test('below the hero: every section, both modals, numbers and image sizes', async ({ page }, info) => {
  const images = [];
  page.on('response', async (r) => {
    if (r.request().resourceType() === 'image') images.push({ url: r.url(), kb: Math.round((await r.body().catch(() => Buffer.alloc(0))).length / 1024) });
  });
  // A link to a section below the hero arrives unlocked (as from the other pages).
  await page.goto('/#dataflow');
  const order = await page.evaluate(() => Array.from(document.querySelectorAll('main > section.sec, footer.site-footer')).map((e) => e.id));
  expect(order).toEqual(SECTIONS);
  await expect(page.locator('#servers')).toHaveCount(0);
  for (const id of SECTIONS) {
    await page.locator('#' + id).scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.locator('#' + id).screenshot({ path: path.join(SHOTS, `${info.project.name}-sec-${id}.png`) });
  }
  await page.waitForTimeout(800);
  // Every image the drawer loads is under 200 KB (the lid frames belong to the hero).
  const big = images.filter((i) => !/\/frames\//.test(i.url) && i.kb > 200);
  expect(big).toEqual([]);
  // Numbers that are claims: these and no others below the hero.
  // (The cloud panel's tally counts the boxes it draws; it is not a claim, so it is left out.)
  const text = await page.evaluate((ids) => ids.map((id) => {
    const c = document.getElementById(id).cloneNode(true);
    c.querySelectorAll('.flow-tally, .zs-root, script, style').forEach((el) => el.remove()); // the product frames (screens library) carry invented figures, not claims; code is not text
    return c.textContent;
  }).join(' '), SECTIONS);
  const nums = Array.from(new Set(text.replace(/\[[A-Z]+_\d+\]/g, '').match(/\$?\d[\d,.]*(\s?GB|%\+?)?/g) || []));
  const allowed = ['99%+', '99%', '90%', '16 GB', '$0', '01', '02', '03', '2026'];
  expect(nums.filter((n) => !allowed.includes(n))).toEqual([]);
  await expect(page.locator('#why-h')).toHaveText('Why ZOE AI.');
  for (const id of ['privacy', 'terms']) {
    await page.locator(`.site-footer a[href="#${id}"]`).click();
    await expect(page.locator('#' + id)).toBeVisible();
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-modal-${id}.png`) });
    await page.keyboard.press('Escape');
    await expect(page.locator('#' + id)).toBeHidden();
  }
  const privacy = await page.locator('#privacy').textContent();
  ['no servers of its own', 'GitHub Pages', 'formsubmit.co', 'Booking a technical demo sends your name', 'No visitor analytics'].forEach((t) => expect(privacy).toContain(t));
  ['Google Sheets', 'Google Apps Script', 'non-disclosure'].forEach((t) => expect(privacy).not.toContain(t));
  expect(privacy).not.toMatch(/private servers/);
  expect(privacy).not.toMatch(/Credly/i); // nothing loads from Credly any more
  expect(privacy).toContain('No visitor analytics are collected at present.');
});

test('the living O: the wordmark overlay rides the drift, the bubble O grows, the small O turns', async ({ page }, info) => {
  await page.goto('/');
  await page.waitForTimeout(800);
  // The overlay's centre sits on the ring's measured centre (frame 1: 851.56, 207.45 of 1920 x 1080).
  await page.waitForFunction(() => window.__zoeHero.gesture === 'phone', null, { timeout: 30000 });
  await page.evaluate(() => window.__zoeHero.perform('tap'));
  await page.waitForFunction(() => window.__zoeHero.gesture === 'lid', null, { timeout: 40000 });
  await page.waitForTimeout(1500);
  const at = async (fx, fy) => {
    const s = await page.locator('.scene').boundingBox();
    const o = await page.locator('.logo-o').boundingBox();
    return { dx: o.x + o.width / 2 - (s.x + fx * s.width), dy: o.y + o.height / 2 - (s.y + fy * s.height) };
  };
  const f1 = await at(851.56 / 1920, 207.45 / 1080);
  expect(Math.abs(f1.dx)).toBeLessThan(1.5);
  expect(Math.abs(f1.dy)).toBeLessThan(1.5);
  expect(await page.locator('.logo-o-a').evaluate((e) => e.getAnimations()[0].playState)).toBe('running');
  await waitWorking(page, 40000);
  // Frame 45 after the lid opened: the ring has drifted to (841.48, 199.63); the scene may be zoomed, so measure unscaled.
  const drift = await page.evaluate(() => {
    const st = getComputedStyle(document.querySelector('.logo-o'));
    return [st.getPropertyValue('--odx'), st.getPropertyValue('--ody')].map(Number);
  });
  expect(Math.abs(drift[0] * 1920 - (841.48 - 851.56))).toBeLessThan(0.6);
  expect(Math.abs(drift[1] * 1920 - (199.63 - 207.45))).toBeLessThan(0.6);
  await page.waitForFunction(() => document.querySelector('.zoe').classList.contains('is-talking') || document.querySelector('.zoe').classList.contains('is-working'), null, { timeout: 30000 });
  // It grows while ZOE talks or works (the growth is a transition, so wait for it).
  await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector('.zoe-mark .o-wrap')).transform).a > 1.5, null, { timeout: 8000 });
  expect(await page.locator('.foot-logo .wordmark-o').evaluate((e) => e.getAnimations()[0].playState)).toBe('running');
  await page.locator('.logo-o').screenshot({ path: path.join(SHOTS, `${info.project.name}-logo-o.png`) }).catch(() => {});
});

test('the living O under reduced motion: still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForTimeout(500);
  expect(await page.locator('.logo-o-a').evaluate((e) => e.getAnimations().length)).toBe(0);
});

test('portrait round trip: the cloud above the laptop, the stream rising to it', async ({ page }, info) => {
  test.skip(isWide(info), 'portrait layout');
  test.setTimeout(150000);
  await open(page);
  await openLid(page);
  await page.waitForFunction(() => document.querySelector('.stream-label').classList.contains('is-on'), null, { timeout: 120000 });
  await page.waitForTimeout(1200);
  const cloud = await page.locator('.cloud').boundingBox();
  const screen = await page.locator('.screen').boundingBox();
  const label = await page.locator('.stream-label').boundingBox();
  expect(cloud.y + cloud.height).toBeLessThan(screen.y);
  expect(label.y).toBeGreaterThan(cloud.y + cloud.height - 4);
  expect(label.y + label.height).toBeLessThan(screen.y);
  // 13 px on the phone: the label "SCRUBBED INFORMATION · NO PII" is longer than the old one and stays clear of the Wi-Fi callout.
  expect(await page.locator('.stream-label').evaluate((e) => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(13);
});

test('comparison: Standard cloud AI chosen to begin with, each panel animates, switching works', async ({ page }, info) => {
  await page.goto('/#dataflow');
  await page.locator('#dataflow').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => window.__zoeCompare && window.__zoeCompare.running, null, { timeout: 8000 });
  await expect(page.locator('#flow-cloud')).toBeVisible();
  await expect(page.locator('#flow-zoe')).toBeHidden();
  await expect(page.locator('.flow-pick[data-pick="cloud"]')).toHaveAttribute('aria-selected', 'true');
  for (const [which, t] of [['cloud', 6800], ['zoe', 6000]]) {
    await page.locator(`.flow-pick[data-pick="${which}"]`).click();
    await expect(page.locator(`#flow-${which}`)).toBeVisible();
    await expect(page.locator(`#flow-${which === 'cloud' ? 'zoe' : 'cloud'}`)).toBeHidden();
    await page.waitForFunction(() => window.__zoeCompare.running, null, { timeout: 3000 });
    await page.evaluate((ms) => window.__zoeCompare.seek(ms), t);
    await page.waitForTimeout(100);
    await page.locator('#dataflow').screenshot({ path: path.join(SHOTS, `${info.project.name}-compare-${which}.png`) });
  }
  await page.locator('.flow-pick[data-pick="cloud"]').click();
  // Part way: the document has reached the vendor cloud, and the tally has counted the three hops.
  await page.evaluate(() => window.__zoeCompare.seek(3200));
  expect(await page.locator('#flow-cloud .fl-tag').evaluateAll((els) => els.filter((e) => +getComputedStyle(e).opacity > 0.9).length)).toBe(3);
  await expect(page.locator('#flow-cloud .flow-tally')).toHaveText('3 attack surfaces');
  await page.locator('#dataflow').screenshot({ path: path.join(SHOTS, `${info.project.name}-compare-cloud-hops.png`) });
  // At the end: every node past the control line is tagged; the trailing boxes count too.
  await page.evaluate(() => window.__zoeCompare.seek(6800));
  expect(await page.locator('#flow-cloud .fl-tag').evaluateAll((els) => els.filter((e) => +getComputedStyle(e).opacity > 0.9).length)).toBe(8);
  await expect(page.locator('#flow-cloud .flow-tally')).toHaveText('11 attack surfaces');
  const labels = await page.locator('#flow-cloud .fl-t').allTextContents();
  ['Your laptop', 'Office router', 'Vendor cloud', 'Confidentiality services (PII)', 'Search index (RAG)', 'Cloud AI models (LLM)',
    'Logging & evaluation', 'Additional subprocessors'].forEach((t) => expect(labels).toContain(t));
  expect(labels.join(' ').replace(/\s+/g, ' ')).toContain('provider (ISP)');
  // Every label fits its box.
  const over = await page.$$eval('#flow-cloud .fl-box', (rs) => rs.flatMap((r) => {
    const b = r.getBBox();
    const out = [];
    for (let t = r.nextElementSibling; t && t.tagName === 'text'; t = t.nextElementSibling) {
      const tb = t.getBBox();
      if (tb.x < b.x || tb.x + tb.width > b.x + b.width) out.push(t.textContent);
    }
    return out;
  }));
  expect(over).toEqual([]);
  // The panel's own words stay in the panel: nowhere else on the page.
  const outside = await page.evaluate(() => {
    const c = document.body.cloneNode(true);
    c.querySelectorAll('#flow-cloud, script, noscript').forEach((el) => el.remove());
    return c.textContent;
  });
  PANEL_ONLY.forEach(({ re, cs }) => expect(outside.match(new RegExp(re, cs ? 'g' : 'gi'))).toBeNull());
  await page.locator('.flow-pick[data-pick="zoe"]').click();
  await page.evaluate(() => window.__zoeCompare.seek(6000));
  expect(+(await page.locator('#flow-zoe .mv-packet').evaluate((e) => getComputedStyle(e).opacity))).toBeGreaterThan(0.9);
});


// Whether a comparison pill is glowing (its ::after ring breathing).
const glowing = (page, which) => page.locator(`.flow-pick[data-pick="${which}"]`).evaluate((e) => {
  const a = getComputedStyle(e, '::after');
  return a.content !== 'none' && a.animationName !== 'none';
});

test('comparison: the cloud panel plays once, types its point, holds, then flips to ZOE AI; a click cancels the flip', async ({ page }, info) => {
  test.setTimeout(90000);
  await page.goto('/');
  await page.waitForTimeout(400);
  await page.evaluate(() => window.__zoeHero.toComparison());
  await expect(page.locator('#flow-h')).toHaveText('Security through architecture');
  await expect(page.locator('#dataflow .flow-lede')).toHaveText('No encryption scheme or indemnity clause is as secure as keeping the data on your own machine. The team at ZOE AI believes in professionals taking back control of their data.');
  await page.waitForFunction(() => window.__zoeCompare && window.__zoeCompare.running, null, { timeout: 8000 });
  // On arrival: Standard cloud AI selected and still; the ZOE AI System pill glows, with its tag.
  await expect(page.locator('.flow-pick[data-pick="zoe"]')).toHaveText(/^ZOE AI/);
  await expect(page.locator('.flow-pick[data-pick="zoe"]')).not.toContainText('System');
  await expect(page.locator('.flow-pick[data-pick="zoe"] .patent')).toHaveText('Patent pending');
  expect(await glowing(page, 'cloud')).toBe(false);
  expect(await glowing(page, 'zoe')).toBe(true);
  await page.waitForTimeout(600);
  await page.locator('#dataflow .flow-choose').screenshot({ path: path.join(SHOTS, `${info.project.name}-pills-arrival.png`) });
  await page.waitForFunction(() => window.__zoeCompare.finished, null, { timeout: 15000 });
  await page.waitForFunction(() => window.__zoeCompare.typed, null, { timeout: 8000 });
  const typedAt = Date.now();
  const cap = await page.locator('#flow-cloud .fl-cap').evaluateAll((els) => els.map((e) => e.textContent).join(' '));
  expect(cap).toBe("Multiple hops. Every system past the router is one you don't control.");
  const point = await page.locator('#flow-cloud .fl-point').evaluateAll((els) => els.map((e) => e.textContent).join(' '));
  expect(point).toBe('A chain of AI vendors and subprocessors is a larger attack surface than traditional cloud software.');
  expect(await page.locator('#flow-cloud svg title').textContent()).toContain('eleven attack surfaces');
  // It holds: the caption stays, nothing loops.
  await page.waitForTimeout(2500);
  expect(await page.locator('#flow-cloud .fl-captions').evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
  expect(await page.evaluate(() => window.__zoeCompare.picked)).toBe('cloud');
  await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-compare-cloud-done.png`) }); // the viewport: the section is now taller than a 900 px screen
  await page.waitForFunction(() => window.__zoeCompare.picked === 'zoe', null, { timeout: 8000 });
  metrics.compare_flip_after_typed_ms = Date.now() - typedAt;
  // After the flip neither pill glows, for the rest of the visit.
  await page.waitForTimeout(400);
  expect(await glowing(page, 'cloud')).toBe(false);
  expect(await glowing(page, 'zoe')).toBe(false);
  await page.locator('#dataflow .flow-choose').screenshot({ path: path.join(SHOTS, `${info.project.name}-pills-after-flip.png`) });
  expect(metrics.compare_flip_after_typed_ms).toBeGreaterThan(4000);
  expect(metrics.compare_flip_after_typed_ms).toBeLessThan(6500);
  // ZOE AI: the pill fits its text; the blurb replaces "(optional)"; the caption stays once in.
  const pill = await page.locator('#flow-zoe .fl-badge').evaluate((t) => { const b = t.getBBox(); const r = t.previousElementSibling.getBBox(); return b.x >= r.x && b.x + b.width <= r.x + r.width; });
  expect(pill).toBe(true);
  const zoeText = await page.locator('#flow-zoe svg').textContent();
  expect(zoeText).toContain("cloud AI, or a high-end");
  expect(zoeText).not.toContain('(optional)');
  await page.waitForTimeout(9000);
  expect(await page.locator('#flow-zoe .fl-captions').evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
  await page.locator('#dataflow').screenshot({ path: path.join(SHOTS, `${info.project.name}-compare-zoe-held.png`) });
  // A click back to Standard plays it again and never flips by itself.
  await page.locator('.flow-pick[data-pick="cloud"]').click();
  await page.waitForFunction(() => window.__zoeCompare.typed, null, { timeout: 20000 });
  await page.waitForTimeout(6500);
  expect(await page.evaluate(() => window.__zoeCompare.picked)).toBe('cloud');
});

test('comparison fits one phone screen: heading, choices and the whole panel at 390x664 and 390x844', async ({ browser }, info) => {
  test.skip(isWide(info), 'phone sizes');
  for (const height of [664, 844]) {
    const ctx = await newGuardedContext(browser, { viewport: { width: 390, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto(BASE);
    await page.waitForTimeout(400);
    await page.evaluate(() => window.__zoeHero.toComparison());
    await page.waitForFunction(() => window.__zoeCompare && window.__zoeCompare.picked === 'cloud', null, { timeout: 8000 });
    await page.waitForTimeout(1200);
    for (const which of ['cloud', 'zoe']) {
      if (which === 'zoe') { await page.locator('.flow-pick[data-pick="zoe"]').click(); await page.waitForTimeout(400); }
      const r = await page.evaluate((w) => ({ head: document.getElementById('flow-h').getBoundingClientRect().top, bottom: document.getElementById(`flow-${w}`).getBoundingClientRect().bottom, vh: innerHeight }), which);
      expect(r.head).toBeGreaterThanOrEqual(0);
      expect(r.bottom).toBeLessThanOrEqual(r.vh);
      await page.screenshot({ path: path.join(SHOTS, `phone-${height}-compare-${which}.png`) });
    }
    await ctx.close();
  }
});

test('comparison under reduced motion: a still picture', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#dataflow').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => window.__zoeCompare, null, { timeout: 8000 });
  await page.locator('.flow-pick[data-pick="cloud"]').click();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__zoeCompare.running)).toBe(false);
  await expect(page.locator('#flow-cloud .fl-captions')).toHaveCSS('opacity', '1');
});

test('the booking page: no NDA, the booking relayed to email (intercepted, nothing sent)', async ({ browser }, info) => {
  const { viewport, deviceScaleFactor, isMobile, hasTouch } = info.project.use;
  const ctx = await newGuardedContext(browser, { viewport, deviceScaleFactor, isMobile, hasTouch });
  // The relay (and the Google script host) is answered by the guard in newGuardedContext(): no booking ever leaves the test.
  const sent = ctx.blockedForms;
  const page = await ctx.newPage();
  await page.goto(BASE + 'book-demo.html');
  await expect(page.locator('link[href="pages.css"]')).toHaveCount(1);
  // Demos start on December 1, 2026: the calendar opens there and nothing earlier can be picked.
  await expect(page.locator('#cal-month-year')).toHaveText('December 2026');
  await expect(page.locator('#cal-prev')).toBeDisabled();
  await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-page-book-demo.png`), fullPage: true });
  await page.locator('.calendar-day:not(:disabled):not(.day-other-month):not(.day-weekend)').first().click();
  await expect(page.locator('#step-2')).toHaveClass(/active/);
  await expect(page.locator('#selected-date-display')).toHaveText('Tuesday, December 1, 2026');
  await page.locator('.time-slot').first().click();
  await expect(page.locator('#step-3')).toHaveClass(/active/);
  await expect(page.locator('#bk-submit')).toHaveText('Book Demo');
  expect(await page.locator('body').innerText()).not.toMatch(/\bNDA\b|non-disclosure/i);
  await page.locator('#bk-name').fill('Test Visitor');
  await page.locator('#bk-email').fill('test@example.test');
  await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-page-book-demo-step3.png`), fullPage: true });
  await page.locator('#bk-submit').click();
  await expect(page.locator('#step-done')).toHaveClass(/active/);
  await expect(page.locator('#conf-date')).toHaveText('Tuesday, December 1, 2026');
  // The one submit this test makes was caught by the guard, never sent.
  expect(sent.length).toBe(1);
  expect(sent[0].url).toBe('https://formsubmit.co/ajax/info@zoemachine.com');
  expect(JSON.parse(sent[0].body || '{}')).toMatchObject({ name: 'Test Visitor', email: 'test@example.test', preferred_date: 'Tuesday, December 1, 2026' });
  await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-page-book-demo-done.png`), fullPage: true });
  // The old NDA address sends visitors back to booking.
  const old = await ctx.newPage();
  await old.goto(BASE + 'nda.html');
  await old.waitForURL(/book-demo\.html$/, { timeout: 5000 });
  sent.length = 0; // the one expected, caught submit is asserted above
  await ctx.close();
});

// Lands the page in its post-introduction state by hand: the class the hero's exit sets, and the scroll unlock.
async function introDone(page) {
  await page.evaluate(() => {
    document.documentElement.classList.add('intro-done');
    return window.__zoeHero.toComparison();
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}

// Waits until the page has stopped scrolling (smooth scrolls to far sections take more than a second).
async function settled(page) {
  let last = -1;
  let same = 0;
  for (let i = 0; i < 40 && same < 3; i += 1) {
    await page.waitForTimeout(200);
    const y = await page.evaluate(() => Math.round(window.scrollY));
    same = y === last ? same + 1 : 0;
    last = y;
  }
}

test('navigation: hidden during the introduction, slides in on intro-done, every link lands below the bar', async ({ page }, info) => {
  await open(page);
  const bar = page.locator('.site-nav-bar');
  // During the introduction: off screen, not visible, and it takes no room (the stage is still exactly one screen).
  await expect(bar).toBeHidden();
  const vh = await page.evaluate(() => innerHeight);
  expect(await page.locator('.stage').evaluate((el) => Math.round(el.getBoundingClientRect().height))).toBe(vh);
  await introDone(page);
  await expect(bar).toBeVisible();
  await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-nav-top.png`) });
  const narrow = !isWide(info);
  const links = [['Secure architecture', '#dataflow'], ['Advantages', '#why'], ['Leadership', '#founder']];
  if (narrow) {
    await page.locator('.nav-toggle').click();
    await expect(page.locator('.nav-toggle')).toHaveAttribute('aria-expanded', 'true');
    await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-nav-menu.png`) });
    await page.locator('.nav-toggle').click();
  }
  expect((await page.locator('.nav-links > a, .nav-links .nav-abilities').allTextContents()).map((t) => t.trim())).toEqual(['Product abilities', ...links.map((l) => l[0])]);
  // The solid button, exact label, to the booking page.
  await expect(page.locator('.nav-book')).toHaveText('Book a demo');
  await expect(page.locator('.nav-book')).toHaveAttribute('href', 'book-demo.html');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
  const barH = await bar.evaluate((el) => Math.round(el.getBoundingClientRect().height));
  for (const [label, hash] of links) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    if (narrow) await page.locator('.nav-toggle').click();
    await page.locator('.nav-links > a', { hasText: label }).click();
    await settled(page);
    const top = await page.locator(hash).evaluate((el) => Math.round(el.getBoundingClientRect().top));
    expect(top, `${label} lands at the bar's lower edge`).toBeGreaterThanOrEqual(barH - 2);
    expect(top).toBeLessThan(barH + 60);
  }
  // The bar is sticky (still on screen at the bottom of the page); the wordmark scrolls to the top.
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  expect(await bar.evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(0);
  await page.locator('.nav-brand').click();
  await page.waitForFunction(() => window.scrollY === 0, null, { timeout: 4000 });
  // Replay removes the class: the bar goes away again.
  await page.evaluate(() => document.documentElement.classList.remove('intro-done'));
  await expect(bar).toBeHidden();
});

test('booking is the main call: no Express Interest, no NDA step, the contact form is blocked from sending', async ({ page }, info) => {
  // Text search of every built page and script.
  const files = ['index.html', 'book-demo.html', 'nda.html', 'hero.js', 'agreement.js', 'compare.js', 'drawer.css', 'nav.css', 'pages.css'];
  for (const f of files) {
    const text = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/data:image\/webp;base64,[^"]+/g, '');
    expect(text.match(/Express Interest/gi), `${f} still says "Express Interest"`).toBeNull();
  }
  // No link or sentence on the home page sends a visitor to an NDA step (nda.html itself redirects to booking).
  const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/data:image\/webp;base64,[^"]+/g, '');
  expect(home.match(/nda\.html|non-disclosure|\bNDA\b/gi)).toBeNull();
  await page.goto('/');
  await introDone(page);
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('#contact-h')).toHaveText('Book a Technical Demo Today');
  const big = page.locator('#contact .cta-big');
  await expect(big).toHaveText('Choose a date');
  await expect(big).toHaveAttribute('href', 'book-demo.html');
  // The large button comes straight after the heading, above the form.
  const above = await page.evaluate(() => document.querySelector('#contact .cta-big').getBoundingClientRect().top
    < document.querySelector('#contact .msg-form').getBoundingClientRect().top
    && document.querySelector('#contact-h').nextElementSibling.contains(document.querySelector('#contact .cta-big')));
  expect(above).toBe(true);
  await expect(page.locator('#contact .form-h')).toHaveText('Questions or Investor Inquiries');
  await expect(page.locator('#contact input[name="_subject"]')).toHaveValue('New Inquiry from ZOE AI Website');
  await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-contact.png`) });
  // Pressing Send on the message form reaches the guard, never the relay.
  await page.locator('#contact input[name="name"]').fill('Test Visitor');
  await page.locator('#contact input[name="email"]').fill('test@example.test');
  await page.locator('#contact textarea[name="message"]').fill('Test message');
  const blocked = page.context().blockedForms;
  await page.locator('#contact button[type="submit"]').click();
  await expect.poll(() => blocked.length).toBe(1);
  expect(blocked[0].url).toBe('https://formsubmit.co/info@zoemachine.com');
  expect(decodeURIComponent(blocked[0].body.replace(/\+/g, ' '))).toContain('New Inquiry from ZOE AI Website');
  blocked.length = 0; // the one expected, caught submit is asserted above
});

test('the triage card sits directly under the stage, with its roadmap badge, and nothing about review platforms or legal research', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('#triage .wf-triage');
  expect(await page.evaluate(() => document.querySelector('.stage').nextElementSibling.tagName === 'NOSCRIPT' ? document.querySelector('.stage').nextElementSibling.nextElementSibling.id : document.querySelector('.stage').nextElementSibling.id)).toBe('triage');
  await expect(page.locator('#workflows')).toHaveCount(0);
  await expect(card.locator('h3')).toHaveText('Local Document Triage & Screening');
  await expect(card.locator('.road-badge')).toHaveText('On the roadmap');
  await expect(card.locator('li', { hasText: 'Claims screening for e-discovery' }).locator('.road-badge')).toHaveCount(1);
  const text = (await page.locator('#triage').textContent()).toLowerCase();
  ['production set', 'bates', 'legal hold', 'review platform', 'legal research'].forEach((w) => expect(text).not.toContain(w));
});

// The four product abilities: id, name, the app the laptop shows, and what each view label puts on the screen.
const ABILITIES = [
  { id: 'word', name: 'Full Word Support', app: /^Word File Edit View/, screen: /Section 9\.6/,
    text: ['ZOE AI includes a full-featured Microsoft Word add-in that lets attorneys draft and review documents without leaving Word. It supports automated drafting, redline review and quality-of-life features for drafting and reviewing in Word. Complex automated document processing happens without the document ever leaving your laptop or desktop: client information stays local.'] },
  { id: 'templates', name: 'Templates & Clauses', app: /^Safari File Edit View/, screen: /ZOE read your search as/i,
    text: ["Search every clause and template your firm prefers to use, without giving up control to the cloud. Your firm's intellectual property stays local, and each attorney can search the firm's preferred templates and language instantly.",
      'ZOE AI does not upload your library to a cloud server: it stays on your laptop. Templates and firm language are shared with cloud AI only on a need-to-know basis.'] },
  { id: 'diligence', name: 'Diligence & Local Discovery', app: /^Safari File Edit View/, screen: /filter/i,
    text: ['Expedite due diligence across thousands of documents with no internet access needed. Then supercharge it with the best AI models while ZOE AI acts as a firewall, keeping sensitive information from going to the cloud.',
      'The fast sweep reads thousands of documents and makes them searchable in a single sitting; the deep pass maps entities and traces relationships across the data room, with a citation behind each one. It identifies the signatory, party, role, agreement type, date, governing law and other critical information.'] },
  { id: 'privacy', name: 'Privacy Scrub & Cloud Processing', app: /^Safari File Edit View/, screen: /Party \d/,
    text: ["The local ZOE AI system acts as the first line of defense against data leaks, protecting client information and law firm intellectual property. Cloud AI requests confidential information on a need-to-know basis, putting control back in the hands of the lawyer, who can now use the world's best AI models without giving up control of the firm's intellectual property or confidential client data."] },
];

// The post-introduction page, reached by the skip hook (the story's own end and the skip land in the same state).
async function postPage(page) {
  await open(page);
  await page.evaluate(() => window.__zoeHero.skip());
  await expect(page.locator('.post-hero')).toBeVisible();
  await page.waitForTimeout(1200);
}

const menubar = (page) => page.locator('.screen .zs-menubar').innerText().then((t) => t.replace(/\s+/g, ' '));

// Opens the navigation's "Product abilities" list (on a phone, the menu first).
async function openAbilities(page, info) {
  if (!isWide(info) && !(await page.locator('.site-nav').evaluate((e) => e.classList.contains('is-open')))) await page.locator('.nav-toggle').click();
  if ((await page.locator('.nav-abilities').getAttribute('aria-expanded')) !== 'true') await page.locator('.nav-abilities').click();
  await expect(page.locator('.nav-ability-list')).toBeVisible();
}

// What a chosen ability must look like: the hero's data, the description, the laptop's app, the navigation's mark.
async function expectAbility(page, a, { hash = true } = {}) {
  await page.waitForFunction((id) => window.__zoeHero.ability === id, a.id, { timeout: 8000 });
  expect(await page.evaluate(() => document.documentElement.getAttribute('data-ability-current'))).toBe(a.id);
  await expect(page.locator(`.ability[data-id="${a.id}"]`)).toBeVisible();
  for (const other of ABILITIES.filter((x) => x.id !== a.id)) await expect(page.locator(`.ability[data-id="${other.id}"]`)).toBeHidden();
  await expect(page.locator(`.ability[data-id="${a.id}"] h3`)).toHaveText(a.name);
  await page.waitForFunction((src) => new RegExp(src).test(document.querySelector('.screen .zs-menubar').innerText.replace(/\s+/g, ' ')), a.app.source, { timeout: 8000 });
  await expect(page.locator(`.nav-ability-list a[data-ability="${a.id}"]`)).toHaveAttribute('aria-current', 'true');
  expect(await page.locator('.nav-ability-list a[aria-current="true"]').count()).toBe(1);
  // (A click or key sets the address to #wf-<id>; the test hook showAbility does not.)
  if (hash) expect(await page.evaluate(() => location.hash)).toBe(`#wf-${a.id}`);
}

test('after the introduction: the headline, the subhead, the four abilities beside a smaller laptop, and nothing else', async ({ page }, info) => {
  const errors = watchErrors(page);
  await postPage(page);
  await expect(page.locator('.post-h')).toHaveText('Safe. Sovereign. System-bound.');
  await expect(page.locator('.post-sub')).toHaveText('Take back control of your data. Automate document drafting and diligence, without exposing client data or law firm IP. Runs on the laptop you already have; no new hardware.');
  // Gone from the hero: the booking button (the navigation's button is the call), Replay, and the row of tabs.
  expect(await page.locator('.post-book, .post-replay, .post-tab, .post-tabs').count()).toBe(0);
  expect(await page.locator('.nav-book').textContent()).toBe('Book a demo');
  // The four descriptions are real text; only the selected one shows; Full Word Support first.
  expect(await page.locator('.abilities .ability').count()).toBe(4);
  expect(await page.locator('.ability[data-id]').evaluateAll((els) => els.map((e) => e.dataset.id))).toEqual(['word', 'templates', 'diligence', 'privacy']);
  await expect(page.locator('.ability[data-id="word"]')).toBeVisible();
  expect(await hero(page, 'ability')).toBe('word');
  // One screen per ability: no view labels, no link to the evidence section.
  expect(await page.locator('.ab-view, .ab-views, .ab-link').count()).toBe(0);
  // The four descriptions, word for word (the page's apostrophes are typographic).
  for (const a of ABILITIES) {
    const paras = await page.locator(`.ability[data-id="${a.id}"] > p`).allTextContents();
    expect(paras.map((t) => t.replace(/\u2019/g, "'").trim()), `${a.id} text`).toEqual(a.text);
  }
  await expect(page.locator('.ability[data-id="word"] .ab-next')).toHaveText(/Next: Templates & Clauses/);
  // The old names and the old phrase appear nowhere on the page.
  const abText = await page.locator('.abilities').textContent();
  ['Drafting in Word', 'Corporate Diligence', 'almost no latency'].forEach((t) => expect(abText).not.toContain(t));
  // The laptop's screen sits inside the laptop: rounded and clipped, inside the viewport's width.
  const scr = await page.locator('.screen').evaluate((el) => { const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return { radius: parseFloat(s.borderTopLeftRadius), clip: s.clipPath, left: b.left, right: b.right, vw: innerWidth }; });
  expect(scr.radius).toBeGreaterThan(0);
  expect(scr.clip).not.toBe('none');
  expect(scr.left).toBeGreaterThanOrEqual(0);
  expect(scr.right).toBeLessThanOrEqual(scr.vw);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
  // Wide: the description is on the left of the laptop, the pair inside the first screen.
  if (isWide(info)) {
    const pair = await page.evaluate(() => ({ d: document.querySelector('.ability:not([hidden])').getBoundingClientRect(), s: document.querySelector('.screen').getBoundingClientRect(), vh: innerHeight }));
    expect(pair.d.right).toBeLessThanOrEqual(pair.s.left + 4);
    expect(pair.s.bottom).toBeLessThanOrEqual(pair.vh);
  }
  await shot(page, info, 'post-hero');
  expect(errors).toEqual([]);
});

test('Product abilities: the dropdown drives the laptop and the description, by mouse and by keyboard', async ({ page }, info) => {
  test.setTimeout(120000);
  const errors = watchErrors(page);
  await postPage(page);
  const btn = page.locator('.nav-abilities');
  // Closed to begin with; a click opens it with the four, in order, each pointing at its ability.
  await expect(page.locator('.nav-ability-list')).toBeHidden();
  await openAbilities(page, info);
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  expect(await page.locator('.nav-ability-list a').evaluateAll((els) => els.map((e) => [e.textContent, e.getAttribute('href'), e.dataset.ability]))).toEqual(
    ABILITIES.map((a) => [a.name, `#wf-${a.id}`, a.id]));
  await shot(page, info, 'dropdown-open');
  // Escape closes it (and returns to the button); so does a click elsewhere.
  if (isWide(info)) {
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await btn.click();
    await page.mouse.click(8, 600);
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  } else {
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  }
  // By mouse: each of the four changes the description and the laptop together, and closes the list.
  for (const a of [...ABILITIES].reverse().concat(ABILITIES[0])) {
    await openAbilities(page, info);
    await page.locator(`.nav-ability-list a[data-ability="${a.id}"]`).click();
    await expectAbility(page, a);
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(40); // the hero comes into view
  }
  await shot(page, info, 'ability-word');
  // By keyboard (desktop): Enter opens, Arrow Down walks the list, Enter chooses; focus lands on the new heading.
  if (isWide(info)) {
    for (let k = 0; k < ABILITIES.length; k += 1) {
      const a = ABILITIES[(k + 1) % ABILITIES.length];
      await btn.focus();
      await page.keyboard.press('Enter');
      await expect(btn).toHaveAttribute('aria-expanded', 'true');
      const idx = ABILITIES.indexOf(a);
      for (let i = 0; i <= idx; i += 1) await page.keyboard.press('ArrowDown');
      await expect(page.locator(`.nav-ability-list a[data-ability="${a.id}"]`)).toBeFocused();
      await page.keyboard.press('Enter');
      await expectAbility(page, a);
      await expect(page.locator(`.ability[data-id="${a.id}"] h3`)).toBeFocused();
    }
  }
  expect(errors).toEqual([]);
});

test('each ability shows one screen; Next walks through the four', async ({ page }, info) => {
  test.setTimeout(150000);
  const errors = watchErrors(page);
  await postPage(page);
  for (const a of ABILITIES) {
    await page.evaluate((id) => window.__zoeHero.showAbility(id), a.id);
    await expectAbility(page, a, { hash: false });
    await page.waitForFunction((src) => new RegExp(src, 'i').test(document.querySelector('.screen').innerText.replace(/\s+/g, ' ')), a.screen.source, { timeout: 8000 });
    if (a.id === 'word') {
      // Full Word Support: Section 9.6 as tracked red text after Article IX, nothing struck, no review insertion in view, the pane open inside Word's window, one zoom.
      await page.waitForTimeout(1500);
      const w = await page.evaluate(() => {
        const pg = document.querySelector('.screen .zs-page');
        const win = document.querySelector('.screen .zs-word').getBoundingClientRect();
        const pr = document.querySelector('.screen .zs-pane').getBoundingClientRect();
        const cv = document.querySelector('.screen .zs-canvas').getBoundingClientRect();
        const cl = pg.querySelector('[data-id="s93new"]');
        const cr = cl && cl.getBoundingClientRect();
        return { struck: pg.querySelectorAll('.zs-del, del, s, strike').length, reserved: /\[Reserved/.test(pg.textContent), clause: cl ? cl.textContent.replace(/\u2019/g, "'") : null,
          inView: !!cr && cr.bottom > cv.top && cr.top < cv.bottom, fixInView: Array.from(pg.querySelectorAll('.b-fix')).filter((f) => !f.hidden && !f.closest('[hidden]') && f.getBoundingClientRect().bottom > cv.top && f.getBoundingClientRect().top < cv.bottom).length,
          pane: pr.width > 0.15 * win.width && pr.height > 0.4 * win.height && !document.querySelector('.screen .zs-pane').hidden && pr.left >= win.left - 1 && pr.right <= win.right + 1 && pr.bottom <= win.bottom + 1, zoom: document.querySelector('.screen .zs-zpct').textContent, web: document.querySelectorAll('.b-web').length };
      });
      expect(w.struck).toBe(0);
      expect(w.reserved).toBe(false);
      expect(w.clause).toBe(CLAUSE_TEXT);
      expect(w.inView).toBe(true);
      expect(w.fixInView).toBe(0);
      expect(w.pane).toBe(true);
      expect(w.zoom).toBe('130%');
      expect(w.web).toBe(0);
    }
    await shot(page, info, `ability-${a.id}`);
  }
  // "Next": a quiet text link at the foot of each description; four steps go round all four and back to the first.
  await page.evaluate(() => window.__zoeHero.showAbility('word'));
  await expectAbility(page, ABILITIES[0], { hash: false });
  for (let k = 1; k <= ABILITIES.length; k += 1) {
    const from = ABILITIES[(k - 1) % ABILITIES.length];
    const to = ABILITIES[k % ABILITIES.length];
    const next = page.locator(`.ability[data-id="${from.id}"] .ab-next`);
    await expect(next).toContainText(`Next: ${to.name}`);
    await expect(next).toHaveAttribute('data-ability', to.id);
    await next.click();
    await expectAbility(page, to);
  }
  // By keyboard: Enter on Next moves on and focus follows to the new heading.
  await page.locator('.ability[data-id="word"] .ab-next').focus();
  await page.keyboard.press('Enter');
  await expectAbility(page, ABILITIES[1]);
  await expect(page.locator('.ability[data-id="templates"] h3')).toBeFocused();
  expect(errors).toEqual([]);
});

test('direct links: /#wf-<ability> opens the post-introduction page with that ability selected, no story', async ({ page }, info) => {
  test.setTimeout(120000);
  const errors = watchErrors(page);
  for (const a of ABILITIES) {
    await page.goto('about:blank');
    await page.goto(`/#wf-${a.id}`);
    await page.waitForFunction((id) => window.__zoeHero && window.__zoeHero.ability === id, a.id, { timeout: 15000 });
    const r = await page.evaluate(() => ({
      introDone: document.documentElement.classList.contains('intro-done'),
      locked: window.__zoeHero.locked,
      act: window.__zoeHero.act,
      nav: getComputedStyle(document.querySelector('.site-nav-bar')).visibility,
      hero: !document.querySelector('.post-hero').hidden,
      wide: document.documentElement.scrollWidth <= innerWidth,
    }));
    expect(r, `/#wf-${a.id}`).toEqual({ introDone: true, locked: false, act: 6, nav: 'visible', hero: true, wide: true });
    await expectAbility(page, a);
  }
  await shot(page, info, 'direct-link-privacy');
  expect(errors).toEqual([]);
});

test('the booking page\'s Product abilities list arrives at the right ability', async ({ page }, info) => {
  test.setTimeout(120000);
  const errors = watchErrors(page);
  for (const a of ABILITIES) {
    await page.goto('/book-demo.html');
    await page.locator('.nav-abilities').click();
    await expect(page.locator('.nav-ability-list')).toBeVisible();
    expect(await page.locator('.nav-ability-list a[data-ability]').evaluateAll((els) => els.map((e) => e.getAttribute('href')))).toEqual(ABILITIES.map((x) => `index.html#wf-${x.id}`));
    await page.locator(`.nav-ability-list a[data-ability="${a.id}"]`).click();
    await page.waitForURL(new RegExp(`index\\.html#wf-${a.id}$`), { timeout: 8000 });
    await page.waitForFunction((id) => window.__zoeHero && window.__zoeHero.ability === id, a.id, { timeout: 15000 });
    await expectAbility(page, a);
  }
  // The page's other links point at the home page's sections.
  await page.goto('/book-demo.html');
  expect(await page.locator('.nav-links > a').evaluateAll((els) => els.map((e) => [e.textContent.trim(), e.getAttribute('href')]))).toEqual([
    ['Secure architecture', 'index.html#dataflow'], ['Advantages', 'index.html#why'], ['Leadership', 'index.html#founder'], ['Book a demo', 'book-demo.html']]);
  expect(errors).toEqual([]);
});

test('deep links: the navigation shows, the page is unlocked, and the section heading lands clear of the bar', async ({ page }, info) => {
  test.setTimeout(120000);
  const errors = watchErrors(page);
  const targets = [['contact', '#contact-h'], ['evidence', '#ev-h'], ['dataflow', '#flow-h']];
  for (const [id, heading] of targets) {
    await page.goto('about:blank');
    await page.goto(`/#${id}`);
    await page.waitForTimeout(3000);
    const r = await page.evaluate((h) => ({
      introDone: document.documentElement.classList.contains('intro-done'),
      locked: window.__zoeHero.locked,
      nav: getComputedStyle(document.querySelector('.site-nav-bar')).visibility,
      top: Math.round(document.querySelector(h).getBoundingClientRect().top),
      wide: document.documentElement.scrollWidth <= innerWidth,
    }), heading);
    expect(r.introDone, `/#${id}: intro-done is set at load`).toBe(true);
    expect(r.locked).toBe(false);
    expect(r.nav, `/#${id}: the navigation shows`).toBe('visible');
    expect(r.wide).toBe(true);
    expect(r.top, `/#${id}: the heading clears the bar`).toBeGreaterThanOrEqual(60);
    expect(r.top).toBeLessThanOrEqual(100);
  }
  await shot(page, info, 'deep-link-dataflow');
  expect(errors).toEqual([]);
});

// The badge, no request to Credly, the one name, the bracket scan, and the Privacy picture.
test('the certification badge: one image beside the name, one link to its Credly page, no Credly box, no Credly request', async ({ page }, info) => {
  test.setTimeout(90000);
  const credly = [];
  page.on('request', (r) => { if (/credly\.com/i.test(r.url())) credly.push(r.url()); });
  const errors = watchErrors(page);
  await page.goto('/#founder');
  await page.waitForFunction(() => window.__zoeHero, null, { timeout: 15000 });
  await page.locator('#founder').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  const link = page.locator('#founder .ncp-badge a');
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute('href', 'https://www.credly.com/badges/83a23c67-2b3f-47f5-b413-0e97101b8ec3');
  await expect(link).toHaveAttribute('target', '_blank');
  expect(await link.getAttribute('rel')).toMatch(/noopener/);
  expect(await link.getAttribute('rel')).toMatch(/noreferrer/);
  await expect(link).toHaveAttribute('aria-label', 'NVIDIA Certified Professional: Agentic AI (opens the verification page on Credly)');
  await expect(link.locator('figcaption')).toHaveText('NVIDIA Certified Professional: Agentic AI');
  const img = link.locator('img');
  await expect(img).toHaveAttribute('src', 'assets/site/ncp-agentic-ai-badge.png');
  await expect(img).toHaveAttribute('loading', 'lazy');
  await expect(img).toHaveAttribute('width', '78');
  await expect(img).toHaveAttribute('height', '80');
  const st = await img.evaluate((el) => ({ ok: el.complete && el.naturalWidth > 0, nw: el.naturalWidth, nh: el.naturalHeight, h: Math.round(el.getBoundingClientRect().height), w: Math.round(el.getBoundingClientRect().width) }));
  expect(st.ok).toBe(true);
  expect([st.nw, st.nh]).toEqual([156, 160]); // twice the shown size
  expect(st.h).toBe(80);
  // It sits directly under his name and title, inside the section; it is the only link to the badge, and the old box is gone.
  const order = await page.evaluate(() => Array.from(document.querySelectorAll('#founder .person > div:last-child > *')).slice(0, 5).map((e) => e.className || e.tagName.toLowerCase()));
  expect(order.slice(0, 4)).toEqual(['eyebrow', 'sec-h', 'person-role', 'ncp-badge']);
  expect(await page.locator('.credly-badge, [data-share-badge-id], #founder iframe').count()).toBe(0);
  expect(await page.locator('a[href*="credly"]').count()).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  // The file: a PNG with an alpha channel (transparent outside the hexagon), 156 x 160.
  const png = fs.readFileSync(path.join(ROOT, 'assets/site/ncp-agentic-ai-badge.png'));
  expect(png.slice(1, 4).toString()).toBe('PNG');
  expect([png.readUInt32BE(16), png.readUInt32BE(20), png[25]]).toEqual([156, 160, 6]);
  await shot(page, info, 'badge');
  // Nothing was requested from Credly while the page loaded and the section came into view.
  expect(credly).toEqual([]);
  expect(errors).toEqual([]);
});

test('no file loads anything from Credly; the only mention is the badge link', async ({}, info) => {
  test.skip(!isWide(info), 'checked once');
  for (const f of SITE_FILES) {
    let text = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (f === 'index.html') text = text.replace(/<a href="https:\/\/www\.credly\.com\/badges\/[^>]*>/, '');
    expect(text.match(/credly/gi) || [], `${f} mentions Credly`).toEqual([]);
  }
});

test('one name: ZOE AI wherever a visitor can read it (the product\'s own labels inside the screens aside)', async ({ page }, info) => {
  test.setTimeout(120000);
  await postPage(page);
  const scan = () => page.evaluate(() => {
    const BARE = /\bZOE\b(?!\s+AI)|\bZoe\b/;
    // The real product's own labels, as drawn inside its screens (the screens' own labels); everything else must say ZOE AI.
    const OWN = [/^ZOE$/, /^Ask ZOE to find or check something$/i, /As you type a name, ZOE offers the names it knows/, /^ZOE is running$/,
      /Describe what you need\. ZOE finds the templates that fit/, /^ZOE read your search as$/i, /^How ZOE connects, and when it starts work on a new document\.$/];
    const hits = [];
    const check = (where, t, inScreen) => {
      const x = t.replace(/\s+/g, ' ').trim();
      if (!BARE.test(x)) return;
      if (inScreen && OWN.some((re) => re.test(x))) return;
      hits.push(`${where}: ${x.slice(0, 120)}`);
    };
    check('title', document.title, false);
    document.querySelectorAll('meta[name=description],meta[property^="og:"],meta[name^="twitter:"]').forEach((m) => check('meta', m.content || '', false));
    const w = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const el = n.parentElement;
      if (!el || /^(SCRIPT|STYLE)$/.test(el.tagName)) continue;
      check(`<${el.tagName.toLowerCase()}>`, n.nodeValue, !!el.closest('.screen'));
    }
    document.querySelectorAll('[alt],[aria-label],[title],[placeholder]').forEach((e) => ['alt', 'aria-label', 'title', 'placeholder'].forEach((a) => e.hasAttribute(a) && check(`[${a}]`, e.getAttribute(a), !!e.closest('.screen'))));
    return hits;
  });
  const hits = [];
  for (const a of ABILITIES) {
    await page.evaluate((id) => window.__zoeHero.showAbility(id), a.id);
    await page.waitForFunction((src) => new RegExp(src).test(document.querySelector('.screen .zs-menubar').innerText.replace(/\s+/g, ' ')), a.app.source, { timeout: 8000 });
    await page.waitForTimeout(500);
    hits.push(...(await scan()));
  }
  expect(Array.from(new Set(hits))).toEqual([]);
  for (const f of ['book-demo.html', 'nda.html']) {
    await page.goto('/' + f, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    expect(await scan(), f).toEqual([]);
  }
});

test('bracket codes: [Month_Day_Year] is the only bracketed token, in the files and on the page', async ({ page }, info) => {
  test.skip(!isWide(info), 'checked once');
  // The files (screens.js and screens.css are the library's; they are scanned too).
  const code = /\[[A-Za-z]+(?:_[A-Za-z0-9]+)+\]/g;
  for (const f of SITE_FILES.concat(['screens.js', 'screens.css', 'deeplink.js'])) {
    if (!fs.existsSync(path.join(ROOT, f))) continue;
    const text = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/data:image\/[a-z]+;base64,[^"')]+/g, '');
    expect((text.match(code) || []).filter((t) => t !== DATE_TOKEN), `${f}: bracketed codes`).toEqual([]);
    expect((text.match(/\[(?:ORG|PERSON|ADDRESS)_?\d*\]/g) || []), `${f}: old bracket codes`).toEqual([]);
  }
  // The library hands out the one token; the page, with the Privacy picture showing, carries it and no other bracketed word.
  await postPage(page);
  expect(await page.evaluate(() => window.ZoeScreens && window.ZoeScreens.dateToken)).toBe(DATE_TOKEN);
  await page.evaluate(() => window.__zoeHero.showAbility('privacy'));
  await page.waitForTimeout(1200);
  const rendered = await page.evaluate(() => document.body.innerText + ' ' + Array.from(document.querySelectorAll('noscript')).map((n) => n.textContent).join(' '));
  expect((rendered.match(code) || []).filter((t) => t !== DATE_TOKEN)).toEqual([]);
  expect(rendered).toContain(DATE_TOKEN);
});

test('the Privacy picture agrees with the story: the date token, the real amounts, nothing highlighted', async ({ page }, info) => {
  test.setTimeout(90000);
  const errors = watchErrors(page);
  await postPage(page);
  await page.evaluate(() => window.__zoeHero.showAbility('privacy'));
  await page.waitForFunction(() => /Party \d/.test(document.querySelector('.screen').textContent), null, { timeout: 8000 });
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const scr = document.querySelector('.screen .zs-safari'); // the cockpit window; Word waits behind it
    const t = scr.textContent.replace(/\s+/g, ' ');
    const marked = Array.from(scr.querySelectorAll('mark, .zs-hl, .zs-ph, [class*="chip" i]')).filter((e) => /\$\d/.test(e.textContent)).map((e) => e.textContent);
    return { t, marked, dates: (t.match(/\[Month_Day_Year\]/g) || []).length, over: Array.from(scr.querySelectorAll('.zs-ph')).filter((e) => e.getBoundingClientRect().right > scr.getBoundingClientRect().right + 1).length };
  });
  ['$45,000,000', '$4,500,000', '$6,000,000', '$30,000,000', '$750,000'].forEach((a) => expect(r.t, a).toContain(a));
  expect(r.marked).toEqual([]);
  expect(r.dates).toBe(3);
  expect(r.t).not.toMatch(/\bDate \d/);
  ['November 6, 2026', 'January 15, 2027', 'December 31, 2027'].forEach((d) => expect(r.t).not.toContain(d));
  expect(r.over).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await shot(page, info, 'ability-privacy-r5');
  expect(errors).toEqual([]);
});

test('Word\'s zoom on the phone equals the desktop\'s at the same beats, and the pane is open at both sizes', async ({ browser }, info) => {
  test.skip(!isWide(info), 'checked once, at both sizes inside');
  test.setTimeout(420000);
  const sizes = {
    desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  };
  const got = {};
  for (const [name, opts] of Object.entries(sizes)) {
    const ctx = await newGuardedContext(browser, opts);
    const page = await ctx.newPage();
    const errors = watchErrors(page);
    await page.goto(BASE);
    await page.waitForFunction(() => window.__zoeHero && window.__zoeHero.act >= 1);
    await startJournal(page);
    await openLid(page);
    const read = () => page.evaluate(() => document.querySelector('.screen .zs-zpct').textContent);
    const zoom = async () => { let prev = await read(); for (let i = 0; i < 10; i += 1) { await page.waitForTimeout(500); const now = await read(); if (now === prev) return now; prev = now; } return prev; }; // settled: the zoom animates
    const pane = () => page.evaluate(() => { const w = document.querySelector('.screen .zs-word').getBoundingClientRect(); const e = document.querySelector('.screen .zs-pane'); const r = e.getBoundingClientRect(); return !e.hidden && r.width > 0.15 * w.width && r.height > 0.4 * w.height && r.left >= w.left - 1 && r.right <= w.right + 1 && r.bottom <= w.bottom + 1; });
    const z = {};
    await said(page, 'Finding critical information in the term sheet.', 40000);
    await page.waitForTimeout(1500);
    z.identified = await zoom(); z.paneIdentified = await pane();
    await said(page, 'Drafting document.', 60000);
    await page.waitForFunction(() => !document.querySelector('.screen .zs-page .b-fill') && document.querySelectorAll('.screen .zs-page .b-filled').length > 20, null, { timeout: 30000 });
    await page.waitForTimeout(1200);
    z.draft = await zoom(); z.paneDraft = await pane();
    await page.waitForFunction(() => { const c = document.querySelector('.screen .zs-page [data-id="s93new"]'); return c && !c.classList.contains('is-typing'); }, null, { timeout: 60000 });
    await page.waitForTimeout(1200);
    z.clause = await zoom(); z.paneClause = await pane();
    await page.evaluate(() => window.__zoeHero.skip());
    await expect(page.locator('.post-hero')).toBeVisible();
    await page.evaluate(() => window.__zoeHero.showAbility('word'));
    await page.waitForTimeout(1800);
    z.fullWord = await zoom(); z.paneFullWord = await pane();
    expect(errors).toEqual([]);
    got[name] = z;
    await ctx.close();
  }
  expect(got.phone).toEqual(got.desktop);
  Object.entries(got.desktop).forEach(([k, v]) => { if (k.startsWith('pane')) expect(v, k).toBe(true); });
  expect(got.desktop.fullWord).toBe('130%');
  fs.writeFileSync(path.join(SHOTS, 'r6-zoom.json'), JSON.stringify(got, null, 2));
});

test('click gates, unattended: three real buttons, each presses itself, nothing else competes, and the story is short', async ({ page }, info) => {
  test.setTimeout(240000);
  const errors = watchErrors(page);
  await open(page);
  await runTo(page, 'lid');
  await page.waitForFunction(() => window.__zoeHero.framesReady, null, { timeout: 20000 });
  const t0 = await page.evaluate(() => { window.__zoeHero.perform('tap'); return performance.now(); });
  const gates = [['template', 'Choose template'], ['insert', 'Insert'], ['scrub', 'Scrub and send to cloud']];
  const waits = [];
  for (const [name, label] of gates) {
    await gateCheck(page, name, label);
    const r = await gateAuto(page, name); // nobody clicks, taps or presses a key
    waits.push(Math.round(r.ms));
  }
  await page.waitForFunction(() => window.__zoeHero.ended > 0, null, { timeout: 120000 });
  const total = await page.evaluate((t) => performance.now() - t, t0);
  metrics.gates_auto_ms = waits;
  metrics.after_lid_unattended_ms = Math.round(total);
  expect(total, 'from the lid opening to the close, nobody touching anything').toBeLessThan(AFTER_LID_LIMIT_MS + 3000); // measured after the close, so a little over the story itself
  expect(await page.evaluate(() => document.querySelectorAll('.stage .cta-hit').length === 0 || Array.from(document.querySelectorAll('.stage .cta-hit')).every((e) => e.hidden || e.getBoundingClientRect().width === 0))).toBe(true);
  expect(errors).toEqual([]);
});

test('click gates, prompt: pressing each button as soon as it shows, the story runs from the lid to the close in under 55 s', async ({ page }, info) => {
  test.setTimeout(240000);
  const errors = watchErrors(page);
  await open(page);
  await runTo(page, 'lid');
  await page.waitForFunction(() => window.__zoeHero.framesReady, null, { timeout: 20000 });
  const t0 = await page.evaluate(() => { window.__zoeHero.perform('tap'); return performance.now(); });
  const gate1 = await gateCheck(page, 'template', 'Choose template');
  await gate1.click();
  const gate2 = await gateCheck(page, 'insert', 'Insert');
  await gate2.focus();
  await page.keyboard.press('Enter');
  const gate3 = await gateCheck(page, 'scrub', 'Scrub and send to cloud');
  await gate3.click();
  await page.waitForFunction(() => window.__zoeHero.ended > 0, null, { timeout: 120000 });
  const total = await page.evaluate((t) => performance.now() - t, t0);
  metrics.after_lid_prompt_ms = Math.round(total);
  expect(total, 'from the lid opening to the close, each button pressed as it shows').toBeLessThan(PROMPT_LIMIT_MS + 3000); // measured after the close, so a little over the story itself
  expect(errors).toEqual([]);
});

test('the story no longer carries the deleted wording, in any shipped file', async ({}, info) => {
  test.skip(!isWide(info), 'checked once');
  const files = ['index.html', 'hero.js', 'styles.css', 'agreement.js', 'compare.js', 'screens.js', 'screens.css', 'book-demo.html', 'nda.html', 'drawer.css', 'nav.css', 'pages.css'];
  const hits = [];
  for (const f of files) {
    if (!fs.existsSync(path.join(ROOT, f))) continue;
    const text = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\u2019|&rsquo;|&#39;|&#x27;/g, "'").replace(/\\'/g, "'").replace(/\u2026|&hellip;/g, '…').replace(/data:image\/[a-z]+;base64,[^"')]+/g, '');
    DELETED_WORDING.forEach((w) => { if (text.includes(w)) hits.push(`${f}: ${w}`); });
  }
  expect(hits).toEqual([]);
});

test('first paint on throttled 4G, total transfer', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  // Lighthouse's mobile profile: 150 ms RTT, 1.6 Mbps down, 750 kbps up.
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8,
  });
  let bytes = 0;
  let requests = 0;
  cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength; requests += 1; });
  await page.goto('/', { waitUntil: 'commit' });
  const paint = await page.evaluate(() => new Promise((resolve) => {
    const out = {};
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) out[e.name] = Math.round(e.startTime);
    }).observe({ type: 'paint', buffered: true });
    new PerformanceObserver((l) => {
      const e = l.getEntries().pop();
      out.lcp = Math.round(e.startTime);
      out.lcp_element = e.element ? e.element.className || e.element.tagName : '';
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    addEventListener('load', () => setTimeout(() => resolve(out), 300));
  }));
  await page.waitForFunction(() => window.__zoeHero.framesReady, null, { timeout: 30000 });
  const framesReadyMs = await page.evaluate(() => Math.round(performance.now()));
  // Then the whole page: scroll through the drawer so every lazy image and the badge load.
  await page.evaluate(() => window.__zoeHero.toComparison());
  for (let y = 0; y < 30; y += 1) {
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(4000);
  metrics.throttled = {
    profile: '150 ms RTT, 1.6 Mbps (Lighthouse mobile)',
    first_contentful_paint_ms: paint['first-contentful-paint'],
    lcp_ms: paint.lcp,
    lcp_element: paint.lcp_element,
    all_frames_decoded_ms: framesReadyMs,
    total_transfer_kb: Math.round(bytes / 1024),
    requests,
  };
  expect(paint['first-contentful-paint']).toBeLessThan(1000);
  expect(bytes).toBeLessThan(2 * 1024 * 1024);
});
