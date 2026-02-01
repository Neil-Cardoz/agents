export const renderDashboard = (agents, onSelect, onBuilder) => {
    const container = document.createElement('div');
    container.className = 'container';

    const header = document.createElement('header');
    header.innerHTML = `
    <h1>Agent Command Center</h1>
    <p>Select an agent to begin your task.</p>
  `;
    header.style.marginBottom = '3rem';
    container.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'grid';

    // Agent Cards
    agents.forEach(agent => {
        const card = document.createElement('div');
        card.className = 'glass card';
        card.innerHTML = `
      <div>
        <div style="font-size: 2rem; margin-bottom: 1rem;">${agent.icon}</div>
        <h3>${agent.name}</h3>
        <p>${agent.description}</p>
      </div>
      <button class="btn" style="margin-top:auto">Launch</button>
    `;
        card.addEventListener('click', () => onSelect(agent.id));
        grid.appendChild(card);
    });

    // Builder Card
    const builderCard = document.createElement('div');
    builderCard.className = 'glass card';
    builderCard.style.border = '1px dashed var(--neon-secondary)';
    builderCard.innerHTML = `
      <div>
        <div style="font-size: 2rem; margin-bottom: 1rem;">🛠️</div>
        <h3 style="color: var(--neon-secondary)">Agent Builder</h3>
        <p>Create your own custom agent.</p>
      </div>
      <button class="btn" style="border-color: var(--neon-secondary); color: var(--neon-secondary);">Build</button>
  `;
    builderCard.addEventListener('click', onBuilder);
    grid.appendChild(builderCard);

    container.appendChild(grid);
    return container;
};
