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
const globalSearchInput = document.getElementById("global-search");
const supportSearchInput = document.getElementById("support-search");
const actionPanel = document.getElementById("action-panel");
const actionTitle = document.getElementById("action-title");
const actionBody = document.getElementById("action-body");
const actionExtra = document.getElementById("action-extra");
const actionClose = document.getElementById("action-close");
const automationList = document.getElementById("automation-list");
const prefLanguage = document.getElementById("pref-language");
const prefTimezone = document.getElementById("pref-timezone");

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
const supportList = document.querySelector(".support-list");
const chatTitle = document.getElementById("chat-title");
const chatChannel = document.getElementById("chat-channel");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const getSupportCards = () => supportList?.querySelectorAll(".support-card") || [];

const demoUser = {
  username: "teste",
  password: "1234",
};

const storedTheme = localStorage.getItem("theme");
if (storedTheme === "dark") {
  document.body.setAttribute("data-theme", "dark");
  themeToggle.textContent = "Modo claro";
}

const storedProfile = localStorage.getItem("profile");
if (storedProfile && userArea) {
  const { name, email, team } = JSON.parse(storedProfile);
  const nameInput = userArea.querySelector("input[type=\"text\"]");
  const emailInput = userArea.querySelector("input[type=\"email\"]");
  const teamSelect = userArea.querySelector("select");
  if (nameInput && name) nameInput.value = name;
  if (emailInput && email) emailInput.value = email;
  if (teamSelect && team) teamSelect.value = team;
}

