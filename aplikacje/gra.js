// ============================================================
// aplikacje/gra.js – Gra w zgadywanie liczby
// ============================================================

import { showToast } from '../main.js';

export default function Gra() {
    const container = document.createElement('div');
    container.className = 'game-area';
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', 'Guess Number');
    container.style.cssText = 'padding:16px;max-width:400px;margin:0 auto;';

    let secret = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;
    let bestScore = parseInt(localStorage.getItem('cortexos-game-best') || '999');

    container.innerHTML = `
        <h3 style="margin-bottom:12px;">🎯 Zgadnij liczbę 1–100</h3>
        <p style="font-size:12px;color:var(--text-secondary);margin-bottom:12px;">
            Rekord: <strong id="gameBest">${bestScore === 999 ? '—' : bestScore}</strong> prób
        </p>
        <input type="number" class="game-input" id="gameInput" min="1" max="100" placeholder="?" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:4px;background:rgba(0,0,0,0.2);color:#fff;font-size:16px;">
        <br>
        <button id="gameBtn" style="width:100%;padding:10px;margin-top:8px;border:none;border-radius:4px;background:var(--accent);color:#0a0a1a;font-weight:600;cursor:pointer;">Zgaduj!</button>
        <div id="gameFeedback" style="margin-top:8px;min-height:24px;font-size:14px;"></div>
        <div id="gameStats" style="margin-top:4px;font-size:13px;color:var(--text-secondary);">Próby: 0</div>
        <button id="gameReset" style="width:100%;padding:8px;margin-top:8px;border:1px solid var(--border-color);border-radius:4px;background:transparent;color:var(--text-primary);cursor:pointer;">🔄 Nowa gra</button>
    `;

    const input = container.querySelector('#gameInput');
    const btn = container.querySelector('#gameBtn');
    const fb = container.querySelector('#gameFeedback');
    const stats = container.querySelector('#gameStats');
    const bestEl = container.querySelector('#gameBest');
    const resetBtn = container.querySelector('#gameReset');

    function resetGame() {
        secret = Math.floor(Math.random() * 100) + 1;
        attempts = 0;
        fb.textContent = '';
        fb.style.color = 'var(--text-secondary)';
        stats.textContent = 'Próby: 0';
        input.value = '';
        input.focus();
    }

    function checkGuess() {
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
                localStorage.setItem('cortexos-game-best', String(bestScore));
                bestEl.textContent = bestScore;
                showToast('🏆', 'Nowy rekord: ' + bestScore + ' prób!');
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
    }

    btn.addEventListener('click', checkGuess);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') checkGuess();
    });
    resetBtn.addEventListener('click', resetGame);

    setTimeout(() => input.focus(), 300);
    return container;
}
