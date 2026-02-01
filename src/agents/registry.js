import { labAgent } from './labStructurer.js';
import { ideaAgent } from './ideaGenerator.js';
import { oneShotAgent } from './oneShot.js';
import { codeAgent } from './codeGenerator.js';
import { journalAgent } from './journalMaker.js';

export const agentRegistry = [
    labAgent,
    ideaAgent,
    oneShotAgent,
    codeAgent,
    journalAgent
];
