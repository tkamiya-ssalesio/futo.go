document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let currentCategory = 'single';
    let currentProblem = null;
    let score = 0;
    let isEndpoint1Filled = false;
    let isEndpoint2Filled = false;

    // --- DOM Elements ---
    const titleScreen = document.getElementById('title-screen');
    const problemArea = document.getElementById('problem-area');
    const appHeader = document.getElementById('app-header');
    const equationDisplay = document.getElementById('equation-display');
    const signInput = document.getElementById('sign-input');
    const valInput = document.getElementById('val-input');
    const checkBtn = document.getElementById('check-btn');
    const scoreVal = document.getElementById('score-val');
    const modeName = document.getElementById('mode-name');
    const backToTitleBtn = document.getElementById('back-to-title-btn');
    const feedbackToast = document.getElementById('feedback-toast');

    // Number Line Elements
    const ticksGroup = document.getElementById('ticks-group');
    const solutionLine = document.getElementById('solution-line');
    const endpoint1 = document.getElementById('endpoint-1');
    const endpoint2 = document.getElementById('endpoint-2');

    // --- Initialization ---
    initNumberLine();

    // --- Event Listeners ---
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            startPractice();
        });
    });

    backToTitleBtn.addEventListener('click', () => {
        titleScreen.classList.remove('hidden');
        problemArea.classList.add('hidden');
        appHeader.classList.add('hidden');
    });

    checkBtn.addEventListener('click', checkAnswer);

    endpoint1.addEventListener('click', () => {
        isEndpoint1Filled = !isEndpoint1Filled;
        updateEndpointStyle(endpoint1, isEndpoint1Filled);
    });

    endpoint2.addEventListener('click', () => {
        isEndpoint2Filled = !isEndpoint2Filled;
        updateEndpointStyle(endpoint2, isEndpoint2Filled);
    });

    // --- Functions ---

    function startPractice() {
        titleScreen.classList.add('hidden');
        problemArea.classList.remove('hidden');
        appHeader.classList.remove('hidden');
        
        const modeLabels = {
            single: '🔰 1次不等式の基本',
            advanced: '⚔️ 連立・応用不等式'
        };
        modeName.textContent = modeLabels[currentCategory];
        
        generateProblem();
    }

    function generateProblem() {
        // Reset inputs
        valInput.value = '';
        document.getElementById('val-input-left').value = '';
        document.getElementById('val-input-right').value = '';
        isEndpoint1Filled = false;
        isEndpoint2Filled = false;
        updateEndpointStyle(endpoint1, false);
        updateEndpointStyle(endpoint2, false);
        
        const signs = ['<', '>', '<=', '>='];
        
        if (currentCategory === 'single') {
            // Randomly decide if it's basic or negative coefficient
            const isNegative = Math.random() > 0.4; // 60% chance for negative coefficient practice
            const a = isNegative ? -(Math.floor(Math.random() * 5) + 1) : (Math.floor(Math.random() * 5) + 1);
            const b = Math.floor(Math.random() * 20) - 10;
            const x = Math.floor(Math.random() * 10) - 5;
            const c = a * x + b;
            const sign = signs[Math.floor(Math.random() * signs.length)];
            currentProblem = { a, b, c, sign, x, type: 'single' };
        } 
        else if (currentCategory === 'advanced') {
            // Randomly decide between System and Compound (A < B < C)
            const isSystem = Math.random() > 0.5;
            
            if (isSystem) {
                // Generate two inequalities: x > x1 and x < x2
                const x1 = Math.floor(Math.random() * 8) - 6; // -6 to 1
                const x2 = x1 + Math.floor(Math.random() * 5) + 1; // x1+1 to x1+5
                
                // Eq 1: a1*x + b1 sign1 c1  => result x > x1
                const a1 = Math.floor(Math.random() * 3) + 1;
                const b1 = Math.floor(Math.random() * 10) - 5;
                const c1 = a1 * x1 + b1;
                const sign1 = Math.random() > 0.5 ? '>' : '>=';

                // Eq 2: a2*x + b2 sign2 c2  => result x < x2
                const a2 = Math.floor(Math.random() * 3) + 1;
                const b2 = Math.floor(Math.random() * 10) - 5;
                const c2 = a2 * x2 + b2;
                const sign2 = Math.random() > 0.5 ? '<' : '<=';

                currentProblem = { a1, b1, c1, sign1, a2, b2, c2, sign2, x1, x2, type: 'system' };
            } else {
                // A < B < C form
                const x1 = Math.floor(Math.random() * 4) - 5;
                const x2 = x1 + Math.floor(Math.random() * 4) + 2;
                
                const a = Math.floor(Math.random() * 3) + 2;
                const b = Math.floor(Math.random() * 10) - 5;
                const val1 = a * x1 + b;
                const val2 = a * x2 + b;
                
                currentProblem = { 
                    val1, val2, a, b, x1, x2, 
                    sign1: Math.random() > 0.5 ? '<' : '<=',
                    sign2: Math.random() > 0.5 ? '<' : '<=',
                    type: 'compound' 
                };
            }
        }

        renderEquation();
        updateNumberLine();
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

        // Switch input rows
        const isSingle = currentProblem.type === 'single';
        document.getElementById('single-input-row').classList.toggle('hidden', !isSingle);
        document.getElementById('compound-input-row').classList.toggle('hidden', isSingle);
    }

    function formatInequality(a, b, c, sign) {
        const aStr = a === 1 ? '' : (a === -1 ? '-' : a);
        const bStr = b === 0 ? '' : (b > 0 ? `+${b}` : b);
        const signStr = sign.replace('<=', '\\leqq').replace('>=', '\\geqq');
        return `${aStr}x ${bStr} ${signStr} ${c}`;
    }

    function checkAnswer() {
        if (currentProblem.type === 'single') {
            const userVal = parseFloat(valInput.value);
            const userSign = signInput.value;
            if (isNaN(userVal)) return showFeedback('値を入力してください', 'error');

            let correctSign = currentProblem.sign;
            if (currentProblem.a < 0) {
                const flip = {'<': '>', '>': '<', '<=': '>=', '>=': '<='};
                correctSign = flip[currentProblem.sign];
            }

            if (userSign === correctSign && userVal === currentProblem.x && isEndpoint1Filled === correctSign.includes('=')) {
                success();
            } else {
                fail(userSign !== correctSign && currentProblem.a < 0);
            }
        } else {
            // System or Compound
            const vLeft = parseFloat(document.getElementById('val-input-left').value);
            const vRight = parseFloat(document.getElementById('val-input-right').value);
            const sLeft = document.getElementById('sign-input-left').value;
            const sRight = document.getElementById('sign-input-right').value;

            if (isNaN(vLeft) || isNaN(vRight)) return showFeedback('値を入力してください', 'error');

            const isCorrect = (vLeft === currentProblem.x1 && vRight === currentProblem.x2 && 
                               sLeft === currentProblem.sign1 && sRight === currentProblem.sign2 &&
                               isEndpoint1Filled === currentProblem.sign1.includes('=') &&
                               isEndpoint2Filled === currentProblem.sign2.includes('='));

            if (isCorrect) success();
            else fail();
        }
    }

    function success() {
        showFeedback('正解！素晴らしい！', 'success');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#5856D6', '#007AFF', '#34C759'] });
        score += 10;
        scoreVal.textContent = score;
        setTimeout(generateProblem, 1500);
    }

    function fail(isSignError = false) {
        let msg = '惜しい！もう一度考えてみよう';
        if (isSignError) msg = '⚠️ 負の数で割った時の向きに注意！';
        showFeedback(msg, 'error');
    }

    function showFeedback(text, type) {
        feedbackToast.textContent = text;
        feedbackToast.className = `feedback show ${type}`;
        setTimeout(() => {
            feedbackToast.classList.remove('show');
        }, 3000);
    }

    // --- Number Line Logic ---
    function initNumberLine() {
        ticksGroup.innerHTML = '';
        for (let i = -10; i <= 10; i++) {
            const x = 250 + i * 20;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 55);
            line.setAttribute('x2', x);
            line.setAttribute('y2', 65);
            line.setAttribute('stroke', '#C7C7CC');
            line.setAttribute('stroke-width', '1');
            ticksGroup.appendChild(line);

            if (i % 5 === 0) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x);
                text.setAttribute('y', 80);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('class', 'tick-label');
                text.textContent = i;
                ticksGroup.appendChild(text);
            }
        }
    }

    function updateNumberLine() {
        const xPos1 = 250 + (currentProblem.type === 'single' ? currentProblem.x : currentProblem.x1) * 20;
        endpoint1.setAttribute('cx', xPos1);
        
        if (currentProblem.type === 'single') {
            endpoint2.classList.add('hidden');
            let actualSign = currentProblem.sign;
            if (currentProblem.a < 0) {
                const flip = {'<': '>', '>': '<', '<=': '>=', '>=': '<='};
                actualSign = flip[currentProblem.sign];
            }
            if (actualSign.includes('>')) {
                solutionLine.setAttribute('x1', xPos1);
                solutionLine.setAttribute('x2', 480);
            } else {
                solutionLine.setAttribute('x1', 20);
                solutionLine.setAttribute('x2', xPos1);
            }
        } else {
            endpoint2.classList.remove('hidden');
            const xPos2 = 250 + currentProblem.x2 * 20;
            endpoint2.setAttribute('cx', xPos2);
            solutionLine.setAttribute('x1', xPos1);
            solutionLine.setAttribute('x2', xPos2);
        }
    }

    function updateEndpointStyle(el, filled) {
        el.setAttribute('fill', filled ? 'var(--apple-indigo)' : 'white');
    }
});
