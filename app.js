const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");

const baseCards = [
  {
    title: "Hotel Atlântico",
    tag: "Lead quente",
    body: "Quer integração com WhatsApp e automações.",
    owner: "Maria C.",
    value: "R$ 18k",
    stage: "novos",
  },
  {
    title: "Clínica Viva",
    tag: "Novo",
    body: "Primeiro contato via landing page.",
    owner: "João P.",
    value: "R$ 9k",
    stage: "novos",
  },
  {
    title: "AgroTech",
    tag: "Em negociação",
    body: "Reunião marcada para sexta.",
    owner: "Lia R.",
    value: "R$ 42k",
    stage: "contato",
  },
  {
    title: "Grupo Solaris",
    tag: "Urgente",
    body: "Precisa da proposta final hoje.",
    owner: "Fernanda S.",
    value: "R$ 24k",
    stage: "proposta",
  },
  {
    title: "Nuvem Labs",
    tag: "Fechado",
    body: "Contrato assinado, kickoff segunda.",
    owner: "Igor M.",
    value: "R$ 33k",
    stage: "fechado",
  },
];

const template = document.getElementById("card-template");
const board = document.getElementById("kanban-board");
const addCardButton = document.getElementById("add-card");
const resetBoardButton = document.getElementById("reset-board");

const loginForm = document.getElementById("login-form");
const loginFeedback = document.getElementById("login-feedback");
const profileForm = document.getElementById("profile-form");
const profileFeedback = document.getElementById("profile-feedback");

let dragState = null;

const stageTitles = {
  novos: "Novo",
  contato: "Contato",
  proposta: "Proposta",
  fechado: "Fechado",
};

const initialCards = JSON.parse(JSON.stringify(baseCards));

const updateCounts = () => {
  document.querySelectorAll(".column-body").forEach((column) => {
    const stage = column.dataset.column;
    const count = column.querySelectorAll(".kanban-card").length;
    const countEl = document.querySelector(`[data-count="${stage}"]`);
    if (countEl) {
      countEl.textContent = count;
    }
  });
};

const createCardElement = (data) => {
  const card = template.content.firstElementChild.cloneNode(true);
  card.querySelector("h4").textContent = data.title;
  card.querySelector(".tag").textContent = data.tag;
  card.querySelector(".card-body").textContent = data.body;
  card.querySelector(".owner").textContent = data.owner;
  card.querySelector(".value").textContent = data.value;
  card.dataset.stage = data.stage;
  setupDragHandlers(card);
  return card;
};

const loadBoard = (cards) => {
  document.querySelectorAll(".column-body").forEach((column) => {
    column.innerHTML = "";
  });

  cards.forEach((data) => {
    const card = createCardElement(data);
    const column = document.querySelector(`[data-column="${data.stage}"]`);
    if (column) {
      column.appendChild(card);
    }
  });

  updateCounts();
};

const setActiveTab = (tabName) => {
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabName);
  });
};

const getColumnFromPoint = (x, y) => {
  const element = document.elementFromPoint(x, y);
  if (!element) return null;
  return element.closest(".column-body");
};

const clearColumnHighlights = () => {
  document.querySelectorAll(".column-body").forEach((column) => {
    column.classList.remove("drag-over");
  });
};

const placeCard = (card, column) => {
  column.appendChild(card);
  card.dataset.stage = column.dataset.column;
  updateCounts();
};

const startDrag = (event, card) => {
  event.preventDefault();
  const rect = card.getBoundingClientRect();
  const placeholder = document.createElement("div");
  placeholder.className = "kanban-card placeholder";
  placeholder.style.height = `${rect.height}px`;
  placeholder.style.border = "2px dashed #c7d2fe";
  placeholder.style.background = "transparent";

  const originColumn = card.parentElement;
  const originIndex = Array.from(originColumn.children).indexOf(card);
  originColumn.insertBefore(placeholder, card);

  card.classList.add("dragging");
  card.style.position = "fixed";
  card.style.left = `${rect.left}px`;
  card.style.top = `${rect.top}px`;
  card.style.width = `${rect.width}px`;
  card.style.zIndex = 1000;

  document.body.appendChild(card);

  dragState = {
    card,
    placeholder,
    originColumn,
    originIndex,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
  };
};

const moveDrag = (event) => {
  if (!dragState) return;
  const { card, offsetX, offsetY } = dragState;
  card.style.left = `${event.clientX - offsetX}px`;
  card.style.top = `${event.clientY - offsetY}px`;

  const column = getColumnFromPoint(event.clientX, event.clientY);
  clearColumnHighlights();
  if (column) {
    column.classList.add("drag-over");
  }
};

const endDrag = (event) => {
  if (!dragState) return;
  const { card, placeholder, originColumn, originIndex } = dragState;
  const column = getColumnFromPoint(event.clientX, event.clientY);
  clearColumnHighlights();

  card.classList.remove("dragging");
  card.style.position = "";
  card.style.left = "";
  card.style.top = "";
  card.style.width = "";
  card.style.zIndex = "";

  if (column) {
    column.appendChild(card);
    card.dataset.stage = column.dataset.column;
  } else {
    const children = Array.from(originColumn.children);
    const referenceNode = children[originIndex] || null;
    originColumn.insertBefore(card, referenceNode);
  }

  placeholder.remove();
  dragState = null;
  updateCounts();
};

const setupDragHandlers = (card) => {
  card.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    startDrag(event, card);
    card.setPointerCapture(event.pointerId);
  });

  card.addEventListener("pointermove", (event) => {
    if (!dragState) return;
    if (dragState.card !== card) return;
    moveDrag(event);
  });

  card.addEventListener("pointerup", (event) => {
    if (!dragState || dragState.card !== card) return;
    endDrag(event);
  });

  card.addEventListener("pointercancel", (event) => {
    if (!dragState || dragState.card !== card) return;
    endDrag(event);
  });
};

const addNewCard = () => {
  const nextId = Math.floor(Math.random() * 900 + 100);
  const card = createCardElement({
    title: `Lead ${nextId}`,
    tag: "Novo",
    body: "Contato iniciado via WhatsApp.",
    owner: "Time SDR",
    value: "R$ 6k",
    stage: "novos",
  });
  const column = document.querySelector('[data-column="novos"]');
  column.appendChild(card);
  updateCounts();
};

const resetBoard = () => {
  loadBoard(initialCards);
};

const handleLogin = (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const email = formData.get("email");
  const password = formData.get("password");

  if (email === "demo@kamba.com" && password === "123456") {
    loginFeedback.textContent = "Login aprovado! Agora você pode editar o perfil.";
    profileForm.classList.remove("disabled");
    const profileButton = profileForm.querySelector("button");
    profileButton.classList.remove("ghost");
    profileButton.classList.add("primary");
  } else {
    loginFeedback.textContent = "Credenciais inválidas. Use o login de teste.";
  }
};

const handleProfileSave = (event) => {
  event.preventDefault();
  profileFeedback.textContent = "Dados salvos com sucesso!";
};

addCardButton.addEventListener("click", addNewCard);
resetBoardButton.addEventListener("click", resetBoard);

loginForm.addEventListener("submit", handleLogin);
profileForm.addEventListener("submit", handleProfileSave);

board.addEventListener("pointerleave", () => {
  if (!dragState) return;
  clearColumnHighlights();
});

window.addEventListener("pointerup", (event) => {
  if (!dragState) return;
  endDrag(event);
});

window.addEventListener("pointermove", (event) => {
  if (!dragState) return;
  moveDrag(event);
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
});

loadBoard(initialCards);
