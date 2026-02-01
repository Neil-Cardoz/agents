import { startChatSession } from '../lib/gemini.js';

export const ideaAgent = {
    id: 'idea-generator',
    name: 'Idea Generator',
    description: 'Generate MVP concepts and tech stacks from a simple topic.',
    icon: '💡',

    chat: null,

    renderInput: () => `
    <h3>Project Topic</h3>
    <p>Enter a topic to generate an MVP plan.</p>
    <div class="flex-col" style="gap:1rem;">
      <input type="text" id="idea-input" class="input-field" placeholder="e.g., AI-powered plant watering system">
      <button id="idea-submit" class="btn">Generate MVP</button>
    </div>
  `,

    attachListeners: (chatInterface) => {
        const btn = document.getElementById('idea-submit');
        const input = document.getElementById('idea-input');

        ideaAgent.chat = startChatSession();

        const generateIdea = async () => {
            const topic = input.value.trim();
            if (!topic) return;

            const loadingId = chatInterface.setLoading(true);
            btn.disabled = true;
            chatInterface.disableInput(true);

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

                const result = await ideaAgent.chat.sendMessage(prompt);
                chatInterface.clearLoading(loadingId);
                chatInterface.appendModelMessage(result.response.text());

                // Allow follow-up
                chatInterface.disableInput(false);
            } catch (e) {
                chatInterface.clearLoading(loadingId);
                chatInterface.appendModelMessage(`Error: ${e.message}`);
                chatInterface.disableInput(false);
            } finally {
                btn.disabled = false;
            }
        };

        btn.addEventListener('click', generateIdea);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') generateIdea();
        })
    },

    onChatMessage: async (message, onResponse, attachments = []) => {
        if (!ideaAgent.chat) ideaAgent.chat = startChatSession();

        let payload = message;
        if (attachments.length > 0) {
            payload = [message, ...attachments];
        }

        const result = await ideaAgent.chat.sendMessage(payload);
        onResponse(result.response.text());
    }
};
