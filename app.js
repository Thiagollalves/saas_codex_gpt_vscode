const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".tab-panel");
const kanban = document.getElementById("kanban");
const addCardButton = document.getElementById("add-card");
const cardTemplate = document.getElementById("card-template");
const themeToggle = document.getElementById("theme-toggle");
const toggleButtons = document.querySelectorAll(".toggle");
const inboxList = document.getElementById("inbox-list");
const chatTitle = document.getElementById("chat-title");
const threadMessages = document.getElementById("thread-messages");
const metaForm = document.getElementById("meta-form");
const metaStatus = document.getElementById("meta-status");
const metaMessage = document.getElementById("meta-message");
const copyEndpoint = document.getElementById("copy-endpoint");

let activeCard = null;
let pointerOffset = { x: 0, y: 0 };

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const userArea = document.getElementById("user-area");
const logoutButton = document.getElementById("logout");

const demoUser = {
  username: "teste",
  password: "1234",
};

const conversations = {
  techlab: {
    title: "TechLab",
    messages: [
      { type: "incoming", text: "Olá, vi a demo e quero fechar o pacote premium ainda hoje.", time: "09:14" },
      { type: "outgoing", text: "Perfeito! Posso te enviar o contrato agora mesmo. Pode confirmar o CNPJ?", time: "09:16" },
      { type: "incoming", text: "Claro, envio em seguida. Também precisamos de integração com o CRM.", time: "09:18" },
    ],
  },
  nuvem: {
    title: "Nuvem Contábil",
    messages: [
      { type: "incoming", text: "Precisamos integrar com o ERP no onboarding.", time: "08:40" },
      { type: "outgoing", text: "Perfeito! Vou encaminhar para o time técnico.", time: "08:45" },
    ],
  },
  pulse: {
    title: "Pulse Marketing",
    messages: [
      { type: "incoming", text: "Queremos testar automações de cobrança.", time: "10:05" },
      { type: "outgoing", text: "Tenho um fluxo pronto. Posso agendar uma call?", time: "10:07" },
    ],
  },
};

const storedTheme = localStorage.getItem("theme");
if (storedTheme === "dark") {
  document.body.setAttribute("data-theme", "dark");
  themeToggle.textContent = "Modo claro";
}

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

  card.addEventListener("dblclick", () => {
    const title = card.querySelector("h3");
    const desc = card.querySelector("p");
    const newTitle = window.prompt("Atualizar título do lead:", title.textContent);
    if (newTitle) title.textContent = newTitle;
    const newDesc = window.prompt("Atualizar observação:", desc.textContent);
    if (newDesc) desc.textContent = newDesc;
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

addCardButton.addEventListener("click", () => {
  const newCard = cardTemplate.content.firstElementChild.cloneNode(true);
  attachCardHandlers(newCard);
  const firstList = kanban.querySelector(".kanban-column .kanban-list");
  if (firstList) firstList.appendChild(newCard);
});

kanban.querySelectorAll(".kanban-card").forEach(attachCardHandlers);

if (inboxList && chatTitle && threadMessages) {
  inboxList.addEventListener("click", (event) => {
    const target = event.target.closest(".inbox-item");
    if (!target) return;
    const contact = target.dataset.contact;
    inboxList.querySelectorAll(".inbox-item").forEach((item) => item.classList.remove("is-active"));
    target.classList.add("is-active");
    const data = conversations[contact];
    if (!data) return;
    chatTitle.textContent = data.title;
    threadMessages.innerHTML = data.messages
      .map(
        (message) => `
        <div class="message ${message.type}">
          <p>${message.text}</p>
          <span>${message.time}</span>
        </div>
      `
      )
      .join("");
  });
}

themeToggle.addEventListener("click", () => {
  const isDark = document.body.getAttribute("data-theme") === "dark";
  if (isDark) {
    document.body.removeAttribute("data-theme");
    localStorage.removeItem("theme");
    themeToggle.textContent = "Modo escuro";
  } else {
    document.body.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "Modo claro";
  }
});

toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("is-on");
    const isOn = button.classList.contains("is-on");
    button.textContent = isOn ? "Ativado" : "Desativado";
    button.dataset.toggle = isOn ? "on" : "off";
  });
});

if (metaForm) {
  const savedMeta = localStorage.getItem("metaConnected");
  if (savedMeta === "true") {
    metaStatus.textContent = "Conectado";
    metaStatus.classList.remove("warning");
    metaStatus.classList.add("success");
    metaMessage.textContent = "Conexão simulada ativa. Token salvo localmente para demo.";
  }

  metaForm.addEventListener("submit", (event) => {
    event.preventDefault();
    metaStatus.textContent = "Conectado";
    metaStatus.classList.remove("warning");
    metaStatus.classList.add("success");
    metaMessage.textContent = "API conectada! Use o endpoint acima para enviar mensagens.";
    localStorage.setItem("metaConnected", "true");
    metaForm.reset();
  });
}

if (copyEndpoint) {
  copyEndpoint.addEventListener("click", async () => {
    const endpoint = "https://graph.facebook.com/v19.0/{phone-number-id}/messages";
    try {
      await navigator.clipboard.writeText(endpoint);
      copyEndpoint.textContent = "Copiado!";
      setTimeout(() => {
        copyEndpoint.textContent = "Copiar endpoint";
      }, 1500);
    } catch (error) {
      copyEndpoint.textContent = "Falhou ao copiar";
    }
  });
}

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
