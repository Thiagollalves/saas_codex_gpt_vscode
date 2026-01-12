const navButtons = document.querySelectorAll('.nav-button');
const pages = document.querySelectorAll('.page');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');

const subtitles = {
  crm: 'Gerencie oportunidades com seu funil arrastável.',
  marketing: 'Ative campanhas integradas ao pipeline.',
  whatsapp: 'Converse com leads no mesmo painel.',
  settings: 'Controle acessos, preferências e dados da conta.'
};

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    navButtons.forEach((btn) => btn.classList.remove('is-active'));
    button.classList.add('is-active');

    const target = button.dataset.target;
    pages.forEach((page) => {
      page.classList.toggle('is-visible', page.id === target);
    });

    pageTitle.textContent = button.textContent;
    pageSubtitle.textContent = subtitles[target] || '';
  });
});

const kanban = document.getElementById('kanban');
let activeCard = null;
let offsetX = 0;
let offsetY = 0;

function highlightColumn(column) {
  document
    .querySelectorAll('.kanban-column')
    .forEach((col) => col.classList.toggle('is-highlight', col === column));
}

function resetHighlights() {
  document
    .querySelectorAll('.kanban-column')
    .forEach((col) => col.classList.remove('is-highlight'));
}

function getColumnFromPoint(x, y) {
  const element = document.elementFromPoint(x, y);
  return element ? element.closest('.kanban-column') : null;
}

function onPointerMove(event) {
  if (!activeCard) return;
  const x = event.clientX - offsetX;
  const y = event.clientY - offsetY;
  activeCard.style.transform = `translate3d(${x}px, ${y}px, 0)`;

  const column = getColumnFromPoint(event.clientX, event.clientY);
  highlightColumn(column);
}

function onPointerUp(event) {
  if (!activeCard) return;

  const column = getColumnFromPoint(event.clientX, event.clientY);
  if (column) {
    column.querySelector('.card-list').appendChild(activeCard);
  }

  activeCard.classList.remove('is-dragging');
  activeCard.style.transform = '';
  activeCard.style.left = '';
  activeCard.style.top = '';
  activeCard.style.width = '';
  activeCard.releasePointerCapture(event.pointerId);
  activeCard = null;
  resetHighlights();
  document.body.classList.remove('is-dragging');
}

function startDrag(card, event) {
  activeCard = card;
  const rect = card.getBoundingClientRect();
  offsetX = event.clientX - rect.left;
  offsetY = event.clientY - rect.top;
  card.classList.add('is-dragging');
  card.style.left = `${rect.left}px`;
  card.style.top = `${rect.top}px`;
  card.style.width = `${rect.width}px`;
  card.setPointerCapture(event.pointerId);
  document.body.classList.add('is-dragging');
}

function attachCardEvents(card) {
  card.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    startDrag(card, event);
  });

  card.addEventListener('click', () => {
    const title = card.querySelector('h5');
    const details = card.querySelector('p');
    const newTitle = prompt('Editar título do card', title.textContent);
    if (newTitle !== null && newTitle.trim() !== '') {
      title.textContent = newTitle.trim();
    }
    const newDetails = prompt('Editar detalhes do card', details.textContent);
    if (newDetails !== null && newDetails.trim() !== '') {
      details.textContent = newDetails.trim();
    }
  });
}

kanban.querySelectorAll('.kanban-card').forEach(attachCardEvents);

kanban.querySelectorAll('.add-card').forEach((button) => {
  button.addEventListener('click', () => {
    const list = button.closest('.kanban-column').querySelector('.card-list');
    const title = prompt('Nome do novo card');
    if (!title) return;
    const details = prompt('Detalhes do card');

    const card = document.createElement('article');
    card.className = 'kanban-card';
    card.tabIndex = 0;
    card.innerHTML = `<h5>${title}</h5><p>${details || 'Sem detalhes.'}</p>`;
    list.appendChild(card);
    attachCardEvents(card);
  });
});

window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);
