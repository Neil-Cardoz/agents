import { generateContent } from '../lib/gemini.js';

export const oneShotAgent = {
    id: 'one-shot',
    name: 'One-Shot Maker',
    description: 'Turn notes or topics into a 1-page quick reference suitable for exams.',
    icon: '⚡',

    renderInput: () => `
    <h3>Source Material</h3>
    <textarea id="shot-input" class="input-field" style="height: 150px;" placeholder="Paste text contents here..."></textarea>
    <button id="shot-submit" class="btn">Create Cheat Sheet</button>
    <div id="loading-shot" style="display:none; color: var(--neon-primary); margin-top:1rem;">Condensing...</div>
  `,

    attachListeners: (displayOutput) => {
        const btn = document.getElementById('shot-submit');
        const input = document.getElementById('shot-input');
        const loading = document.getElementById('loading-shot');

        btn.addEventListener('click', async () => {
            const text = input.value.trim();
            if (!text) return;

            loading.style.display = 'block';
            btn.disabled = true;

            try {
                const prompt = `
          Create a "One-Shot" quick reference guide / cheat sheet from the following text.
          Focus on high-yield facts, formulas, definitions, and key concepts suitable for last-minute exam revision.
          Use bullet points, bold text, and clear headers.
          
          Text:
          ${text}
        `;
                const result = await generateContent(prompt);
                displayOutput(result);
            } catch (e) {
                displayOutput(`Error: ${e.message}`);
            } finally {
                loading.style.display = 'none';
                btn.disabled = false;
            }
        });
    }
};
