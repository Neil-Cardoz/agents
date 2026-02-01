import { marked } from 'marked';
import { $ } from '../lib/utils.js';

export const createChatView = () => {
    const container = document.createElement('div');
    container.className = 'chat-container flex-col';
    container.style.height = '100%';
    container.style.position = 'relative';

    // Chat History Area
    const chatHistory = document.createElement('div');
    chatHistory.className = 'chat-history';
    chatHistory.style.flex = '1';
    chatHistory.style.overflowY = 'auto';
    chatHistory.style.padding = '1rem';
    chatHistory.style.display = 'flex';
    chatHistory.style.flexDirection = 'column';
    chatHistory.style.gap = '1.5rem';
    container.appendChild(chatHistory);

    // Input Area
    const inputArea = document.createElement('div');
    inputArea.className = 'glass chat-input-area';
    inputArea.style.padding = '1rem';
    inputArea.style.display = 'flex';
    inputArea.style.flexDirection = 'column'; // Changed to column to hold preview
    inputArea.style.gap = '0.5rem';
    inputArea.style.borderTop = '1px solid var(--glass-border)';
    inputArea.style.borderLeft = 'none';
    inputArea.style.borderRight = 'none';
    inputArea.style.borderBottom = 'none';
    inputArea.style.borderRadius = '0';

    // Attachment Preview
    const attachmentPreview = document.createElement('div');
    attachmentPreview.style.display = 'flex';
    attachmentPreview.style.gap = '0.5rem';
    attachmentPreview.style.flexWrap = 'wrap';
    attachmentPreview.style.paddingBottom = '0.5rem';
    attachmentPreview.style.display = 'none'; // Hidden by default
    inputArea.appendChild(attachmentPreview);

    const inputRow = document.createElement('div');
    inputRow.style.display = 'flex';
    inputRow.style.gap = '1rem';
    inputRow.style.width = '100%';

    // File Input (Hidden)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    inputRow.appendChild(fileInput);

    // Attachment Button
    const attachBtn = document.createElement('button');
    attachBtn.className = 'btn';
    attachBtn.innerHTML = '📎';
    attachBtn.style.padding = '0 1rem';
    attachBtn.style.height = '50px';
    attachBtn.style.fontSize = '1.2rem';
    attachBtn.title = 'Attach files (Images, Text, Code)';

    attachBtn.addEventListener('click', () => fileInput.click());
    inputRow.appendChild(attachBtn);

    const textArea = document.createElement('textarea');
    textArea.id = 'chat-input';
    textArea.className = 'input-field';
    textArea.placeholder = 'Ask a follow-up...';
    textArea.style.marginBottom = '0';
    textArea.style.height = '50px';
    textArea.style.resize = 'none';
    textArea.style.flex = '1';
    inputRow.appendChild(textArea);

    const sendBtn = document.createElement('button');
    sendBtn.id = 'chat-send';
    sendBtn.className = 'btn';
    sendBtn.style.height = '50px';
    sendBtn.style.display = 'flex';
    sendBtn.style.alignItems = 'center';
    sendBtn.style.justifyContent = 'center';
    sendBtn.textContent = 'Send ➢';
    inputRow.appendChild(sendBtn);

    inputArea.appendChild(inputRow);
    container.appendChild(inputArea);

    // State for attachments
    let activeAttachments = [];

    const renderAttachments = () => {
        attachmentPreview.innerHTML = '';
        if (activeAttachments.length === 0) {
            attachmentPreview.style.display = 'none';
            return;
        }
        attachmentPreview.style.display = 'flex';

        activeAttachments.forEach((file, index) => {
            const chip = document.createElement('div');
            chip.style.background = 'rgba(255, 255, 255, 0.1)';
            chip.style.padding = '4px 8px';
            chip.style.borderRadius = '4px';
            chip.style.fontSize = '0.8rem';
            chip.style.display = 'flex';
            chip.style.alignItems = 'center';
            chip.style.gap = '6px';

            const name = document.createElement('span');
            name.textContent = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;
            chip.appendChild(name);

            const remove = document.createElement('span');
            remove.innerHTML = '&times;';
            remove.style.cursor = 'pointer';
            remove.style.fontWeight = 'bold';
            remove.onclick = (e) => {
                e.stopPropagation();
                activeAttachments.splice(index, 1);
                renderAttachments();
            };
            chip.appendChild(remove);

            attachmentPreview.appendChild(chip);
        });
    };

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            Array.from(fileInput.files).forEach(f => activeAttachments.push(f));
            fileInput.value = ''; // Reset
            renderAttachments();
        }
    });

    const appendMessage = (role, text) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        msgDiv.style.maxWidth = '80%';
        msgDiv.style.padding = '1rem';
        msgDiv.style.borderRadius = '12px';
        msgDiv.style.lineHeight = '1.5';

        if (role === 'user') {
            msgDiv.style.alignSelf = 'flex-end';
            msgDiv.style.background = 'var(--neon-primary)';
            msgDiv.style.color = '#000';
            msgDiv.textContent = text;
        } else {
            msgDiv.style.alignSelf = 'flex-start';
            msgDiv.style.background = 'rgba(255, 255, 255, 0.05)';
            msgDiv.style.color = 'var(--text-main)';
            msgDiv.innerHTML = marked.parse(text);
        }

        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    };

    const showTyping = () => {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'message model';
        div.style.alignSelf = 'flex-start';
        div.style.color = 'var(--text-muted)';
        div.style.fontStyle = 'italic';
        div.textContent = 'Thinking...';
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        return id;
    };

    const removeTyping = (id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    const getAttachments = () => activeAttachments;
    const clearAttachments = () => {
        activeAttachments = [];
        renderAttachments();
    };

    return { container, appendMessage, showTyping, removeTyping, getAttachments, clearAttachments, setInputValue: (v) => textArea.value = v };
};
