import { $ } from '../lib/utils.js';

export const renderLogin = (onSuccess) => {
    const container = document.createElement('div');
    container.className = 'container flex-center';
    container.style.height = '100%';

    const card = document.createElement('div');
    card.className = 'glass card';
    card.style.maxWidth = '400px';
    card.style.height = 'auto';

    card.innerHTML = `
    <h1>Gemini Portal</h1>
    <p>Enter your Google Gemini API Key to access the agent suite.</p>
    <div style="margin-top: 2rem;">
      <input type="password" id="api-key" class="input-field" placeholder="Paste API Key here...">
      <button id="login-btn" class="btn" style="width: 100%;">Enter Portal</button>
    </div>
    <p style="font-size: 0.8rem; margin-top: 1rem; opacity: 0.7;">
      Your key is stored locally in your browser and never sent to our servers.
    </p>
  `;

    const btn = card.querySelector('#login-btn');
    const input = card.querySelector('#api-key');

    btn.addEventListener('click', () => {
        const key = input.value.trim();
        if (key) onSuccess(key);
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const key = input.value.trim();
            if (key) onSuccess(key);
        }
    })

    container.appendChild(card);
    return container;
};
