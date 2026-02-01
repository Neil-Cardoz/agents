import { startChatSession } from '../lib/gemini.js';

export const codeAgent = {
    id: 'python-coder',
    name: 'Python Solver',
    description: 'Describe a problem, get clean Python code.',
    icon: '🐍',

    chat: null,

    renderInput: () => `
    <h3>Problem Description</h3>
    <p>Describe your coding problem.</p>
    <div class="flex-col" style="gap:1rem;">
      <textarea id="code-input" class="input-field" style="height: 100px; resize: vertical;" placeholder="e.g., Write a function to check if a number is prime..."></textarea>
      <button id="code-submit" class="btn">Generate Code</button>
    </div>
  `,

    attachListeners: (chatInterface) => {
        const btn = document.getElementById('code-submit');
        const input = document.getElementById('code-input');

        codeAgent.chat = startChatSession();

        btn.addEventListener('click', async () => {
            const promptText = input.value.trim();
            if (!promptText) return;

            const loadingId = chatInterface.setLoading(true);
            btn.disabled = true;
            chatInterface.disableInput(true);

            try {
                const prompt = `
          Write a Python solution for the following problem. 
          Provide ONLY the code and brief comments. Use a code block.
          
          Problem:
          ${promptText}
        `;
                const result = await codeAgent.chat.sendMessage(prompt);
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
        if (!codeAgent.chat) codeAgent.chat = startChatSession();

        let payload = message;
        if (attachments.length > 0) {
            payload = [message, ...attachments];
        }

        const result = await codeAgent.chat.sendMessage(payload);
        onResponse(result.response.text());
    }
};
