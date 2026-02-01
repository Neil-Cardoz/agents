import { generateContent } from '../lib/gemini.js';
import { readAsText, downloadFile } from '../lib/utils.js';

export const labAgent = {
    id: 'lab-structurer',
    name: 'Lab Assignment Structurer',
    description: 'Upload .ipynb to add Aim, Objectives, Theory, and proper comments.',
    icon: '🧪',

    renderInput: () => `
    <h3>Upload Notebook</h3>
    <p>Select your .ipynb file.</p>
    <div class="flex-col" style="gap:1rem; max-width: 400px;">
      <input type="file" id="lab-file" accept=".ipynb" class="input-field">
      <button id="lab-submit" class="btn">Process & Download</button>
    </div>
    <div id="loading" style="display:none; margin-top:1rem; color: var(--neon-primary);">Processing... This may take a minute.</div>
  `,

    attachListeners: (displayOutput) => {
        const btn = document.getElementById('lab-submit');
        const input = document.getElementById('lab-file');
        const loading = document.getElementById('loading');

        btn.addEventListener('click', async () => {
            if (!input.files.length) return alert('Please upload a file first.');

            const file = input.files[0];
            loading.style.display = 'block';
            btn.disabled = true;

            try {
                const text = await readAsText(file);
                const json = JSON.parse(text);

                // Extract code cells
                const codeCells = json.cells.filter(c => c.cell_type === 'code');
                const codeContent = codeCells.map(c => c.source.join('')).join('\n\n# NEXT CELL\n\n');

                const prompt = `
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

                const responseText = await generateContent(prompt);
                // Clean cleanup if model adds markdown blocks
                const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '');
                const data = JSON.parse(cleaned);

                // Construct new cells
                const newCells = [];

                // Header Cells
                newCells.push({ cell_type: "markdown", metadata: {}, source: [`# ${data.aim}`] });
                newCells.push({ cell_type: "markdown", metadata: {}, source: [`## Objectives\n${data.objectives.map(o => `- ${o}`).join('\n')}`] });
                newCells.push({ cell_type: "markdown", metadata: {}, source: [`## Theory\n${data.theory}`] });

                // Code Cells (Assuming 1-to-1 mapping or just dumped sequentially if structure varies)
                // For simple assignments, we'll try to map back, but simplified: assume user wants the refactored versions.
                // If the number of blocks doesn't match, we just append them.

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

                downloadFile(`structured_${file.name}`, JSON.stringify(json, null, 2), 'application/json');
                displayOutput(`### Success!\nFile downloaded as structure_${file.name}. \n\n**Aim Detected:** ${data.aim}`);

            } catch (e) {
                console.error(e);
                displayOutput(`### Error\n${e.message}`);
            } finally {
                loading.style.display = 'none';
                btn.disabled = false;
            }
        });
    }
};
