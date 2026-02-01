import { startChatSession } from '../lib/gemini.js';

export const journalAgent = {
    id: 'journal-maker',
    name: 'EAI Journal Maker',
    description: 'Create structured journal entries for Embedded AI experiments.',
    icon: '📓',

    chat: null,

    renderInput: () => `
    <h3>Experiment Topic</h3>
    <p>Enter the experiment name to draft a journal.</p>
    <div class="flex-col" style="gap:1rem;">
      <input type="text" id="journal-input" class="input-field" placeholder="e.g., LED Blinking with ESP32">
      <button id="journal-submit" class="btn">Draft Journal</button>
    </div>
  `,

    attachListeners: (chatInterface) => {
        const btn = document.getElementById('journal-submit');
        const input = document.getElementById('journal-input');

        journalAgent.chat = startChatSession();

        const draftJournal = async () => {
            const topic = input.value.trim();
            if (!topic) return;

            const loadingId = chatInterface.setLoading(true);
            btn.disabled = true;
            chatInterface.disableInput(true);

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
                const result = await journalAgent.chat.sendMessage(prompt);
                chatInterface.clearLoading(loadingId);
                chatInterface.appendModelMessage(result.response.text());
                chatInterface.disableInput(false);
            } catch (e) {
                chatInterface.clearLoading(loadingId);
                chatInterface.appendModelMessage(`Error: ${e.message}`);
                chatInterface.disableInput(false);
            } finally {
                btn.disabled = false;
            }
        };

        btn.addEventListener('click', draftJournal);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') draftJournal();
        });
    },

    onChatMessage: async (message, onResponse, attachments = []) => {
        if (!journalAgent.chat) journalAgent.chat = startChatSession();

        let payload = message;
        if (attachments.length > 0) {
            payload = [message, ...attachments];
        }

        const result = await journalAgent.chat.sendMessage(payload);
        onResponse(result.response.text());
    }
};
