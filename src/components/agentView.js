import { $ } from '../lib/utils.js';
import { createChatView } from './chatView.js';

export const renderAgentView = (agent, onBack) => {
    const container = document.createElement('div');
    container.className = 'container';
    container.style.height = 'calc(100vh - 4rem)'; // Adjust for padding
    container.style.display = 'flex';
    container.style.flexDirection = 'column';

    // Header with Back Button
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '1rem';
    header.style.flexShrink = '0';

    header.innerHTML = `
    <div style="display:flex; align-items:center; gap: 1rem;">
        <button id="back-btn" class="btn" style="padding: 0.5rem 1rem;">← Back</button>
        <h2>${agent.icon} ${agent.name}</h2>
    </div>
  `;
    container.appendChild(header);

    container.querySelector('#back-btn').addEventListener('click', onBack);

    // Main Content Area (Split Layout: Config/Input vs Chat)
    const mainContent = document.createElement('div');
    mainContent.style.flex = '1';
    mainContent.style.display = 'flex';
    mainContent.style.gap = '2rem';
    mainContent.style.overflow = 'hidden'; // Important for scrolling chat

    // 1. Sidebar / Config Area (Agent Specific Input)
    const configArea = document.createElement('div');
    configArea.className = 'glass';
    configArea.style.width = '350px';
    configArea.style.padding = '1.5rem';
    configArea.style.display = 'flex';
    configArea.style.flexDirection = 'column';
    configArea.style.flexShrink = '0';
    configArea.style.overflowY = 'auto';

    // Render Agent Specific Input UI
    configArea.innerHTML = agent.renderInput();
    mainContent.appendChild(configArea);

    // 2. Chat Area
    const chatAreaWrapper = document.createElement('div');
    chatAreaWrapper.className = 'glass';
    chatAreaWrapper.style.flex = '1';
    chatAreaWrapper.style.display = 'flex';
    chatAreaWrapper.style.flexDirection = 'column';
    chatAreaWrapper.style.overflow = 'hidden';

    const { container: chatContainer, appendMessage, showTyping, removeTyping } = createChatView();
    chatAreaWrapper.appendChild(chatContainer);
    mainContent.appendChild(chatAreaWrapper);
    container.appendChild(mainContent);

    // Initialize Chat Logic
    const inputField = chatContainer.querySelector('#chat-input');
    const sendBtn = chatContainer.querySelector('#chat-send');

    // Interface for the agent to use
    const chatInterface = {
        appendUserMessage: (text) => appendMessage('user', text),
        appendModelMessage: (text) => appendMessage('model', text),
        setLoading: (isLoading) => {
            if (isLoading) {
                const id = showTyping();
                return id;
            }
        },
        disableInput: (disabled) => {
            inputField.disabled = disabled;
            sendBtn.disabled = disabled;
        },
        clearLoading: (id) => removeTyping(id)
    };

    // Helper to read file
    const processFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (file.type.startsWith('image/')) {
                    // Remove data URL prefix for Gemini API
                    const data = reader.result.split(',')[1];
                    resolve({
                        inlineData: {
                            data: data,
                            mimeType: file.type
                        }
                    });
                } else {
                    // Text context
                    resolve(`\n\n[File Attachment: ${file.name}]\n${reader.result}\n[End File Attachment]\n\n`);
                }
            };
            reader.onerror = reject;

            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                // Try read as text for everything else (fallback)
                reader.readAsText(file);
            }
        });
    };

    // Hook up standard Chat Input
    const handleSend = async () => {
        const text = inputField.value.trim();
        const attachments = getAttachments(); // Destructured from createChatView result

        if (!text && attachments.length === 0) return;

        inputField.value = '';
        clearAttachments(); // Clear UI state

        const userDisplay = text + (attachments.length ? `\n\n*[Attached ${attachments.length} file(s)]*` : '');
        appendMessage('user', userDisplay);

        // Process attachments for API
        const processedAttachments = await Promise.all(attachments.map(processFile));

        const loadingId = showTyping();

        try {
            if (agent.onChatMessage) {
                // Pass text AND processed attachments to agent
                await agent.onChatMessage(text, (response) => {
                    removeTyping(loadingId);
                    appendMessage('model', response);
                }, processedAttachments);
            } else {
                removeTyping(loadingId);
                appendMessage('model', "Sorry, this agent doesn't support chat interactions yet.");
            }
        } catch (e) {
            removeTyping(loadingId);
            appendMessage('model', `**Error**: ${e.message}`);
        }
    };

    sendBtn.addEventListener('click', handleSend);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Hook up Agent specific listeners (Initial processing)
    setTimeout(() => {
        if (agent.attachListeners) {
            agent.attachListeners(chatInterface);
        }
    }, 0);

    return container;
};
