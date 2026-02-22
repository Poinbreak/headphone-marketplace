import { readFileSync, writeFileSync } from 'fs';

const filePath = new URL('../src/data/headphones.ts', import.meta.url).pathname.slice(1);
let src = readFileSync(filePath, 'utf8');

// ── Heuristic scorer ───────────────────────────────────────────────────────
function clamp(v) { return Math.min(10, Math.max(1, Math.round(v))); }

function scoreBass(entry) {
    const name = (entry.name || '').toLowerCase();
    const type = (entry.type || '').toLowerCase();
    const bestFor = (entry.bestFor || []).join(' ').toLowerCase();
    const brand = (entry.brand || '').toLowerCase();

    // ── Base values by form-factor
    let sub = 5;   // sub bass  20–60 Hz
    let mid = 6;   // bass      60–250 Hz
    let upr = 6;   // upper bass 250–500 Hz

    if (type === 'over-ear') { sub = 7; mid = 7; upr = 6; }
    if (type === 'on-ear') { sub = 6; mid = 7; upr = 6; }
    if (type === 'in-ear') { sub = 5; mid = 6; upr = 7; }
    if (type === 'iem') { sub = 6; mid = 7; upr = 8; }

    // ── Use-case tweaks
    if (bestFor.includes('gaming')) { sub += 1; mid += 1; }
    if (bestFor.includes('sound production')) { sub -= 1; mid -= 1; upr -= 1; } // flat/neutral
    if (bestFor.includes('consumer')) { mid += 0.5; }

    // ── Name-keyword tweaks
    if (/sub.?bass|deep.?bass|extra.?bass|xb\b/.test(name)) { sub += 2; mid += 1; }
    if (/\bbass\b/.test(name)) { sub += 1; mid += 1; }
    if (/bass.?boost|bass.?wave|bass.?(channel|pulse|intensity)/.test(name)) { sub += 2; mid += 1; }
    if (/studio|monitor|reference|flat/.test(name)) { sub -= 1; mid -= 1; upr -= 1; }
    if (/gaming|game/.test(name)) { sub += 1; mid += 1; }
    if (/treble|bright|airy/.test(name)) { upr += 1; }
    if (/warm|punchy|thumpy|thump/.test(name)) { sub += 1; mid += 1; }

    // ── Brand tweaks (known sound signatures)
    if (['boat', 'skullcandy', 'jbl', 'sony'].includes(brand)) { sub += 1; mid += 1; }
    if (['sennheiser', 'beyerdynamic', 'ath'].includes(brand)) { sub -= 1; upr += 1; } // balanced
    if (['shure', 'etymotic'].includes(brand)) { sub -= 1; mid -= 1; upr -= 1; }
    if (['zebronics', 'goboult', 'ptron', 'noise'].includes(brand)) { mid += 0.5; }

    return {
        subBass: clamp(sub),
        bass: clamp(mid),
        upperBass: clamp(upr),
    };
}

// ── Parse & inject ─────────────────────────────────────────────────────────
// We find each headphone object by extracting the JSON-like content between
// the opening { and closing } of every array element, then inject bass fields.

// Match every headphone object: starts with `  {\n` inside the array
// and ends at the next `  },` or `  }\n]`
// Strategy: split on object boundaries then reassemble

let injected = 0;

// Replace each occurrence of `"cons": [...]` that is NOT already followed by bass fields
src = src.replace(
    /("cons"\s*:\s*\[[\s\S]*?\])\s*\n(\s*\})/g,
    (match, consField, closing, offset) => {
        // Check the surrounding context to extract the entry values
        // Pull a window before this match to find the headphone's type/name/bestFor
        const window = src.slice(Math.max(0, offset - 1500), offset + match.length);

        // Extract relevant fields
        const nameM = window.match(/"name"\s*:\s*"([^"]*)"/);
        const typeM = window.match(/"type"\s*:\s*"([^"]*)"/);
        const brandM = window.match(/"brand"\s*:\s*"([^"]*)"/);
        const bestForM = window.match(/"bestFor"\s*:\s*\[([^\]]*)\]/);

        const entry = {
            name: nameM ? nameM[1] : '',
            type: typeM ? typeM[1] : '',
            brand: brandM ? brandM[1] : '',
            bestFor: bestForM ? bestForM[1].match(/"([^"]*)"/g)?.map(s => s.replace(/"/g, '')) ?? [] : [],
        };

        const { subBass, bass, upperBass } = scoreBass(entry);
        injected++;

        return `${consField},\n    "subBass": ${subBass},\n    "bass": ${bass},\n    "upperBass": ${upperBass}\n${closing}`;
    }
);

writeFileSync(filePath, src, 'utf8');
console.log(`✅  Done. Injected bass fields into ${injected} headphone entries.`);