const storedPrefs = localStorage.getItem("preferences");
if (storedPrefs) {
  const { language, timezone } = JSON.parse(storedPrefs);
  if (prefLanguage && language) prefLanguage.value = language;
  if (prefTimezone && timezone) prefTimezone.value = timezone;
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

const switchTab = (targetId) => {
  const tab = document.querySelector(`.tab-button[data-target="${targetId}"]`);
  if (!tab) return;
  tabs.forEach((button) => button.classList.remove("is-active"));
  panels.forEach((panel) => panel.classList.remove("is-active"));
  tab.classList.add("is-active");
  const target = document.getElementById(targetId);
  if (target) target.classList.add("is-active");
};

const showToast = (message) => {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
};

const openActionPanel = ({ title, body, items }) => {
  if (!actionPanel) return;
  actionTitle.textContent = title;
  actionBody.textContent = body;
  actionExtra.innerHTML = "";
  if (items?.length) {
    items.forEach((item) => {
      const row = document.createElement("span");
      row.textContent = item;
      actionExtra.appendChild(row);
    });
  }
  actionPanel.classList.remove("is-hidden");
};

const closeActionPanel = () => {
  if (!actionPanel) return;
  actionPanel.classList.add("is-hidden");
};

if (actionClose) {
  actionClose.addEventListener("click", closeActionPanel);
}

if (actionPanel) {
  actionPanel.addEventListener("click", (event) => {
    if (event.target === actionPanel) {
      closeActionPanel();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    globalSearchInput?.focus();
    showToast("Busca rápida ativada.");
  }
  if (event.key === "Escape") {
    closeActionPanel();
  }
});

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

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    const message = actionMessages[action] || "Ação executada.";
    showToast(message);

    if (action === "filter-crm") {
      const isActive = button.dataset.active === "true";
      const crmCards = document.querySelectorAll(".kanban-card");
      crmCards.forEach((card) => {
        const isMql = card.textContent.toLowerCase().includes("mql");
        card.classList.toggle("search-hidden", !isActive && !isMql);
      });
      button.dataset.active = (!isActive).toString();
    }

    if (action === "export-crm") {
      exportCrm();
    }

    if (action === "notifications") {
      openActionPanel({
        title: "Notificações",
        body: "Alertas mais recentes do seu time.",
        items: [
          "✔️ Novo lead atribuído para Camila.",
          "⚠️ SLA próximo de expirar: TechLab.",
          "📈 Relatório semanal disponível.",
        ],
      });
    }

    if (action === "profile") {
      switchTab("settings");
    }

    if (action === "agent-panel") {
      openActionPanel({
        title: "Painel de agentes",
        body: "Agentes disponíveis e status atual.",
        items: ["Camila • Online", "Felipe • Online", "Larissa • Pausa"],
      });
    }

    if (action === "new-support") {
      createSupportCard("Cliente Novo", "WhatsApp • Novo", "Iniciou conversa agora.");
    }

    if (action === "tag-chat") {
      openActionPanel({
        title: "Etiquetas",
        body: "Selecione etiquetas rápidas para a conversa.",
        items: ["Urgente", "Comercial", "Financeiro", "Suporte"],
      });
    }

    if (action === "transfer-chat") {
      openActionPanel({
        title: "Transferir atendimento",
        body: "Escolha o agente para transferência.",
        items: ["Camila Santos", "Felipe Rocha", "Larissa Prado"],
      });
    }

    if (action === "omni-dashboard") {
      openActionPanel({
        title: "Painel omnichannel",
        body: "Resumo consolidado dos canais.",
        items: ["WhatsApp: 32 ativos", "Instagram: 18 ativos", "Facebook: 12 ativos"],
      });
    }

    if (action === "create-queue") {
      const firstColumn = document.querySelector(".service-column");
      if (firstColumn) {
        const card = document.createElement("div");
        card.className = "service-card";
        card.dataset.draggable = "true";
        card.dataset.searchable = "true";
        card.innerHTML = "<strong>Fila VIP</strong><p>Atendimentos prioritários.</p><span class=\"tag\">Nova</span>";
        makeDraggable(card);
        firstColumn.appendChild(card);
      }
    }

    if (action === "create-automation") {
      if (automationList) {
        const hint = automationList.querySelector(".hint");
        if (hint) hint.remove();
        const item = document.createElement("div");
        item.className = "automation-item";
        item.textContent = `Automação criada às ${new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
        automationList.appendChild(item);
      }
    }

    if (action === "reply-now") {
      switchTab("atendimentos");
      renderChat("techlab");
      chatForm?.querySelector("input")?.focus();
    }

    if (action === "save-profile") {
      const name = userArea.querySelector("input[type=\"text\"]")?.value;
      const email = userArea.querySelector("input[type=\"email\"]")?.value;
      const team = userArea.querySelector("select")?.value;
      localStorage.setItem("profile", JSON.stringify({ name, email, team }));
    }

    if (action === "manage-api") {
      openActionPanel({
        title: "API",
        body: "Credenciais e status do token.",
        items: ["Token: ••••••", "Webhook: ativo", "Última chamada: agora"],
      });
    }

    if (action === "update-preferences") {
      localStorage.setItem(
        "preferences",
        JSON.stringify({ language: prefLanguage?.value, timezone: prefTimezone?.value })
      );
    }
  });
});

const applySearch = (query) => {
  const normalized = query.trim().toLowerCase();
  const items = document.querySelectorAll("[data-searchable=\"true\"]");
  let matches = 0;
  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    const match = !normalized || text.includes(normalized);
    item.classList.toggle("search-hidden", !match);
    item.classList.toggle("search-match", match && normalized);
    if (match && normalized) matches += 1;
  });
  if (normalized) {
    showToast(`Busca encontrou ${matches} resultados.`);
  }
};

const exportCrm = () => {
  const rows = [["Etapa", "Empresa", "Resumo", "Tag"]];
  document.querySelectorAll(".kanban-card").forEach((card) => {
    const stage = card.closest(".kanban-column")?.dataset.stage || "desconhecido";
    const title = card.querySelector("h3")?.textContent?.trim() || "";
    const desc = card.querySelector("p")?.textContent?.trim() || "";
    const tag = card.querySelector(".tag")?.textContent?.trim() || "";
    rows.push([stage, title, desc, tag]);
  });
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "crm-export.csv";
  link.click();
  URL.revokeObjectURL(url);
};

if (globalSearchInput) {
  globalSearchInput.addEventListener("change", () => applySearch(globalSearchInput.value));
}

const createSupportCard = (title, channel, preview) => {
  if (!supportList) return;
  const id = `novo-${Date.now()}`;
  chatData[id] = {
    title,
    channel,
    messages: [{ text: preview, time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), type: "incoming" }],
  };
  const card = document.createElement("button");
  card.className = "support-card";
  card.type = "button";
  card.dataset.chat = id;
  card.dataset.draggable = "true";
  card.dataset.searchable = "true";
  card.innerHTML = `<strong>${title}</strong><span>${channel}</span><p>${preview}</p>`;
  makeDraggable(card);
  card.addEventListener("click", () => {
    getSupportCards().forEach((item) => item.classList.remove("is-active"));
    card.classList.add("is-active");
    renderChat(id);
  });
  supportList.appendChild(card);
};

if (supportSearchInput) {
  supportSearchInput.addEventListener("input", () => {
    const query = supportSearchInput.value.trim().toLowerCase();
    const cards = supportList?.querySelectorAll(".support-card") || [];
    cards.forEach((card) => {
      const match = card.textContent.toLowerCase().includes(query);
      card.classList.toggle("search-hidden", !match);
    });
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
    getSupportCards().forEach((item) => item.classList.remove("is-active"));
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
