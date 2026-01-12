const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".tab-panel");
const kanban = document.getElementById("kanban");
const addCardButton = document.getElementById("add-card");
const cardTemplate = document.getElementById("card-template");
const searchInput = document.getElementById("global-search");

let activeCard = null;
let pointerOffset = { x: 0, y: 0 };
let cardBeingEdited = null;

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const userArea = document.getElementById("user-area");
const logoutButton = document.getElementById("logout");

const modal = document.getElementById("edit-modal");
const closeModalButton = document.getElementById("close-modal");
const saveCardButton = document.getElementById("save-card");
const editTitle = document.getElementById("edit-title");
const editDescription = document.getElementById("edit-description");
const editTag = document.getElementById("edit-tag");
const editOwner = document.getElementById("edit-owner");

const demoUser = {
  username: "teste",
  password: "1234",
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((button) => button.classList.remove("is-active"));
    panels.forEach((panel) => panel.classList.remove("is-active"));

    tab.classList.add("is-active");
    const target = document.getElementById(tab.dataset.target);
    if (target) {
      target.classList.add("is-active");
    }
  });
});

const attachCardHandlers = (card) => {
  const editButton = card.querySelector(".edit-card");

  card.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) return;
    if (event.target.closest(".edit-card")) return;
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

  if (editButton) {
    editButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openEditModal(card);
    });
  }
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

const openEditModal = (card) => {
  cardBeingEdited = card;
  editTitle.value = card.querySelector("h3")?.textContent ?? "";
  editDescription.value = card.querySelector("p")?.textContent ?? "";
  editTag.value = card.querySelector(".tag")?.textContent ?? "";
  editOwner.value = card.querySelector(".owner")?.textContent ?? "";
  modal.classList.remove("is-hidden");
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  modal.classList.add("is-hidden");
  modal.setAttribute("aria-hidden", "true");
  cardBeingEdited = null;
};

addCardButton.addEventListener("click", () => {
  const newCard = cardTemplate.content.firstElementChild.cloneNode(true);
  attachCardHandlers(newCard);
  const firstList = kanban.querySelector(".kanban-column .kanban-list");
  if (firstList) firstList.appendChild(newCard);
});

kanban.querySelectorAll(".kanban-card").forEach(attachCardHandlers);

searchInput.addEventListener("input", (event) => {
  const query = event.target.value.toLowerCase();
  kanban.querySelectorAll(".kanban-card").forEach((card) => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query) ? "grid" : "none";
  });
});

closeModalButton.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

saveCardButton.addEventListener("click", () => {
  if (!cardBeingEdited) return;
  const title = cardBeingEdited.querySelector("h3");
  const description = cardBeingEdited.querySelector("p");
  const tag = cardBeingEdited.querySelector(".tag");
  const owner = cardBeingEdited.querySelector(".owner");

  if (title) title.textContent = editTitle.value.trim() || "Lead";
  if (description) description.textContent = editDescription.value.trim() || "";
  if (tag) tag.textContent = editTag.value.trim() || "Novo";
  if (owner) owner.textContent = editOwner.value.trim() || "Equipe";

  closeModal();
});

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
