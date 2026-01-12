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
const qrImage = document.getElementById("qr-image");
const qrToken = document.getElementById("qr-token");
const supportItems = document.querySelectorAll(".support-item");
const chatTitle = document.getElementById("chat-title");
const chatChannel = document.getElementById("chat-channel");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");

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
    "WhatsApp QR pronto para pareamento. Escaneie para ativar o número oficial.",
};

const supportThreads = {
  techlab: {
    title: "TechLab",
    channel: "Canal: WhatsApp • SLA 5m",
    messages: [
      { from: "customer", text: "Preciso do pacote premium ainda hoje.", time: "10:02" },
      { from: "agent", text: "Claro! Posso enviar o link de pagamento agora.", time: "10:03" },
    ],
  },
  marina: {
    title: "Marina Costa",
    channel: "Canal: Instagram • SLA 8m",
    messages: [
      { from: "customer", text: "Integração com CRM está pronta?", time: "09:45" },
      { from: "agent", text: "Sim! Posso ativar hoje. Quer agendar?", time: "09:46" },
    ],
  },
  hotel: {
    title: "Hotel Brisa",
    channel: "Canal: Facebook • SLA 10m",
    messages: [
      { from: "customer", text: "Quero falar sobre upgrade.", time: "08:30" },
      { from: "agent", text: "Vamos conferir o melhor plano para vocês.", time: "08:32" },
    ],
  },
};

const renderMessages = (thread) => {
  chatMessages.innerHTML = "";
  thread.messages.forEach((message) => {
    const bubble = document.createElement("div");
    bubble.className = `message ${message.from}`;
    bubble.innerHTML = `<p>${message.text}</p><span>${message.time}</span>`;
    chatMessages.appendChild(bubble);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const generateQrToken = () =>
  `WA-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

const updateQr = () => {
  const token = generateQrToken();
  qrToken.textContent = `Token: ${token}`;
  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    token
  )}`;
  qrImage.alt = `QR Code ${token}`;
};

const updateIntegrationDetails = (channel) => {
  const copy = integrationCopy[channel] || integrationCopy.whatsapp;
  integrationDetails.textContent = copy;
  if (channel === "whatsapp") {
    qrPanel.classList.remove("is-hidden");
    updateQr();
  } else {
    qrPanel.classList.add("is-hidden");
  }
};

integrationActions.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".integration-card");
    if (!card) return;
    const channel = card.dataset.channel;
    updateIntegrationDetails(channel);

    if (channel === "whatsapp") {
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
  });
});

qrRefresh.addEventListener("click", () => {
  updateQr();
  qrPanel.classList.add("pulse");
  setTimeout(() => qrPanel.classList.remove("pulse"), 600);
});

supportItems.forEach((item) => {
  item.addEventListener("click", () => {
    supportItems.forEach((btn) => btn.classList.remove("is-active"));
    item.classList.add("is-active");
    const thread = supportThreads[item.dataset.thread];
    if (!thread) return;
    chatTitle.textContent = thread.title;
    chatChannel.textContent = thread.channel;
    renderMessages(thread);
  });
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(chatForm);
  const text = data.get("message");
  if (!text) return;
  const time = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const bubble = document.createElement("div");
  bubble.className = "message agent";
  bubble.innerHTML = `<p>${text}</p><span>${time}</span>`;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  chatForm.reset();
});

renderMessages(supportThreads.techlab);
