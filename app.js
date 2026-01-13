const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".tab-panel");
const kanban = document.getElementById("kanban");
const addCardButton = document.getElementById("add-card");
const cardTemplate = document.getElementById("card-template");
const themeToggle = document.getElementById("theme-toggle");
const toggleButtons = document.querySelectorAll(".toggle");
const toastContainer = document.getElementById("toast-container");
const draggableItems = document.querySelectorAll("[data-draggable=\"true\"]");
const dropzones = document.querySelectorAll("[data-dropzone]");
const topSearchInput = document.querySelector(".top-search input");
const supportSearchInput = document.querySelector(".support-search input");
const settingsSelects = document.querySelectorAll(".settings-card select");
const settingsInputs = document.querySelectorAll(".settings-card input[type=\"text\"], .settings-card input[type=\"email\"]");
const actionOverlay = document.getElementById("action-overlay");
const actionDrawer = document.getElementById("action-drawer");
const actionTitle = document.getElementById("action-title");
const actionDescription = document.getElementById("action-description");
const actionForm = document.getElementById("action-form");
const actionFields = document.getElementById("action-fields");
const actionClose = document.getElementById("action-close");
const actionSubmit = document.getElementById("action-submit");
const campaignsTable = document.querySelector(".campaigns-table");
const funnelsGrid = document.querySelector(".funnels-grid");
const flowsTable = document.querySelector(".flows-table");
const connectionsGrid = document.querySelector(".connections-grid");
const contactsTable = document.querySelector(".contacts-table");
const chatTags = document.getElementById("chat-tags");
const shiftLog = document.getElementById("shift-log");

let activeDrag = null;
let pointerOffset = { x: 0, y: 0 };
let activeChatKey = "techlab";

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
const qrStatusText = document.getElementById("qr-status-text");
const supportCards = document.querySelectorAll(".support-card");
const supportList = document.querySelector(".support-list");
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

const setActiveTab = (tab) => {
  tabs.forEach((button) => {
    const isSelected = button === tab;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-selected", String(isSelected));
    button.tabIndex = isSelected ? 0 : -1;
  });

  panels.forEach((panel) => {
    const isActive = panel.id === tab.dataset.target;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
};

const getTabIndex = (tab) => Array.from(tabs).indexOf(tab);

const focusTabByIndex = (index) => {
  if (!tabs.length) return;
  const normalizedIndex = (index + tabs.length) % tabs.length;
  const nextTab = tabs[normalizedIndex];
  nextTab.focus();
  setActiveTab(nextTab);
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setActiveTab(tab);
  });

  tab.addEventListener("keydown", (event) => {
    const currentIndex = getTabIndex(tab);
    if (currentIndex < 0) return;
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusTabByIndex(currentIndex + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusTabByIndex(currentIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTabByIndex(0);
        break;
      case "End":
        event.preventDefault();
        focusTabByIndex(tabs.length - 1);
        break;
      default:
        break;
    }
  });
});

const initialTab = document.querySelector(".tab-button.is-active") || tabs[0];
if (initialTab) {
  setActiveTab(initialTab);
}

const showToast = (message) => {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
};

const storageKey = "kambaData";
const qrSessionKey = "kambaQrSession";
const apiBaseKey = "kambaApiBase";

const loadStoredData = () => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  return parsed && typeof parsed === "object" ? parsed : {};
};

const saveStoredData = (data) => {
  localStorage.setItem(storageKey, JSON.stringify(data));
};

const buildApiUrl = (path) => {
  if (path.startsWith("http")) return path;
  const base = localStorage.getItem(apiBaseKey) || "";
  return `${base}${path}`;
};

const requestJson = async (path) => {
  const response = await fetch(buildApiUrl(path));
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
};

const storedData = loadStoredData();

const openDrawer = ({ title, description, fields, confirmText, onSubmit }) => {
  if (!actionOverlay || !actionDrawer || !actionForm || !actionFields) return;
  actionTitle.textContent = title;
  actionDescription.textContent = description || "Preencha as informações necessárias.";
  actionFields.innerHTML = "";

  fields.forEach((field) => {
    if (field.type === "info") {
      const info = document.createElement("div");
      info.className = "info-block";
      info.textContent = field.value || "";
      actionFields.appendChild(info);
      return;
    }
    const label = document.createElement("label");
    label.textContent = field.label;
    let input = null;
    if (field.type === "select") {
      input = document.createElement("select");
      field.options.forEach((option) => {
        const opt = document.createElement("option");
        opt.value = option.value;
        opt.textContent = option.label;
        if (option.value === field.value) opt.selected = true;
        input.appendChild(opt);
      });
    } else if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.value = field.value || "";
    } else {
      input = document.createElement("input");
      input.type = field.type || "text";
      input.value = field.value || "";
    }
    input.name = field.name;
    if (field.placeholder) input.placeholder = field.placeholder;
    if (field.required) input.required = true;
    label.appendChild(input);
    actionFields.appendChild(label);
  });

  actionSubmit.textContent = confirmText || "Confirmar";
  actionForm.onsubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(actionForm);
    const values = {};
    fields.forEach((field) => {
      if (field.type === "info") return;
      values[field.name] = formData.get(field.name);
    });
    onSubmit(values);
    closeDrawer();
  };
  actionOverlay.classList.remove("is-hidden");
  actionOverlay.setAttribute("aria-hidden", "false");
};

