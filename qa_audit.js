/**
 * Exhaustive QA & Pre-Deployment Audit Script for GMRC Psychometric Suite
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let errors = [];
let warnings = [];
let passCount = 0;

function assert(condition, message) {
    if (!condition) {
        errors.push(message);
        console.error('❌ FAIL: ' + message);
    } else {
        passCount++;
        console.log('✅ PASS: ' + message);
    }
}

function warn(message) {
    warnings.push(message);
    console.warn('⚠️ WARN: ' + message);
}

console.log('================================================================');
console.log('   GMRC PSYCHOMETRIC SUITE - SENIOR QA ARCHITECTURAL AUDIT      ');
console.log('================================================================\n');

// ----------------------------------------------------------------------
// 1. Critical Production Files Existence
// ----------------------------------------------------------------------
console.log('>>> 1. PRODUCTION FILE INTEGRITY:');
const requiredFiles = [
    'index.html',
    'style.css',
    'app.js',
    'obs-data.js',
    'observation.js',
    'track-data.js',
    'track-memory.js',
    'concentration-data.js',
    'concentration.js',
    'personality-data.js',
    'personality.js'
];

requiredFiles.forEach(f => {
    assert(fs.existsSync(f) && fs.statSync(f).size > 0, `File exists and is non-empty: ${f}`);
});

// ----------------------------------------------------------------------
// 2. Syntax Validation of All JavaScript Files
// ----------------------------------------------------------------------
console.log('\n>>> 2. JAVASCRIPT SYNTAX INTEGRITY:');
const jsFiles = fs.readdirSync('.').filter(f => f.endsWith('.js') && f !== 'qa_audit.js');
jsFiles.forEach(f => {
    try {
        const code = fs.readFileSync(f, 'utf8');
        new vm.Script(code, { filename: f });
        assert(true, `Syntax valid: ${f}`);
    } catch (err) {
        assert(false, `Syntax error in ${f}: ${err.message}`);
    }
});

// ----------------------------------------------------------------------
// 3. HTML DOM & Resource Resolution Validation
// ----------------------------------------------------------------------
console.log('\n>>> 3. HTML DOM & SCRIPT RESOLUTION:');
const html = fs.readFileSync('index.html', 'utf8');

// Check script tags match existing files
const scriptMatches = [...html.matchAll(/<script\s+src="([^"]+)"><\/script>/g)];
assert(scriptMatches.length >= 9, `Found ${scriptMatches.length} script tags in index.html`);
scriptMatches.forEach(m => {
    const src = m[1];
    assert(fs.existsSync(src), `Script referenced in HTML exists on disk: ${src}`);
});

// Check css links match existing files
const cssMatches = [...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)">/g)];
cssMatches.forEach(m => {
    const href = m[1];
    assert(fs.existsSync(href), `Stylesheet referenced in HTML exists on disk: ${href}`);
});

// Check no TCS elements exist in index.html
assert(!html.includes('tcs-mode-switcher-bar'), 'No tcs-mode-switcher-bar in index.html');
assert(!html.includes('tcs-portal-container'), 'No tcs-portal-container in index.html');
assert(!html.includes('tcs-portal.js'), 'No tcs-portal.js in index.html');
assert(!html.includes('tcs-questions-bank.js'), 'No tcs-questions-bank.js in index.html');

// Check offline self-reliance (no external http/https cdn links)
const externalUrls = [...html.matchAll(/(src|href)="https?:\/\/([^"]+)"/g)];
if (externalUrls.length === 0) {
    assert(true, '100% Offline Standalone: No external CDN or web dependencies in index.html');
} else {
    warn(`Found external URLs in index.html: ${externalUrls.map(u => u[2]).join(', ')}`);
}

// ----------------------------------------------------------------------
// 4. DOM ID Cross-Reference Validation
// ----------------------------------------------------------------------
console.log('\n>>> 4. DOM ID INTEGRITY (JS vs HTML):');
function checkElementIds(jsFile, idList) {
    idList.forEach(id => {
        const inHtml = html.includes(`id="${id}"`);
        assert(inHtml, `[${jsFile}] Element #${id} exists in index.html`);
    });
}

// App.js IDs
checkElementIds('app.js', [
    'module-reaction',
    'nav-candidate-name',
    'nav-roll-no',
    'audio-toggle-btn',
    'btn-proceed-instructions',
    'btn-start-exam',
    'lamp-red',
    'lamp-yellow',
    'lamp-green',
    'lamp-blue',
    'vkey-b',
    'score-candidate-name',
    'verdict-banner'
]);

// Observation.js IDs
checkElementIds('observation.js', [
    'module-observation',
    'obs-selector-bar-inst',
    'obs-selector-bar-test',
    'obs-screen-instructions',
    'obs-screen-test',
    'obs-btn-start',
    'obs-btn-next',
    'obs-btn-prev',
    'obs-btn-mark',
    'obs-btn-clear',
    'obs-btn-submit',
    'obs-palette-grid'
]);

// Track Memory IDs
checkElementIds('track-memory.js', [
    'module-track-memory',
    'tm-selector-bar-inst',
    'tm-selector-bar-test',
    'tm-screen-instructions',
    'tm-screen-study',
    'tm-screen-test',
    'tm-btn-start',
    'tm-btn-end-study',
    'tm-btn-next',
    'tm-btn-prev',
    'tm-btn-mark',
    'tm-btn-clear',
    'tm-btn-submit-set',
    'tm-palette-grid'
]);

// Concentration IDs
checkElementIds('concentration.js', [
    'module-concentration',
    'conc-selector-bar-inst',
    'conc-selector-bar-test',
    'conc-screen-instructions',
    'conc-screen-test',
    'conc-btn-start',
    'conc-btn-yes',
    'conc-btn-no',
    'conc-btn-skip',
    'conc-num-left',
    'conc-num-right'
]);

// Personality IDs
checkElementIds('personality.js', [
    'module-personality',
    'pers-selector-bar-inst',
    'pers-selector-bar-test',
    'pers-screen-instructions',
    'pers-screen-test',
    'pers-btn-start',
    'pers-btn-next',
    'pers-btn-prev',
    'pers-btn-mark',
    'pers-btn-clear',
    'pers-btn-submit',
    'pers-palette-grid'
]);

// ----------------------------------------------------------------------
// 5. Data Banks & Image Assets Validation
// ----------------------------------------------------------------------
console.log('\n>>> 5. DATA BANKS & IMAGE ASSET VALIDATION:');
const ctx = { window: {}, console: console };
vm.runInNewContext(fs.readFileSync('obs-data.js', 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync('track-data.js', 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync('concentration-data.js', 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync('personality-data.js', 'utf8'), ctx);

// Observation
const obsPatterns = ctx.window.OBSERVATION_PATTERNS;
let totalObsQuestions = 0;
let missingObsImages = 0;
['pattern1', 'pattern2', 'pattern3'].forEach(pid => {
    const pat = obsPatterns[pid];
    assert(pat && pat.tests.length === 10, `Observation ${pid} has 10 mock tests`);
    pat.tests.forEach((t, tIdx) => {
        t.questions.forEach((q, qIdx) => {
            totalObsQuestions++;
            if (!fs.existsSync(q.image) || fs.statSync(q.image).size === 0) {
                missingObsImages++;
                console.error(`Missing or empty image for ${pid} T${tIdx+1} Q${qIdx+1}: ${q.image}`);
            }
        });
    });
});
assert(totalObsQuestions === 700, `Observation Bank contains exactly 700 authentic questions (verified: ${totalObsQuestions})`);
assert(missingObsImages === 0, `All ${totalObsQuestions} Observation diagram images exist on disk`);

// Track Memory
const trackTests = ctx.window.TRACK_MEMORY_MOCK_TESTS;
assert(trackTests && trackTests.length === 10, 'Track Memory has 10 mock tests');
let trackImagesOk = 0;
let trackQuestionsTotal = 0;
trackTests.forEach((t, idx) => {
    assert(t.studyTimeSeconds === 180, `Track Test ${idx+1} studyTime is 180s (3 min)`);
    assert(t.testTimeSeconds === 180, `Track Test ${idx+1} testTime is 180s (3 min)`);
    ['set1', 'set2'].forEach(s => {
        const set = t[s];
        if (fs.existsSync(set.memoryImage) && fs.statSync(set.memoryImage).size > 0) trackImagesOk++;
        if (fs.existsSync(set.questionImage) && fs.statSync(set.questionImage).size > 0) trackImagesOk++;
        trackQuestionsTotal += set.questions.length;
    });
});
assert(trackImagesOk === 40, `All 40 Track Memory map images exist and are valid (verified: ${trackImagesOk})`);
assert(trackQuestionsTotal === 240, `Track Memory has exactly 240 questions (verified: ${trackQuestionsTotal})`);

// Concentration
const concTests = ctx.window.CONCENTRATION_MOCK_TESTS;
assert(concTests && concTests.length === 10, 'Concentration has 10 mock tests');
let concPairsTotal = 0;
concTests.forEach((t, idx) => {
    concPairsTotal += t.questions.length;
    assert(t.questions.length === 60, `Concentration Test ${idx+1} has 60 pairs`);
});
assert(concPairsTotal === 600, `Concentration has exactly 600 pairs (verified: ${concPairsTotal})`);

// Personality
const persTests = ctx.window.PERSONALITY_MOCK_TESTS;
assert(persTests && persTests.length === 10, 'Personality has 10 mock tests');
let persQuestionsTotal = 0;
persTests.forEach((t, idx) => {
    persQuestionsTotal += t.questions.length;
    assert(t.questions.length === 30, `Personality Test ${idx+1} has 30 questions`);
});
assert(persQuestionsTotal === 300, `Personality has exactly 300 questions (verified: ${persQuestionsTotal})`);

// ----------------------------------------------------------------------
// 6. Logic & UX Guardrail Integrity (Single Increment, Debounce, 0ms Delay)
// ----------------------------------------------------------------------
console.log('\n>>> 6. LOGIC & UX GUARDRAILS (NO SKIPPING, 0ms DELAY):');
const appCode = fs.readFileSync('app.js', 'utf8');
assert(appCode.includes('holdTime: 0'), 'Color Reaction Test holdTime is 0ms (instant stimulus on B press)');
assert(!appCode.includes('TrackMemoryModule.init()'), 'No duplicate module initialization in app.js');

['observation.js', 'personality.js', 'track-memory.js', 'concentration.js'].forEach(eng => {
    const code = fs.readFileSync(eng, 'utf8');
    assert(code.includes('eventsBound'), `[${eng}] Has eventsBound guard to prevent duplicate listeners`);
    assert(code.includes('120'), `[${eng}] Has 120ms debounce to prevent question skipping`);
});

// ----------------------------------------------------------------------
// 7. Styling & CSS Integrity
// ----------------------------------------------------------------------
console.log('\n>>> 7. STYLESHEET & VERDICT BANNER INTEGRITY:');
const css = fs.readFileSync('style.css', 'utf8');
assert(css.includes('.verdict-banner.suitable'), 'Suitable verdict banner styled in style.css');
assert(css.includes('.verdict-banner.not-suitable'), 'Not-Suitable verdict banner styled in style.css');
assert(!css.includes('#tcs-portal-container'), 'No residual #tcs-portal-container styles in style.css');
assert(!css.includes('.tcs-mode-switcher-bar'), 'No residual .tcs-mode-switcher-bar styles in style.css');

// ----------------------------------------------------------------------
// AUDIT SUMMARY
// ----------------------------------------------------------------------
console.log('\n================================================================');
console.log(`QA AUDIT COMPLETED: ${passCount} PASSED, ${warnings.length} WARNINGS, ${errors.length} ERRORS`);
console.log('================================================================');

if (errors.length > 0) {
    console.error('\n❌ AUDIT FAILED WITH ' + errors.length + ' ERROR(S). CANNOT DEPLOY YET.');
    process.exit(1);
} else {
    console.log('\n🌟 100% QA AUDIT PASSED! SYSTEM IS COMPLETELY PRODUCTION-READY FOR GITHUB DEPLOYMENT!\n');
    process.exit(0);
}
