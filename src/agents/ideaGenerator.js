import { generateContent } from '../lib/gemini.js';

export const ideaAgent = {
    id: 'idea-generator',
    name: 'Idea Generator',
    description: 'Generate MVP concepts and tech stacks from a simple topic.',
    icon: '💡',

    renderInput: () => `
    <h3>Project Topic</h3>
    <input type="text" id="idea-input" class="input-field" placeholder="e.g., AI-powered plant watering system">
    <button id="idea-submit" class="btn">Generate MVP</button>
    <div id="loading-idea" style="display:none; color: var(--neon-primary); margin-top:1rem;">Brainstorming...</div>
  `,

    attachListeners: (displayOutput) => {
        const btn = document.getElementById('idea-submit');
        const input = document.getElementById('idea-input');
        const loading = document.getElementById('loading-idea');

        btn.addEventListener('click', async () => {
            const topic = input.value.trim();
            if (!topic) return;

            loading.style.display = 'block';
            btn.disabled = true;

            try {
                const prompt = `
          I need an MVP idea for a project about: "${topic}".
          Please provide:
          1. **Project Title**: Catchy name.
          2. **Core Value Proposition**: One sentence pitch.
          3. **Key Features (MVP)**: Top 3-5 features for version 1.
          4. **Tech Stack**: Recommended modern tools.
          5. **Future Scalability**: One idea for v2.
          
          Format as nice Markdown.
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
