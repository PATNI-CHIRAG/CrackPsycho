/**
 * GMRC / RDSO CBAT - Track Memory Test Module (Battery 1)
 * Authentic Railway Track Memory Test Suite:
 * - 10 Dedicated Mock Tests
 * - 2 Sets per Mock Test (12 Stations per set = 24 Questions total)
 * - Timing: 3 Minutes (180s) Study Phase + 3 Minutes (180s) Test Phase
 * - Authentic Cropped High-Res Track Maps from Official RDSO Bank
 */

(function () {
    'use strict';

    // Module State
    const state = {
        currentTestId: 1, // 1 to 10
        currentSet: 1, // 1 or 2
        phase: 'instructions', // 'instructions', 'study', 'test', 'scorecard'
        timeRemaining: 180, // 3 mins (180s) as required
        timerInterval: null,
        currentQuestionIndex: 0, // 0 to 11 within active set
        userAnswers: {}, // key `${set}_${qId}` -> letter
        markedReview: {}, // key `${set}_${qId}` -> boolean
        startTime: null,
        totalSets: 2,
        setResults: []
    };

    function getActiveMockTest() {
        if (window.TRACK_MEMORY_MOCK_TESTS && window.TRACK_MEMORY_MOCK_TESTS[state.currentTestId - 1]) {
            return window.TRACK_MEMORY_MOCK_TESTS[state.currentTestId - 1];
        }
        return null;
    }

    function getActiveSetData() {
        const mock = getActiveMockTest();
        if (!mock) return null;
        return state.currentSet === 1 ? mock.set1 : mock.set2;
    }

    // Initialize UI
    function init() {
        bindEvents();
        renderTestSelectorBars();
    }

    // Render Test Selector Bar on Track Memory Screens
    function renderTestSelectorBars() {
        const containers = ['tm-selector-bar-inst', 'tm-selector-bar-study', 'tm-selector-bar-test'];
        containers.forEach(cId => {
            const el = document.getElementById(cId);
            if (!el) return;
            el.innerHTML = `
                <div class="battery-test-selector-card">
                    <div class="sel-bar-header">
                        <span class="sel-bar-title">&#128649; TRACK MEMORY TEST SELECTOR:</span>
                        <span class="sel-bar-hint">Active: Mock Test ${String(state.currentTestId).padStart(2, '0')} (2 Sets &times; 12 Stations &bull; 3 Min Study + 3 Min Test)</span>
                    </div>
                    <div class="test-pill-grid">
                        ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `
                            <button class="test-pill-btn ${state.currentTestId === n ? 'active' : ''}" data-tm-test="${n}">
                                Test ${String(n).padStart(2, '0')}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            el.querySelectorAll('[data-tm-test]').forEach(btn => {
                btn.onclick = () => {
                    const testNum = parseInt(btn.getAttribute('data-tm-test'), 10);
                    switchTrackMemoryTest(testNum);
                };
            });
        });
    }

    function switchTrackMemoryTest(testNum) {
        clearInterval(state.timerInterval);
        state.currentTestId = testNum;
        state.currentSet = 1;
        state.phase = 'instructions';
        state.userAnswers = {};
        state.markedReview = {};
        state.setResults = [];
        renderTestSelectorBars();
        showScreen('tm-screen-instructions');
    }

    let eventsBound = false;
    let lastNavTime = 0;

    function bindEvents() {
        if (eventsBound) return;
        eventsBound = true;

        const btnStart = document.getElementById('tm-btn-start');
        if (btnStart) {
            btnStart.onclick = startSetStudy;
        }

        const btnEndStudy = document.getElementById('tm-btn-end-study');
        if (btnEndStudy) {
            btnEndStudy.onclick = endStudyAndStartTest;
        }

        const btnNext = document.getElementById('tm-btn-next');
        if (btnNext) {
            btnNext.onclick = () => navigateQuestion(1);
        }

        const btnPrev = document.getElementById('tm-btn-prev');
        if (btnPrev) {
            btnPrev.onclick = () => navigateQuestion(-1);
        }

        const btnMark = document.getElementById('tm-btn-mark');
        if (btnMark) {
            btnMark.onclick = toggleMarkReview;
        }

        const btnClear = document.getElementById('tm-btn-clear');
        if (btnClear) {
            btnClear.onclick = clearAnswer;
        }

        const btnSubmitSet = document.getElementById('tm-btn-submit-set');
        if (btnSubmitSet) {
            btnSubmitSet.onclick = () => {
                if (confirm(`Are you sure you want to submit Set ${state.currentSet}?`)) {
                    finishCurrentSet();
                }
            };
        }

        const btnRetake = document.getElementById('tm-btn-retake');
        if (btnRetake) {
            btnRetake.onclick = resetAll;
        }

        // Global Keyboard Shortcuts for Track Memory Test (A-E, Arrows, Enter, M, C)
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            const mod = document.getElementById('module-track-memory');
            if (!mod || mod.style.display === 'none') return;
            if (state.phase !== 'test') return;

            const key = e.key.toUpperCase();
            const validLetters = ['A', 'B', 'C', 'D', 'E'];
            if (validLetters.includes(key)) {
                e.preventDefault();
                const setData = getActiveSetData();
                if (setData && setData.questions[state.currentQuestionIndex]) {
                    const qObj = setData.questions[state.currentQuestionIndex];
                    const qKey = `${state.currentSet}_${qObj.id}`;
                    selectOption(qKey, key);
                }
            } else if (e.code === 'ArrowRight' || e.code === 'Enter') {
                e.preventDefault();
                navigateQuestion(1);
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                navigateQuestion(-1);
            } else if (key === 'M') {
                e.preventDefault();
                toggleMarkReview();
            } else if (key === 'C') {
                e.preventDefault();
                clearAnswer();
            }
        });
    }

    // Step 1: Start Set Study Phase (3 Minutes / 180s)
    function startSetStudy() {
        state.phase = 'study';
        state.timeRemaining = 180; // 3 minutes study time
        const setData = getActiveSetData();

        showScreen('tm-screen-study');
        renderTestSelectorBars();

        const badgeEl = document.getElementById('tm-study-set-badge');
        if (badgeEl) {
            badgeEl.textContent = `Mock Test ${String(state.currentTestId).padStart(2, '0')} - Set ${state.currentSet} of 2 (3 Min Study)`;
        }

        const mapContainer = document.getElementById('tm-study-map-container');
        if (mapContainer && setData) {
            mapContainer.innerHTML = `
                <div style="text-align:center; padding:10px;">
                    <img src="${setData.memoryImage}" alt="Track Memory Map - Study" 
                         style="max-width:100%; max-height:550px; width:auto; height:auto; object-fit:contain; border:2px solid #334155; border-radius:8px; box-shadow:0 4px 14px rgba(0,0,0,0.15); display:block; margin:0 auto; background:#fff;" />
                </div>
            `;
        }

        startTimer(() => {
            endStudyAndStartTest();
        }, 'tm-study-timer');
    }

    // Step 2: Transition from Study to Test Phase (3 Minutes / 180s)
    function endStudyAndStartTest() {
        clearInterval(state.timerInterval);
        state.phase = 'test';
        state.timeRemaining = 180; // 3 minutes test time
        state.currentQuestionIndex = 0;

        showScreen('tm-screen-test');
        renderTestSelectorBars();

        const badgeEl = document.getElementById('tm-test-set-badge');
        if (badgeEl) {
            badgeEl.textContent = `Mock Test ${String(state.currentTestId).padStart(2, '0')} - Set ${state.currentSet} of 2 (3 Min Answer)`;
        }

        renderTestScreen();
        startTimer(() => {
            finishCurrentSet();
        }, 'tm-test-timer');
    }

    // Render Active Test Question & Map
    function renderTestScreen() {
        const setData = getActiveSetData();
        if (!setData) return;

        const qIndex = state.currentQuestionIndex;
        const qObj = setData.questions[qIndex];
        const qKey = `${state.currentSet}_${qObj.id}`;

        // Render Test Map (with letters A, B, C, D, E)
        const testMapContainer = document.getElementById('tm-test-map-container');
        if (testMapContainer) {
            testMapContainer.innerHTML = `
                <div style="text-align:center; padding:8px;">
                    <img src="${setData.questionImage}" alt="Track Question Map" 
                         style="max-width:100%; max-height:510px; width:auto; height:auto; object-fit:contain; border:2px solid #334155; border-radius:8px; box-shadow:0 4px 14px rgba(0,0,0,0.12); display:block; margin:0 auto; background:#fff;" />
                </div>
            `;
        }

        // Render Question Details
        const qNumEl = document.getElementById('tm-q-num');
        if (qNumEl) {
            const overallQNum = (state.currentSet - 1) * 12 + (qIndex + 1);
            qNumEl.textContent = `Question ${overallQNum} of 24 (Set ${state.currentSet}: Q${qIndex + 1}/12)`;
        }

        const qStationEl = document.getElementById('tm-q-station-name');
        if (qStationEl) {
            qStationEl.textContent = qObj.station;
        }

        // 5 Options: A, B, C, D, E
        const options = ['A', 'B', 'C', 'D', 'E'];
        const optContainer = document.getElementById('tm-options-container');
        if (optContainer) {
            optContainer.innerHTML = '';
            options.forEach(letter => {
                const btn = document.createElement('button');
                btn.className = 'tm-opt-btn';
                if (state.userAnswers[qKey] === letter) {
                    btn.classList.add('selected');
                }
                btn.innerHTML = `
                    <span class="opt-badge">${letter}</span>
                    <span style="font-weight:700; margin-left:10px; font-size:1.05rem;">Position ${letter}</span>
                `;
                btn.addEventListener('click', () => {
                    selectOption(qKey, letter);
                });
                optContainer.appendChild(btn);
            });
        }

        // Update Palette
        renderPalette();
    }

    function selectOption(qKey, letter) {
        state.userAnswers[qKey] = letter;
        renderTestScreen();
    }

    function clearAnswer() {
        const setData = getActiveSetData();
        if (!setData) return;
        const qObj = setData.questions[state.currentQuestionIndex];
        const qKey = `${state.currentSet}_${qObj.id}`;
        delete state.userAnswers[qKey];
        renderTestScreen();
    }

    function toggleMarkReview() {
        const setData = getActiveSetData();
        if (!setData) return;
        const qObj = setData.questions[state.currentQuestionIndex];
        const qKey = `${state.currentSet}_${qObj.id}`;
        state.markedReview[qKey] = !state.markedReview[qKey];
        renderTestScreen();
    }

    function navigateQuestion(delta) {
        const now = Date.now();
        if (now - lastNavTime < 120) return; // Ignore rapid duplicate triggers
        lastNavTime = now;

        const next = state.currentQuestionIndex + delta;
        if (next >= 0 && next < 12) {
            state.currentQuestionIndex = next;
            renderTestScreen();
        }
    }

    function renderPalette() {
        const setData = getActiveSetData();
        if (!setData) return;

        const palette = document.getElementById('tm-palette-grid');
        if (!palette) return;
        palette.innerHTML = '';

        let answeredCount = 0;

        setData.questions.forEach((qObj, idx) => {
            const qKey = `${state.currentSet}_${qObj.id}`;
            const isAnswered = !!state.userAnswers[qKey];
            const isMarked = !!state.markedReview[qKey];
            const isCurrent = idx === state.currentQuestionIndex;

            if (isAnswered) answeredCount++;

            const btn = document.createElement('button');
            let cls = 'tm-pal-btn';
            if (isCurrent) cls += ' active';
            if (isMarked) cls += ' marked';
            else if (isAnswered) cls += ' answered';

            btn.className = cls;
            const overallNum = (state.currentSet - 1) * 12 + (idx + 1);
            btn.textContent = overallNum;
            btn.title = `Station: ${qObj.station}`;
            btn.addEventListener('click', () => {
                state.currentQuestionIndex = idx;
                renderTestScreen();
            });
            palette.appendChild(btn);
        });

        const elAns = document.getElementById('tm-stat-answered');
        if (elAns) elAns.textContent = answeredCount;
        const elUnans = document.getElementById('tm-stat-unanswered');
        if (elUnans) elUnans.textContent = 12 - answeredCount;
    }

    // Finish Current Set & evaluate
    function finishCurrentSet() {
        clearInterval(state.timerInterval);
        const setData = getActiveSetData();
        if (!setData) return;

        let correctCount = 0;
        const setDetails = [];

        setData.questions.forEach((qObj, idx) => {
            const qKey = `${state.currentSet}_${qObj.id}`;
            const userChoice = state.userAnswers[qKey] || 'Unanswered';
            const isCorrect = userChoice === qObj.answer;
            if (isCorrect) correctCount++;

            setDetails.push({
                qNum: (state.currentSet - 1) * 12 + (idx + 1),
                station: qObj.station,
                correctLetter: qObj.answer,
                userChoice: userChoice,
                isCorrect: isCorrect
            });
        });

        state.setResults.push({
            setNum: state.currentSet,
            correct: correctCount,
            total: 12,
            details: setDetails
        });

        if (state.currentSet < state.totalSets) {
            // Move to Set 2
            state.currentSet++;
            alert(`Set 1 Complete (${correctCount}/12 correct)! Now beginning Set 2: 3-Minute Study Phase.`);
            startSetStudy();
        } else {
            // Both sets finished -> Show Comprehensive Battery 1 Scorecard
            renderFinalScorecard();
        }
    }

    // Render Final Scorecard
    function renderFinalScorecard() {
        showScreen('tm-screen-scorecard');

        const set1 = state.setResults[0] || { correct: 0, total: 12, details: [] };
        const set2 = state.setResults[1] || { correct: 0, total: 12, details: [] };
        const totalCorrect = set1.correct + set2.correct;
        const totalQuestions = 24;
        const totalWrong = totalQuestions - totalCorrect;
        const accuracyPct = Math.round((totalCorrect / totalQuestions) * 100);

        // RDSO T-Score Formula: T = 50 + 10 * ((Raw - Mean) / SD)
        // Standard RDSO Norms for Track Memory: Mean = 16.5, SD = 3.2, Cutoff = 42.0
        const normMean = 16.5;
        const normSd = 3.2;
        const tScore = Math.max(0, 50 + 10 * ((totalCorrect - normMean) / normSd));
        const isPassed = tScore >= 42.0;

        const elScoreRaw = document.getElementById('tm-score-raw') || document.getElementById('tm-metric-score');
        if (elScoreRaw) elScoreRaw.textContent = `${totalCorrect} / ${totalQuestions}`;

        const elScoreT = document.getElementById('tm-score-t') || document.getElementById('tm-metric-t-score');
        if (elScoreT) elScoreT.textContent = tScore.toFixed(4);

        const elAccuracy = document.getElementById('tm-metric-accuracy');
        if (elAccuracy) elAccuracy.textContent = `${accuracyPct}%`;

        const elCorrect = document.getElementById('tm-metric-correct');
        if (elCorrect) elCorrect.textContent = `${totalCorrect}`;

        const elWrong = document.getElementById('tm-metric-wrong');
        if (elWrong) elWrong.textContent = `${totalWrong}`;

        const elUnanswered = document.getElementById('tm-metric-unanswered');
        if (elUnanswered) {
            const unans = set1.details.concat(set2.details).filter(d => d.userChoice === 'Unanswered').length;
            elUnanswered.textContent = `${unans}`;
        }

        const elSet1 = document.getElementById('tm-score-set1');
        if (elSet1) elSet1.textContent = `${set1.correct} / 12`;
        const elSet2 = document.getElementById('tm-score-set2');
        if (elSet2) elSet2.textContent = `${set2.correct} / 12`;

        const banner = document.getElementById('tm-verdict-banner');
        if (banner) {
            banner.className = 'verdict-banner ' + (isPassed ? 'suitable' : 'not-suitable');
        }
        const titleEl = document.getElementById('tm-verdict-title');
        if (titleEl) {
            titleEl.textContent = isPassed ? 'RESULT: SUITABLE!' : 'RESULT: NOT SUITABLE!';
        }
        const descEl = document.getElementById('tm-verdict-desc') || document.getElementById('tm-verdict-subtitle');
        if (descEl) {
            descEl.textContent = isPassed
                ? `Passed! Qualifying T-Score achieved (T = ${tScore.toFixed(4)} >= 42.0000). Total Score: ${totalCorrect}/24.`
                : `Not Qualified. T-Score (${tScore.toFixed(4)}) is below RDSO qualifying cutoff (42.0000). Need >= 14 correct.`;
        }

        // Populate details table
        const tbody = document.getElementById('tm-trials-table-body') || document.getElementById('tm-result-table-body');
        if (tbody) {
            tbody.innerHTML = '';
            const allDetails = [
                ...set1.details.map(d => ({ ...d, setLabel: 'Set 1' })),
                ...set2.details.map(d => ({ ...d, setLabel: 'Set 2' }))
            ];

            allDetails.forEach(d => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${d.setLabel} - Q${d.qNum}</td>
                    <td><strong>${d.station}</strong></td>
                    <td><span class="badge-letter">${d.correctLetter}</span></td>
                    <td><span class="badge-letter ${d.isCorrect ? 'pass' : 'fail'}">${d.userChoice}</span></td>
                    <td><span class="status-pill ${d.isCorrect ? 'pass' : 'fail'}">${d.isCorrect ? 'Correct' : (d.userChoice === 'Unanswered' ? 'Skipped' : 'Incorrect')}</span></td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    // Reset module
    function resetAll() {
        clearInterval(state.timerInterval);
        state.currentSet = 1;
        state.phase = 'instructions';
        state.userAnswers = {};
        state.markedReview = {};
        state.setResults = [];
        showScreen('tm-screen-instructions');
        renderTestSelectorBars();
    }

    // Helper: Screen Switcher
    function showScreen(screenId) {
        ['tm-screen-instructions', 'tm-screen-study', 'tm-screen-test', 'tm-screen-scorecard', 'tm-screen-result'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        const target = document.getElementById(screenId) || document.getElementById('tm-screen-scorecard');
        if (target) {
            target.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Helper: Timer
    function startTimer(callback, displayId) {
        clearInterval(state.timerInterval);
        const display = document.getElementById(displayId);

        function tick() {
            const mins = Math.floor(state.timeRemaining / 60);
            const secs = state.timeRemaining % 60;
            if (display) {
                display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            }

            if (state.timeRemaining <= 0) {
                clearInterval(state.timerInterval);
                callback();
            } else {
                state.timeRemaining--;
            }
        }

        tick();
        state.timerInterval = setInterval(tick, 1000);
    }

    // Public API
    window.TrackMemoryModule = {
        init: init,
        switchTest: switchTrackMemoryTest
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
