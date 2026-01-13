const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".tab-panel");
const kanban = document.getElementById("kanban");
const addCardButton = document.getElementById("add-card");
const cardTemplate = document.getElementById("card-template");
const themeToggle = document.getElementById("theme-toggle");
const toggleButtons = document.querySelectorAll(".toggle");
const actionButtons = document.querySelectorAll("[data-action]");
const toastContainer = document.getElementById("toast-container");
const draggableItems = document.querySelectorAll("[data-draggable=\"true\"]");
const dropzones = document.querySelectorAll("[data-dropzone]");
const globalSearch = document.getElementById("global-search");
const supportSearch = document.getElementById("support-search");
const notificationPanel = document.getElementById("notification-panel");

let activeDrag = null;
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
const qrTokenInput = document.getElementById("qr-token");
const qrImage = document.getElementById("qr-image");
const supportCards = document.querySelectorAll(".support-card");
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

const activateTab = (targetId) => {
  const tab = document.querySelector(`.tab-button[data-target="${targetId}"]`);
  if (!tab) return;
  tab.click();
};

const showToast = (message) => {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
};

const actionMessages = {
  "filter-crm": "Filtro aplicado às oportunidades do CRM.",
  "export-crm": "Exportação iniciada. Você receberá um arquivo em instantes.",
  notifications: "Notificações atualizadas.",
  profile: "Abrindo perfil do usuário.",
  "agent-panel": "Painel de agentes aberto.",
  "new-support": "Novo atendimento criado.",
  "tag-chat": "Etiquetas do atendimento atualizadas.",
  "transfer-chat": "Selecione um agente para transferência.",
  "omni-dashboard": "Abrindo painel omnichannel.",
  "create-queue": "Nova fila criada.",
  sla: "SLA atualizado.",
  routing: "Regras de distribuição sincronizadas.",
  "manage-shifts": "Escalas atualizadas.",
  "create-automation": "Automação criada com sucesso.",
  "reply-now": "Abrindo resposta rápida.",
  "save-profile": "Alterações do perfil salvas.",
  "manage-api": "Gerenciamento de API aberto.",
  "update-preferences": "Preferências atualizadas.",
};

const toggleNotifications = () => {
  if (!notificationPanel) return;
  notificationPanel.classList.toggle("is-hidden");
};

const exportCrm = () => {
  const cards = document.querySelectorAll(".kanban-card");
  const rows = [["Lead", "Detalhe", "Etapa"]];
  cards.forEach((card) => {
    const title = card.querySelector("h3")?.textContent || "";
    const detail = card.querySelector("p")?.textContent || "";
    const column = card.closest(".kanban-column");
    const stage = column?.querySelector("h2")?.textContent || "";
    rows.push([title, detail, stage]);
  });
  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "crm-export.csv";
  link.click();
  URL.revokeObjectURL(link.href);
};

const toggleCrmFilter = () => {
  document.body.classList.toggle("crm-filtered");
};

const createSupportCard = () => {
  const supportList = document.querySelector(".support-list");
  if (!supportList) return;
  const newId = `novo-${Date.now()}`;
  const card = document.createElement("button");
  card.type = "button";
  card.className = "support-card";
  card.dataset.chat = newId;
  card.dataset.draggable = "true";
  card.dataset.search = "Novo cliente WhatsApp";
  card.innerHTML = "<strong>Novo Cliente</strong><span>WhatsApp • Novo</span><p>Quero iniciar atendimento.</p>";
  supportList.appendChild(card);
  makeDraggable(card);
  supportCards.forEach((item) => item.classList.remove("is-active"));
  card.classList.add("is-active");
  chatData[newId] = {
    title: "Novo Cliente",
    channel: "WhatsApp • Novo",
    messages: [{ text: "Olá! Gostaria de suporte.", time: "Agora", type: "incoming" }],
  };
  renderChat(newId);
  card.addEventListener("click", () => {
    supportCards.forEach((item) => item.classList.remove("is-active"));
    card.classList.add("is-active");
    renderChat(card.dataset.chat);
  });
};

const createQueueCard = () => {
  const firstColumn = document.querySelector(".service-column");
  if (!firstColumn) return;
  const card = document.createElement("div");
  card.className = "service-card";
  card.dataset.draggable = "true";
  card.dataset.search = "Novo atendimento";
  card.innerHTML = "<strong>Novo Atendimento</strong><p>Cliente aguardando resposta.</p><span class=\"tag\">Pendente</span>";
  firstColumn.appendChild(card);
  makeDraggable(card);
};

