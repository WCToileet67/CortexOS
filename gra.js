// ============================================================
// apps/gra.js – Gra w zgadywanie liczby
// ============================================================

(function() {
    if (!window.WebOS || !window.WebOS.registerApp) {
        setTimeout(arguments.callee, 50);
        return;
    }

    window.WebOS.registerApp(
        'game',
        'Zgadnij Liczbę',
        '🎮',
        'Gry',
        function(winId) {
            const container = document.createElement('div');
            container.className = 'game-area';
            let secret = Math.floor(Math.random() * 100) + 1;
            let attempts = 0;
            let bestScore = parseInt(localStorage.getItem('webos-game-best') || '999');
            container.innerHTML = `
                <h3>🎯 Zgadnij liczbę 1–100</h3>
                <p style="font-size:12px;color:#999;">Rekord: <strong id="game-best-${winId}">${bestScore === 999 ? '—' : bestScore}</strong> prób</p>
                <input type="number" class="game-input" id="game-inp-${winId}" min="1" max="100" placeholder="?">
                <br><button class="app-btn primary" style="margin-top:8px;" id="game-btn-${winId}">Zgaduj!</button>
                <div class="game-feedback" id="game-fb-${winId}"></div>
                <div class="game-stats" id="game-stats-${winId}">Próby: 0</div>
                <button class="app-btn" style="margin-top:10px;" id="game-reset-${winId}">🔄 Nowa gra</button>
            `;
            const input = container.querySelector('.game-input');
            const btn = container.querySelector(`#game-btn-${winId}`);
            const fb = container.querySelector('.game-feedback');
            const stats = container.querySelector('.game-stats');
            const bestEl = container.querySelector(`#game-best-${winId}`);
            const resetBtn = container.querySelector(`#game-reset-${winId}`);

            function resetGame() {
                secret = Math.floor(Math.random() * 100) + 1;
                attempts = 0;
                fb.textContent = '';
                fb.style.color = '#ddd';
                stats.textContent = 'Próby: 0';
                input.value = '';
                input.focus();
            }

            btn.addEventListener('click', () => {
                const guess = parseInt(input.value);
                if (isNaN(guess) || guess < 1 || guess > 100) {
                    fb.textContent = '⚠ Podaj liczbę 1–100!';
                    fb.style.color = '#e0a840';
                    return;
                }
                attempts++;
                stats.textContent = 'Próby: ' + attempts;
                if (guess === secret) {
                    fb.textContent = `🎉 BRAWO! Zgadłeś w ${attempts} próbach!`;
                    fb.style.color = '#5cb878';
                    if (attempts < bestScore) {
                        bestScore = attempts;
                        localStorage.setItem('webos-game-best', bestScore);
                        bestEl.textContent = bestScore;
                        window.WebOS.showToast('🏆', 'Nowy rekord: ' + bestScore + ' prób!');
                    }
                } else if (guess < secret) {
                    fb.textContent = '📈 Więcej!';
                    fb.style.color = '#7eb8f4';
                } else {
                    fb.textContent = '📉 Mniej!';
                    fb.style.color = '#e0556a';
                }
                input.value = '';
                input.focus();
            });
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') btn.click(); });
            resetBtn.addEventListener('click', resetGame);
            setTimeout(() => input.focus(), 300);
            return container;
        },
        450, 400
    );
})();