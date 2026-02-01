import { $, $$ } from './lib/utils.js';
import { initGemini, getStoredKey } from './lib/gemini.js';
import { renderDashboard } from './components/dashboard.js';
import { renderLogin } from './components/login.js';
import { agentRegistry } from './agents/registry.js';
import { renderAgentView } from './components/agentView.js';

const App = (() => {
  const root = $('#app');
  let currentAgent = null;

  const init = () => {
    const key = getStoredKey();
    if (key) {
      if (initGemini(key)) {
        navigateTo('dashboard');
      } else {
        navigateTo('login');
      }
    } else {
      navigateTo('login');
    }
  };

  const navigateTo = (view, data = null) => {
    root.innerHTML = '';

    if (view === 'login') {
      root.appendChild(renderLogin(onLoginSuccess));
    } else if (view === 'dashboard') {
      currentAgent = null;
      root.appendChild(renderDashboard(agentRegistry, onAgentSelect, onBuilderSelect));
    } else if (view === 'agent') {
      currentAgent = data;
      root.appendChild(renderAgentView(currentAgent, onBack));
    }
  };

  const onLoginSuccess = (apiKey) => {
    if (initGemini(apiKey)) {
      navigateTo('dashboard');
    } else {
      alert('Invalid API Key format or initialization failed.');
    }
  };

  const onAgentSelect = (agentId) => {
    const agent = agentRegistry.find(a => a.id === agentId);
    if (agent) {
      navigateTo('agent', agent);
    }
  };

  const onBuilderSelect = () => {
    // navigateTo('builder'); // TODO
    alert("Builder coming soon!");
  };

  const onBack = () => {
    navigateTo('dashboard');
  };

  return { init };
})();

App.init();