const closeDrawer = () => {
  if (!actionOverlay) return;
  actionOverlay.classList.add("is-hidden");
  actionOverlay.setAttribute("aria-hidden", "true");
};

const downloadCsv = (filename, rows) => {
  const csvContent = rows
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, "\"\"")}"`)
        .join(",")
    )
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const createId = () => `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const openTabById = (id) => {
  const tab = Array.from(tabs).find((button) => button.dataset.target === id);
  if (tab) setActiveTab(tab);
};

const createCampaignRow = ({ id, name, status, contacts, received }) => {
  const row = document.createElement("div");
  row.className = "table-row";
  row.dataset.draggable = "true";
  row.dataset.searchItem = "";
  if (id) row.dataset.id = id;
  row.innerHTML = `
    <span>${id}</span>
    <span>${name}</span>
    <span>${status}</span>
    <span>${contacts}</span>
    <span>${received}</span>
    <span>
      <button class="ghost" type="button" data-action="campaign-edit">Editar</button>
      <button class="ghost" type="button" data-action="campaign-report">Relatório</button>
    </span>
  `;
  return row;
};

const createFunnelCard = ({ id, name, department, leads, sends }) => {
  const card = document.createElement("article");
  card.className = "funnel-card";
  card.dataset.draggable = "true";
  card.dataset.searchItem = "";
  if (id) card.dataset.id = id;
  card.innerHTML = `
    <h3>${name}</h3>
    <p>Departamento: ${department}</p>
    <div class="funnel-stats">
      <span>${leads} leads</span>
      <span>${sends} envios</span>
    </div>
    <div class="funnel-actions">
      <button class="ghost" type="button" data-action="funnels-edit">Editar</button>
      <button class="ghost" type="button" data-action="funnels-copy">Duplicar</button>
    </div>
  `;
  return card;
};

const createFlowRow = ({ id, name, status, service }) => {
  const row = document.createElement("div");
  row.className = "table-row";
  row.dataset.draggable = "true";
  row.dataset.searchItem = "";
  if (id) row.dataset.id = id;
  row.innerHTML = `
    <span>${name}</span>
    <span>${status}</span>
    <span>${service}</span>
    <span>
      <button class="ghost" type="button" data-action="flow-edit">Editar</button>
      <button class="ghost" type="button" data-action="flow-clone">Duplicar</button>
    </span>
  `;
  return row;
};

const createConnectionCard = ({ id, name, channel, description }) => {
  const card = document.createElement("article");
  card.className = "connection-card";
  card.dataset.draggable = "true";
  card.dataset.searchItem = "";
  if (id) card.dataset.id = id;
  card.innerHTML = `
    <h3>Nome: ${name}</h3>
    <p>${channel} • ${description}</p>
    <span class="status-badge online">Ativo</span>
    <div class="header-actions">
      <button class="ghost" type="button" data-action="import-contacts">Importar contatos</button>
      <button class="ghost" type="button" data-action="disconnect">Desconectar</button>
    </div>
  `;
  return card;
};

const createContactRow = ({ id, name, whatsapp, state, tags }) => {
  const row = document.createElement("div");
  row.className = "table-row";
  row.dataset.draggable = "true";
  row.dataset.searchItem = "";
  if (id) row.dataset.id = id;
  row.innerHTML = `
    <span>${name}</span>
    <span>${whatsapp}</span>
    <span>${state}</span>
    <span>${tags}</span>
    <span>
      <button class="ghost" type="button" data-action="contact-chat">Chat</button>
      <button class="ghost" type="button" data-action="contact-edit">Editar</button>
    </span>
  `;
  return row;
};

const createSupportCard = ({ id, name, channel, preview, chatKey }) => {
  const card = document.createElement("button");
  card.className = "support-card";
  card.type = "button";
  card.dataset.chat = chatKey;
  card.dataset.draggable = "true";
  card.dataset.searchItem = "";
  if (id) card.dataset.id = id;
  card.innerHTML = `
    <strong>${name}</strong>
    <span>${channel}</span>
    <p>${preview}</p>
  `;
  return card;
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

const getTableRows = (table) => {
  if (!table) return [];
  return Array.from(table.querySelectorAll(".table-row")).filter(
    (row) => !row.classList.contains("table-head")
  );
};

const updateStoredArray = (key, updater) => {
  storedData[key] = updater(storedData[key] || []);
  saveStoredData(storedData);
};

const getNextCampaignId = () => {
  const rows = getTableRows(campaignsTable);
  const ids = rows
    .map((row) => Number(row.querySelector("span")?.textContent))
    .filter((value) => !Number.isNaN(value));
  const maxId = ids.length ? Math.max(...ids) : 200;
  return String(maxId + 1);
};

const getRowText = (row, index) => row.querySelectorAll("span")[index]?.textContent?.trim() || "";

const toTimeStamp = () =>
  new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

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

const appendStoredItems = () => {
  if (storedData.campaigns && campaignsTable) {
    storedData.campaigns.forEach((campaign) => {
      const row = createCampaignRow(campaign);
      campaignsTable.appendChild(row);
      makeDraggable(row);
    });
  }
  if (storedData.funnels && funnelsGrid) {
    storedData.funnels.forEach((funnel) => {
      const card = createFunnelCard(funnel);
      funnelsGrid.appendChild(card);
      makeDraggable(card);
    });
  }
  if (storedData.flows && flowsTable) {
    storedData.flows.forEach((flow) => {
      const row = createFlowRow(flow);
      flowsTable.appendChild(row);
      makeDraggable(row);
    });
  }
  if (storedData.connections && connectionsGrid) {
    storedData.connections.forEach((connection) => {
      const card = createConnectionCard(connection);
      connectionsGrid.appendChild(card);
      makeDraggable(card);
    });
  }
  if (storedData.contacts && contactsTable) {
    storedData.contacts.forEach((contact) => {
      const row = createContactRow(contact);
      contactsTable.appendChild(row);
      makeDraggable(row);
    });
  }
  if (storedData.supports && supportList) {
    storedData.supports.forEach((support) => {
      const card = createSupportCard(support);
      supportList.appendChild(card);
      makeDraggable(card);
    });
  }
};


if (topSearchInput) {
  topSearchInput.addEventListener("input", (event) => {
    filterItems(document.querySelectorAll("[data-search-item]"), event.target.value);
  });
  topSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const query = event.target.value.trim();
      const results = filterItems(document.querySelectorAll("[data-search-item]"), query);
      showToast(
        `Busca global: ${query || "todos os resultados"} (${results} encontrados)`
      );
    }
  });
}

if (supportSearchInput) {
  supportSearchInput.addEventListener("input", (event) => {
    filterItems(document.querySelectorAll(".support-card"), event.target.value);
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

appendStoredItems();

const chatData = {
  techlab: {
    title: "TechLab",
    channel: "WhatsApp • Prioridade alta",
    messages: [
      { text: "Oi! Preciso fechar o pacote premium ainda hoje.", time: "09:14", type: "incoming" },
      { text: "Posso te ajudar com o checkout agora mesmo.", time: "09:15", type: "outgoing" },
    ],
    tags: ["Urgente", "Premium"],
  },
  marina: {
    title: "Marina Costa",
    channel: "Instagram • Novo",
    messages: [
      { text: "Quero integrar o CRM com o Instagram.", time: "09:02", type: "incoming" },
      { text: "Perfeito! Vou te enviar os próximos passos.", time: "09:03", type: "outgoing" },
    ],
    tags: ["Instagram", "Novo"],
  },
  padaria: {
    title: "Padaria Central",
    channel: "Facebook • Atendimento",
    messages: [
      { text: "Estou com problema no boleto.", time: "08:44", type: "incoming" },
      { text: "Vou gerar uma segunda via para você.", time: "08:45", type: "outgoing" },
    ],
    tags: ["Financeiro"],
  },
};

const renderChat = (key) => {
  const data = chatData[key];
  if (!data || !chatMessages) return;
  activeChatKey = key;
  chatTitle.textContent = data.title;
  chatChannel.textContent = data.channel;
  chatMessages.innerHTML = "";
  data.messages.forEach((message) => {
    const wrapper = document.createElement("div");
    wrapper.className = `message ${message.type}`;
    wrapper.innerHTML = `<p>${message.text}</p><span>${message.time}</span>`;
    chatMessages.appendChild(wrapper);
  });
  if (chatTags) {
    chatTags.innerHTML = "";
    (data.tags || []).forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.textContent = tag;
      chatTags.appendChild(tagElement);
    });
  }
};

const openCampaignDrawer = () => {
  openDrawer({
    title: "Nova campanha WhatsApp",
    description: "Crie uma campanha rapida para disparo.",
    fields: [
      { name: "name", label: "Nome da campanha", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Pendente", value: "Pendente" },
          { label: "No ar", value: "No ar" },
          { label: "Finalizada", value: "Finalizada" },
        ],
      },
      { name: "contacts", label: "Qtd. contatos", type: "number", value: 0 },
    ],
    confirmText: "Criar campanha",
    onSubmit: ({ name, status, contacts }) => {
      if (!campaignsTable) return;
      const id = getNextCampaignId();
      const row = createCampaignRow({
        id,
        name,
        status,
        contacts,
        received: 0,
      });
      campaignsTable.appendChild(row);
      makeDraggable(row);
      updateStoredArray("campaigns", (list) => [
        ...list,
        { id, name, status, contacts, received: 0 },
      ]);
      showToast("Campanha criada com sucesso.");
    },
  });
};

const openImportContactsDrawer = () => {
  openDrawer({
    title: "Importar contatos",
    description: "Simule uma importacao rapida para esta conexao.",
    fields: [
      { name: "count", label: "Quantidade", type: "number", value: 3 },
    ],
    confirmText: "Importar",
    onSubmit: ({ count }) => {
      const total = Number(count) || 0;
      if (!contactsTable) return;
      const newContacts = Array.from({ length: total }).map((_, index) => ({
        id: createId(),
        name: `Contato importado ${index + 1}`,
        whatsapp: "+55 11 90000-0000",
        state: "SP",
        tags: "Importado",
      }));
      newContacts.forEach((contact) => {
        const row = createContactRow(contact);
        contactsTable.appendChild(row);
        makeDraggable(row);
      });
      updateStoredArray("contacts", (list) => [...list, ...newContacts]);
      showToast(`${total} contatos importados.`);
    },
  });
};

const actionHandlers = {
  "filter-crm": () => {
    openDrawer({
      title: "Filtrar CRM",
      description: "Encontre oportunidades pelo nome, tag ou observacao.",
      fields: [
        { name: "query", label: "Buscar por", placeholder: "Ex: Clinica, MQL, 48k", required: true },
      ],
      confirmText: "Aplicar filtro",
      onSubmit: ({ query }) => {
        const items = kanban.querySelectorAll(".kanban-card");
        const results = filterItems(items, query || "");
        showToast(`Filtro aplicado. ${results} cards visiveis.`);
      },
    });
  },
  "export-crm": () => {
    const rows = [["Etapa", "Lead", "Descricao", "Tag"]];
    kanban.querySelectorAll(".kanban-card").forEach((card) => {
      const stage = card.closest(".kanban-column")?.querySelector("h2")?.textContent || "CRM";
      rows.push([
        stage,
        card.querySelector("h3")?.textContent || "",
        card.querySelector("p")?.textContent || "",
        card.querySelector(".tag")?.textContent || "",
      ]);
    });
    downloadCsv("crm-export.csv", rows);
    showToast("Exportacao do CRM pronta para download.");
  },
  "refresh-dashboard": () => {
    const activityList = document.querySelector("#command-center .activity-card ul");
    if (activityList) {
      const item = document.createElement("li");
      item.innerHTML = `<strong>Dashboard</strong> atualizado as ${toTimeStamp()}.`;
      activityList.prepend(item);
    }
    showToast("Dashboard atualizado com novos eventos.");
  },
  "export-dashboard": () => {
    const rows = [["Metrica", "Valor"]];
    document.querySelectorAll("#command-center .metric-card").forEach((card) => {
      const label = card.querySelector("p")?.textContent || "";
      const value = card.querySelector("h3")?.textContent || "";
      rows.push([label, value]);
    });
    downloadCsv("dashboard-metrics.csv", rows);
    showToast("Dashboard exportado.");
  },
  "collapse-config": () => {
    document.querySelectorAll(".config-card").forEach((card) => {
      card.classList.toggle("is-collapsed");
    });
    showToast("Configuracoes recolhidas.");
  },
  "new-campaign": () => {
    openCampaignDrawer();
  },
  "new-campaign-waba": () => {
    openCampaignDrawer();
  },
  "campaign-edit": (button) => {
    const row = button.closest(".table-row");
    if (!row) return;
    const id = getRowText(row, 0);
    const name = getRowText(row, 1);
    const status = getRowText(row, 2);
    const contacts = getRowText(row, 3);
    const received = getRowText(row, 4);
    openDrawer({
      title: `Editar campanha #${id}`,
      fields: [
        { name: "name", label: "Nome da campanha", value: name, required: true },
        {
          name: "status",
          label: "Status",
          type: "select",
          value: status,
          options: [
            { label: "Pendente", value: "Pendente" },
            { label: "No ar", value: "No ar" },
            { label: "Finalizada", value: "Finalizada" },
          ],
        },
        { name: "contacts", label: "Qtd. contatos", type: "number", value: contacts },
        { name: "received", label: "Recebidas", type: "number", value: received },
      ],
      confirmText: "Salvar",
      onSubmit: (values) => {
        row.querySelectorAll("span")[1].textContent = values.name;
        row.querySelectorAll("span")[2].textContent = values.status;
        row.querySelectorAll("span")[3].textContent = values.contacts;
        row.querySelectorAll("span")[4].textContent = values.received;
        updateStoredArray("campaigns", (list) =>
          list.map((item) => (item.id === id ? { ...item, ...values } : item))
        );
        showToast("Campanha atualizada.");
      },
    });
  },
  "campaign-report": (button) => {
    const row = button.closest(".table-row");
    if (!row) return;
    const name = getRowText(row, 1);
    const status = getRowText(row, 2);
    openDrawer({
      title: "Relatorio da campanha",
      description: "Resumo rapido de performance.",
      fields: [
        { type: "info", value: `Campanha: ${name}` },
        { type: "info", value: `Status: ${status}` },
        { type: "info", value: `Atualizado: ${toTimeStamp()}` },
      ],
      confirmText: "Fechar",
      onSubmit: () => {},
    });
  },
  "funnels-new": () => {
    openDrawer({
      title: "Novo funil",
      description: "Crie um funil para disparos segmentados.",
      fields: [
        { name: "name", label: "Nome do funil", required: true },
        { name: "department", label: "Departamento", required: true },
        { name: "leads", label: "Leads", type: "number", value: 0 },
        { name: "sends", label: "Envios", type: "number", value: 0 },
      ],
      confirmText: "Criar funil",
      onSubmit: ({ name, department, leads, sends }) => {
        if (!funnelsGrid) return;
        const id = createId();
        const card = createFunnelCard({ id, name, department, leads, sends });
        funnelsGrid.appendChild(card);
        makeDraggable(card);
        updateStoredArray("funnels", (list) => [...list, { id, name, department, leads, sends }]);
        showToast("Funil criado.");
      },
    });
  },
  "funnels-edit": (button) => {
    const card = button.closest(".funnel-card");
    if (!card) return;
    const name = card.querySelector("h3")?.textContent || "";
    const department = card.querySelector("p")?.textContent?.replace("Departamento: ", "") || "";
    const leads = card.querySelectorAll(".funnel-stats span")[0]?.textContent?.split(" ")[0] || "0";
    const sends = card.querySelectorAll(".funnel-stats span")[1]?.textContent?.split(" ")[0] || "0";
    openDrawer({
      title: "Editar funil",
      fields: [
        { name: "name", label: "Nome do funil", value: name, required: true },
        { name: "department", label: "Departamento", value: department, required: true },
        { name: "leads", label: "Leads", type: "number", value: leads },
        { name: "sends", label: "Envios", type: "number", value: sends },
      ],
      confirmText: "Salvar",
      onSubmit: (values) => {
        card.querySelector("h3").textContent = values.name;
        card.querySelector("p").textContent = `Departamento: ${values.department}`;
        card.querySelectorAll(".funnel-stats span")[0].textContent = `${values.leads} leads`;
        card.querySelectorAll(".funnel-stats span")[1].textContent = `${values.sends} envios`;
        updateStoredArray("funnels", (list) =>
          list.map((item) => (item.id === card.dataset.id ? { ...item, ...values } : item))
        );
        showToast("Funil atualizado.");
      },
    });
  },
  "funnels-copy": (button) => {
    const card = button.closest(".funnel-card");
    if (!card || !funnelsGrid) return;
    const name = card.querySelector("h3")?.textContent || "";
    const department = card.querySelector("p")?.textContent?.replace("Departamento: ", "") || "";
    const leads = card.querySelectorAll(".funnel-stats span")[0]?.textContent?.split(" ")[0] || "0";
    const sends = card.querySelectorAll(".funnel-stats span")[1]?.textContent?.split(" ")[0] || "0";
    const id = createId();
    const newCard = createFunnelCard({
      id,
      name: `${name} (Copia)`,
      department,
      leads,
      sends,
    });
    funnelsGrid.appendChild(newCard);
    makeDraggable(newCard);
    updateStoredArray("funnels", (list) => [
      ...list,
      { id, name: `${name} (Copia)`, department, leads, sends },
    ]);
    showToast("Funil duplicado.");
  },
  "flow-add": () => {
    openDrawer({
      title: "Novo fluxo",
      description: "Crie um fluxo de atendimento ou chatbot.",
      fields: [
        { name: "name", label: "Nome do fluxo", required: true },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Ativo", value: "Ativo" },
            { label: "Pausado", value: "Pausado" },
          ],
        },
        {
          name: "service",
          label: "Fluxo de atendimento",
          type: "select",
          options: [
            { label: "Sim", value: "Sim" },
            { label: "Não", value: "Não" },
          ],
        },
      ],
      confirmText: "Adicionar fluxo",
      onSubmit: ({ name, status, service }) => {
        if (!flowsTable) return;
        const id = createId();
        const row = createFlowRow({ id, name, status, service });
        flowsTable.appendChild(row);
        makeDraggable(row);
        updateStoredArray("flows", (list) => [...list, { id, name, status, service }]);
        showToast("Fluxo criado.");
      },
    });
  },
  "flow-edit": (button) => {
    const row = button.closest(".table-row");
    if (!row) return;
    const name = getRowText(row, 0);
    const status = getRowText(row, 1);
    const service = getRowText(row, 2);
    openDrawer({
      title: "Editar fluxo",
      fields: [
        { name: "name", label: "Nome do fluxo", value: name, required: true },
        {
          name: "status",
          label: "Status",
          type: "select",
          value: status,
          options: [
            { label: "Ativo", value: "Ativo" },
            { label: "Pausado", value: "Pausado" },
          ],
        },
        {
          name: "service",
          label: "Fluxo de atendimento",
          type: "select",
          value: service,
          options: [
            { label: "Sim", value: "Sim" },
            { label: "Não", value: "Não" },
          ],
        },
      ],
      confirmText: "Salvar",
      onSubmit: (values) => {
        row.querySelectorAll("span")[0].textContent = values.name;
        row.querySelectorAll("span")[1].textContent = values.status;
        row.querySelectorAll("span")[2].textContent = values.service;
        updateStoredArray("flows", (list) =>
          list.map((item) => (item.id === row.dataset.id ? { ...item, ...values } : item))
        );
        showToast("Fluxo atualizado.");
      },
    });
  },
  "flow-clone": (button) => {
    const row = button.closest(".table-row");
    if (!row || !flowsTable) return;
    const name = getRowText(row, 0);
    const status = getRowText(row, 1);
    const service = getRowText(row, 2);
    const id = createId();
    const clone = createFlowRow({ id, name: `${name} (Copia)`, status, service });
    flowsTable.appendChild(clone);
    makeDraggable(clone);
    updateStoredArray("flows", (list) => [
      ...list,
      { id, name: `${name} (Copia)`, status, service },
    ]);
    showToast("Fluxo duplicado.");
  },
  "toggle-inactive": () => {
    if (!connectionsGrid) return;
    connectionsGrid.classList.toggle("hide-inactive");
    const isHidden = connectionsGrid.classList.contains("hide-inactive");
    showToast(isHidden ? "Inativos ocultados." : "Inativos exibidos.");
  },
  "notify-me": () => {
    openDrawer({
      title: "Notificacoes",
      description: "Controle alertas de conexoes e filas.",
      fields: [
        { name: "email", label: "Email de alertas", type: "email", required: true },
        {
          name: "frequency",
          label: "Frequencia",
          type: "select",
          options: [
            { label: "Imediato", value: "Imediato" },
            { label: "A cada hora", value: "Hora" },
            { label: "Diario", value: "Diario" },
          ],
        },
      ],
      confirmText: "Salvar alertas",
      onSubmit: ({ email, frequency }) => {
        updateStoredArray("notifications", (list) => [
          ...list,
          { email, frequency, at: toTimeStamp() },
        ]);
        showToast("Alertas configurados.");
      },
    });
  },
  "add-connection": () => {
    openDrawer({
      title: "Nova conexao",
      description: "Adicione um canal para atendimento.",
      fields: [
        { name: "name", label: "Nome da conexao", required: true },
        {
          name: "channel",
          label: "Canal",
          type: "select",
          options: [
            { label: "WhatsApp v4", value: "WhatsApp v4" },
            { label: "Instagram", value: "Instagram" },
            { label: "Facebook", value: "Facebook" },
          ],
        },
        { name: "description", label: "Descricao", value: "Conexao em configuracao" },
      ],
      confirmText: "Adicionar conexao",
      onSubmit: ({ name, channel, description }) => {
        if (!connectionsGrid) return;
        const id = createId();
        const card = createConnectionCard({ id, name, channel, description });
        connectionsGrid.appendChild(card);
        makeDraggable(card);
        updateStoredArray("connections", (list) => [
          ...list,
          { id, name, channel, description },
        ]);
        showToast("Conexao adicionada.");
      },
    });
  },
  "import-contacts": (button) => {
    openImportContactsDrawer();
  },
  disconnect: (button) => {
    const card = button.closest(".connection-card");
    if (!card) return;
    const badge = card.querySelector(".status-badge");
    const isInactive = card.classList.contains("is-inactive");
    if (isInactive) {
      card.classList.remove("is-inactive");
      badge.classList.remove("offline");
      badge.classList.add("online");
      badge.textContent = "Ativo";
      button.textContent = "Desconectar";
      showToast("Conexao reativada.");
    } else {
      card.classList.add("is-inactive");
      badge.classList.remove("online");
      badge.classList.add("offline");
      badge.textContent = "Inativo";
      button.textContent = "Conectar";
      showToast("Conexao desconectada.");
    }
  },
  "contacts-add": () => {
    openDrawer({
      title: "Novo contato",
      fields: [
        { name: "name", label: "Nome", required: true },
        { name: "whatsapp", label: "WhatsApp", required: true },
        { name: "state", label: "Estado", required: true },
        { name: "tags", label: "Tags", value: "Lead" },
      ],
      confirmText: "Adicionar contato",
      onSubmit: ({ name, whatsapp, state, tags }) => {
        if (!contactsTable) return;
        const id = createId();
        const row = createContactRow({ id, name, whatsapp, state, tags });
        contactsTable.appendChild(row);
        makeDraggable(row);
        updateStoredArray("contacts", (list) => [...list, { id, name, whatsapp, state, tags }]);
        showToast("Contato adicionado.");
      },
    });
  },
  "contacts-import": () => {
    openImportContactsDrawer();
  },
  "contacts-delete": () => {
    if (!contactsTable) return;
    const selected = contactsTable.querySelectorAll(".table-row.is-selected");
    if (!selected.length) {
      showToast("Selecione contatos para apagar.");
      return;
    }
    selected.forEach((row) => row.remove());
    updateStoredArray("contacts", (list) =>
      list.filter((item) => !Array.from(selected).some((row) => row.dataset.id === item.id))
    );
    showToast("Contatos apagados.");
  },
  "contacts-export": () => {
    const rows = [["Nome", "WhatsApp", "Estado", "Tags"]];
    getTableRows(contactsTable).forEach((row) => {
      rows.push([
        getRowText(row, 0),
        getRowText(row, 1),
        getRowText(row, 2),
        getRowText(row, 3),
      ]);
    });
    downloadCsv("contatos.csv", rows);
    showToast("Exportacao de contatos pronta.");
  },
  "contact-chat": (button) => {
    const row = button.closest(".table-row");
    if (!row) return;
    const name = getRowText(row, 0);
    const chatKey = name.toLowerCase().replace(/\s+/g, "-");
    if (!chatData[chatKey]) {
      chatData[chatKey] = {
        title: name,
        channel: "WhatsApp • Novo",
        messages: [
          { text: `Oi ${name}, como podemos ajudar?`, time: toTimeStamp(), type: "outgoing" },
        ],
        tags: ["Novo contato"],
      };
      if (supportList) {
        const card = createSupportCard({
          id: createId(),
          name,
          channel: "WhatsApp • Novo",
          preview: "Clique para iniciar o atendimento.",
          chatKey,
        });
        supportList.appendChild(card);
        makeDraggable(card);
      }
    }
    openTabById("atendimentos");
    renderChat(chatKey);
    showToast(`Chat aberto para ${name}.`);
  },
  "contact-edit": (button) => {
    const row = button.closest(".table-row");
    if (!row) return;
    const name = getRowText(row, 0);
    const whatsapp = getRowText(row, 1);
    const state = getRowText(row, 2);
    const tags = getRowText(row, 3);
    openDrawer({
      title: "Editar contato",
      fields: [
        { name: "name", label: "Nome", value: name, required: true },
        { name: "whatsapp", label: "WhatsApp", value: whatsapp, required: true },
        { name: "state", label: "Estado", value: state, required: true },
        { name: "tags", label: "Tags", value: tags },
      ],
      confirmText: "Salvar",
      onSubmit: (values) => {
        row.querySelectorAll("span")[0].textContent = values.name;
        row.querySelectorAll("span")[1].textContent = values.whatsapp;
        row.querySelectorAll("span")[2].textContent = values.state;
        row.querySelectorAll("span")[3].textContent = values.tags;
        updateStoredArray("contacts", (list) =>
          list.map((item) => (item.id === row.dataset.id ? { ...item, ...values } : item))
        );
        showToast("Contato atualizado.");
      },
    });
  },
  "agent-panel": () => {
    const agents = Array.from(document.querySelectorAll(".agent-card strong")).map(
      (node) => node.textContent
    );
    openDrawer({
      title: "Painel de agentes",
      description: "Resumo rapido dos agentes online.",
      fields: [
        { type: "info", value: `Agentes ativos: ${agents.join(", ") || "Sem agentes."}` },
      ],
      confirmText: "Fechar",
      onSubmit: () => {},
    });
  },
  "new-support": () => {
    openDrawer({
      title: "Novo atendimento",
      fields: [
        { name: "name", label: "Cliente", required: true },
        { name: "channel", label: "Canal", value: "WhatsApp • Novo" },
        { name: "preview", label: "Resumo", value: "Novo atendimento aberto." },
      ],
      confirmText: "Criar atendimento",
      onSubmit: ({ name, channel, preview }) => {
        const chatKey = createId();
        chatData[chatKey] = {
          title: name,
          channel,
          messages: [{ text: "Atendimento iniciado.", time: toTimeStamp(), type: "incoming" }],
          tags: ["Novo"],
        };
        if (supportList) {
          const card = createSupportCard({
            id: chatKey,
            name,
            channel,
            preview,
            chatKey,
          });
          supportList.prepend(card);
          makeDraggable(card);
        }
        updateStoredArray("supports", (list) => [
          ...list,
          { id: chatKey, name, channel, preview, chatKey },
        ]);
        renderChat(chatKey);
        showToast("Atendimento criado.");
      },
    });
  },
  "tag-chat": () => {
    openDrawer({
      title: "Etiquetas do atendimento",
      fields: [
        { name: "tag", label: "Adicionar etiqueta", required: true },
      ],
      confirmText: "Adicionar",
      onSubmit: ({ tag }) => {
        if (!activeChatKey || !chatData[activeChatKey]) return;
        chatData[activeChatKey].tags = chatData[activeChatKey].tags || [];
        chatData[activeChatKey].tags.push(tag);
        renderChat(activeChatKey);
        showToast("Etiqueta adicionada.");
      },
    });
  },
  "transfer-chat": () => {
    const agents = Array.from(document.querySelectorAll(".agent-card strong")).map(
      (node) => node.textContent
    );
    openDrawer({
      title: "Transferir atendimento",
      fields: [
        {
          name: "agent",
          label: "Agente",
          type: "select",
          options: agents.map((agent) => ({ label: agent, value: agent })),
        },
      ],
      confirmText: "Transferir",
      onSubmit: ({ agent }) => {
        showToast(`Atendimento transferido para ${agent}.`);
      },
    });
  },
  "omni-dashboard": () => {
    openDrawer({
      title: "Painel omnichannel",
      fields: [
        { type: "info", value: "Fila unificada ativa e monitorada em tempo real." },
        { type: "info", value: `Ultima atualizacao: ${toTimeStamp()}` },
      ],
      confirmText: "Fechar",
      onSubmit: () => {},
    });
  },
  "create-queue": () => {
    const column = document.querySelector(".service-column");
    openDrawer({
      title: "Criar fila",
      fields: [
        { name: "name", label: "Cliente", required: true },
        { name: "detail", label: "Detalhe", value: "Fila criada manualmente." },
        { name: "tag", label: "Etiqueta", value: "Pendente" },
      ],
      confirmText: "Adicionar fila",
      onSubmit: ({ name, detail, tag }) => {
        if (!column) return;
        const card = document.createElement("div");
        card.className = "service-card";
        card.dataset.draggable = "true";
        card.innerHTML = `
          <strong>${name}</strong>
          <p>${detail}</p>
          <span class="tag">${tag}</span>
        `;
        column.appendChild(card);
        makeDraggable(card);
        showToast("Fila adicionada.");
      },
    });
  },
  sla: () => {
    openDrawer({
      title: "Atualizar SLA",
      fields: [
        { name: "target", label: "Meta de SLA (min)", type: "number", value: 5 },
      ],
      confirmText: "Salvar SLA",
      onSubmit: ({ target }) => {
        showToast(`SLA atualizado para ${target} min.`);
      },
    });
  },
  routing: () => {
    openDrawer({
      title: "Regras de distribuicao",
      fields: [
        { name: "rule", label: "Regra principal", value: "Round-robin" },
      ],
      confirmText: "Aplicar",
      onSubmit: ({ rule }) => {
        showToast(`Distribuicao configurada: ${rule}.`);
      },
    });
  },
  "manage-shifts": () => {
    openDrawer({
      title: "Gerenciar escalas",
      fields: [
        { name: "note", label: "Atualizacao", value: "Escalas atualizadas para semana atual." },
      ],
      confirmText: "Salvar escala",
      onSubmit: ({ note }) => {
        if (shiftLog) shiftLog.innerHTML = `<p>${note}</p>`;
        showToast("Escalas atualizadas.");
      },
    });
  },
  "create-automation": () => {
    openDrawer({
      title: "Criar automacao",
      fields: [
        { name: "name", label: "Nome da automacao", required: true },
        { name: "trigger", label: "Gatilho", value: "Novo lead" },
      ],
      confirmText: "Criar",
      onSubmit: ({ name }) => {
        showToast(`Automacao "${name}" criada.`);
      },
    });
  },
  "reply-now": () => {
    openTabById("atendimentos");
    const input = document.querySelector("#chat-form input[name=\"message\"]");
    if (input) input.focus();
    showToast("Redirecionado para atendimento.");
  },
  "manage-api": () => {
    openDrawer({
      title: "Gerenciar API",
      fields: [
        { type: "info", value: "Copie sua chave e configure webhooks no painel." },
      ],
      confirmText: "Fechar",
      onSubmit: () => {},
    });
  },
  "check-qr-status": () => {
    const sessionId = localStorage.getItem(qrSessionKey);
    if (!sessionId) {
      showToast("Gere um QR antes de validar a conexão.");
      return;
    }
    requestJson(`/api/whatsapp/qr/status?session_id=${encodeURIComponent(sessionId)}&mark=connected`)
      .then((data) => {
        const status = data.status || "pending";
        if (status === "connected") {
          setQrStatus("Status: conectado.");
          const card = document.querySelector(".integration-card[data-channel=\"whatsapp\"]");
          if (card) {
            const badge = card.querySelector(".status-badge");
            badge.classList.remove("offline");
            badge.classList.add("online");
            badge.textContent = "Conectado";
          }
          showToast("WhatsApp conectado.");
        } else {
          setQrStatus("Status: aguardando leitura do QR.");
          showToast("Ainda aguardando leitura do QR.");
        }
      })
      .catch(() => {
        setQrStatus("Status: falha ao validar conexão.");
        showToast("Nao foi possivel validar a conexao.");
      });
  },
  notifications: () => {
    const list = storedData.notifications || [];
    openDrawer({
      title: "Notificacoes recentes",
      fields: list.length
        ? list.map((item) => ({
            type: "info",
            value: `${item.email} • ${item.frequency} • ${item.at}`,
          }))
        : [{ type: "info", value: "Nenhuma notificacao cadastrada." }],
      confirmText: "Fechar",
      onSubmit: () => {},
    });
  },
  profile: () => {
    openDrawer({
      title: "Perfil do usuario",
      fields: [
        { type: "info", value: "Camila Santos • Administradora" },
        { type: "info", value: "Plano: Enterprise" },
      ],
      confirmText: "Fechar",
      onSubmit: () => {},
    });
  },
};

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const handler = actionHandlers[action];
  if (handler) {
    handler(button);
    return;
  }
  const message = actionMessages[action] || "Acao executada.";
  showToast(message);
});

