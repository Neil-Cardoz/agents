import { startChatSession } from '../lib/gemini.js';

export const oneShotAgent = {
    id: 'one-shot',
    name: 'One-Shot Maker',
    description: 'Turn notes or topics into a 1-page quick reference suitable for exams.',
    icon: '⚡',

    chat: null,

    renderInput: () => `
    <h3>Source Material</h3>
    <p>Paste your notes below to create a cheat sheet.</p>
    <div class="flex-col" style="gap:1rem;">
      <textarea id="shot-input" class="input-field" style="height: 150px; resize: vertical;" placeholder="Paste text contents here..."></textarea>
      <button id="shot-submit" class="btn">Create Cheat Sheet</button>
    </div>
  `,

    attachListeners: (chatInterface) => {
        const btn = document.getElementById('shot-submit');
        const input = document.getElementById('shot-input');

        oneShotAgent.chat = startChatSession();

        btn.addEventListener('click', async () => {
            const text = input.value.trim();
            if (!text) return;

            const loadingId = chatInterface.setLoading(true);
            btn.disabled = true;
            chatInterface.disableInput(true);

            try {
                const prompt = `
          Create a "One-Shot" quick reference guide / cheat sheet from the following text.
          Focus on high-yield facts, formulas, definitions, and key concepts suitable for last-minute exam revision.
          Use bullet points, bold text, and clear headers.
          
          Text:
          ${text}
        `;
                const result = await oneShotAgent.chat.sendMessage(prompt);
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
        });
    },

    onChatMessage: async (message, onResponse, attachments = []) => {
        if (!oneShotAgent.chat) oneShotAgent.chat = startChatSession();

        let payload = message;
        if (attachments.length > 0) {
            payload = [message, ...attachments];
        }

        const result = await oneShotAgent.chat.sendMessage(payload);
        onResponse(result.response.text());
    }
};
