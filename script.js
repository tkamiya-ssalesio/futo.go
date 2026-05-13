document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let currentCategory = 'single';
    let currentGameMode = 'practice';
    let currentProblem = null;
    let selectedFormat = 'none';
    let isGameOver = false;

    // Game Mode Variables
    let practiceStreak = 0;
    let taStartTime = 0;
    let taTimerInterval = null;
    let taQuestionsDone = 0;
    let svHp = 3;
    let saScore = 0;
    let saTimeLeft = 60;
    let saCombo = 0;
    let saTimerInterval = null;

    // --- Helpers ---
    function gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        return b === 0 ? a : gcd(b, a % b);
    }

    function simplifyFraction(n, d) {
        if (d === 0) return { n, d };
        const common = gcd(n, d);
        let finalN = n / common;
        let finalD = d / common;
        // Mark sheet rule: keep sign in numerator
        if (finalD < 0) {
            finalN = -finalN;
            finalD = -finalD;
        }
        return { n: finalN, d: finalD };
    }

    function renderMath() {
        document.querySelectorAll('.math:not(.rendered)').forEach(el => {
            katex.render(el.textContent, el, { throwOnError: false });
            el.classList.add('rendered');
        });
    }

    // --- DOM Elements ---
    const titleScreen = document.getElementById('title-screen');
    const tutorialSelectScreen = document.getElementById('tutorial-select-screen');
    const trainingSelectScreen = document.getElementById('training-select-screen');
    const trainingModeSelectScreen = document.getElementById('training-mode-select-screen');
    const tutorialScreen = document.getElementById('tutorial-screen');
    const introScreen = document.getElementById('intro-screen');
    const problemArea = document.getElementById('problem-area');
    const appHeader = document.getElementById('app-header');
    const equationDisplay = document.getElementById('equation-display');
    const signInput = document.getElementById('sign-input');
    const valInput = document.getElementById('val-input');
    const checkBtn = document.getElementById('check-btn');
    const statsContainer = document.getElementById('stats-container');
    const backToTitleBtn = document.getElementById('back-to-title-btn');
    const backToTitleFromTutorial = document.getElementById('back-to-title-from-tutorial');
    const goToTutorialBtn = document.getElementById('go-to-tutorial-btn');
    const goToTrainingBtn = document.getElementById('go-to-training-btn');
    const backToTopBtns = document.querySelectorAll('.back-to-top-btn');
    const backToTrainingSelectBtn = document.getElementById('back-to-training-select-btn');
    const tutorialContent = document.getElementById('tutorial-content');
    const tutorialPrevBtn = document.getElementById('tutorial-prev-btn');
    const tutorialNextBtn = document.getElementById('tutorial-next-btn');
    const tutorialTitle = document.getElementById('tutorial-title');
    const startPracticeBtn = document.getElementById('start-practice-btn');
    const backToTitleFromIntro = document.getElementById('back-to-title-from-intro');
    const feedbackToast = document.getElementById('feedback-toast');
    const patternSelector = document.getElementById('pattern-selector');
    const patternBtns = document.querySelectorAll('.pattern-btn');
    const backToPatternBtn = document.getElementById('back-to-pattern-btn');
    const inputsWrapper = document.getElementById('inputs-wrapper');
    const singleInputRow = document.getElementById('single-input-row');
    const compoundInputRow = document.getElementById('compound-input-row');
    const selectedFormatText = document.getElementById('selected-format-text');
    const formatDisplayRow = document.getElementById('format-display-row');

    renderMath();

    // --- Tutorial Content ---
    const tutorials = {
        single: {
            title: "1次不等式の解き方",
            slides: [
                `
                <div class="tutorial-slide">
                    <p>不等式は、方程式（<span class="math">=</span>）と同じように移項して解くことができます。</p>
                    <div class="visual-box">
                        <span class="math">2x - 3 < 5</span>
                        <span style="font-size:16px; margin: 4px 0;">↓ <span class="math">-3</span> を移項</span>
                        <span class="math">2x < 5 + 3</span>
                        <span class="math">2x < 8</span>
                        <span style="font-size:16px; margin: 4px 0;">↓ 両辺を <span class="math">2</span> で割る</span>
                        <span class="math">x < 4</span>
                    </div>
                </div>
                `,
                `
                <div class="tutorial-slide">
                    <p class="warning">⚠️ 最大の罠：マイナスで割るとき</p>
                    <p>両辺に<span class="highlight">負の数</span>を掛けたり割ったりすると、<span class="highlight">不等号の向きが逆転</span>します。</p>
                    <div class="visual-box">
                        <span class="math">-2x < 6</span>
                        <span style="font-size:16px; margin: 4px 0; color:var(--apple-red); font-weight:bold;">↓ 両辺を <span class="math">-2</span> で割る（逆転！）</span>
                        <span class="math">x > -3</span>
                    </div>
                </div>
                `,
                `
                <div class="tutorial-slide">
                    <p>なぜ逆転するの？</p>
                    <p>例えば <span class="math">2 < 5</span> という正しい式があります。<br>両辺に <span class="math">-1</span> を掛けると、<span class="math">-2</span> と <span class="math">-5</span> になりますね。</p>
                    <div class="visual-box" style="padding: 10px;">
                        <div class="number-line-box" style="margin-top:0;">
                            <div class="nl-line"></div>
                            <!-- Positive -->
                            <div class="nl-point filled" style="left:70%;"></div>
                            <div class="nl-label" style="left:70%;">2</div>
                            <div class="nl-point filled" style="left:90%;"></div>
                            <div class="nl-label" style="left:90%;">5</div>
                            <div class="nl-arrow right" style="left:70%; right:10%; border-top: 2px dashed #8E8E93; border-right: 2px dashed #8E8E93;"></div>
                            
                            <!-- Negative -->
                            <div class="nl-point filled" style="left:10%;"></div>
                            <div class="nl-label" style="left:10%;">-5</div>
                            <div class="nl-point filled" style="left:30%;"></div>
                            <div class="nl-label" style="left:30%;">-2</div>
                        </div>
                        <p style="font-size:14px; margin-top:12px;">マイナスの世界では、絶対値が大きいほど「小さく」なるため、大小関係がひっくり返るのです！<br>（<span class="math">-2 > -5</span>）</p>
                    </div>
                </div>
                `
            ]
        },
        system: {
            title: "連立不等式の解き方",
            slides: [
                `
                <div class="tutorial-slide">
                    <p>連立不等式とは、<span class="highlight">2つの条件を「同時に満たす」</span>範囲を見つける問題です。</p>
                    <div class="visual-box">
                        <div style="text-align:left;">
                            <span class="math">\\begin{cases} 2x > 4 \\quad \\text{①} \\\\ x - 3 \\leqq 2 \\quad \\text{②} \\end{cases}</span>
                        </div>
                    </div>
                    <p>まずは、方程式と同じように<span class="highlight">別々に解きます</span>。</p>
                </div>
                `,
                `
                <div class="tutorial-slide">
                    <p>①と②をそれぞれ解いて、シンプルな形にします。</p>
                    <div class="visual-box">
                        <div style="display:flex; justify-content:space-around; width:100%;">
                            <div>
                                <span style="font-size:14px;">①を解く</span><br>
                                <span class="math">2x > 4</span><br>
                                <span class="math">x > 2</span>
                            </div>
                            <div>
                                <span style="font-size:14px;">②を解く</span><br>
                                <span class="math">x - 3 \\leqq 2</span><br>
                                <span class="math">x \\leqq 2 + 3</span><br>
                                <span class="math">x \\leqq 5</span>
                            </div>
                `,
                `
                <div class="tutorial-slide">
                    <p>出た結果を<span class="highlight">数直線</span>に描き込み、<span class="highlight">重なる部分（共通範囲）</span>が答えになります！</p>
                    <div class="visual-box" style="padding: 10px;">
                        <div class="number-line-box">
                            <div class="nl-line"></div>
                            
                            <!-- x > 2 (Dashed, hollow) -->
                            <div class="nl-overlap" style="left:30%; right:10%;"></div>
                            <div class="nl-arrow right" style="left:30%; right:10%;"></div>
                            <div class="nl-point" style="left:30%;"></div>
                            <div class="nl-label" style="left:30%;">2</div>
                            
                            <!-- x <= 5 (Solid, filled) -->
                            <div class="nl-arrow left" style="left:10%; right:70%; border-color:var(--apple-red); top:15px; height:15px;"></div>
                            <div class="nl-point filled" style="left:70%; border-color:var(--apple-red); background:var(--apple-red);"></div>
                            <div class="nl-label" style="left:70%;">5</div>
                            
                        </div>
                        <p style="font-size:14px; margin-top:24px;">共通範囲は <span class="math">2 < x \\leqq 5</span></p>
                    </div>
                </div>
                `,
                `
                <div class="tutorial-slide">
                    <p><span class="highlight">応用：<span class="math">A < B < C</span> の形</span></p>
                    <p>両端にも <span class="math">x</span> がある場合は、必ず2つの不等式に分けて解く必要があります。</p>
                    <div class="visual-box">
                        <span class="math">x + 2 < 3x - 4 < 2x + 8</span>
                        <span style="font-size:16px; margin: 4px 0;">↓ この2つに分ける！</span>
                        <div style="text-align:left;">
                            <span class="math">\\begin{cases} x + 2 < 3x - 4 \\\\ 3x - 4 < 2x + 8 \\end{cases}</span>
                        </div>
                    </div>
                    <p>バラバラにしてから、いつもの連立不等式として解きましょう。</p>
                </div>
                `
            ]
        }
    };

    let currentTutorial = null;
    let currentSlideIndex = 0;

    // --- Event Listeners ---
    goToTutorialBtn.addEventListener('click', () => {
        titleScreen.classList.add('hidden');
        tutorialSelectScreen.classList.remove('hidden');
        appHeader.classList.remove('hidden');
    });

    goToTrainingBtn.addEventListener('click', () => {
        titleScreen.classList.add('hidden');
        trainingSelectScreen.classList.remove('hidden');
        appHeader.classList.remove('hidden');
    });

    backToTopBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tutorialSelectScreen.classList.add('hidden');
            trainingSelectScreen.classList.add('hidden');
            titleScreen.classList.remove('hidden');
            appHeader.classList.add('hidden');
        });
    });

    document.querySelectorAll('.tutorial-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentTutorial = tutorials[btn.dataset.tutorial];
            currentSlideIndex = 0;
            tutorialTitle.textContent = currentTutorial.title;
            updateTutorialView();
            
            tutorialSelectScreen.classList.add('hidden');
            tutorialScreen.classList.remove('hidden');
        });
    });

    function updateTutorialView() {
        tutorialContent.innerHTML = currentTutorial.slides[currentSlideIndex];
        renderMath();
        
        tutorialPrevBtn.disabled = (currentSlideIndex === 0);
        
        if (currentSlideIndex === currentTutorial.slides.length - 1) {
            tutorialNextBtn.textContent = '完了して戻る';
            tutorialNextBtn.classList.replace('primary-btn', 'secondary-btn');
            tutorialNextBtn.style.background = 'var(--apple-green)';
            tutorialNextBtn.style.color = 'white';
            tutorialNextBtn.style.borderColor = 'var(--apple-green)';
        } else {
            tutorialNextBtn.textContent = '次へ ▶';
            tutorialNextBtn.classList.replace('secondary-btn', 'primary-btn');
            tutorialNextBtn.style.background = '';
            tutorialNextBtn.style.color = '';
            tutorialNextBtn.style.borderColor = '';
        }
    }

    tutorialPrevBtn.addEventListener('click', () => {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            updateTutorialView();
        }
    });

    tutorialNextBtn.addEventListener('click', () => {
        if (currentSlideIndex < currentTutorial.slides.length - 1) {
            currentSlideIndex++;
            updateTutorialView();
        } else {
            // End of tutorial
            tutorialScreen.classList.add('hidden');
            titleScreen.classList.remove('hidden');
            appHeader.classList.add('hidden');
        }
    });

    backToTitleFromTutorial.addEventListener('click', () => {
        tutorialScreen.classList.add('hidden');
        titleScreen.classList.remove('hidden');
        appHeader.classList.add('hidden');
    });

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            trainingSelectScreen.classList.add('hidden');
            trainingModeSelectScreen.classList.remove('hidden');
        });
    });

    backToTrainingSelectBtn.addEventListener('click', () => {
        trainingModeSelectScreen.classList.add('hidden');
        trainingSelectScreen.classList.remove('hidden');
    });

    document.querySelectorAll('.game-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentGameMode = btn.dataset.mode;
            trainingModeSelectScreen.classList.add('hidden');
            showIntro();
        });
    });

    function showIntro() {
        titleScreen.classList.add('hidden');
        introScreen.classList.remove('hidden');
        appHeader.classList.remove('hidden');
    }

    startPracticeBtn.addEventListener('click', () => {
        introScreen.classList.add('hidden');
        startPractice();
    });

    backToTitleFromIntro.addEventListener('click', () => {
        introScreen.classList.add('hidden');
        titleScreen.classList.remove('hidden');
        appHeader.classList.add('hidden');
    });

    backToTitleBtn.addEventListener('click', () => {
        resetGameTimers();
        problemArea.classList.add('hidden');
        introScreen.classList.add('hidden');
        tutorialScreen.classList.add('hidden');
        tutorialSelectScreen.classList.add('hidden');
        trainingSelectScreen.classList.add('hidden');
        trainingModeSelectScreen.classList.add('hidden');
        titleScreen.classList.remove('hidden');
        appHeader.classList.add('hidden');
    });

    function resetGameTimers() {
        if (taTimerInterval) clearInterval(taTimerInterval);
        if (saTimerInterval) clearInterval(saTimerInterval);
        isGameOver = false;
        checkBtn.disabled = false;
    }

    checkBtn.addEventListener('click', checkAnswer);


    document.querySelectorAll('.toggle-frac-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const integerInput = document.getElementById(targetId);
            const fractionInput = document.getElementById(targetId + '-frac');
            
            if (fractionInput.classList.contains('hidden')) {
                fractionInput.classList.remove('hidden');
                integerInput.classList.add('hidden');
                btn.classList.add('active');
                btn.textContent = '整数';
            } else {
                fractionInput.classList.add('hidden');
                integerInput.classList.remove('hidden');
                btn.classList.remove('active');
                btn.textContent = '分数';
            }
        });
    });

    patternBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.dataset.format;
            selectPattern(format);
        });
    });

    function selectPattern(format) {
        selectedFormat = format;
        patternSelector.classList.add('hidden');
        inputsWrapper.classList.remove('hidden');
        formatDisplayRow.classList.remove('hidden');
        backToPatternBtn.classList.remove('hidden');
        
        if (format === 'single') {
            selectedFormatText.innerHTML = '解答形式: <span class="math">x \\lesseqgtr a</span>';
            singleInputRow.classList.remove('hidden');
            compoundInputRow.classList.add('hidden');
        } else if (format === 'compound') {
            selectedFormatText.innerHTML = '解答形式: <span class="math">a \\lesseqgtr x \\lesseqgtr b</span>';
            singleInputRow.classList.add('hidden');
            compoundInputRow.classList.remove('hidden');
        }
        renderMath();
    }

    const backToPatternAction = () => {
        selectedFormat = 'none';
        patternSelector.classList.remove('hidden');
        inputsWrapper.classList.add('hidden');
        singleInputRow.classList.add('hidden');
        compoundInputRow.classList.add('hidden');
        backToPatternBtn.classList.add('hidden');
    };

    backToPatternBtn.addEventListener('click', backToPatternAction);

    // --- Functions ---

    function updateStatsUI() {
        const catName = currentCategory === 'single' ? '🔰 1次不等式' : '⚔️ 連立不等式';
        
        if (currentGameMode === 'practice') {
            statsContainer.innerHTML = `
                <div id="mode-name">${catName} (練習)</div>
                <div id="score-display">連続正解: <span style="color:var(--apple-indigo); font-weight:bold;">${practiceStreak}</span></div>
            `;
        } else if (currentGameMode === 'timeAttack') {
            const now = Date.now();
            const elapsed = ((now - taStartTime) / 1000).toFixed(1);
            statsContainer.innerHTML = `
                <div id="mode-name">⏱️ タイムアタック</div>
                <div id="score-display">${taQuestionsDone}/10問 | <span style="color:var(--apple-red); font-weight:bold;">${elapsed}s</span></div>
            `;
        } else if (currentGameMode === 'survival') {
            let hearts = '❤️'.repeat(svHp) + '🤍'.repeat(3 - svHp);
            statsContainer.innerHTML = `
                <div id="mode-name">❤️ サバイバル</div>
                <div id="score-display">${hearts} | <span style="color:var(--apple-indigo); font-weight:bold;">${practiceStreak}問</span></div>
            `;
        } else if (currentGameMode === 'scoreAttack') {
            statsContainer.innerHTML = `
                <div id="mode-name">🔥 スコアアタック</div>
                <div id="score-display">残り <span style="color:var(--apple-red); font-weight:bold;">${saTimeLeft}s</span> | Score: <span style="color:var(--apple-indigo); font-weight:bold;">${saScore}</span></div>
            `;
        }
    }

    function startPractice() {
        titleScreen.classList.add('hidden');
        problemArea.classList.remove('hidden');
        appHeader.classList.remove('hidden');
        
        resetGameTimers();
        
        if (currentGameMode === 'practice') {
            practiceStreak = 0;
        } else if (currentGameMode === 'timeAttack') {
            taQuestionsDone = 0;
            taStartTime = Date.now();
            taTimerInterval = setInterval(updateStatsUI, 100);
        } else if (currentGameMode === 'survival') {
            svHp = 3;
            practiceStreak = 0;
        } else if (currentGameMode === 'scoreAttack') {
            saScore = 0;
            saTimeLeft = 60;
            saCombo = 0;
            saTimerInterval = setInterval(() => {
                if (isGameOver) return;
                saTimeLeft--;
                updateStatsUI();
                if (saTimeLeft <= 0) endGame('scoreAttack');
            }, 1000);
        }

        updateStatsUI();
        generateProblem();
    }

    function endGame(mode) {
        isGameOver = true;
        checkBtn.disabled = true;
        resetGameTimers();
        
        let msg = '';
        if (mode === 'timeAttack') {
            const elapsed = ((Date.now() - taStartTime) / 1000).toFixed(1);
            msg = `10問クリア！ タイム: ${elapsed}秒`;
        } else if (mode === 'survival') {
            msg = `ゲームオーバー！ 記録: ${practiceStreak}問連続正解`;
        } else if (mode === 'scoreAttack') {
            msg = `タイムアップ！ 最終スコア: ${saScore}`;
        }
        showFeedback(msg, true);
    }

    function generateProblem() {
        // Reset inputs
        const allInputs = document.querySelectorAll('.val-input');
        allInputs.forEach(i => i.value = '');
        
        // Reset fraction toggles to integer view
        document.querySelectorAll('.toggle-frac-btn').forEach(btn => {
            const targetId = btn.dataset.target;
            document.getElementById(targetId).classList.remove('hidden');
            document.getElementById(targetId + '-frac').classList.add('hidden');
            btn.classList.remove('active');
            btn.textContent = '分数';
        });

        // Reset and handle format selection visibility
        if (currentCategory === 'single') {
            patternSelector.classList.add('hidden');
            inputsWrapper.classList.remove('hidden');
            formatDisplayRow.classList.add('hidden'); // Hide "change format" for single category
            backToPatternBtn.classList.add('hidden');
            singleInputRow.classList.remove('hidden');
            compoundInputRow.classList.add('hidden');
            selectedFormat = 'single';
        } else {
            patternSelector.classList.remove('hidden');
            selectedFormat = 'none';
            inputsWrapper.classList.add('hidden');
            formatDisplayRow.classList.add('hidden');
            backToPatternBtn.classList.add('hidden');
            singleInputRow.classList.add('hidden');
            compoundInputRow.classList.add('hidden');
        }
        
        const signs = ['<', '>', '<=', '>='];
        
        if (currentCategory === 'single') {
            const signs = ['<', '>', '<=', '>='];
            const isNegative = Math.random() > 0.4;
            const a = isNegative ? -(Math.floor(Math.random() * 5) + 2) : (Math.floor(Math.random() * 5) + 2);
            
            // Ensure b is not 0
            let b = Math.floor(Math.random() * 9) + 1;
            if (Math.random() > 0.5) b = -b;
            
            const c = Math.floor(Math.random() * 30) - 15;
            
            const sign = signs[Math.floor(Math.random() * signs.length)];
            const targetFrac = simplifyFraction(c - b, a);
            
            currentProblem = { a, b, c, sign, targetFrac, type: 'single' };
        } 
        else if (currentCategory === 'advanced') {
            const isSystem = Math.random() > 0.5;
            
            if (isSystem) {
                const a1 = Math.floor(Math.random() * 4) + 2;
                
                // Ensure b1 is not 0
                let b1 = Math.floor(Math.random() * 9) + 1;
                if (Math.random() > 0.5) b1 = -b1;
                
                const c1 = Math.floor(Math.random() * 20) - 10;
                const sign1 = Math.random() > 0.5 ? '>' : '>=';
                
                const a2 = Math.floor(Math.random() * 4) + 2;
                
                // Ensure b2 is not 0
                let b2 = Math.floor(Math.random() * 9) + 1;
                if (Math.random() > 0.5) b2 = -b2;
                
                const c2 = Math.floor(Math.random() * 20) - 10;
                const sign2 = Math.random() > 0.5 ? '<' : '<=';

                currentProblem = { 
                    a1, b1, c1, sign1, 
                    a2, b2, c2, sign2, 
                    targetFrac1: simplifyFraction(c1 - b1, a1),
                    targetFrac2: simplifyFraction(c2 - b2, a2),
                    type: 'system' 
                };
            } else {
                const a = Math.floor(Math.random() * 3) + 2;
                
                // Ensure b is not 0
                let b = Math.floor(Math.random() * 9) + 1;
                if (Math.random() > 0.5) b = -b;
                
                const val1 = Math.floor(Math.random() * 15) - 15;
                const val2 = Math.floor(Math.random() * 15) + 1;
                
                currentProblem = { 
                    val1, val2, a, b, 
                    targetFrac1: simplifyFraction(val1 - b, a),
                    targetFrac2: simplifyFraction(val2 - b, a),
                    sign1: Math.random() > 0.5 ? '<' : '<=',
                    sign2: Math.random() > 0.5 ? '<' : '<=',
                    type: 'compound' 
                };
            }
        }

        renderEquation();
    }

    function renderEquation() {
        let latex = '';
        if (currentProblem.type === 'single') {
            latex = formatInequality(currentProblem.a, currentProblem.b, currentProblem.c, currentProblem.sign);
        } else if (currentProblem.type === 'system') {
            const eq1 = formatInequality(currentProblem.a1, currentProblem.b1, currentProblem.c1, currentProblem.sign1);
            const eq2 = formatInequality(currentProblem.a2, currentProblem.b2, currentProblem.c2, currentProblem.sign2);
            latex = `\\begin{cases} ${eq1} \\\\ ${eq2} \\end{cases}`;
        } else if (currentProblem.type === 'compound') {
            const s1 = currentProblem.sign1.replace('<=', '\\leqq');
            const s2 = currentProblem.sign2.replace('<=', '\\leqq');
            const mid = `${currentProblem.a}x ${currentProblem.b >= 0 ? '+' : ''}${currentProblem.b}`;
            latex = `${currentProblem.val1} ${s1} ${mid} ${s2} ${currentProblem.val2}`;
        }
        
        katex.render(latex, equationDisplay, {
            throwOnError: false,
            displayMode: true
        });
    }

    function formatInequality(a, b, c, sign) {
        const aStr = a === 1 ? '' : (a === -1 ? '-' : a);
        const bStr = b === 0 ? '' : (b > 0 ? `+${b}` : b);
        const signStr = sign.replace('<=', '\\leqq').replace('>=', '\\geqq');
        return `${aStr}x ${bStr} ${signStr} ${c}`;
    }

    function checkAnswer() {
        if (selectedFormat === 'none') {
            return showFeedback('解答の形式を選択してください', 'error');
        }

        function getUserValue(id) {
            const integerInput = document.getElementById(id);
            const fractionInput = document.getElementById(id + '-frac');
            if (fractionInput.classList.contains('hidden')) {
                const val = parseFloat(integerInput.value);
                return isNaN(val) ? null : { n: val, d: 1 };
            } else {
                const n = parseInt(document.getElementById(id + '-num').value);
                const d = parseInt(document.getElementById(id + '-den').value);
                if (isNaN(n) || isNaN(d)) return null;
                return simplifyFraction(n, d);
            }
        }

        if (currentProblem.type === 'single') {
            if (selectedFormat !== 'single') {
                return showFeedback('解答の形式が違います（x ≶ a 型を選んでください）', 'error');
            }

            const userVal = getUserValue('val-input');
            const userSign = signInput.value;
            if (!userVal) return showFeedback('値を入力してください', 'error');

            let correctSign = currentProblem.sign;
            if (currentProblem.a < 0) {
                const flip = {'<': '>', '>': '<', '<=': '>=', '>=': '<='};
                correctSign = flip[currentProblem.sign];
            }

            const isCorrect = (userSign === correctSign && 
                               userVal.n === currentProblem.targetFrac.n && 
                               userVal.d === currentProblem.targetFrac.d);

            if (isCorrect) {
                success();
            } else {
                fail(userSign !== correctSign && currentProblem.a < 0);
            }
        } else {
            // System or Compound
            if (selectedFormat !== 'compound') {
                return showFeedback('解答の形式が違います（a ≶ x ≶ b 型を選んでください）', 'error');
            }

            const vLeft = getUserValue('val-input-left');
            const vRight = getUserValue('val-input-right');
            const sLeft = document.getElementById('sign-input-left').value;
            const sRight = document.getElementById('sign-input-right').value;

            if (!vLeft || !vRight) return showFeedback('値を入力してください', 'error');

            const isCorrect = (vLeft.n === currentProblem.targetFrac1.n && vLeft.d === currentProblem.targetFrac1.d &&
                               vRight.n === currentProblem.targetFrac2.n && vRight.d === currentProblem.targetFrac2.d &&
                               sLeft === currentProblem.sign1 && sRight === currentProblem.sign2);

            if (isCorrect) success();
            else fail();
        }
    }

    function success() {
        if (isGameOver) return;
        let feedbackMsg = '正解！素晴らしい！';
        
        if (currentGameMode === 'practice') {
            practiceStreak++;
        } else if (currentGameMode === 'timeAttack') {
            taQuestionsDone++;
            if (taQuestionsDone >= 10) {
                endGame('timeAttack');
                return;
            }
        } else if (currentGameMode === 'survival') {
            practiceStreak++;
        } else if (currentGameMode === 'scoreAttack') {
            saCombo++;
            saScore += 100 + (saCombo * 50);
            feedbackMsg = `正解！ ${saCombo}コンボ (+${100 + (saCombo * 50)}点)`;
        }

        updateStatsUI();
        showFeedback(feedbackMsg, 'success');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#5856D6', '#007AFF', '#34C759'] });
        setTimeout(() => {
            if (!isGameOver) generateProblem();
        }, 1200);
    }

    function fail(isSignError = false) {
        if (isGameOver) return;
        
        let msg = '惜しい！もう一度考えてみよう';
        if (isSignError) msg = '⚠️ 負の数で割った時の向きに注意！';
        
        if (currentGameMode === 'practice') {
            practiceStreak = 0;
            showFeedback(msg, 'error');
        } else if (currentGameMode === 'timeAttack') {
            showFeedback(msg + ' (ペナルティ +5秒)', 'error');
            taStartTime -= 5000;
        } else if (currentGameMode === 'survival') {
            svHp--;
            if (svHp <= 0) {
                endGame('survival');
                return;
            } else {
                practiceStreak = 0;
                showFeedback(msg + ` (残りHP: ${svHp})`, 'error');
            }
        } else if (currentGameMode === 'scoreAttack') {
            saCombo = 0;
            saScore = Math.max(0, saScore - 50);
            showFeedback(msg + ' (コンボリセット -50点)', 'error');
        }
        
        updateStatsUI();
    }

    function showFeedback(text, type) {
        feedbackToast.textContent = text;
        feedbackToast.className = `feedback show ${type}`;
        setTimeout(() => {
            feedbackToast.classList.remove('show');
        }, 3000);
    }

});