const createAutomationTag = () => {
  const list = document.querySelector(".whatsapp-panel ul");
  if (!list) return;
  const item = document.createElement("li");
  item.textContent = "✅ Nova automação criada.";
  list.appendChild(item);
};

const replyNow = () => {
  activateTab("atendimentos");
  chatForm?.querySelector("input[name=\"message\"]")?.focus();
};

const saveProfile = () => {
  const name = document.querySelector("#user-area input[type=\"text\"]")?.value || "";
  const email = document.querySelector("#user-area input[type=\"email\"]")?.value || "";
  localStorage.setItem("profileName", name);
  localStorage.setItem("profileEmail", email);
};

const updatePreferences = () => {
  const selects = document.querySelectorAll("#settings select");
  selects.forEach((select) => {
    localStorage.setItem(`pref-${select.name || select.parentElement?.textContent}`, select.value);
  });
};

const toggleAgentPanel = () => {
  const panel = document.querySelector(".agent-panel");
  if (!panel) return;
  panel.classList.toggle("is-hidden");
};

const toggleAgentStatus = () => {
  const badge = document.querySelector(".agent-card .status-badge");
  if (!badge) return;
  if (badge.classList.contains("online")) {
    badge.classList.remove("online");
    badge.classList.add("busy");
    badge.textContent = "Pausa";
  } else {
    badge.classList.remove("busy");
    badge.classList.add("online");
    badge.textContent = "Online";
  }
};

const actionHandlers = {
  notifications: toggleNotifications,
  "export-crm": exportCrm,
  "filter-crm": toggleCrmFilter,
  "agent-panel": toggleAgentPanel,
  "new-support": createSupportCard,
  "create-queue": createQueueCard,
  "create-automation": createAutomationTag,
  "reply-now": replyNow,
  "save-profile": saveProfile,
  "update-preferences": updatePreferences,
  "manage-shifts": toggleAgentStatus,
  profile: () => activateTab("settings"),
};

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    actionHandlers[action]?.();
    const message = actionMessages[action] || "Ação executada.";
    showToast(message);
  });
});

const normalizeText = (value) => (value || "").toLowerCase().trim();

const applySearchFilter = (items, query) => {
  const normalized = normalizeText(query);
  let matches = 0;
  items.forEach((item) => {
    const haystack = normalizeText(item.dataset.search || item.textContent);
    const isMatch = normalized.length === 0 || haystack.includes(normalized);
    item.classList.toggle("is-filtered", !isMatch);
    if (isMatch) matches += 1;
  });
  return matches;
};

if (globalSearch) {
  globalSearch.addEventListener("input", () => {
    const items = document.querySelectorAll("[data-search]");
    applySearchFilter(items, globalSearch.value);
  });

  globalSearch.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const items = document.querySelectorAll("[data-search]");
    const matches = applySearchFilter(items, globalSearch.value);
    if (matches === 0) {
      showToast("Nenhum resultado encontrado.");
    }
  });
}

if (supportSearch) {
  supportSearch.addEventListener("input", () => {
    const items = document.querySelectorAll(".support-card");
    applySearchFilter(items, supportSearch.value);
  });
}

const findDropzone = (x, y) => {
  const elements = document.elementsFromPoint(x, y);
  return elements.find((element) => element.dataset?.dropzone);
};

const clearDropzones = () => {
  dropzones.forEach((zone) => zone.classList.remove("dropzone-highlight"));
};

const makeDraggable = (item) => {
  item.classList.add("draggable-item");
  item.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) return;
    const interactive = event.target.closest("button, input, textarea, select, a");
    if (interactive && interactive !== item) return;
    activeDrag = {
      element: item,
      parent: item.parentElement,
      nextSibling: item.nextElementSibling,
    };
    item.setPointerCapture(event.pointerId);
    item.classList.add("is-dragging");

    const rect = item.getBoundingClientRect();
    pointerOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    item.style.width = `${rect.width}px`;
    item.style.left = `${event.clientX - pointerOffset.x}px`;
    item.style.top = `${event.clientY - pointerOffset.y}px`;
  });

  item.addEventListener("pointermove", (event) => {
    if (!activeDrag || activeDrag.element !== item || !event.isPrimary) return;
    item.style.left = `${event.clientX - pointerOffset.x}px`;
    item.style.top = `${event.clientY - pointerOffset.y}px`;
    const zone = findDropzone(event.clientX, event.clientY);
    clearDropzones();
    if (zone) zone.classList.add("dropzone-highlight");
  });

  const endDrag = (event) => {
    if (!activeDrag || activeDrag.element !== item || !event.isPrimary) return;
    const zone = findDropzone(event.clientX, event.clientY);
    item.classList.remove("is-dragging");
    item.style.left = "";
    item.style.top = "";
    item.style.width = "";
    item.style.transform = "";

    if (zone) {
      zone.appendChild(item);
    } else if (activeDrag.parent) {
      activeDrag.parent.insertBefore(item, activeDrag.nextSibling);
    }
    clearDropzones();
    item.releasePointerCapture(event.pointerId);
    activeDrag = null;
  };

  item.addEventListener("pointerup", endDrag);
  item.addEventListener("pointercancel", endDrag);
};

