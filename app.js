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
const searchItems = document.querySelectorAll("[data-search-item]");
const topSearchInput = document.querySelector(".top-search input");
const supportSearchInput = document.querySelector(".support-search input");
const settingsSelects = document.querySelectorAll(".settings-card select");
const settingsInputs = document.querySelectorAll(".settings-card input[type=\"text\"], .settings-card input[type=\"email\"]");

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

const showToast = (message) => {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
};

const filterItems = (items, query) => {
  const normalized = query.trim().toLowerCase();
  let visibleCount = 0;
  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    const isVisible = !(normalized && !text.includes(normalized));
    item.style.display = isVisible ? "" : "none";
    if (isVisible) visibleCount += 1;
  });
  return visibleCount;
};

const actionMessages = {
  "filter-crm": "Filtro aplicado às oportunidades do CRM.",
  "export-crm": "Exportação iniciada. Você receberá um arquivo em instantes.",
  notifications: "Notificações atualizadas.",
  profile: "Abrindo perfil do usuário.",
  "refresh-dashboard": "Dashboard atualizado.",
  "export-dashboard": "Exportação do dashboard iniciada.",
  "collapse-config": "Configurações recolhidas.",
  "open-plugin": "Abrindo configurações de plug-ins.",
  "lead-status": "Abrindo status de leads.",
  "quick-messages": "Configurando mensagens rápidas.",
  labels: "Abrindo etiquetas.",
  "closure-reasons": "Abrindo motivos de fechamento.",
  "templates-sync": "Sincronizando templates.",
  "users-config": "Abrindo gestão de usuários.",
  departments: "Abrindo departamentos.",
  "custom-fields": "Abrindo campos customizados.",
  "refresh-campaigns": "Campanhas atualizadas.",
  "new-campaign": "Criando campanha WhatsApp.",
  "new-campaign-waba": "Criando campanha WABA.",
  "campaign-edit": "Editando campanha.",
  "campaign-report": "Abrindo relatório da campanha.",
  "funnels-refresh": "Funis atualizados.",
  "funnels-history": "Abrindo histórico de envios.",
  "funnels-new": "Criando novo funil.",
  "funnels-edit": "Editando funil.",
  "funnels-copy": "Funil duplicado.",
  "flow-add": "Criando novo fluxo.",
  "flow-edit": "Editando fluxo.",
  "flow-clone": "Fluxo duplicado.",
  "toggle-inactive": "Ocultando conexões inativas.",
  "notify-me": "Notificações ativadas.",
  "add-connection": "Assistente de conexão aberto.",
  "import-contacts": "Importação de contatos iniciada.",
  disconnect: "Conexão encerrada.",
  "contacts-add": "Novo contato em criação.",
  "contacts-import": "Importação de contatos aberta.",
  "contacts-delete": "Selecione contatos para apagar.",
  "contacts-export": "Exportação de contatos iniciada.",
  "contact-chat": "Abrindo chat do contato.",
  "contact-edit": "Editando contato.",
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

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const message = actionMessages[button.dataset.action] || "Ação executada.";
    showToast(message);
  });
});

if (topSearchInput) {
  topSearchInput.addEventListener("input", (event) => {
    filterItems(searchItems, event.target.value);
  });
  topSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const query = event.target.value.trim();
      const results = filterItems(searchItems, query);
      showToast(
        `Busca global: ${query || "todos os resultados"} (${results} encontrados)`
      );
    }
  });
}

if (supportSearchInput) {
  supportSearchInput.addEventListener("input", (event) => {
    filterItems(supportCards, event.target.value);
  });
}

settingsSelects.forEach((select) => {
  select.addEventListener("change", () => {
    showToast(`Preferência atualizada: ${select.value}`);
  });
});

settingsInputs.forEach((input) => {
  input.addEventListener("blur", () => {
    if (!input.value) return;
    showToast(`${input.name || "Campo"} atualizado.`);
  });
});

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
    if (event.target !== item && event.target.closest("button, input, textarea, select, a")) return;
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
  showToast("Novo lead adicionado ao funil.");
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
    showToast(`Segurança: ${isOn ? "ativado" : "desativado"}.`);
  });
});

if (loginForm) {
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
      showToast("Login realizado com sucesso.");
    } else {
      loginError.textContent = "Usuário ou senha inválidos.";
      showToast("Falha no login. Verifique usuário e senha.");
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    userArea.classList.add("is-hidden");
    loginForm.classList.remove("is-hidden");
    showToast("Você saiu da conta.");
  });
}

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

if (qrTokenInput) {
  qrTokenInput.addEventListener("change", () => {
    const token = qrTokenInput.value.trim();
    if (!token) {
      showToast("Informe um token válido para gerar o QR.");
      return;
    }
    generateQrCode(token);
    showToast("QR atualizado para o novo token.");
  });
}

if (qrImage) {
  qrImage.addEventListener("error", () => {
    showToast("Não foi possível carregar o QR. Tente novamente.");
  });
}

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

if (qrRefresh) {
  qrRefresh.addEventListener("click", () => {
    qrPanel.classList.add("pulse");
    generateQrCode(qrTokenInput?.value);
    setTimeout(() => qrPanel.classList.remove("pulse"), 600);
  });
}

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
    const trimmedMessage = message?.trim();
    if (!trimmedMessage || !chatMessages) {
      showToast("Digite uma mensagem antes de enviar.");
      return;
    }
    const wrapper = document.createElement("div");
    wrapper.className = "message outgoing";
    const now = new Date();
    const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    wrapper.innerHTML = `<p>${trimmedMessage}</p><span>${time}</span>`;
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatForm.reset();
  });
}
