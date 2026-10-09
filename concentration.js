/**
 * GMRC / RDSO CBAT - Concentration Test Module (Battery 2)
 * Pattern: Yes/No Number Matching & Digit Concentration
 * Supports 10 Full Separate Mock Tests (60 Pairs Each = 600 Questions)
 * Standard Exam: 60 Pairs in 180 seconds (3 minutes)
 */

(function () {
    'use strict';

    // Generate 60 realistic test pairs fallback
    function generateQuestionBank(testId = 1) {
        if (window.CONCENTRATION_MOCK_TESTS && window.CONCENTRATION_MOCK_TESTS[testId - 1]) {
            return window.CONCENTRATION_MOCK_TESTS[testId - 1].questions;
        }

        const bank = [];
        const baseNumbers = [
            "4839201", "7291048", "3819204", "9482015", "6102948",
            "5829104", "1928374", "8472910", "2910384", "6381920",
            "9182736", "4729103", "8392015", "2019384", "5729104",
            "6839201", "3920184", "7482910", "1829304", "9283741",
            "5839201", "2749103", "6192834", "8302914", "4920183",
            "7192830", "3849201", "9028374", "5629104", "1839205",
            "8492013", "2938471", "6729104", "4192830", "9382015",
            "5283910", "7829104", "3019284", "6492018", "1938472",
            "8291047", "4910283", "7382910", "2839104", "6019283",
            "9481023", "5192830", "3729104", "8102934", "2639104",
            "7492018", "4019283", "9283014", "6839102", "1729384",
            "8391024", "3928104", "5482910", "2019385", "7193820"
        ];

        baseNumbers.forEach((num, idx) => {
            const isMatch = (idx % 2 === 0);
            let num2 = num;

            if (!isMatch) {
                const pos = 2 + (idx % 4);
                const originalDigit = parseInt(num[pos], 10);
                const alteredDigit = (originalDigit + 1 + (idx % 3)) % 10;
                num2 = num.substring(0, pos) + alteredDigit + num.substring(pos + 1);
            }

            bank.push({
                id: idx + 1,
                leftNumber: num,
                rightNumber: num2,
                isMatch: isMatch,
                correctAnswer: isMatch ? 'YES' : 'NO'
            });
        });

        return bank;
    }

    const state = {
        currentTestId: 1, // 1 to 10
        questions: [],
        currentIndex: 0,
        userAnswers: {}, // questionId -> 'YES' | 'NO'
        timeRemaining: 180, // 3 mins (180s)
        timerInterval: null,
        testActive: false,
        testOver: false,
        startTime: 0
    };

    function init() {
        bindEvents();
        renderTestSelectorBars();
    }

    function renderTestSelectorBars() {
        const containers = ['conc-selector-bar-inst', 'conc-selector-bar-test'];
        containers.forEach(cId => {
            const el = document.getElementById(cId);
            if (!el) return;
            el.innerHTML = `
                <div class="battery-test-selector-card">
                    <div class="sel-bar-header">
                        <span class="sel-bar-title">&#127919; CONCENTRATION TEST SELECTOR:</span>
                        <span class="sel-bar-hint">Active: Mock Test ${String(state.currentTestId).padStart(2, '0')} (60 Pairs in 180s)</span>
                    </div>
                    <div class="test-pill-grid">
                        ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `
                            <button class="test-pill-btn ${state.currentTestId === n ? 'active' : ''}" data-conc-test="${n}">
                                Test ${String(n).padStart(2, '0')}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            el.querySelectorAll('[data-conc-test]').forEach(btn => {
                btn.onclick = () => {
                    const testNum = parseInt(btn.getAttribute('data-conc-test'), 10);
                    switchConcentrationTest(testNum);
                };
            });
        });
    }

    function switchConcentrationTest(testNum) {
        clearInterval(state.timerInterval);
        state.currentTestId = testNum;
        state.testActive = false;
        state.testOver = false;
        renderTestSelectorBars();
        showScreen('conc-screen-instructions');
    }

    let eventsBound = false;
    let lastActionTime = 0;

    function bindEvents() {
        if (eventsBound) return;
        eventsBound = true;

        const btnStart = document.getElementById('conc-btn-start');
        if (btnStart) {
            btnStart.onclick = startTest;
        }

        const btnYes = document.getElementById('conc-btn-yes');
        if (btnYes) {
            btnYes.onclick = () => recordAnswer('YES');
        }

        const btnNo = document.getElementById('conc-btn-no');
        if (btnNo) {
            btnNo.onclick = () => recordAnswer('NO');
        }

        const btnSkip = document.getElementById('conc-btn-skip');
        if (btnSkip) {
            btnSkip.onclick = () => nextQuestion();
        }

        const btnRetake = document.getElementById('conc-btn-retake');
        if (btnRetake) {
            btnRetake.onclick = () => switchConcentrationTest(state.currentTestId);
        }

        // Global Keyboard Shortcuts (Y / N, 1 / 2, Arrow Left / Arrow Right)
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            const mod = document.getElementById('module-concentration');
            if (!mod || mod.style.display === 'none') return;
            if (!state.testActive || state.testOver) return;

            const key = e.key.toUpperCase();
            if (key === 'Y' || key === '1' || e.code === 'ArrowLeft') {
                e.preventDefault();
                recordAnswer('YES');
            } else if (key === 'N' || key === '2' || e.code === 'ArrowRight') {
                e.preventDefault();
                recordAnswer('NO');
            } else if (key === ' ' || e.code === 'Space') {
                e.preventDefault();
                nextQuestion();
            }
        });
    }

    function startTest() {
        state.questions = generateQuestionBank(state.currentTestId);
        state.currentIndex = 0;
        state.userAnswers = {};
        state.timeRemaining = 180;
        state.testActive = true;
        state.testOver = false;
        state.startTime = Date.now();

        showScreen('conc-screen-test');
        renderTestSelectorBars();
        renderCurrentQuestion();
        startTimer();
    }

    function renderCurrentQuestion() {
        if (state.currentIndex >= state.questions.length) {
            finishTest();
            return;
        }

        const q = state.questions[state.currentIndex];
        const qNum = document.getElementById('conc-q-num');
        if (qNum) qNum.textContent = `Pair ${state.currentIndex + 1} of ${state.questions.length}`;

        const elLeft = document.getElementById('conc-num-left') || document.getElementById('conc-left-number');
        const elRight = document.getElementById('conc-num-right') || document.getElementById('conc-right-number');
        if (elLeft) elLeft.textContent = q.leftNumber;
        if (elRight) elRight.textContent = q.rightNumber;

        const answeredCount = Object.keys(state.userAnswers).length;
        const elAns = document.getElementById('conc-stat-answered');
        const elRem = document.getElementById('conc-stat-remaining');
        if (elAns) elAns.textContent = answeredCount;
        if (elRem) elRem.textContent = Math.max(0, state.questions.length - state.currentIndex);

        // Progress bar
        const pct = ((state.currentIndex) / state.questions.length) * 100;
        const pBar = document.getElementById('conc-progress-bar');
        if (pBar) pBar.style.width = `${pct}%`;
    }

    function recordAnswer(answer) {
        if (!state.testActive || state.testOver) return;

        const now = Date.now();
        if (now - lastActionTime < 120) return;
        lastActionTime = now;

        const q = state.questions[state.currentIndex];
        state.userAnswers[q.id] = answer;

        nextQuestion(true);
    }

    function nextQuestion(alreadyDebounced) {
        if (!alreadyDebounced) {
            const now = Date.now();
            if (now - lastActionTime < 120) return;
            lastActionTime = now;
        }
        state.currentIndex++;
        renderCurrentQuestion();
    }

    function finishTest() {
        clearInterval(state.timerInterval);
        state.testActive = false;
        state.testOver = true;

        showScreen('conc-screen-result');

        // Evaluate
        let correctCount = 0;
        let attemptedCount = 0;
        const trials = [];

        state.questions.forEach((q, idx) => {
            const userAns = state.userAnswers[q.id];
            const attempted = !!userAns;
            if (attempted) attemptedCount++;

            const isCorrect = userAns === q.correctAnswer;
            if (isCorrect) correctCount++;

            trials.push({
                num: idx + 1,
                left: q.leftNumber,
                right: q.rightNumber,
                correct: q.correctAnswer,
                user: userAns || 'Skipped',
                isCorrect: isCorrect
            });
        });

        const totalQuestions = state.questions.length;
        const normMean = 48.0;
        const normSd = 6.5;
        const tScore = Math.max(0, 50 + 10 * ((correctCount - normMean) / normSd));
        const isPassed = tScore >= 42.0;
        const wrongCount = attemptedCount - correctCount;
        const unansweredCount = totalQuestions - attemptedCount;
        const accuracyPct = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

        showScreen('conc-screen-scorecard');

        const elScore = document.getElementById('conc-metric-score') || document.getElementById('conc-score-raw');
        if (elScore) elScore.textContent = `${correctCount} / ${totalQuestions}`;

        const elScoreT = document.getElementById('conc-metric-t-score') || document.getElementById('conc-score-t');
        if (elScoreT) elScoreT.textContent = tScore.toFixed(4);

        const elAtt = document.getElementById('conc-score-attempted');
        if (elAtt) elAtt.textContent = `${attemptedCount} / ${totalQuestions}`;

        const elAcc = document.getElementById('conc-metric-accuracy');
        if (elAcc) elAcc.textContent = `${accuracyPct}%`;

        const elCorrect = document.getElementById('conc-metric-correct');
        if (elCorrect) elCorrect.textContent = `${correctCount}`;

        const elWrong = document.getElementById('conc-metric-wrong');
        if (elWrong) elWrong.textContent = `${wrongCount}`;

        const elUnans = document.getElementById('conc-metric-unanswered');
        if (elUnans) elUnans.textContent = `${unansweredCount}`;

        const banner = document.getElementById('conc-verdict-banner');
        if (banner) {
            banner.className = 'verdict-banner ' + (isPassed ? 'suitable' : 'not-suitable');
        }
        const titleEl = document.getElementById('conc-verdict-title');
        if (titleEl) {
            titleEl.textContent = isPassed ? 'RESULT: SUITABLE!' : 'RESULT: NOT SUITABLE!';
        }
        const descEl = document.getElementById('conc-verdict-subtitle') || document.getElementById('conc-verdict-desc');
        if (descEl) {
            descEl.textContent = isPassed
                ? `Passed! Qualifying T-Score achieved (T = ${tScore.toFixed(4)} >= 42.0000). Total: ${correctCount}/${totalQuestions}.`
                : `Not Qualified. T-Score (${tScore.toFixed(4)}) is below RDSO cutoff (42.0000). Need >= 43 correct.`;
        }

        // Render trials table
        const tbody = document.getElementById('conc-trials-table-body');
        if (tbody) {
            tbody.innerHTML = '';
            trials.slice(0, 30).forEach(t => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${t.num}</td>
                    <td><code>${t.left}</code></td>
                    <td><code>${t.right}</code></td>
                    <td><span class="badge-letter">${t.correct}</span></td>
                    <td><span class="badge-letter ${t.isCorrect ? 'pass' : 'fail'}">${t.user}</span></td>
                    <td><span class="status-pill ${t.isCorrect ? 'pass' : 'fail'}">${t.isCorrect ? 'Correct' : 'Incorrect'}</span></td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    function startTimer() {
        clearInterval(state.timerInterval);
        const display1 = document.getElementById('conc-test-timer');
        const display2 = document.getElementById('conc-timer-display');

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
        ['conc-screen-instructions', 'conc-screen-test', 'conc-screen-scorecard', 'conc-screen-result'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        const target = document.getElementById(screenId) || document.getElementById('conc-screen-scorecard');
        if (target) {
            target.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    window.ConcentrationModule = {
        init: init,
        switchTest: switchConcentrationTest
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
