import { generateContent } from '../lib/gemini.js';

export const codeAgent = {
    id: 'python-coder',
    name: 'Python Solver',
    description: 'Describe a problem, get clean Python code.',
    icon: '🐍',

    renderInput: () => `
    <h3>Problem Description</h3>
    <textarea id="code-input" class="input-field" style="height: 100px;" placeholder="e.g., Write a function to check if a number is prime..."></textarea>
    <button id="code-submit" class="btn">Generate Code</button>
    <div id="loading-code" style="display:none; color: var(--neon-primary); margin-top:1rem;">Coding...</div>
  `,

    attachListeners: (displayOutput) => {
        const btn = document.getElementById('code-submit');
        const input = document.getElementById('code-input');
        const loading = document.getElementById('loading-code');

        btn.addEventListener('click', async () => {
            const promptText = input.value.trim();
            if (!promptText) return;

            loading.style.display = 'block';
            btn.disabled = true;

            try {
                const prompt = `
          Write a Python solution for the following problem. 
          Provide ONLY the code and brief comments. Use a code block.
          
          Problem:
          ${promptText}
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
