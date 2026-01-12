const navButtons = document.querySelectorAll(".nav__btn");
const tabs = document.querySelectorAll(".tab");

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    navButtons.forEach((btn) => btn.classList.remove("is-active"));
    tabs.forEach((tab) => tab.classList.remove("is-active"));

    button.classList.add("is-active");
    const target = document.getElementById(button.dataset.tab);
    if (target) {
      target.classList.add("is-active");
    }
  });
});

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    const email = data.get("email");
    const password = data.get("password");

    if (email === "teste@kamba.com" && password === "123456") {
      loginMessage.textContent = "Login realizado com sucesso!";
      loginMessage.style.color = "#1a9b5f";
    } else {
      loginMessage.textContent = "Credenciais inválidas. Use o login de teste.";
      loginMessage.style.color = "#e04444";
    }
  });
}

const kanban = document.getElementById("kanban");
let draggingCard = null;
let placeholder = null;
let offsetX = 0;
let offsetY = 0;

const startDrag = (card, pointerEvent) => {
  const rect = card.getBoundingClientRect();
  draggingCard = card;
  card.classList.add("dragging");

  placeholder = document.createElement("div");
  placeholder.className = "placeholder";
  placeholder.style.height = `${rect.height}px`;
  placeholder.style.width = "100%";
  card.parentElement.insertBefore(placeholder, card.nextSibling);

  const kanbanRect = kanban.getBoundingClientRect();
  offsetX = pointerEvent.clientX - rect.left;
  offsetY = pointerEvent.clientY - rect.top;

  card.style.left = `${rect.left - kanbanRect.left}px`;
  card.style.top = `${rect.top - kanbanRect.top}px`;

  kanban.appendChild(card);
  card.setPointerCapture(pointerEvent.pointerId);
};

const moveDrag = (pointerEvent) => {
  if (!draggingCard) return;
  const kanbanRect = kanban.getBoundingClientRect();
  const left = pointerEvent.clientX - kanbanRect.left - offsetX;
  const top = pointerEvent.clientY - kanbanRect.top - offsetY;
  draggingCard.style.left = `${left}px`;
  draggingCard.style.top = `${top}px`;

  const element = document.elementFromPoint(
    pointerEvent.clientX,
    pointerEvent.clientY
  );
  const column = element ? element.closest(".column") : null;
  if (!column) return;

  const list = column.querySelector(".column__list");
  if (!list) return;

  const cards = [...list.querySelectorAll(".kanban-card:not(.dragging)")];
  let inserted = false;
  for (const card of cards) {
    const cardRect = card.getBoundingClientRect();
    if (pointerEvent.clientY < cardRect.top + cardRect.height / 2) {
      list.insertBefore(placeholder, card);
      inserted = true;
      break;
    }
  }
  if (!inserted) {
    list.appendChild(placeholder);
  }
};

const endDrag = (pointerEvent) => {
  if (!draggingCard) return;
  draggingCard.classList.remove("dragging");
  draggingCard.style.left = "";
  draggingCard.style.top = "";
  draggingCard.style.width = "";

  if (placeholder) {
    placeholder.replaceWith(draggingCard);
  }

  draggingCard.releasePointerCapture(pointerEvent.pointerId);
  draggingCard = null;
  placeholder = null;
};

if (kanban) {
  kanban.addEventListener("pointerdown", (event) => {
    const card = event.target.closest(".kanban-card");
    if (!card) return;
    startDrag(card, event);
  });

  kanban.addEventListener("pointermove", moveDrag);
  kanban.addEventListener("pointerup", endDrag);
  kanban.addEventListener("pointercancel", endDrag);
}
