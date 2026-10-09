/**
 * GMRC / RDSO CBAT - Observation Test Module (Battery 3) - PATTERN-WISE TEST SUITE
 * Completely Separated by Pattern (Not Mixed):
 * - Pattern 1: Odd Box Matrix (A–F) -> 10 Mock Tests (30 Qs each = 300 Qs) [Files 1 & 3]
 * - Pattern 2: Figure Association (1–5) -> 10 Mock Tests (20 Qs each = 200 Qs) [File 2]
 * - Pattern 3: Figure Formation (1–4) -> 10 Mock Tests (20 Qs each = 200 Qs) [File 4]
 * Total: 700 Authentic Questions across 30 Dedicated Mock Tests!
 */

(function () {
    'use strict';

    // Module State
    const state = {
        currentPatternId: 'pattern1', // 'pattern1', 'pattern2', 'pattern3'
        currentTestId: 1, // 1 to 10
        questions: [],
        currentIndex: 0,
        userAnswers: {},  // questionId -> string
        markedReview: {}, // questionId -> boolean
        timeRemaining: 300, // 5 mins (300s)
        timerInterval: null,
        testActive: false,
        testOver: false
    };

    function init() {
        loadMockTest('pattern1', 1);
        bindEvents();
        renderTestSelectorBars();
    }

    function getActivePatternConfig() {
        if (window.OBSERVATION_PATTERNS && window.OBSERVATION_PATTERNS[state.currentPatternId]) {
            return window.OBSERVATION_PATTERNS[state.currentPatternId];
        }
        return {
            id: 'pattern1',
            name: 'Pattern 1: Odd Box Matrix (A–F)',
            shortName: 'Odd Box Matrix',
            instruction: 'Five of the six boxes (A-F) are identical. Find the single ODD box.',
            options: ['A', 'B', 'C', 'D', 'E', 'F'],
            normMean: 22.0,
            normSd: 4.1,
            tests: []
        };
    }

    function loadMockTest(patternId, testId) {
        state.currentPatternId = patternId || 'pattern1';
        state.currentTestId = testId || 1;

        const patConfig = getActivePatternConfig();
        const testObj = (patConfig.tests && patConfig.tests[state.currentTestId - 1]) ? patConfig.tests[state.currentTestId - 1] : null;

        if (testObj && testObj.questions) {
            state.questions = testObj.questions;
        } else if (window.OBSERVATION_MOCK_TESTS && window.OBSERVATION_MOCK_TESTS[state.currentTestId - 1]) {
            state.questions = window.OBSERVATION_MOCK_TESTS[state.currentTestId - 1].questions;
        } else {
            state.questions = Array.from({ length: 30 }, (_, i) => ({
                id: i + 1,
                type: 'odd-box-6',
                typeName: 'Odd Box Matrix (A-F)',
                instruction: 'Five of the six boxes (A-F) are identical. Find the single ODD box.',
                options: ['A', 'B', 'C', 'D', 'E', 'F'],
                correctAnswer: ['A', 'B', 'C', 'D', 'E', 'F'][i % 6],
                image: `assets/obs/p1_q${i + 1}.png`,
                source: `Pattern 1 Q${i + 1}`
            }));
        }

        state.currentIndex = 0;
        state.userAnswers = {};
        state.markedReview = {};
        state.timeRemaining = patConfig.timeSeconds || 300;
        state.testActive = false;
        state.testOver = false;
        clearInterval(state.timerInterval);
    }

    function renderTestSelectorBars() {
        const containers = ['obs-selector-bar-inst', 'obs-selector-bar-test'];
        const patConfig = getActivePatternConfig();

        containers.forEach(cId => {
            const el = document.getElementById(cId);
            if (!el) return;
            el.innerHTML = `
                <div class="battery-test-selector-card">
                    <div class="sel-bar-header" style="margin-bottom:8px;">
                        <span class="sel-bar-title">&#128065; OBSERVATION TEST - PATTERN-WISE EXAM SELECTOR:</span>
                        <span class="sel-bar-hint">Pure Pattern Sets (Not Mixed) &bull; 10 Tests Each</span>
                    </div>

                    <!-- 3 Pattern Tabs -->
                    <div class="pattern-pill-grid">
                        <button class="pattern-tab-btn ${state.currentPatternId === 'pattern1' ? 'active' : ''}" data-obs-pattern="pattern1">
                            &#9633; Pattern 1: Odd Box Matrix (A–F) &bull; 10 Tests (30 Qs)
                        </button>
                        <button class="pattern-tab-btn ${state.currentPatternId === 'pattern2' ? 'active' : ''}" data-obs-pattern="pattern2">
                            &#9670; Pattern 2: Figure Association (1–5) &bull; 10 Tests (20 Qs)
                        </button>
                        <button class="pattern-tab-btn ${state.currentPatternId === 'pattern3' ? 'active' : ''}" data-obs-pattern="pattern3">
                            &#9651; Pattern 3: Figure Formation (1–4) &bull; 10 Tests (20 Qs)
                        </button>
                    </div>

                    <!-- 10 Test Pills for Selected Pattern -->
                    <div class="sel-bar-subhead" style="font-size:0.8rem; font-weight:700; color:#475569; margin:8px 0 6px 0;">
                        Active: <strong>${patConfig.name}</strong> &mdash; Select Mock Test (1 to 10):
                    </div>
                    <div class="test-pill-grid">
                        ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `
                            <button class="test-pill-btn ${state.currentTestId === n ? 'active' : ''}" data-obs-test="${n}">
                                Test ${String(n).padStart(2, '0')}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;

            // Bind Pattern Buttons
            el.querySelectorAll('[data-obs-pattern]').forEach(btn => {
                btn.onclick = () => {
                    const patId = btn.getAttribute('data-obs-pattern');
                    switchPattern(patId);
                };
            });

            // Bind Test Buttons
            el.querySelectorAll('[data-obs-test]').forEach(btn => {
                btn.onclick = () => {
                    const testNum = parseInt(btn.getAttribute('data-obs-test'), 10);
                    switchObservationTest(testNum);
                };
            });
        });
    }

    function switchPattern(patternId) {
        clearInterval(state.timerInterval);
        loadMockTest(patternId, 1);
        renderTestSelectorBars();
        updateInstructionsUI();
        showScreen('obs-screen-instructions');
    }

    function switchObservationTest(testNum) {
        clearInterval(state.timerInterval);
        loadMockTest(state.currentPatternId, testNum);
        renderTestSelectorBars();
        updateInstructionsUI();
        showScreen('obs-screen-instructions');
    }

    function updateInstructionsUI() {
        const pat = getActivePatternConfig();
        const headerEl = document.querySelector('#obs-screen-instructions .subtitle');
        if (headerEl) {
            headerEl.textContent = `Active Pattern: ${pat.name} - ${pat.questionCount} Questions (${Math.round(pat.timeSeconds / 60)} Minutes)`;
        }
    }

    let eventsBound = false;
    let lastNavTime = 0;

    function bindEvents() {
        if (eventsBound) return;
        eventsBound = true;

        const btnStart = document.getElementById('obs-btn-start');
        if (btnStart) {
            btnStart.onclick = startTest;
        }

        const btnNext = document.getElementById('obs-btn-next');
        if (btnNext) {
            btnNext.onclick = () => navigate(1);
        }

        const btnPrev = document.getElementById('obs-btn-prev');
        if (btnPrev) {
            btnPrev.onclick = () => navigate(-1);
        }

        const btnMark = document.getElementById('obs-btn-mark');
        if (btnMark) {
            btnMark.onclick = toggleMarkReview;
        }

        const btnClear = document.getElementById('obs-btn-clear');
        if (btnClear) {
            btnClear.onclick = clearAnswer;
        }

        const btnSubmit = document.getElementById('obs-btn-submit');
        if (btnSubmit) {
            btnSubmit.onclick = () => {
                if (confirm('Are you sure you want to submit this Observation Test?')) {
                    finishTest();
                }
            };
        }

        const btnRetake = document.getElementById('obs-btn-retake');
        if (btnRetake) {
            btnRetake.onclick = () => {
                switchObservationTest(state.currentTestId);
            };
        }

        // Global Keyboard Handler
        window.addEventListener('keydown', (e) => {
            const mod = document.getElementById('module-observation');
            if (!mod || mod.style.display === 'none') return;
            if (!state.testActive || state.testOver) return;

            const q = state.questions[state.currentIndex];
            if (!q) return;

            const key = e.key.toUpperCase();

            // Match options: A-F or 1-5 or 1-4
            if (q.options && q.options.includes(key)) {
                e.preventDefault();
                selectOption(key);
            } else if (e.code === 'ArrowRight' || e.code === 'Enter') {
                e.preventDefault();
                navigate(1);
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                navigate(-1);
            } else if (key === 'M') {
                e.preventDefault();
                toggleMarkReview();
            } else if (key === 'C') {
                e.preventDefault();
                clearAnswer();
            }
        });
    }

    function startTest() {
        state.testActive = true;
        state.testOver = false;
        const patConfig = getActivePatternConfig();
        state.timeRemaining = patConfig.timeSeconds || 300;
        state.currentIndex = 0;
        state.userAnswers = {};
        state.markedReview = {};

        showScreen('obs-screen-test');
        renderTestSelectorBars();
        renderQuestion();
        startTimer();
    }

    function renderQuestion() {
        const q = state.questions[state.currentIndex];
        if (!q) return;

        // Question header
        const qNumEl = document.getElementById('obs-q-num');
        if (qNumEl) {
            qNumEl.textContent = `Question ${state.currentIndex + 1} of ${state.questions.length}`;
        }

        // Type badge & prompt
        const typeTag = document.getElementById('obs-type-tag');
        if (typeTag) {
            typeTag.textContent = q.typeName || 'Observation Test';
        }

        const srcTag = document.getElementById('obs-src-tag');
        if (srcTag) {
            srcTag.textContent = q.source || 'Authentic Question';
        }

        const promptText = document.getElementById('obs-prompt-text');
        if (promptText) {
            promptText.textContent = q.instruction || 'Observe the figure carefully and select the correct option.';
        }

        // Diagram image
        const targetContainer = document.getElementById('obs-target-figure');
        if (targetContainer) {
            targetContainer.innerHTML = `
                <img src="${q.image}" alt="Problem Figure" class="obs-diagram-img" />
            `;
        }

        // Options Grid
        const optionsGrid = document.getElementById('obs-options-grid');
        if (optionsGrid) {
            optionsGrid.innerHTML = '';
            const currentAns = state.userAnswers[q.id];

            q.options.forEach(opt => {
                const btn = document.createElement('button');
                const isSelected = currentAns === opt;
                btn.className = 'obs-opt-btn' + (isSelected ? ' selected' : '');
                btn.setAttribute('data-opt', opt);
                btn.innerHTML = `
                    <span class="obs-opt-badge-pill">${opt}</span>
                    <span class="obs-opt-label">Option (${opt})</span>
                `;

                btn.addEventListener('click', () => {
                    selectOption(opt);
                });

                optionsGrid.appendChild(btn);
            });
        }

        // Update Palette
        renderPalette();
    }

    function selectOption(opt) {
        const q = state.questions[state.currentIndex];
        if (!q) return;
        state.userAnswers[q.id] = opt;
        renderQuestion();
    }

    function clearAnswer() {
        const q = state.questions[state.currentIndex];
        if (!q) return;
        delete state.userAnswers[q.id];
        renderQuestion();
    }

    function toggleMarkReview() {
        const q = state.questions[state.currentIndex];
        if (!q) return;
        state.markedReview[q.id] = !state.markedReview[q.id];
        renderQuestion();
    }

    function navigate(delta) {
        const now = Date.now();
        if (now - lastNavTime < 120) return; // Ignore rapid duplicate triggers
        lastNavTime = now;

        const next = state.currentIndex + delta;
        if (next >= 0 && next < state.questions.length) {
            state.currentIndex = next;
            renderQuestion();
        }
    }

    function renderPalette() {
        const palette = document.getElementById('obs-palette-grid');
        if (!palette) return;
        palette.innerHTML = '';

        let answeredCount = 0;

        state.questions.forEach((q, idx) => {
            const isAnswered = !!state.userAnswers[q.id];
            if (isAnswered) answeredCount++;

            const isMarked = !!state.markedReview[q.id];
            const isCurrent = idx === state.currentIndex;

            const btn = document.createElement('button');
            let cls = 'obs-pal-btn tm-pal-btn';
            if (isCurrent) cls += ' active';
            if (isMarked) cls += ' marked';
            else if (isAnswered) cls += ' answered';
            else cls += ' unanswered';

            btn.className = cls;
            btn.textContent = idx + 1;
            btn.addEventListener('click', () => {
                state.currentIndex = idx;
                renderQuestion();
            });
            palette.appendChild(btn);
        });

        const statAns = document.getElementById('obs-stat-answered');
        if (statAns) statAns.textContent = answeredCount;

        const statUnans = document.getElementById('obs-stat-unanswered');
        if (statUnans) statUnans.textContent = state.questions.length - answeredCount;
    }

    function finishTest() {
        clearInterval(state.timerInterval);
        state.testActive = false;
        state.testOver = true;

        const patConfig = getActivePatternConfig();
        let correctCount = 0;
        const details = [];

        state.questions.forEach((q, idx) => {
            const userChoice = state.userAnswers[q.id] || 'Unanswered';
            const isCorrect = userChoice === q.correctAnswer;
            if (isCorrect) correctCount++;

            details.push({
                num: idx + 1,
                source: q.source || `Q${idx + 1}`,
                typeName: q.typeName || 'Observation',
                correctAnswer: q.correctAnswer,
                userChoice: userChoice,
                isCorrect: isCorrect
            });
        });

        const normMean = patConfig.normMean || 22.0;
        const normSd = patConfig.normSd || 4.1;
        const tScore = Math.max(20, Math.min(80, 50 + 10 * ((correctCount - normMean) / normSd)));
        const isPassed = tScore >= 42.0;
        const totalQuestions = state.questions.length;
        const wrongCount = Object.keys(state.userAnswers).length - correctCount;
        const unansweredCount = totalQuestions - Object.keys(state.userAnswers).length;
        const accuracyPct = Object.keys(state.userAnswers).length > 0
            ? Math.round((correctCount / Object.keys(state.userAnswers).length) * 100)
            : 0;

        showScreen('obs-screen-scorecard');

        const elScore = document.getElementById('obs-metric-score') || document.getElementById('obs-score-raw');
        if (elScore) elScore.textContent = `${correctCount} / ${totalQuestions}`;

        const elScoreT = document.getElementById('obs-metric-t-score') || document.getElementById('obs-score-t');
        if (elScoreT) elScoreT.textContent = tScore.toFixed(4);

        const elAccuracy = document.getElementById('obs-metric-accuracy');
        if (elAccuracy) elAccuracy.textContent = `${accuracyPct}%`;

        const elCorrect = document.getElementById('obs-metric-correct');
        if (elCorrect) elCorrect.textContent = `${correctCount}`;

        const elWrong = document.getElementById('obs-metric-wrong');
        if (elWrong) elWrong.textContent = `${wrongCount}`;

        const elUnans = document.getElementById('obs-metric-unanswered');
        if (elUnans) elUnans.textContent = `${unansweredCount}`;

        const banner = document.getElementById('obs-verdict-banner');
        if (banner) {
            banner.className = 'verdict-banner ' + (isPassed ? 'suitable' : 'not-suitable');
        }
        const titleEl = document.getElementById('obs-verdict-title');
        if (titleEl) {
            titleEl.textContent = isPassed ? 'RESULT: SUITABLE!' : 'RESULT: NOT SUITABLE!';
        }
        const descEl = document.getElementById('obs-verdict-subtitle') || document.getElementById('obs-verdict-desc');
        if (descEl) {
            descEl.textContent = isPassed
                ? `Passed! Qualified RDSO Observation Cutoff (T-Score ${tScore.toFixed(4)} >= 42.0000). Total: ${correctCount}/${totalQuestions}.`
                : `Not Qualified. T-Score (${tScore.toFixed(4)}) is below RDSO cutoff (42.0000).`;
        }

        const tbody = document.getElementById('obs-trials-table-body');
        if (tbody) {
            tbody.innerHTML = '';
            details.forEach(d => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>Q${d.num} <span style="font-size:11px; color:#64748b;">(${d.typeName})</span></td>
                    <td><span class="badge-letter">${d.correctAnswer}</span></td>
                    <td><span class="badge-letter ${d.isCorrect ? 'pass' : 'fail'}">${d.userChoice}</span></td>
                    <td><span class="status-pill ${d.isCorrect ? 'pass' : 'fail'}">${d.isCorrect ? 'Correct' : 'Incorrect'}</span></td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    function startTimer() {
        clearInterval(state.timerInterval);
        const display1 = document.getElementById('obs-test-timer');
        const display2 = document.getElementById('obs-timer-display');

        function tick() {
            const mins = Math.floor(state.timeRemaining / 60);
            const secs = state.timeRemaining % 60;
            const str = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            if (display1) display1.textContent = str;
            if (display2) display2.textContent = str;

            if (state.timeRemaining <= 0) {
                clearInterval(state.timerInterval);
                finishTest();
            } else {
                state.timeRemaining--;
            }
        }

        tick();
        state.timerInterval = setInterval(tick, 1000);
    }

    function showScreen(screenId) {
        ['obs-screen-instructions', 'obs-screen-test', 'obs-screen-scorecard', 'obs-screen-result'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        const target = document.getElementById(screenId) || document.getElementById('obs-screen-scorecard');
        if (target) {
            target.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    window.ObservationModule = {
        init: init,
        switchPattern: switchPattern,
        switchTest: switchObservationTest,
        getState: () => state
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
