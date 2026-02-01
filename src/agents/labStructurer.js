import { startChatSession } from '../lib/gemini.js';
import { readAsText, downloadFile } from '../lib/utils.js';

export const labAgent = {
    id: 'lab-structurer',
    name: 'Lab Assignment Structurer',
    description: 'Upload .ipynb to add Aim, Objectives, Theory, and proper comments.',
    icon: '🧪',

    // State to hold the active chat session
    chat: null,
    lastJson: null,

    renderInput: () => `
    <h3>Upload Notebook</h3>
    <p>Select your .ipynb file to start the session.</p>
    <div class="flex-col" style="gap:1rem;">
      <input type="file" id="lab-file" accept=".ipynb" class="input-field">
      <button id="lab-submit" class="btn">Process & Init Chat</button>
      <button id="lab-download" class="btn" style="display:none; border-color: var(--neon-secondary); color: var(--neon-secondary);">Download Result</button>
    </div>
    <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-muted);">
      Once processed, you can ask follow-up questions in the chat window.
    </div>
  `,

    attachListeners: (chatInterface) => {
        const btn = document.getElementById('lab-submit');
        const downloadBtn = document.getElementById('lab-download');
        const input = document.getElementById('lab-file');

        // Initialize chat session on load (empty history)
        labAgent.chat = startChatSession();

        btn.addEventListener('click', async () => {
            if (!input.files.length) return alert('Please upload a file first.');

            const file = input.files[0];
            const loadingId = chatInterface.setLoading(true);
            btn.disabled = true;
            chatInterface.disableInput(true);

            try {
                const text = await readAsText(file);
                const json = JSON.parse(text);

                // Extract code cells
                const codeCells = json.cells.filter(c => c.cell_type === 'code');
                const codeContent = codeCells.map(c => c.source.join('')).join('\n\n# NEXT CELL\n\n');

                const systemPrompt = `
          I have a python notebook. I need you to analyze the code and extract the likely Aim, Objectives, and Theory for this lab assignment.
          Also, strictly refactor the code to improve quality and add detailed comments explaining each step.
          
          Return a JSON object with this EXACT structure (no markdown formatting around it):
          {
            "aim": "The aim...",
            "objectives": ["obj1", "obj2"],
            "theory": "The theory...",
            "code_analysis": "Explanation of what the code does...",
            "refactored_code_blocks": ["code for cell 1", "code for cell 2"] 
          }
          
          Here is the code content:
          ${codeContent}
        `;

                // Send the initial heavy context to the chat
                const result = await labAgent.chat.sendMessage(systemPrompt);
                const responseText = result.response.text();

                // Clean cleanup if model adds markdown blocks
                const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '');
                const data = JSON.parse(cleaned);

                // Construct new cells
                const newCells = [];
                newCells.push({ cell_type: "markdown", metadata: {}, source: [`# ${data.aim}`] });
                newCells.push({ cell_type: "markdown", metadata: {}, source: [`## Objectives\n${data.objectives.map(o => `- ${o}`).join('\n')}`] });
                newCells.push({ cell_type: "markdown", metadata: {}, source: [`## Theory\n${data.theory}`] });

                data.refactored_code_blocks.forEach(code => {
                    newCells.push({
                        cell_type: "code",
                        execution_count: null,
                        metadata: {},
                        outputs: [],
                        source: code.split('\n').map(l => l + '\n')
                    });
                });

                json.cells = newCells;
                labAgent.lastJson = json;
                labAgent.lastFileName = file.name;

                // Show success in chat
                chatInterface.clearLoading(loadingId);
                chatInterface.appendModelMessage(`
### Analysis Complete! 🧪
**Aim**: ${data.aim}

I have refactored the code and added theory sections.
You can now **Download** the file using the button on the left, or ask me questions about the code!
        `);

                // Enable controls
                chatInterface.disableInput(false);
                downloadBtn.style.display = 'block';

            } catch (e) {
                console.error(e);
                chatInterface.clearLoading(loadingId);
                chatInterface.appendModelMessage(`**Error processing file**: ${e.message}`);
                chatInterface.disableInput(false);
            } finally {
                btn.disabled = false;
            }
        });

        downloadBtn.addEventListener('click', () => {
            if (labAgent.lastJson) {
                downloadFile(`structured_${labAgent.lastFileName}`, JSON.stringify(labAgent.lastJson, null, 2), 'application/json');
            }
        });
    },

    onChatMessage: async (message, onResponse, attachments = []) => {
        if (!labAgent.chat) {
            labAgent.chat = startChatSession();
        }

        let payload = message;
        if (attachments.length > 0) {
            payload = [message, ...attachments];
        }

        const result = await labAgent.chat.sendMessage(payload);
        onResponse(result.response.text());
    }
};