const attachCardHandlers = (card) => {
  card.addEventListener("dblclick", () => {
    const title = card.querySelector("h3");
    const desc = card.querySelector("p");
    const newTitle = window.prompt("Atualizar título do lead:", title.textContent);
    if (newTitle) title.textContent = newTitle;
    const newDesc = window.prompt("Atualizar observação:", desc.textContent);
    if (newDesc) desc.textContent = newDesc;
  });
};

addCardButton.addEventListener("click", () => {
  const newCard = cardTemplate.content.firstElementChild.cloneNode(true);
  attachCardHandlers(newCard);
  makeDraggable(newCard);
  const firstList = kanban.querySelector(".kanban-column .kanban-list");
  if (firstList) firstList.appendChild(newCard);
});

kanban.querySelectorAll(".kanban-card").forEach(attachCardHandlers);
draggableItems.forEach(makeDraggable);

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

const updateIntegrationDetails = (channel) => {
  if (!integrationDetails) return;
  const copy = integrationCopy[channel] || integrationCopy.whatsapp;
  integrationDetails.textContent = copy;
  if (channel === "whatsapp") {
    qrPanel.classList.remove("is-hidden");
  } else {
    qrPanel.classList.add("is-hidden");
  }
};

const generateQrCode = (token) => {
  if (!qrImage) return;
  const safeToken = token?.trim() || "kamba-whatsapp-session";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    safeToken
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
      const token = qrTokenInput?.value;
      generateQrCode(token);
      const badge = card.querySelector(".status-badge");
      badge.classList.remove("offline");
      badge.classList.add("online");
      badge.textContent = "Conectado";
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
  qrPanel.classList.add("pulse");
  generateQrCode(qrTokenInput?.value);
  setTimeout(() => qrPanel.classList.remove("pulse"), 600);
});

const chatData = {
  techlab: {
    title: "TechLab",
    channel: "WhatsApp • Prioridade alta",
    messages: [
      { text: "Oi! Preciso fechar o pacote premium ainda hoje.", time: "09:14", type: "incoming" },
      { text: "Posso te ajudar com o checkout agora mesmo.", time: "09:15", type: "outgoing" },
    ],
  },
  marina: {
    title: "Marina Costa",
    channel: "Instagram • Novo",
    messages: [
      { text: "Quero integrar o CRM com o Instagram.", time: "09:02", type: "incoming" },
      { text: "Perfeito! Vou te enviar os próximos passos.", time: "09:03", type: "outgoing" },
    ],
  },
  padaria: {
    title: "Padaria Central",
    channel: "Facebook • Atendimento",
    messages: [
      { text: "Estou com problema no boleto.", time: "08:44", type: "incoming" },
      { text: "Vou gerar uma segunda via para você.", time: "08:45", type: "outgoing" },
    ],
  },
};

const renderChat = (key) => {
  const data = chatData[key];
  if (!data || !chatMessages) return;
  chatTitle.textContent = data.title;
  chatChannel.textContent = data.channel;
  chatMessages.innerHTML = "";
  data.messages.forEach((message) => {
    const wrapper = document.createElement("div");
    wrapper.className = `message ${message.type}`;
    wrapper.innerHTML = `<p>${message.text}</p><span>${message.time}</span>`;
    chatMessages.appendChild(wrapper);
  });
};

supportCards.forEach((card) => {
  card.addEventListener("click", () => {
    supportCards.forEach((item) => item.classList.remove("is-active"));
    card.classList.add("is-active");
    renderChat(card.dataset.chat);
  });
});

if (chatForm) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(chatForm);
    const message = formData.get("message");
    if (!message || !chatMessages) return;
    const wrapper = document.createElement("div");
    wrapper.className = "message outgoing";
    const now = new Date();
    const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    wrapper.innerHTML = `<p>${message}</p><span>${time}</span>`;
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatForm.reset();
  });
}
