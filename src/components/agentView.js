import { $ } from '../lib/utils.js';
import { marked } from 'marked';

export const renderAgentView = (agent, onBack) => {
    const container = document.createElement('div');
    container.className = 'container';

    // Header with Back Button
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '2rem';

    header.innerHTML = `
    <div style="display:flex; align-items:center; gap: 1rem;">
        <button id="back-btn" class="btn" style="padding: 0.5rem 1rem;">← Back</button>
        <h2>${agent.icon} ${agent.name}</h2>
    </div>
  `;
    container.appendChild(header);

    container.querySelector('#back-btn').addEventListener('click', onBack);

    // Content Layout (Split View or Single Column depending on needs, sticking to Single Column for simplicity first)
    const content = document.createElement('div');
    content.className = 'glass';
    content.style.padding = '2rem';

    // Render Agent Specific Input UI
    const inputSection = document.createElement('div');
    inputSection.innerHTML = agent.renderInput();
    content.appendChild(inputSection);

    // Output Section
    const outputSection = document.createElement('div');
    outputSection.id = 'agent-output';
    outputSection.className = 'markdown-body';
    outputSection.style.marginTop = '2rem';
    outputSection.style.borderTop = '1px solid var(--glass-border)';
    outputSection.style.paddingTop = '2rem';
    outputSection.style.display = 'none'; // Hidden initially
    content.appendChild(outputSection);

    // Hook up event listeners specific to the agent
    setTimeout(() => {
        agent.attachListeners((result, isMarkdown = true) => {
            outputSection.style.display = 'block';
            if (isMarkdown) {
                outputSection.innerHTML = marked.parse(result);
            } else {
                outputSection.textContent = result;
            }
        });
    }, 0);

    container.appendChild(content);
    return container;
};
