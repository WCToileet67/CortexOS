// ============================================================
// aplikacje/quiz.js – Quiz App
// ============================================================

export default function Quiz() {
    const container = document.createElement('div');
    container.className = 'quiz-wrap';
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', 'Quiz');

    const questions = [{
        q: 'What is the capital of France?',
        opts: ['London', 'Paris', 'Berlin', 'Madrid'],
        ans: 1,
    }, {
        q: 'What is 7 + 8?',
        opts: ['13', '14', '15', '16'],
        ans: 2,
    }, {
        q: 'Which planet is known as the Red Planet?',
        opts: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        ans: 1,
    }, {
        q: 'What is the largest ocean on Earth?',
        opts: ['Atlantic', 'Indian', 'Pacific', 'Arctic'],
        ans: 2,
    }, {
        q: 'Who wrote "Romeo and Juliet"?',
        opts: ['Charles Dickens', 'Mark Twain', 'William Shakespeare', 'Jane Austen'],
        ans: 2,
    }, {
        q: 'What is the square root of 64?',
        opts: ['6', '7', '8', '9'],
        ans: 2,
    }, {
        q: 'Which element has the symbol "O"?',
        opts: ['Oxygen', 'Gold', 'Osmium', 'Oganesson'],
        ans: 0,
    }, {
        q: 'What year did World War II end?',
        opts: ['1944', '1945', '1946', '1947'],
        ans: 1,
    }, {
        q: 'What is the smallest continent?',
        opts: ['Europe', 'Australia', 'Antarctica', 'South America'],
        ans: 1,
    }, {
        q: 'How many colors are in a rainbow?',
        opts: ['5', '6', '7', '8'],
        ans: 2,
    }, ];

    let current = 0;
    let score = 0;
    let highScore = parseInt(localStorage.getItem('cortexos_quiz_high') || '0');
    let answered = false;

    const questionEl = document.createElement('div');
    questionEl.className = 'quiz-question';
    const optionsEl = document.createElement('div');
    optionsEl.className = 'quiz-options';
    const progressEl = document.createElement('div');
    progressEl.className = 'quiz-progress';
    const scoreEl = document.createElement('div');
    scoreEl.className = 'quiz-score';

    container.append(questionEl, optionsEl, progressEl, scoreEl);

    function render() {
        if (current >= questions.length) {
            // End
            questionEl.textContent = '🎉 Quiz Complete!';
            optionsEl.innerHTML = '';
            progressEl.textContent = `Final Score: ${score}/${questions.length}`;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('cortexos_quiz_high', String(highScore));
                scoreEl.textContent = `🏆 New High Score: ${highScore}!`;
            } else {
                scoreEl.textContent = `🏆 High Score: ${highScore}`;
            }
            const restartBtn = document.createElement('button');
            restartBtn.textContent = '🔄 Restart Quiz';
            restartBtn.style.cssText =
                'padding:8px 24px;border:none;border-radius:4px;background:var(--accent);color:#0a0a1a;font-weight:600;cursor:pointer;margin-top:12px;';
            restartBtn.addEventListener('click', () => {
                current = 0;
                score = 0;
                answered = false;
                render();
            });
            optionsEl.appendChild(restartBtn);
            return;
        }

        const q = questions[current];
        questionEl.textContent = `${current+1}. ${q.q}`;
        optionsEl.innerHTML = '';
        q.opts.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.textContent = String.fromCharCode(65 + idx) + '. ' + opt;
            btn.dataset.idx = idx;
            btn.addEventListener('click', () => handleAnswer(idx));
            optionsEl.appendChild(btn);
        });

        progressEl.textContent = `Question ${current+1} of ${questions.length} • Score: ${score}`;
        scoreEl.textContent = `🏆 High Score: ${highScore}`;
        answered = false;
    }

    function handleAnswer(idx) {
        if (answered) return;
        answered = true;
        const q = questions[current];
        const btns = optionsEl.querySelectorAll('button');
        btns.forEach((btn, i) => {
            btn.disabled = true;
            if (i === q.ans) btn.classList.add('correct');
            if (i === idx && idx !== q.ans) btn.classList.add('wrong');
        });

        if (idx === q.ans) {
            score++;
            import('../main.js').then(({ showToast }) => {
                showToast('✅', 'Correct!');
            });
        } else {
            import('../main.js').then(({ showToast }) => {
                showToast('❌', 'Wrong!');
            });
        }

        setTimeout(() => {
            current++;
            render();
        }, 1200);
    }

    render();
    return container;
}
