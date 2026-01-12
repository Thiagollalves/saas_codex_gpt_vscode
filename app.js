const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".tab-panel");
const kanban = document.getElementById("kanban");
const addCardButton = document.getElementById("add-card");
const cardTemplate = document.getElementById("card-template");
const globalSearch = document.getElementById("global-search");
const crmSearch = document.getElementById("crm-search");

let activeCard = null;
let pointerOffset = { x: 0, y: 0 };
let editingCard = null;

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const userArea = document.getElementById("user-area");
const logoutButton = document.getElementById("logout");

const modal = document.getElementById("card-modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalTag = document.getElementById("modal-tag");
const modalSave = document.getElementById("modal-save");
const modalCancel = document.getElementById("modal-cancel");

const demoUser = {
  username: "teste",
  password: "1234",
};

const openTab = (tab) => {
  tabs.forEach((button) => button.classList.remove("is-active"));
  panels.forEach((panel) => panel.classList.remove("is-active"));

  tab.classList.add("is-active");
  const target = document.getElementById(tab.dataset.target);
  if (target) {
    target.classList.add("is-active");
  }
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => openTab(tab));
});

const attachCardHandlers = (card) => {
  card.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) return;
    activeCard = card;
    activeCard.setPointerCapture(event.pointerId);
    activeCard.classList.add("is-dragging");

    const rect = activeCard.getBoundingClientRect();
    pointerOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    moveCard(event.clientX, event.clientY);
    highlightColumn(event.clientX, event.clientY);
  });

  card.addEventListener("pointermove", (event) => {
    if (!activeCard || !event.isPrimary) return;
    moveCard(event.clientX, event.clientY);
    highlightColumn(event.clientX, event.clientY);
  });

  const endDrag = (event) => {
    if (!activeCard || !event.isPrimary) return;
    const targetColumn = findColumn(event.clientX, event.clientY);
    activeCard.classList.remove("is-dragging");
    activeCard.style.transform = "";
    activeCard.style.left = "";
    activeCard.style.top = "";

    if (targetColumn) {
      const list = targetColumn.querySelector(".kanban-list");
      if (list) list.appendChild(activeCard);
    }

    clearHighlights();
    activeCard.releasePointerCapture(event.pointerId);
    activeCard = null;
  };

  card.addEventListener("pointerup", endDrag);
  card.addEventListener("pointercancel", endDrag);

  card.addEventListener("dblclick", () => openModal(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      openModal(card);
    }
  });
};

const moveCard = (x, y) => {
  if (!activeCard) return;
  activeCard.style.left = `${x - pointerOffset.x}px`;
  activeCard.style.top = `${y - pointerOffset.y}px`;
};

const findColumn = (x, y) => {
  const elements = document.elementsFromPoint(x, y);
  return elements.find((element) => element.classList?.contains("kanban-column"));
};

const highlightColumn = (x, y) => {
  const column = findColumn(x, y);
  clearHighlights();
  if (column) column.classList.add("is-highlight");
};

const clearHighlights = () => {
  document.querySelectorAll(".kanban-column").forEach((column) => {
    column.classList.remove("is-highlight");
  });
};

const filterCards = (query) => {
  const lower = query.trim().toLowerCase();
  kanban.querySelectorAll(".kanban-card").forEach((card) => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(lower) ? "" : "none";
  });
};

const openModal = (card) => {
  editingCard = card;
  modalTitle.value = card.querySelector("h3")?.textContent ?? "";
  modalDescription.value = card.querySelector("p")?.textContent ?? "";
  modalTag.value = card.querySelector(".tag")?.textContent ?? "";
  modal.classList.remove("is-hidden");
};

const closeModal = () => {
  modal.classList.add("is-hidden");
  editingCard = null;
};

modalSave.addEventListener("click", () => {
  if (!editingCard) return;
  const title = editingCard.querySelector("h3");
  const description = editingCard.querySelector("p");
  const tag = editingCard.querySelector(".tag");

  if (title) title.textContent = modalTitle.value;
  if (description) description.textContent = modalDescription.value;
  if (tag) tag.textContent = modalTag.value;

  closeModal();
});

modalCancel.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

globalSearch.addEventListener("input", (event) => {
  const value = event.target.value;
  filterCards(value);
  const crmTab = document.querySelector('[data-target="crm"]');
  if (crmTab) openTab(crmTab);
  crmSearch.value = value;
});

crmSearch.addEventListener("input", (event) => {
  filterCards(event.target.value);
  globalSearch.value = event.target.value;
});

addCardButton.addEventListener("click", () => {
  const newCard = cardTemplate.content.firstElementChild.cloneNode(true);
  attachCardHandlers(newCard);
  const firstList = kanban.querySelector(".kanban-column .kanban-list");
  if (firstList) firstList.appendChild(newCard);
});

kanban.querySelectorAll(".kanban-card").forEach(attachCardHandlers);

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const username = data.get("username");
  const password = data.get("password");

  if (username === demoUser.username && password === demoUser.password) {
    loginError.textContent = "";
    loginForm.reset();
    loginForm.classList.add("is-hidden");
    userArea.classList.remove("is-hidden");
  } else {
    loginError.textContent = "Usuário ou senha inválidos.";
  }
});

logoutButton.addEventListener("click", () => {
  userArea.classList.add("is-hidden");
  loginForm.classList.remove("is-hidden");
});
