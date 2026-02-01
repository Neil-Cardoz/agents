import { generateContent } from '../lib/gemini.js';

export const journalAgent = {
    id: 'journal-maker',
    name: 'EAI Journal Maker',
    description: 'Create structured journal entries for Embedded AI experiments.',
    icon: '📓',

    renderInput: () => `
    <h3>Experiment Topic</h3>
    <input type="text" id="journal-input" class="input-field" placeholder="e.g., LED Blinking with ESP32">
    <button id="journal-submit" class="btn">Draft Journal</button>
    <div id="loading-journal" style="display:none; color: var(--neon-primary); margin-top:1rem;">Drafting...</div>
  `,

    attachListeners: (displayOutput) => {
        const btn = document.getElementById('journal-submit');
        const input = document.getElementById('journal-input');
        const loading = document.getElementById('loading-journal');

        btn.addEventListener('click', async () => {
            const topic = input.value.trim();
            if (!topic) return;

            loading.style.display = 'block';
            btn.disabled = true;

            try {
                const prompt = `
          Create a lab journal entry for an experiment on: "${topic}".
          Strictly follow this structure:
          
          1. **Hardware/Components and Tools required**: List them.
          2. **Theory**: Brief explanation of the concept.
          3. **Hardware circuit connections Diagram**: (Write "[PLACEHOLDER FOR CIRCUIT DIAGRAM]" here).
          4. **Working steps**: Step-by-step procedures.
          5. **Arduino IDE Sketch/Microcontroller Program**: Provide the code (C++/Python).
          6. **Photo of hardware execution**: (Write "[PLACEHOLDER FOR HARDWARE PHOTO]" here).
          7. **Screenshot of program execution as Results**: (Write "[PLACEHOLDER FOR RESULT SCREENSHOT]" here).
          8. **Conclusion**: Summary of learning.
          
          Format in Markdown.
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
