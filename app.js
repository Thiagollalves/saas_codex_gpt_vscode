const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".tab-panel");
const kanban = document.getElementById("kanban");
const addCardButton = document.getElementById("add-card");
const cardTemplate = document.getElementById("card-template");
const themeToggle = document.getElementById("theme-toggle");
const toggleButtons = document.querySelectorAll(".toggle");

let activeCard = null;
let pointerOffset = { x: 0, y: 0 };

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const userArea = document.getElementById("user-area");
const logoutButton = document.getElementById("logout");
const integrationActions = document.querySelectorAll(".integration-action");
const integrationDetailsButtons = document.querySelectorAll(".integration-details");
const integrationDetails = document.getElementById("integration-details");
const qrPanel = document.getElementById("qr-panel");
const qrRefresh = document.getElementById("qr-refresh");
const qrInput = document.getElementById("whatsapp-qr-input");
const qrImage = document.getElementById("whatsapp-qr-image");
const chatForm = document.getElementById("chat-form");
const chatMessages = document.getElementById("chat-messages");
const chatTitle = document.getElementById("chat-title");
const chatMeta = document.getElementById("chat-meta");
const chatItems = document.querySelectorAll(".chat-item");

const demoUser = {
  username: "teste",
  password: "1234",
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

const integrationCopy = {
  facebook:
    "Facebook conectado para atendimento via Messenger e comentários. Defina filas e automações.",
  instagram:
    "Instagram conectado para Direct e comentários. Ative respostas rápidas e etiquetas.",
  whatsapp:
    "WhatsApp QR pronto para pareamento. Gere um QR Code e escaneie para ativar o número oficial.",
};

const chatData = {
  techlab: {
    title: "TechLab",
    meta: "WhatsApp • Pipeline: Proposta",
    messages: [
      { type: "incoming", text: "Quero fechar o pacote premium ainda hoje.", time: "14:02" },
      { type: "outgoing", text: "Perfeito! Posso gerar o contrato agora mesmo.", time: "14:03" },
    ],
  },
  marina: {
    title: "Marina Costa",
    meta: "Instagram • Interesse em integrações",
    messages: [
      { type: "incoming", text: "Consigo conectar com meu Instagram hoje?", time: "13:48" },
      { type: "outgoing", text: "Sim! Já deixei o fluxo de ativação pronto.", time: "13:49" },
    ],
  },
  mercado: {
    title: "Mercado Dias",
    meta: "Facebook • Segunda via",
    messages: [
      { type: "incoming", text: "Preciso da segunda via do boleto.", time: "13:32" },
      { type: "outgoing", text: "Claro! Envio agora em seguida.", time: "13:33" },
    ],
  },
};

const renderMessages = (messages) => {
  chatMessages.innerHTML = "";
  messages.forEach((message) => {
    const wrapper = document.createElement("div");
    wrapper.className = `message ${message.type}`;
    const text = document.createElement("p");
    text.textContent = message.text;
    const time = document.createElement("span");
    time.textContent = message.time;
    wrapper.append(text, time);
    chatMessages.appendChild(wrapper);
  });
};

const nowTime = () =>
  new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const updateIntegrationDetails = (channel) => {
  const copy = integrationCopy[channel] || integrationCopy.whatsapp;
  integrationDetails.textContent = copy;
  if (channel === "whatsapp") {
    qrPanel.classList.remove("is-hidden");
  } else {
    qrPanel.classList.add("is-hidden");
  }
};

const updateQrCode = () => {
  const value = qrInput.value.trim() || "Kamba-CRM-WhatsApp";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    value
  )}`;
  qrImage.src = qrUrl;
};

integrationActions.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".integration-card");
    if (!card) return;
    const channel = card.dataset.channel;
    updateIntegrationDetails(channel);

    if (channel === "whatsapp") {
      updateQrCode();
      button.textContent = "QR gerado";
      return;
    }

    const badge = card.querySelector(".status-badge");
    const isConnected = badge.classList.contains("online");
    if (isConnected) {
      badge.classList.remove("online");
      badge.classList.add("offline");
      badge.textContent = "Desconectado";
      button.textContent = "Conectar";
    } else {
      badge.classList.remove("offline");
      badge.classList.add("online");
      badge.textContent = "Conectado";
      button.textContent = "Desconectar";
    }
  });
});

integrationDetailsButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".integration-card");
    if (!card) return;
    updateIntegrationDetails(card.dataset.channel);
    if (card.dataset.channel === "whatsapp") {
      updateQrCode();
    }
  });
});

qrRefresh.addEventListener("click", () => {
  updateQrCode();
  qrPanel.classList.add("pulse");
  setTimeout(() => qrPanel.classList.remove("pulse"), 600);
});

chatItems.forEach((item) => {
  item.addEventListener("click", () => {
    chatItems.forEach((other) => other.classList.remove("is-active"));
    item.classList.add("is-active");
    const data = chatData[item.dataset.chat];
    if (!data) return;
    chatTitle.textContent = data.title;
    chatMeta.textContent = data.meta;
    renderMessages(data.messages);
  });
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(chatForm);
  const messageText = data.get("message")?.toString().trim();
  if (!messageText) return;
  const message = { type: "outgoing", text: messageText, time: nowTime() };
  const activeChat = document.querySelector(".chat-item.is-active");
  const key = activeChat?.dataset.chat || "techlab";
  chatData[key].messages.push(message);
  renderMessages(chatData[key].messages);
  chatForm.reset();
});