if (actionClose) {
  actionClose.addEventListener("click", closeDrawer);
}

if (actionOverlay) {
  actionOverlay.addEventListener("click", (event) => {
    if (event.target === actionOverlay) closeDrawer();
  });
}

if (contactsTable) {
  contactsTable.addEventListener("click", (event) => {
    const row = event.target.closest(".table-row");
    if (!row || row.classList.contains("table-head")) return;
    if (event.target.closest("button")) return;
    row.classList.toggle("is-selected");
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
    setQrStatus("Status: aguardando conexão.");
  } else {
    qrPanel.classList.add("is-hidden");
  }
};

const setQrStatus = (message) => {
  if (!qrStatusText) return;
  qrStatusText.textContent = message;
};

const generateQrCode = async (token) => {
  if (!qrImage) return;
  const safeToken = token?.trim() || "kamba-whatsapp-session";
  try {
    const data = await requestJson(
      `/api/whatsapp/qr?token=${encodeURIComponent(safeToken)}`
    );
    if (data.session_id) {
      localStorage.setItem(qrSessionKey, data.session_id);
    }
    if (data.qr_url) {
      qrImage.src = data.qr_url;
      setQrStatus("Status: aguardando leitura do QR.");
      return;
    }
    throw new Error("QR URL ausente");
  } catch (error) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      safeToken
    )}`;
    qrImage.src = qrUrl;
    setQrStatus("Status: QR gerado localmente.");
  }
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


const setActiveSupportCard = (card) => {
  document.querySelectorAll(".support-card").forEach((item) => item.classList.remove("is-active"));
  card.classList.add("is-active");
  renderChat(card.dataset.chat);
};

supportCards.forEach((card) => {
  card.addEventListener("click", () => {
    setActiveSupportCard(card);
  });
});

if (supportList) {
  supportList.addEventListener("click", (event) => {
    const card = event.target.closest(".support-card");
    if (!card) return;
    setActiveSupportCard(card);
  });
}

const initialSupport = document.querySelector(".support-card.is-active");
if (initialSupport) {
  renderChat(initialSupport.dataset.chat);
}

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
