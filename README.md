<div align="center">

# 🚇 CrackPsycho &bull; GMRC / RDSO CBAT Suite

**Full Offline Psychometric Test Simulator for Metro Rail SC/TO Recruitment**

[![Pure Vanilla JS](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JS-orange?style=flat-square)](https://developer.mozilla.org/)
[![Offline Ready](https://img.shields.io/badge/Offline-100%25%20Standalone-success?style=flat-square)](https://github.com/PATNI-CHIRAG/CrackPhycho)
[![QA Verified](https://img.shields.io/badge/QA%20Tests-165%2F165%20Passed-brightgreen?style=flat-square)](qa_audit.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[**🌐 Live Demo**](https://patni-chirag.github.io/CrackPhycho/) &bull; [**📖 Test Details**](#-detailed-test-battery-specifications) &bull; [**⌨️ Shortcuts**](#-keyboard-shortcuts-cheat-sheet) &bull; [**🚀 Deploy**](#-how-to-deploy-on-github-pages)

</div>

---

## ⚡ Key Highlights

- **Instant Stimulus**: 0ms delay on pressing <kbd>B</kbd> in Color Reaction Test (mirrors physical apparatus).
- **Anti-Skip Protection**: Hardened 120ms debounce prevents question skipping (strict 1 &rarr; 2 &rarr; 3 &rarr; 4 progression).
- **RDSO T-Score Engine**: Authentic statistical formula ($T = 50 + 10 \times \frac{X - \mu}{\sigma}$) with Green (**SUITABLE**) / Red (**NOT SUITABLE**) scorecards.
- **100% Offline Standalone**: Pure HTML5, CSS3, and modern vanilla JavaScript &mdash; no build tools or servers needed.

---

## 📊 Summary of Batteries (10 Mock Tests Each)

| Battery | Test Name | Questions / Structure | Time Limit | Qualifying Norm |
| :---: | :--- | :--- | :---: | :--- |
| **Battery 6** | 🚦 **Color Reaction** | 10 Mock Tests &bull; Physical Apparatus | 60s per test | 100% Accuracy (0 Errors) & $T \ge 42.0$ |
| **Battery 1** | 🗺️ **Track Memory** | 10 Tests &bull; 2 Sets Each &bull; 240 Qs | 3m Study + 3m Test / set | RDSO T-Score $\ge 42.0000$ |
| **Battery 2** | 🎯 **Concentration** | 10 Tests &bull; 60 Pairs &bull; 600 Qs | 3 min (180s) | RDSO T-Score $\ge 42.0000$ |
| **Battery 3** | 👁️ **Observation** | 3 Pure Patterns &bull; 30 Tests &bull; 700 Qs | Pattern-Wise | RDSO T-Score $\ge 42.0000$ |
| **Battery 4** | 🧠 **Personality** | 10 Tests &bull; Bilingual En/Hi &bull; 300 Qs | 12 min (720s) | RDSO T-Score $\ge 42.0000$ |

---

## 🔍 Detailed Test Battery Specifications

### 1. 🚦 Color Reaction Test (Battery 6)
- **Objective**: Evaluates psychomotor reflexes, visual attention, and decision-making speed under time pressure.
- **Apparatus Mechanism**: 
  - 4 vertical signal lamps: **Red** (Top), **Yellow** (2nd), **Green** (3rd), and **Blue** (Bottom).
  - Hold neutral key <kbd>B</kbd> to ready the apparatus. A lamp illuminates with **0ms instant stimulus delay**.
  - Release <kbd>B</kbd> and strike the matching key immediately:
    - 🔴 **Red**: Press <kbd>2</kbd> or <kbd>6</kbd>
    - 🟡 **Yellow**: Press <kbd>4</kbd> or <kbd>G</kbd>
    - 🟢 **Green**: Press <kbd>8</kbd> or <kbd>H</kbd>
    - 🔵 **Blue**: Press <kbd>0</kbd>
- **Exam Rule**: Exactly **0 errors permitted** (100% accuracy required for a SUITABLE verdict). Test runs for full 60s duration.

---

### 2. 🗺️ Track Memory Test (Battery 1)
- **Objective**: Assesses spatial orientation and visual memory recall of railway track routes and station points.
- **Structure**: 10 mock tests, each divided into **Set 1** and **Set 2**:
  - **Study Phase (3 Minutes)**: Memorize the layout of 12 railway stations on an authentic schematic track diagram.
  - **Test Phase (3 Minutes)**: Locate each station on the test map and choose the correct location letter (<kbd>A</kbd>–<kbd>E</kbd>).
- **Assets**: Includes all **40 high-resolution diagram maps** in `assets/track/` (24 questions per test &bull; 240 questions total).

---

### 3. 🎯 Concentration Test (Battery 2)
- **Objective**: Measures visual vigilance, sustained concentration, and rapid digit-by-digit error detection.
- **Structure**: 10 mock tests containing **60 number pairs each** (600 total questions).
- **Mechanism**: Compare two 7-digit numbers shown side-by-side and determine if they are identical (**YES**) or different (**NO**).
  - Press <kbd>Y</kbd> / <kbd>1</kbd> / <kbd>&larr;</kbd> for **YES** (Identical)
  - Press <kbd>N</kbd> / <kbd>2</kbd> / <kbd>&rarr;</kbd> for **NO** (Different)
  - Press <kbd>Space</kbd> to Skip
- **Time Limit**: 3 minutes (180 seconds) for all 60 pairs. Features real-time counters and progress indicator.

---

### 4. 👁️ Observation Test (Battery 3)
- **Objective**: Evaluates perceptual acuity, geometric discrimination, and shape recognition under strict time limits.
- **Pure Pattern Architecture**: Separated cleanly into **3 distinct pattern suites** across 30 mock tests (700 authentic questions):
  - **Pattern 1: Odd Box Matrix (A–F)** &bull; 10 Tests &bull; 30 Qs each (300 Qs total) &mdash; Find the anomalous or unique box among 6 grid options.
  - **Pattern 2: Figure Association (1–5)** &bull; 10 Tests &bull; 20 Qs each (200 Qs total) &mdash; Match target figures with their associated geometric counterpart.
  - **Pattern 3: Figure Formation (1–4)** &bull; 10 Tests &bull; 20 Qs each (200 Qs total) &mdash; Identify composite figures formed by combining individual puzzle pieces.
- **Navigation**: Supports keys <kbd>A</kbd>–<kbd>F</kbd> / <kbd>1</kbd>–<kbd>5</kbd>, <kbd>Enter</kbd> (Save & Next), <kbd>M</kbd> (Mark Review).

---

### 5. 🧠 Personality Test (Battery 4)
- **Objective**: Evaluates safety conscientiousness, rule compliance, emotional resilience, and railway operational mindset.
- **Structure**: 10 mock tests with **30 questions each** (300 questions total).
- **Bilingual**: 100% English & Hindi side-by-side with 3 custom scenario options (<kbd>A</kbd>, <kbd>B</kbd>, <kbd>C</kbd> or <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>).
- **Time Limit**: 12 minutes (720 seconds) for 30 questions. RDSO guidelines recommend attempting all 30 questions.

---

## ⌨️ Keyboard Shortcuts Cheat Sheet

| Battery | Action | Keys |
| :--- | :--- | :--- |
| **Color Reaction** | Hold Stimulus Key | <kbd>B</kbd> |
| | Red Signal | <kbd>2</kbd> or <kbd>6</kbd> |
| | Yellow Signal | <kbd>4</kbd> or <kbd>G</kbd> |
| | Green Signal | <kbd>8</kbd> or <kbd>H</kbd> |
| | Blue Signal | <kbd>0</kbd> |
| **Track Memory** | Select Station Option | <kbd>A</kbd>, <kbd>B</kbd>, <kbd>C</kbd>, <kbd>D</kbd>, <kbd>E</kbd> |
| | Save & Next / Previous | <kbd>&rarr;</kbd> or <kbd>Enter</kbd> / <kbd>&larr;</kbd> |
| | Mark Review / Clear | <kbd>M</kbd> / <kbd>C</kbd> |
| **Concentration** | YES (Identical) | <kbd>Y</kbd> or <kbd>1</kbd> or <kbd>&larr;</kbd> |
| | NO (Different) | <kbd>N</kbd> or <kbd>2</kbd> or <kbd>&rarr;</kbd> |
| | Skip to Next | <kbd>Space</kbd> |
| **Observation** | Select Option | <kbd>A</kbd>–<kbd>F</kbd> or <kbd>1</kbd>–<kbd>5</kbd> |
| | Next / Previous | <kbd>&rarr;</kbd> or <kbd>Enter</kbd> / <kbd>&larr;</kbd> |
| **Personality** | Select Option | <kbd>A</kbd>, <kbd>B</kbd>, <kbd>C</kbd> or <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd> |
| | Next / Previous | <kbd>&rarr;</kbd> or <kbd>Enter</kbd> / <kbd>&larr;</kbd> |

---


## 💻 Run Locally

Clone and double-click `index.html`:
```bash
git clone https://github.com/PATNI-CHIRAG/CrackPhycho.git
cd CrackPhycho
start index.html
```

---

## 🧪 Automated QA Verification

Run the automated test suite locally:
```bash
node qa_audit.js
```
Validates **165 assertions** covering syntax, all 740 image diagrams, DOM bindings, and RDSO evaluation metrics with 100% pass rate.

<div align="center">
  <sub>MIT License &bull; Built with ❤️ for GMRC &amp; Indian Metro Rail CBAT Aspirants.</sub>
</div>
