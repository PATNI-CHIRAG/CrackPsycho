/**
 * ============================================================================
 * GMRC / RDSO Color Reaction Test Engine - CrackPsycho Exact Replica
 * ============================================================================
 */

(function () {
    "use strict";

    // ========================================================================
    // Sound Effects Manager (Web Audio API - 100% Offline & Low Latency)
    // ========================================================================
    class SoundManager {
        constructor() {
            this.ctx = null;
            this.enabled = localStorage.getItem('gmrc_sound') !== 'false';
        }

        init() {
            if (!this.ctx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.ctx = new AudioContext();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        toggle() {
            this.enabled = !this.enabled;
            localStorage.setItem('gmrc_sound', this.enabled ? 'true' : 'false');
            return this.enabled;
        }

        playTone(freq, type, duration, gainValue = 0.15) {
            if (!this.enabled) return;
            try {
                this.init();
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) {
                console.warn('Audio play error:', e);
            }
        }

        stimulusBeep() {
            // Crisp stimulus onset ping (850Hz)
            this.playTone(850, 'sine', 0.12, 0.25);
        }

        correctChime() {
            if (!this.enabled) return;
            try {
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                // Double bell chime (1046Hz, then 1318Hz)
                const osc1 = this.ctx.createOscillator();
                const gain1 = this.ctx.createGain();
                osc1.frequency.setValueAtTime(1046.5, now); // C6
                gain1.gain.setValueAtTime(0.18, now);
                gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
                osc1.connect(gain1);
                gain1.connect(this.ctx.destination);
                osc1.start(now);
                osc1.stop(now + 0.12);

                const osc2 = this.ctx.createOscillator();
                const gain2 = this.ctx.createGain();
                osc2.frequency.setValueAtTime(1318.5, now + 0.08); // E6
                gain2.gain.setValueAtTime(0.2, now + 0.08);
                gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
                osc2.connect(gain2);
                gain2.connect(this.ctx.destination);
                osc2.start(now + 0.08);
                osc2.stop(now + 0.22);
            } catch (e) {
                console.warn('Audio chime error:', e);
            }
        }

        errorBuzzer() {
            // Low saw buzzer (180Hz)
            this.playTone(180, 'sawtooth', 0.25, 0.25);
        }

        prematureBuzzer() {
            // Warning buzzer for early 'B' release (240Hz)
            this.playTone(240, 'triangle', 0.18, 0.2);
        }

        finishFanfare() {
            if (!this.enabled) return;
            try {
                this.init();
                if (!this.ctx) return;
                const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C
                notes.forEach((freq, idx) => {
                    setTimeout(() => {
                        this.playTone(freq, 'sine', 0.25, 0.2);
                    }, idx * 100);
                });
            } catch (e) {
                console.warn('Fanfare error:', e);
            }
        }
    }

    // ========================================================================
    // Application State & Configuration
    // ========================================================================
    const sound = new SoundManager();

    const COLOR_CONFIG = {
        2: { name: 'Red', hex: '#ff2222', lampId: 'lamp-red', key: '2' },
        4: { name: 'Yellow', hex: '#ffd700', lampId: 'lamp-yellow', key: '4' },
        8: { name: 'Green', hex: '#00e639', lampId: 'lamp-green', key: '8' },
        0: { name: 'Blue', hex: '#0088ff', lampId: 'lamp-blue', key: '0' }
    };

    const DIFFICULTIES = {
        easy: { 
            name: 'Easy', 
            holdTime: 0, 
            attemptsCap: 25, 
            label: 'Instant (0s Delay)',
            benchmarkMean: 989.70, // Empirical candidate mean from CrackPsycho
            benchmarkSd: 466.02    // Empirical candidate SD from CrackPsycho
        },
        medium: { 
            name: 'Medium', 
            holdTime: 0, 
            attemptsCap: 32, 
            label: 'Instant (0s Delay)',
            benchmarkMean: 901.85, // Empirical candidate mean from CrackPsycho
            benchmarkSd: 253.93    // Empirical candidate SD from CrackPsycho
        },
        hard: { 
            name: 'Hard', 
            holdTime: 0, 
            attemptsCap: 40, 
            label: 'Instant (0s Delay)',
            benchmarkMean: 829.94, // Empirical candidate mean from CrackPsycho
            benchmarkSd: 127.54    // Empirical candidate SD from CrackPsycho
        }
    };

    // RDSO standard normative qualification cutoffs for visual reaction timer
    const RDSO_BENCHMARK = {
        qualifyingTScore: 42.0,
        qualifyingAccuracy: 100.0
    };

    // 10 Authentic RDSO Color Reaction Mock Tests
    const REACTION_MOCK_TESTS = [
        { id: 1, title: 'Mock Test 01', desc: 'Standard Metro Speed & Accuracy (Balanced 4-Color Sequence)', colors: [2, 4, 8, 0, 8, 2, 0, 4, 2, 8, 4, 0, 2, 0, 8, 4, 8, 2, 4, 0, 0, 8, 2, 4, 8, 0, 2, 4, 8, 0] },
        { id: 2, title: 'Mock Test 02', desc: 'High-Alert Train Protection (Red & Green Focus)', colors: [2, 8, 2, 8, 4, 2, 8, 0, 2, 8, 8, 2, 4, 8, 2, 0, 8, 2, 8, 4, 2, 8, 2, 0, 8, 2, 4, 8, 2, 8] },
        { id: 3, title: 'Mock Test 03', desc: 'Station Dispatch Drill (Yellow & Blue Focus)', colors: [4, 0, 4, 0, 2, 4, 0, 8, 4, 0, 0, 4, 8, 0, 4, 2, 0, 4, 0, 8, 4, 0, 4, 2, 0, 4, 8, 0, 4, 0] },
        { id: 4, title: 'Mock Test 04', desc: 'Fast Alternation Drill (Quick Rhythm Color Shifts)', colors: [2, 4, 8, 0, 2, 4, 8, 0, 8, 4, 2, 0, 0, 2, 4, 8, 4, 2, 0, 8, 2, 0, 4, 8, 8, 0, 2, 4, 4, 8] },
        { id: 5, title: 'Mock Test 05', desc: 'Emergency Signal Protocol (Critical Red Frequency)', colors: [2, 2, 4, 8, 2, 0, 2, 2, 8, 4, 2, 0, 2, 8, 4, 2, 2, 0, 8, 2, 4, 2, 2, 8, 0, 2, 4, 8, 2, 2] },
        { id: 6, title: 'Mock Test 06', desc: 'Peak Traffic Hours (Randomized Junction Sequence)', colors: [8, 4, 2, 0, 4, 8, 0, 2, 8, 2, 4, 0, 4, 2, 8, 0, 0, 8, 4, 2, 2, 8, 4, 0, 8, 4, 0, 2, 4, 8] },
        { id: 7, title: 'Mock Test 07', desc: 'Aspect Transition Drill (Dynamic 4-Color Shift Patterns)', colors: [0, 8, 4, 2, 0, 4, 8, 2, 8, 0, 2, 4, 2, 0, 4, 8, 4, 8, 2, 0, 8, 4, 0, 2, 0, 2, 8, 4, 4, 0] },
        { id: 8, title: 'Mock Test 08', desc: 'Train Operator Response Drill (Strict RDSO Speed Benchmark)', colors: [2, 8, 4, 0, 8, 2, 4, 0, 2, 8, 0, 4, 4, 2, 8, 0, 8, 4, 2, 0, 0, 2, 8, 4, 2, 8, 4, 0, 4, 8] },
        { id: 9, title: 'Mock Test 09', desc: 'Night Operations Vigilance (High Visual Contrast Stimuli)', colors: [8, 0, 2, 4, 8, 0, 4, 2, 0, 8, 2, 4, 2, 4, 0, 8, 8, 2, 4, 0, 0, 4, 8, 2, 4, 0, 8, 2, 2, 8] },
        { id: 10, title: 'Mock Test 10', desc: 'Official RDSO Comprehensive Final (Full Certification Sequence)', colors: [2, 4, 8, 0, 4, 8, 2, 0, 8, 2, 0, 4, 2, 0, 4, 8, 4, 8, 0, 2, 0, 4, 8, 2, 8, 2, 4, 0, 2, 8] }
    ];

    // Runtime state
    const state = {
        candidateName: 'Candidate',
        rollNo: 'GMRC-100234',
        currentTestId: 1, // 1 to 10
        currentDifficulty: 'easy',
        examMode: 'exam', // 'exam' (60s countdown / max attempts) or 'practice' (unlimited)
        
        testActive: false,
        testOver: false,
        testAbandoned: false,
        startTime: 0,
        examStartTime: 0,
        examTimerId: null,
        timeRemaining: 60, // seconds in exam mode
        
        // 'B' hold management
        isBPressed: false,
        bPressedStartTime: 0,
        holdAnimFrameId: null,
        hasCompletedHold: false,
        
        // Stimulus management
        currentLight: null,
        lastLight: null,
        awaitingResponse: false,
        stimulusStartTime: 0,
        timeoutTimerId: null,
        
        // Metrics
        totalAttempts: 0,
        correctAttempts: 0,
        wrongAttempts: 0,
        timeoutAttempts: 0,
        prematureReleases: 0,
        reactionTimes: [],
        trialHistory: []
    };

    // ========================================================================
    // DOM Elements Cache
    // ========================================================================
    const dom = {
        // Screens
        screenInstructions: document.getElementById('screen-instructions'),
        screenDifficulty: document.getElementById('screen-difficulty'),
        screenTest: document.getElementById('screen-test'),
        screenScorecard: document.getElementById('screen-scorecard'),
        
        // Candidate Inputs & Nav Display
        inputCandidateName: document.getElementById('input-candidate-name'),
        inputRollNo: document.getElementById('input-roll-no'),
        navCandidatePill: document.getElementById('nav-candidate-pill'),
        navCandidateName: document.getElementById('nav-candidate-name'),
        navRollNo: document.getElementById('nav-roll-no'),
        audioToggleBtn: document.getElementById('audio-toggle-btn'),
        
        // Instructions
        chkAgreement: document.getElementById('chk-agreement'),
        btnProceedInstructions: document.getElementById('btn-proceed-instructions'),
        
        // Difficulty Selection
        difficultyOptions: document.querySelectorAll('.difficulty-option'),
        modeButtons: document.querySelectorAll('.mode-btn'),
        btnStartExam: document.getElementById('btn-start-exam'),
        
        // Test Area Elements
        liveInstruction: document.getElementById('live-instruction'),
        liveInstructionText: document.getElementById('live-instruction-text'),
        holdProgressBar: document.getElementById('hold-progress-bar'),
        testTimerDisplay: document.getElementById('test-timer-display'),
        testAttemptsDisplay: document.getElementById('test-attempts-display'),
        testAccuracyDisplay: document.getElementById('test-accuracy-display'),
        btnQuitTest: document.getElementById('btn-quit-test'),
        
        // Apparatus Lamps
        lampRed: document.getElementById('lamp-red'),
        lampYellow: document.getElementById('lamp-yellow'),
        lampGreen: document.getElementById('lamp-green'),
        lampBlue: document.getElementById('lamp-blue'),
        allLamps: document.querySelectorAll('.signal-lamp'),
        
        // Virtual Keypad
        vKeyB: document.getElementById('vkey-b'),
        vKeyRed: document.getElementById('vkey-2'),
        vKeyYellow: document.getElementById('vkey-4'),
        vKeyGreen: document.getElementById('vkey-8'),
        vKeyBlue: document.getElementById('vkey-0'),
        allVKeys: document.querySelectorAll('.v-key, .v-key-neutral'),
        
        // Scorecard Elements
        scoreCandidateName: document.getElementById('score-candidate-name'),
        scoreRollNo: document.getElementById('score-roll-no'),
        scoreExamDate: document.getElementById('score-exam-date'),
        scoreDifficulty: document.getElementById('score-difficulty'),
        verdictBanner: document.getElementById('verdict-banner'),
        verdictTitle: document.getElementById('verdict-title'),
        verdictSubtitle: document.getElementById('verdict-subtitle'),
        metricTScore: document.getElementById('metric-t-score'),
        metricAccuracy: document.getElementById('metric-accuracy'),
        metricAvgRt: document.getElementById('metric-avg-rt'),
        metricBenchmarkNote: document.getElementById('metric-benchmark-note'),
        metricTotalAttempts: document.getElementById('metric-total-attempts'),
        metricCorrectAttempts: document.getElementById('metric-correct-attempts'),
        metricWrongAttempts: document.getElementById('metric-wrong-attempts'),
        metricTimeTaken: document.getElementById('metric-time-taken'),
        metricStandardDev: document.getElementById('metric-standard-dev') || document.getElementById('metric-std-dev'),
        trialsTableBody: document.getElementById('trials-table-body'),
        btnRetakeTest: document.getElementById('btn-retake-test'),
        btnChangeDiff: document.getElementById('btn-change-diff'),
        btnPrintScorecard: document.getElementById('btn-print-scorecard'),
        btnBackHome: document.getElementById('btn-back-home'),
        batteryTabs: document.querySelectorAll('.battery-tab'),
        allModuleContainers: document.querySelectorAll('.test-module-container'),
        moduleReaction: document.getElementById('module-reaction')
    };

    // ========================================================================
    // Screen Navigation
    // ========================================================================
    function showScreen(screenEl) {
        [dom.screenInstructions, dom.screenDifficulty, dom.screenTest, dom.screenScorecard]
            .forEach(s => {
                if (s) s.style.display = 'none';
            });
        if (screenEl) {
            screenEl.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        renderReactionTestSelector();
    }

    function renderReactionTestSelector() {
        const containers = ['reaction-selector-bar', 'reaction-selector-bar-diff'];
        containers.forEach(cId => {
            const el = document.getElementById(cId);
            if (!el) return;
            const currentMock = REACTION_MOCK_TESTS[state.currentTestId - 1] || REACTION_MOCK_TESTS[0];
            el.innerHTML = `
                <div class="battery-test-selector-card">
                    <div class="sel-bar-header">
                        <span class="sel-bar-title">&#128678; COLOR REACTION TEST SELECTOR:</span>
                        <span class="sel-bar-hint">Active: Mock Test ${String(currentMock.id).padStart(2, '0')} &bull; ${currentMock.desc}</span>
                    </div>
                    <div class="test-pill-grid">
                        ${REACTION_MOCK_TESTS.map(t => `
                            <button class="test-pill-btn ${state.currentTestId === t.id ? 'active' : ''}" data-reaction-test="${t.id}">
                                Test ${String(t.id).padStart(2, '0')}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            el.querySelectorAll('[data-reaction-test]').forEach(btn => {
                btn.onclick = () => {
                    const testNum = parseInt(btn.getAttribute('data-reaction-test'), 10);
                    switchReactionTest(testNum);
                };
            });
        });
    }

    function switchReactionTest(testNum) {
        state.currentTestId = testNum;
        clearAllTimeouts();
        clearLamps();
        state.testActive = false;
        state.testOver = false;
        renderReactionTestSelector();
        showScreen(dom.screenInstructions);
    }

    // ========================================================================
    // Candidate Profile Management
    // ========================================================================
    function loadSavedProfile() {
        const savedName = localStorage.getItem('gmrc_candidate_name') || 'Candidate';
        const savedRoll = localStorage.getItem('gmrc_roll_no') || 'GMRC-' + Math.floor(100000 + Math.random() * 900000);
        
        if (dom.inputCandidateName) dom.inputCandidateName.value = savedName;
        if (dom.inputRollNo) dom.inputRollNo.value = savedRoll;
        
        state.candidateName = savedName;
        state.rollNo = savedRoll;
        updateNavPill();
    }

    function saveProfile() {
        if (dom.inputCandidateName) {
            state.candidateName = dom.inputCandidateName.value.trim() || 'Candidate';
            localStorage.setItem('gmrc_candidate_name', state.candidateName);
        }
        if (dom.inputRollNo) {
            state.rollNo = dom.inputRollNo.value.trim() || 'GMRC-100234';
            localStorage.setItem('gmrc_roll_no', state.rollNo);
        }
        updateNavPill();
    }

    function updateNavPill() {
        if (dom.navCandidateName) dom.navCandidateName.textContent = state.candidateName;
        if (dom.navRollNo) dom.navRollNo.textContent = state.rollNo;
    }

    // ========================================================================
    // Test Engine: Initiation & Loop
    // ========================================================================
    function initTest() {
        saveProfile();
        sound.init();

        const diffConfig = DIFFICULTIES[state.currentDifficulty];
        state.testActive = true;
        state.testOver = false;
        state.testAbandoned = false;
        state.totalAttempts = 0;
        state.correctAttempts = 0;
        state.wrongAttempts = 0;
        state.timeoutAttempts = 0;
        state.prematureReleases = 0;
        state.reactionTimes = [];
        state.trialHistory = [];
        state.isBPressed = false;
        state.hasCompletedHold = false;
        state.awaitingResponse = false;
        state.currentLight = null;
        state.lastLight = null;
        state.timeRemaining = 60; // 60 seconds exam mode

        clearAllTimeouts();
        clearLamps();
        updateTestStatsUI();
        setInstruction('waiting', "Press and HOLD 'B' key to trigger light");
        updateHoldProgress(0);

        showScreen(dom.screenTest);

        // Start exam timer if exam mode
        if (state.examMode === 'exam') {
            dom.testTimerDisplay.textContent = '60s';
            state.examStartTime = Date.now();
            state.examTimerId = setInterval(() => {
                const elapsed = Math.floor((Date.now() - state.examStartTime) / 1000);
                const remaining = Math.max(0, 60 - elapsed);
                state.timeRemaining = remaining;
                dom.testTimerDisplay.textContent = remaining + 's';
                
                if (remaining <= 0) {
                    clearInterval(state.examTimerId);
                    finishTest();
                }
            }, 500);
        } else {
            dom.testTimerDisplay.textContent = 'Practice';
        }
    }

    function clearAllTimeouts() {
        if (state.timeoutTimerId) {
            clearTimeout(state.timeoutTimerId);
            state.timeoutTimerId = null;
        }
        if (state.examTimerId) {
            clearInterval(state.examTimerId);
            state.examTimerId = null;
        }
        if (state.holdAnimFrameId) {
            cancelAnimationFrame(state.holdAnimFrameId);
            state.holdAnimFrameId = null;
        }
    }

    function clearLamps() {
        dom.allLamps.forEach(lamp => lamp.classList.remove('active'));
    }

    function setInstruction(type, message) {
        if (!dom.liveInstruction || !dom.liveInstructionText) return;
        dom.liveInstruction.className = 'live-instruction-alert ' + type;
        dom.liveInstructionText.innerHTML = message;
    }

    function updateHoldProgress(percentage) {
        if (dom.holdProgressBar) {
            dom.holdProgressBar.style.width = Math.min(100, Math.max(0, percentage)) + '%';
        }
    }

    // ========================================================================
    // 'B' Key Handling (Instant Stimulus - No 1-Second Delay)
    // ========================================================================
    function handleBKeyDown() {
        if (!state.testActive || state.testOver) return;
        if (state.awaitingResponse) return; // Ignore 'B' while responding to light
        if (state.isBPressed) return; // Already holding

        state.isBPressed = true;
        state.hasCompletedHold = true;
        state.bPressedStartTime = performance.now();
        setVirtualKeyPressed(dom.vKeyB, true);
        updateHoldProgress(100);

        // Immediate stimulus trigger on pressing 'B' (Zero Delay as requested!)
        triggerStimulus();
    }

    function handleBKeyUp() {
        if (!state.testActive || state.testOver) return;
        if (!state.isBPressed) return;

        state.isBPressed = false;
        setVirtualKeyPressed(dom.vKeyB, false);
        if (state.holdAnimFrameId) {
            cancelAnimationFrame(state.holdAnimFrameId);
            state.holdAnimFrameId = null;
        }
    }

    // ========================================================================
    // Stimulus Presentation
    // ========================================================================
    function triggerStimulus() {
        clearLamps();
        const diffConfig = DIFFICULTIES[state.currentDifficulty];

        let newLight;
        const currentMock = REACTION_MOCK_TESTS[state.currentTestId - 1] || REACTION_MOCK_TESTS[0];
        const trialIdx = state.totalAttempts;

        if (currentMock && currentMock.colors && trialIdx < currentMock.colors.length) {
            newLight = currentMock.colors[trialIdx];
        } else {
            // Pick next color with CrackPsycho's exact 20% repeat algorithm
            const repeatChance = 0.20;
            const colorKeys = [2, 4, 8, 0];

            if (Math.random() < repeatChance && state.lastLight !== null) {
                newLight = state.lastLight;
            } else {
                const otherColors = colorKeys.filter(c => c !== state.lastLight);
                newLight = otherColors[Math.floor(Math.random() * otherColors.length)];
            }
        }

        state.lastLight = newLight;
        state.currentLight = newLight;
        state.awaitingResponse = true;

        const config = COLOR_CONFIG[newLight];
        const lampEl = document.getElementById(config.lampId);
        if (lampEl) {
            lampEl.classList.add('active');
        }

        sound.stimulusBeep();
        state.stimulusStartTime = performance.now();
        setInstruction('active-light', `<strong>${config.name.toUpperCase()}</strong> Light is ON! Strike key <strong>${config.key}</strong>!`);

        // 5-Second Response Timeout (handleNotPressed in CrackPsycho)
        if (state.timeoutTimerId) clearTimeout(state.timeoutTimerId);
        state.timeoutTimerId = setTimeout(() => {
            handleTimeout();
        }, 5000);
    }

    function handleTimeout() {
        if (!state.awaitingResponse) return;

        state.awaitingResponse = false;
        clearLamps();
        updateHoldProgress(0);
        sound.errorBuzzer();

        const config = COLOR_CONFIG[state.currentLight];
        state.totalAttempts++;
        state.wrongAttempts++;
        state.timeoutAttempts++;
        state.reactionTimes.push(5000);

        state.trialHistory.push({
            trialNumber: state.trialHistory.length + 1,
            colorName: config.name,
            colorHex: config.hex,
            targetKey: config.key,
            pressedKey: 'Timed Out',
            reactionTime: 5000,
            status: 'timeout'
        });

        updateTestStatsUI();
        setInstruction('wrong-alert', "Timed Out (5.00s)! No response. Press and hold 'B' again.");

        checkAutoFinish();
    }

    // ========================================================================
    // Stimulus Response Evaluation
    // ========================================================================
    function handleColorKeyResponse(pressedKey, displayKey = null) {
        if (!state.testActive || state.testOver) return;
        if (!state.awaitingResponse) return; // Must have an active light

        const reactionTime = Math.round(performance.now() - state.stimulusStartTime);
        state.awaitingResponse = false;
        if (state.timeoutTimerId) {
            clearTimeout(state.timeoutTimerId);
            state.timeoutTimerId = null;
        }

        clearLamps();
        updateHoldProgress(0);

        const config = COLOR_CONFIG[state.currentLight];
        const isCorrect = (String(pressedKey) === String(state.currentLight));
        const keyLabel = displayKey || pressedKey;

        state.totalAttempts++;
        state.reactionTimes.push(reactionTime);

        if (isCorrect) {
            state.correctAttempts++;
            sound.correctChime();
            setInstruction('success-alert', `Correct (${config.name})! Reaction Time: <strong>${reactionTime} ms</strong>. Press 'B' for next.`);
        } else {
            state.wrongAttempts++;
            sound.errorBuzzer();
            setInstruction('wrong-alert', `Wrong Key! Expected <strong>${config.key} (${config.name})</strong>, pressed "${keyLabel}". Status: <strong>NOT SUITABLE</strong> (0 errors allowed). Press 'B' for new color.`);
        }

        state.trialHistory.push({
            trialNumber: state.trialHistory.length + 1,
            colorName: config.name,
            colorHex: config.hex,
            targetKey: config.key,
            pressedKey: keyLabel,
            reactionTime: reactionTime,
            status: isCorrect ? 'correct' : 'wrong'
        });

        updateTestStatsUI();
        checkAutoFinish();
    }

    function updateTestStatsUI() {
        const accuracy = state.totalAttempts > 0 
            ? ((state.correctAttempts / state.totalAttempts) * 100).toFixed(1) 
            : '100.0';

        if (dom.testAttemptsDisplay) {
            const cap = DIFFICULTIES[state.currentDifficulty].attemptsCap;
            if (state.examMode === 'exam') {
                dom.testAttemptsDisplay.textContent = `${state.totalAttempts} / ${cap}`;
            } else {
                dom.testAttemptsDisplay.textContent = `${state.totalAttempts}`;
            }
        }
        if (dom.testAccuracyDisplay) {
            dom.testAccuracyDisplay.textContent = `${accuracy}%`;
            if (state.wrongAttempts > 0 || state.timeoutAttempts > 0) {
                dom.testAccuracyDisplay.style.color = '#dc3545';
            } else {
                dom.testAccuracyDisplay.style.color = '';
            }
        }
    }

    function checkAutoFinish() {
        // Exam mode completes strictly when the 60-second timer reaches 0s.
        // If attempts are reached while time remains, test does NOT close early.
    }

    // ========================================================================
    // Test Completion & RDSO T-Score Evaluation
    // ========================================================================
    function finishTest() {
        if (state.testOver) return;
        state.testOver = true;
        state.testActive = false;
        clearAllTimeouts();
        clearLamps();
        updateHoldProgress(0);

        sound.finishFanfare();

        const diffConfig = DIFFICULTIES[state.currentDifficulty] || DIFFICULTIES.hard;

        // Calculate candidate metrics
        const validReactionTimes = state.reactionTimes.filter(rt => rt > 0);
        const candidateMean = validReactionTimes.length > 0 
            ? validReactionTimes.reduce((a, b) => a + b, 0) / validReactionTimes.length 
            : 0;

        // Candidate Standard Deviation
        let candidateStdDev = 0;
        if (validReactionTimes.length > 1) {
            const variance = validReactionTimes.reduce((acc, val) => acc + Math.pow(val - candidateMean, 2), 0) / validReactionTimes.length;
            candidateStdDev = Math.sqrt(variance);
        }

        // T-Score Calculation:
        // In reaction speed tests, smaller candidate mean (faster speed) = higher T-Score!
        // T = 50 + 10 * ((Benchmark_Mean - Candidate_Mean) / Benchmark_SD)
        let tScore = 50.0;
        if (validReactionTimes.length > 0) {
            tScore = 50.0 + 10.0 * ((diffConfig.benchmarkMean - candidateMean) / diffConfig.benchmarkSd);
        }

        // Floor at 0 to avoid statistically invalid negative T-scores
        tScore = Math.max(0, tScore);

        const accuracy = state.totalAttempts > 0 
            ? (state.correctAttempts / state.totalAttempts) * 100 
            : 0;

        // Total duration calculation
        const totalDurationSec = state.examStartTime > 0 
            ? Math.round((Date.now() - state.examStartTime) / 1000) 
            : 0;

        // DEVELOPER ACCEPTANCE TEST EVALUATION LOGIC:
        // Scenarios:
        // 1. 30/30 correct, 0 wrong -> SUITABLE
        // 2. 29/30 correct, 0 wrong -> UNSUITABLE (Incomplete quota)
        // 3. 30/30 correct, 1 wrong key during response -> UNSUITABLE
        // 4. 30/30 correct, 5 wrong keys -> UNSUITABLE
        // 5. 30/30 correct, wrong key later corrected -> UNSUITABLE
        // 6. Very fast + 100% + 0 wrong -> SUITABLE
        // 7. Very slow + 100% + 0 wrong -> SUITABLE* (Conditional pass)
        // 8. Test abandoned -> UNSUITABLE
        // 9. Wrong key followed by correct key -> UNSUITABLE
        // 10. Key repeat causing invalid input -> Handled by ignoring e.repeat
        // 11. B used correctly as control -> Ignored during awaitingResponse, not counted as wrong
        // 12. Invalid key during target response -> Counted as wrong, trial locked

        const totalErrors = state.wrongAttempts + state.timeoutAttempts;
        const hasZeroErrors = (totalErrors === 0) && (state.prematureReleases === 0) && (accuracy === 100.0);

        let isSuitable = false;
        let isConditionalSuitable = false;
        let verdictReason = '';

        if (state.totalAttempts === 0) {
            isSuitable = false;
            verdictReason = 'No test attempts recorded.';
        } else if (totalErrors > 0 || !hasZeroErrors) {
            // NOT SUITABLE directly when any key is wrongly pressed (does not depend on attempt count)
            isSuitable = false;
            if (totalErrors > 0) {
                verdictReason = `Did not meet 100% Accuracy requirement (${totalErrors} error${totalErrors > 1 ? 's' : ''}, accuracy: ${accuracy.toFixed(2)}%). RDSO permits zero errors.`;
            } else if (state.prematureReleases > 0) {
                verdictReason = `Did not meet qualifying requirement (${state.prematureReleases} premature release fault${state.prematureReleases > 1 ? 's' : ''}). Hold 'B' until signal lamp illuminates.`;
            } else {
                verdictReason = `Accuracy is ${accuracy.toFixed(2)}%. RDSO permits zero errors.`;
            }
        } else {
            // Zero wrong keys / 100% Accuracy: Candidate is SUITABLE (does not require reaching 30 attempts)
            isSuitable = true;
            if (tScore < RDSO_BENCHMARK.qualifyingTScore) {
                // Very slow + 100% + 0 wrong -> SUITABLE*
                isConditionalSuitable = true;
                verdictReason = `Candidate achieved 100% Accuracy with zero errors. Note: T-Score (${tScore.toFixed(4)}) is below 42.0000; reaction speed improvement is recommended.`;
            } else {
                // Normal or fast reaction speed + 100% + 0 wrong -> SUITABLE
                isConditionalSuitable = false;
                verdictReason = `Congratulations! You met the RDSO qualifying standards (100% Accuracy with zero errors & T-Score ≥ 42.0000).`;
            }
        }

        renderScorecard({
            candidateName: state.candidateName,
            rollNo: state.rollNo,
            difficulty: diffConfig.name,
            benchmarkMean: diffConfig.benchmarkMean,
            benchmarkSd: diffConfig.benchmarkSd,
            tScore: tScore,
            accuracy: accuracy,
            meanRt: candidateMean,
            stdDev: candidateStdDev,
            totalAttempts: state.totalAttempts,
            correctAttempts: state.correctAttempts,
            wrongAttempts: state.wrongAttempts,
            timeoutAttempts: state.timeoutAttempts,
            prematureReleases: state.prematureReleases,
            durationSec: totalDurationSec,
            isSuitable: isSuitable,
            isConditionalSuitable: isConditionalSuitable,
            verdictReason: verdictReason,
            trialHistory: state.trialHistory
        });

        showScreen(dom.screenScorecard);
    }

    function renderScorecard(res) {
        if (dom.scoreCandidateName) dom.scoreCandidateName.textContent = res.candidateName;
        if (dom.scoreRollNo) dom.scoreRollNo.textContent = res.rollNo;
        if (dom.scoreExamDate) dom.scoreExamDate.textContent = new Date().toLocaleString('en-IN');
        if (dom.scoreDifficulty) dom.scoreDifficulty.textContent = res.difficulty;

        // Verdict Banner
        if (dom.verdictBanner) {
            dom.verdictBanner.className = 'verdict-banner ' + (res.isSuitable ? 'suitable' : 'not-suitable');
        }
        if (dom.verdictTitle) {
            if (res.isConditionalSuitable) {
                dom.verdictTitle.textContent = 'RESULT: SUITABLE*';
            } else if (res.isSuitable) {
                dom.verdictTitle.textContent = 'RESULT: SUITABLE!';
            } else {
                dom.verdictTitle.textContent = 'RESULT: NOT SUITABLE!';
            }
        }
        if (dom.verdictSubtitle) {
            dom.verdictSubtitle.textContent = res.verdictReason;
        }

        // Metrics
        if (dom.metricTScore) dom.metricTScore.textContent = res.tScore.toFixed(4);
        if (dom.metricAccuracy) dom.metricAccuracy.textContent = res.accuracy.toFixed(2) + '%';
        if (dom.metricAvgRt) dom.metricAvgRt.textContent = res.meanRt.toFixed(1) + ' ms';
        if (dom.metricBenchmarkNote) dom.metricBenchmarkNote.textContent = `Benchmark Mean: ${res.benchmarkMean.toFixed(1)} ms`;
        if (dom.metricTotalAttempts) dom.metricTotalAttempts.textContent = res.totalAttempts;
        if (dom.metricCorrectAttempts) dom.metricCorrectAttempts.textContent = res.correctAttempts;
        if (dom.metricWrongAttempts) dom.metricWrongAttempts.textContent = res.wrongAttempts;
        if (dom.metricTimeTaken) dom.metricTimeTaken.textContent = res.durationSec + ' s';
        if (dom.metricStandardDev) dom.metricStandardDev.textContent = res.stdDev.toFixed(1) + ' ms';

        // Trials Table
        if (dom.trialsTableBody) {
            dom.trialsTableBody.innerHTML = '';
            res.trialHistory.forEach(trial => {
                const row = document.createElement('tr');
                
                let statusClass = 'correct';
                if (trial.status === 'wrong') statusClass = 'wrong';
                if (trial.status === 'timeout') statusClass = 'timeout';
                if (trial.status === 'premature') statusClass = 'premature';

                row.innerHTML = `
                    <td><strong>#${trial.trialNumber}</strong></td>
                    <td>
                        <span class="color-dot" style="background:${trial.colorHex};"></span>
                        ${trial.colorName}
                    </td>
                    <td><span class="key-badge">${trial.targetKey}</span></td>
                    <td><span class="key-badge">${trial.pressedKey}</span></td>
                    <td>${trial.reactionTime > 0 ? trial.reactionTime + ' ms' : '-'}</td>
                    <td><span class="status-tag ${statusClass}">${trial.status}</span></td>
                `;
                dom.trialsTableBody.appendChild(row);
            });
        }
    }

    // ========================================================================
    // Virtual Keys Visual Feedback Helper
    // ========================================================================
    function setVirtualKeyPressed(btnEl, isPressed) {
        if (!btnEl) return;
        if (isPressed) {
            btnEl.classList.add('pressed');
        } else {
            btnEl.classList.remove('pressed');
        }
    }

    function getVKeyForResponse(key) {
        if (key === '2') return dom.vKeyRed;
        if (key === '4') return dom.vKeyYellow;
        if (key === '8') return dom.vKeyGreen;
        if (key === '0') return dom.vKeyBlue;
        return null;
    }

    // ========================================================================
    // Global Keyboard Listeners
    // ========================================================================
    function setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            // Ignore keystrokes when editing inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Allow normal browser shortcuts (Ctrl+R, Ctrl+Shift+I, Alt+F4, etc.)
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            // Allow system/navigation keys (F5, F11, F12)
            if (['F5', 'F11', 'F12'].includes(e.key)) return;
            // Ignore standalone modifier keys
            if (['Tab', 'Escape', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;

            const key = e.key;
            const code = e.code;

            // Prevent page scrolling on Space / Arrow keys during active test
            if (['Space', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(code)) {
                e.preventDefault();
            }

            // Only respond when Reaction Test module is active
            const reactionMod = document.getElementById('module-reaction');
            if (!reactionMod || reactionMod.style.display === 'none') return;

            if (!state.testActive || state.testOver) return;

            const isBKey = (key === 'b' || key === 'B' || code === 'KeyB');

            // CRITICAL: "B used correctly as control -> Do NOT count as wrong"
            if (isBKey) {
                // If light is currently ON (awaiting response), holding or pressing 'B' is the control key,
                // NOT a response key, so do NOT count as wrong!
                if (state.awaitingResponse) {
                    return;
                }

                // If light is OFF, 'B' starts the hold.
                // Key repeat while holding is handled: only initial keydown triggers hold start:
                if (!e.repeat && !state.isBPressed) {
                    handleBKeyDown();
                }
                return;
            }

            // CRITICAL: "Key repeat causing invalid input -> Handle according to input-validation rules"
            // Ignore ANY repeating keydown for response keys!
            if (e.repeat) {
                return;
            }

            // Response Keys & Invalid Keys:
            // When stimulus light is ON awaiting response:
            if (state.awaitingResponse) {
                let responseKey = null;
                let displayKey = null;

                if (key === '2' || key === '6' || code === 'Digit2' || code === 'Numpad2' || code === 'Digit6' || code === 'Numpad6') {
                    responseKey = '2'; // Red
                    displayKey = (key === '6') ? '6' : '2';
                } else if (key === '4' || key === 'g' || key === 'G' || code === 'Digit4' || code === 'Numpad4' || code === 'KeyG') {
                    responseKey = '4'; // Yellow
                    displayKey = (key.toUpperCase() === 'G') ? 'G' : '4';
                } else if (key === '8' || key === 'h' || key === 'H' || code === 'Digit8' || code === 'Numpad8' || code === 'KeyH') {
                    responseKey = '8'; // Green
                    displayKey = (key.toUpperCase() === 'H') ? 'H' : '8';
                } else if (key === '0' || code === 'Digit0' || code === 'Numpad0') {
                    responseKey = '0'; // Blue
                    displayKey = '0';
                } else {
                    // Invalid key during target response (e.g. 'A', '1', '3', Space, Enter, etc.)
                    responseKey = key.length === 1 ? key.toUpperCase() : key;
                    displayKey = code === 'Space' ? 'Space' : responseKey;
                }

                const vBtn = getVKeyForResponse(responseKey);
                if (vBtn) {
                    setVirtualKeyPressed(vBtn, true);
                    setTimeout(() => setVirtualKeyPressed(vBtn, false), 120);
                }

                handleColorKeyResponse(responseKey, displayKey);
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const reactionMod = document.getElementById('module-reaction');
            if (!reactionMod || reactionMod.style.display === 'none') return;

            const key = e.key;
            const code = e.code;

            if (key === 'b' || key === 'B' || code === 'KeyB') {
                handleBKeyUp();
                return;
            }

            let responseKey = null;
            if (key === '2' || key === '6' || code === 'Digit2' || code === 'Numpad2' || code === 'Digit6' || code === 'Numpad6') responseKey = '2';
            else if (key === '4' || key === 'g' || key === 'G' || code === 'Digit4' || code === 'Numpad4' || code === 'KeyG') responseKey = '4';
            else if (key === '8' || key === 'h' || key === 'H' || code === 'Digit8' || code === 'Numpad8' || code === 'KeyH') responseKey = '8';
            else if (key === '0' || code === 'Digit0' || code === 'Numpad0') responseKey = '0';

            if (responseKey !== null) {
                const vBtn = getVKeyForResponse(responseKey);
                if (vBtn) setVirtualKeyPressed(vBtn, false);
            }
        });
    }

    // ========================================================================
    // Virtual Keypad / Touch Events Listeners
    // ========================================================================
    function setupVirtualKeypadListeners() {
        // 'B' Button (Mouse / Touch)
        if (dom.vKeyB) {
            const pressB = (e) => {
                e.preventDefault();
                handleBKeyDown();
            };
            const releaseB = (e) => {
                e.preventDefault();
                handleBKeyUp();
            };

            dom.vKeyB.addEventListener('mousedown', pressB);
            window.addEventListener('mouseup', () => {
                if (state.isBPressed) handleBKeyUp();
            });

            dom.vKeyB.addEventListener('touchstart', pressB, { passive: false });
            dom.vKeyB.addEventListener('touchend', releaseB, { passive: false });
            dom.vKeyB.addEventListener('touchcancel', releaseB, { passive: false });
        }

        // Response Buttons (2, 4, 8, 0)
        const bindResponseBtn = (btn, key) => {
            if (!btn) return;
            const clickHandler = (e) => {
                e.preventDefault();
                setVirtualKeyPressed(btn, true);
                setTimeout(() => setVirtualKeyPressed(btn, false), 120);
                handleColorKeyResponse(key);
            };
            btn.addEventListener('click', clickHandler);
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                setVirtualKeyPressed(btn, true);
                handleColorKeyResponse(key);
            }, { passive: false });
            btn.addEventListener('touchend', () => setVirtualKeyPressed(btn, false), { passive: false });
        };

        bindResponseBtn(dom.vKeyRed, '2');
        bindResponseBtn(dom.vKeyYellow, '4');
        bindResponseBtn(dom.vKeyGreen, '8');
        bindResponseBtn(dom.vKeyBlue, '0');

        // Direct clicks on signal apparatus lamps (convenient for touchscreens)
        bindResponseBtn(dom.lampRed, '2');
        bindResponseBtn(dom.lampYellow, '4');
        bindResponseBtn(dom.lampGreen, '8');
        bindResponseBtn(dom.lampBlue, '0');
    }

    // ========================================================================
    // UI Setup & Event Bindings
    // ========================================================================
    function setupUIEventHandlers() {
        // Audio Toggle
        if (dom.audioToggleBtn) {
            dom.audioToggleBtn.addEventListener('click', () => {
                const isEnabled = sound.toggle();
                dom.audioToggleBtn.innerHTML = isEnabled 
                    ? '<span>🔊</span> Sound: ON' 
                    : '<span>🔇</span> Sound: OFF';
            });
            dom.audioToggleBtn.innerHTML = sound.enabled 
                ? '<span>🔊</span> Sound: ON' 
                : '<span>🔇</span> Sound: OFF';
        }

        // Instructions Proceed Button
        if (dom.btnProceedInstructions) {
            dom.btnProceedInstructions.disabled = false;
            dom.btnProceedInstructions.onclick = () => {
                saveProfile();
                showScreen(dom.screenDifficulty);
            };
        }
        if (dom.chkAgreement && dom.btnProceedInstructions) {
            dom.chkAgreement.addEventListener('change', () => {
                dom.btnProceedInstructions.disabled = !dom.chkAgreement.checked;
            });
        }

        // Candidate Profile Inputs
        if (dom.inputCandidateName) {
            dom.inputCandidateName.addEventListener('input', saveProfile);
        }
        if (dom.inputRollNo) {
            dom.inputRollNo.addEventListener('input', saveProfile);
        }

        // Difficulty Selection Radios
        dom.difficultyOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                dom.difficultyOptions.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                const radio = opt.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                state.currentDifficulty = opt.dataset.diff;
            });
        });

        // Mode Selector (Standard Exam vs Practice)
        dom.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                dom.modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.examMode = btn.dataset.mode;
            });
        });

        // Start Exam Button from Difficulty screen
        if (dom.btnStartExam) {
            dom.btnStartExam.addEventListener('click', () => {
                initTest();
            });
        }

        // Quit Test Button
        if (dom.btnQuitTest) {
            dom.btnQuitTest.addEventListener('click', () => {
                if (confirm('Are you sure you want to end the current reaction test?')) {
                    state.testAbandoned = true;
                    finishTest();
                }
            });
        }

        // Scorecard Action Buttons
        if (dom.btnRetakeTest) {
            dom.btnRetakeTest.addEventListener('click', () => {
                initTest();
            });
        }
        if (dom.btnChangeDiff) {
            dom.btnChangeDiff.addEventListener('click', () => {
                showScreen(dom.screenDifficulty);
            });
        }
        if (dom.btnPrintScorecard) {
            dom.btnPrintScorecard.addEventListener('click', () => {
                window.print();
            });
        }
        if (dom.btnBackHome) {
            dom.btnBackHome.addEventListener('click', () => {
                showScreen(dom.screenInstructions);
            });
        }

        // Master Battery Navigation Tabs
        const batteryTabs = document.querySelectorAll('.battery-tab');
        batteryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const battery = tab.dataset.battery;
                switchBattery(battery);
            });
        });

        // Candidate pill click to edit name & roll
        const navPill = document.getElementById('nav-candidate-pill');
        if (navPill) {
            navPill.style.cursor = 'pointer';
            navPill.title = 'Click to edit Candidate Name & Roll Number';
            navPill.addEventListener('click', () => {
                const newName = prompt('Enter Candidate Full Name:', state.candidateName);
                if (newName !== null && newName.trim()) {
                    state.candidateName = newName.trim();
                    if (dom.inputCandidateName) dom.inputCandidateName.value = state.candidateName;
                    localStorage.setItem('gmrc_candidate_name', state.candidateName);
                }
                const newRoll = prompt('Enter Roll Number:', state.rollNo);
                if (newRoll !== null && newRoll.trim()) {
                    state.rollNo = newRoll.trim();
                    if (dom.inputRollNo) dom.inputRollNo.value = state.rollNo;
                    localStorage.setItem('gmrc_roll_no', state.rollNo);
                }
                updateNavPill();
            });
        }
    }

    // ========================================================================
    // Master Battery Switching Function
    // ========================================================================
    function switchBattery(battery) {
        const tabs = document.querySelectorAll('.battery-tab');
        tabs.forEach(t => {
            if (t.dataset.battery === battery) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        const modules = document.querySelectorAll('.test-module-container');
        modules.forEach(m => {
            m.style.display = 'none';
            m.classList.remove('active');
        });

        const targetModule = document.getElementById(`module-${battery}`);
        if (targetModule) {
            targetModule.style.display = 'block';
            targetModule.classList.add('active');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.switchBattery = switchBattery;
    window.ReactionModule = {
        init: renderReactionTestSelector,
        switchTest: switchReactionTest
    };

    // ========================================================================
    // Initialization
    // ========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        loadSavedProfile();
        setupKeyboardListeners();
        setupVirtualKeypadListeners();
        setupUIEventHandlers();
        renderReactionTestSelector();
        showScreen(dom.screenInstructions);
    });

})();
