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
const campaignsTable = document.querySelector("#campanhas .table");
const funnelsGrid = document.querySelector(".funnels-grid");
const flowsTable = document.querySelector("#fluxos .table");
const connectionsGrid = document.querySelector(".connections-grid");
const contactsTable = document.querySelector("#contatos .table");
const supportList = document.querySelector(".support-list");
const serviceColumns = document.querySelectorAll(".service-column");
const agentPanel = document.querySelector(".agent-panel");
const marketingMetrics = document.querySelectorAll("#marketing .metric-card h3");
const dashboardMetrics = document.querySelectorAll("#dashboard .metric-card h3");

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

const downloadFile = (filename, content, mime = "text/plain") => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const toCsv = (rows) => rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

const createTableRow = (cells, actions) => {
  const row = document.createElement("div");
  row.className = "table-row";
  row.dataset.draggable = "true";
  row.dataset.searchItem = "";
  cells.forEach((cell) => {
    const span = document.createElement("span");
    span.textContent = cell;
    row.appendChild(span);
  });
  if (actions) {
    const span = document.createElement("span");
    span.appendChild(actions);
    row.appendChild(span);
  }
  makeDraggable(row);
  return row;
};

const createActionButton = (label, action) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ghost";
  button.dataset.action = action;
  button.textContent = label;
  button.addEventListener("click", handleActionClick);
  return button;
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

const actionHandlers = {
  "filter-crm": () => {
    const query = window.prompt("Filtrar leads por palavra-chave:", "");
    if (query === null) return;
    const cards = kanban.querySelectorAll(".kanban-card");
    const count = filterItems(cards, query);
    showToast(`Filtro aplicado (${count} leads visiveis).`);
  },
  "export-crm": () => {
    const cards = kanban.querySelectorAll(".kanban-card");
    const rows = [["Titulo", "Descricao", "Tag"]];
    cards.forEach((card) => {
      const title = card.querySelector("h3")?.textContent || "";
      const desc = card.querySelector("p")?.textContent || "";
      const tag = card.querySelector(".tag")?.textContent || "";
      rows.push([title, desc, tag]);
    });
    downloadFile("crm-leads.csv", toCsv(rows), "text/csv");
    showToast("CSV do CRM gerado.");
  },
  "refresh-dashboard": () => {
    dashboardMetrics.forEach((metric) => {
      const value = Math.floor(100 + Math.random() * 900);
      metric.textContent = value.toString();
    });
    showToast("Dashboard atualizado.");
  },
  "export-dashboard": () => {
    const data = Array.from(dashboardMetrics).map((metric) => metric.textContent || "");
    downloadFile("dashboard.json", JSON.stringify({ metrics: data }, null, 2), "application/json");
    showToast("Exportacao do dashboard concluida.");
  },
  "collapse-config": () => {
    document.querySelectorAll(".config-card p").forEach((item) => {
      item.classList.toggle("is-hidden");
    });
    showToast("Configuracoes recolhidas.");
  },
  "new-campaign": () => {
    const name = window.prompt("Nome da campanha WhatsApp:", "Nova campanha WA");
    if (!name || !campaignsTable) return;
    const id = Math.floor(200 + Math.random() * 800).toString();
    const actions = document.createElement("div");
    actions.appendChild(createActionButton("Editar", "campaign-edit"));
    const row = createTableRow([id, name, "Pendente", "0", "0"], actions);
    campaignsTable.appendChild(row);
    showToast("Campanha WA criada.");
  },
  "new-campaign-waba": () => {
    const name = window.prompt("Nome da campanha WABA:", "Nova campanha WABA");
    if (!name || !campaignsTable) return;
    const id = Math.floor(200 + Math.random() * 800).toString();
    const actions = document.createElement("div");
    actions.appendChild(createActionButton("Editar", "campaign-edit"));
    const row = createTableRow([id, name, "Pendente", "0", "0"], actions);
    campaignsTable.appendChild(row);
    showToast("Campanha WABA criada.");
  },
  "campaign-edit": (button) => {
    const row = button.closest(".table-row");
    if (!row) return;
    const cells = row.querySelectorAll("span");
    const name = window.prompt("Atualizar nome da campanha:", cells[1]?.textContent || "");
    if (name) cells[1].textContent = name;
    showToast("Campanha atualizada.");
  },
  "campaign-report": (button) => {
    const row = button.closest(".table-row");
    const name = row?.querySelectorAll("span")[1]?.textContent || "Campanha";
    window.alert(`Relatorio rapido: ${name}\nStatus: OK\nEntregues: 98%`);
  },
  "funnels-new": () => {
    const name = window.prompt("Nome do funil:", "Novo funil");
    if (!name || !funnelsGrid) return;
    const card = document.createElement("article");
    card.className = "funnel-card";
    card.dataset.draggable = "true";
    card.dataset.searchItem = "";
    card.innerHTML = `<h3>${name}</h3><p>Departamento: Novo</p><div class="funnel-stats"><span>0 leads</span><span>0 envios</span></div>`;
    const actions = document.createElement("div");
    actions.className = "funnel-actions";
    actions.appendChild(createActionButton("Editar", "funnels-edit"));
    actions.appendChild(createActionButton("Duplicar", "funnels-copy"));
    card.appendChild(actions);
    makeDraggable(card);
    funnelsGrid.appendChild(card);
    showToast("Novo funil criado.");
  },
  "funnels-edit": (button) => {
    const card = button.closest(".funnel-card");
    const title = card?.querySelector("h3");
    if (!title) return;
    const name = window.prompt("Atualizar nome do funil:", title.textContent);
    if (name) title.textContent = name;
    showToast("Funil atualizado.");
  },
  "funnels-copy": (button) => {
    const card = button.closest(".funnel-card");
    if (!card || !funnelsGrid) return;
    const clone = card.cloneNode(true);
    clone.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", handleActionClick);
    });
    makeDraggable(clone);
    funnelsGrid.appendChild(clone);
    showToast("Funil duplicado.");
  },
  "flow-add": () => {
    const name = window.prompt("Nome do fluxo:", "Novo fluxo");
    if (!name || !flowsTable) return;
    const actions = document.createElement("div");
    actions.appendChild(createActionButton("Editar", "flow-edit"));
    actions.appendChild(createActionButton("Duplicar", "flow-clone"));
    const row = createTableRow([name, "Ativo", "Nao"], actions);
    flowsTable.appendChild(row);
    showToast("Fluxo criado.");
  },
  "flow-edit": (button) => {
    const row = button.closest(".table-row");
    if (!row) return;
    const cells = row.querySelectorAll("span");
    const name = window.prompt("Atualizar nome do fluxo:", cells[0]?.textContent || "");
    if (name) cells[0].textContent = name;
    showToast("Fluxo atualizado.");
  },
  "flow-clone": (button) => {
    const row = button.closest(".table-row");
    if (!row || !flowsTable) return;
    const clone = row.cloneNode(true);
    clone.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", handleActionClick);
    });
    makeDraggable(clone);
    flowsTable.appendChild(clone);
    showToast("Fluxo duplicado.");
  },
  "toggle-inactive": () => {
    document.querySelectorAll(".connection-card[data-inactive]").forEach((card) => {
      card.classList.toggle("is-hidden");
    });
    showToast("Conexoes inativas atualizadas.");
  },
  "add-connection": () => {
    const name = window.prompt("Nome da conexao:", "Nova conexao");
    if (!name || !connectionsGrid) return;
    const card = document.createElement("article");
    card.className = "connection-card";
    card.dataset.draggable = "true";
    card.dataset.searchItem = "";
    card.innerHTML = `<h3>Nome: ${name}</h3><p>WhatsApp v4 • Nova conexao</p>`;
    const actions = document.createElement("div");
    actions.className = "header-actions";
    actions.appendChild(createActionButton("Importar contatos", "import-contacts"));
    actions.appendChild(createActionButton("Desconectar", "disconnect"));
    card.appendChild(actions);
    makeDraggable(card);
    connectionsGrid.appendChild(card);
    showToast("Conexao criada.");
  },
  "disconnect": (button) => {
    const card = button.closest(".connection-card");
    if (!card) return;
    card.remove();
    showToast("Conexao removida.");
  },
  "contacts-add": () => {
    if (!contactsTable) return;
    const name = window.prompt("Nome do contato:", "");
    if (!name) return;
    const phone = window.prompt("WhatsApp:", "");
    const state = window.prompt("Estado:", "");
    const tag = window.prompt("Tags:", "Novo");
    const actions = document.createElement("div");
    actions.appendChild(createActionButton("Chat", "contact-chat"));
    actions.appendChild(createActionButton("Editar", "contact-edit"));
    const row = createTableRow([name, phone || "", state || "", tag || ""], actions);
    contactsTable.appendChild(row);
    showToast("Contato adicionado.");
  },
  "contacts-delete": () => {
    if (!contactsTable) return;
    const rows = contactsTable.querySelectorAll(".table-row:not(.table-head)");
    if (!rows.length) return;
    const confirmDelete = window.confirm("Apagar todos os contatos?");
    if (!confirmDelete) return;
    rows.forEach((row) => row.remove());
    showToast("Contatos removidos.");
  },
  "contacts-export": () => {
    if (!contactsTable) return;
    const rows = [["Nome", "WhatsApp", "Estado", "Tags"]];
    contactsTable.querySelectorAll(".table-row:not(.table-head)").forEach((row) => {
      const cells = row.querySelectorAll("span");
      rows.push([cells[0]?.textContent || "", cells[1]?.textContent || "", cells[2]?.textContent || "", cells[3]?.textContent || ""]);
    });
    downloadFile("contatos.csv", toCsv(rows), "text/csv");
    showToast("Contatos exportados.");
  },
  "contacts-import": () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file || !contactsTable) return;
      file.text().then((content) => {
        const lines = content.split(/\r?\n/).filter(Boolean);
        lines.slice(1).forEach((line) => {
          const [name, phone, state, tag] = line.split(",");
          const actions = document.createElement("div");
          actions.appendChild(createActionButton("Chat", "contact-chat"));
          actions.appendChild(createActionButton("Editar", "contact-edit"));
          const row = createTableRow(
            [name?.replace(/"/g, "") || "", phone?.replace(/"/g, "") || "", state?.replace(/"/g, "") || "", tag?.replace(/"/g, "") || ""],
            actions
          );
          contactsTable.appendChild(row);
        });
        showToast("Importacao concluida.");
      });
    });
    input.click();
  },
  "contact-chat": () => {
    const tab = document.querySelector('[data-target="atendimentos"]');
    if (tab) setActiveTab(tab);
    showToast("Contato enviado para atendimento.");
  },
  "contact-edit": (button) => {
    const row = button.closest(".table-row");
    if (!row) return;
    const cells = row.querySelectorAll("span");
    const name = window.prompt("Nome:", cells[0]?.textContent || "");
    const phone = window.prompt("WhatsApp:", cells[1]?.textContent || "");
    const state = window.prompt("Estado:", cells[2]?.textContent || "");
    const tag = window.prompt("Tags:", cells[3]?.textContent || "");
    if (name) cells[0].textContent = name;
    if (phone) cells[1].textContent = phone;
    if (state) cells[2].textContent = state;
    if (tag) cells[3].textContent = tag;
    showToast("Contato atualizado.");
  },
  "new-support": () => {
    if (!supportList) return;
    const name = window.prompt("Nome do cliente:", "Novo atendimento");
    if (!name) return;
    const channel = window.prompt("Canal (WhatsApp/Instagram/Facebook):", "WhatsApp");
    const summary = window.prompt("Resumo:", "Novo atendimento");
    const key = `chat-${Date.now()}`;
    chatData[key] = {
      title: name,
      channel: `${channel} • Novo`,
      messages: [{ text: summary || "Nova conversa", time: "Agora", type: "incoming" }],
    };
    const card = document.createElement("button");
    card.className = "support-card";
    card.type = "button";
    card.dataset.chat = key;
    card.dataset.draggable = "true";
    card.dataset.searchItem = "";
    card.innerHTML = `<strong>${name}</strong><span>${channel} • Novo</span><p>${summary}</p>`;
    card.addEventListener("click", () => {
      supportList.querySelectorAll(".support-card").forEach((item) => item.classList.remove("is-active"));
      card.classList.add("is-active");
      renderChat(key);
    });
    makeDraggable(card);
    supportList.appendChild(card);
    renderChat(key);
    showToast("Atendimento criado.");
  },
  "create-queue": () => {
    if (!serviceColumns.length) return;
    const name = window.prompt("Novo atendimento na fila:", "Novo cliente");
    if (!name) return;
    const card = document.createElement("div");
    card.className = "service-card";
    card.dataset.draggable = "true";
    card.innerHTML = `<strong>${name}</strong><p>Nova solicitacao criada.</p><span class="tag">Pendente</span>`;
    makeDraggable(card);
    serviceColumns[0].appendChild(card);
    showToast("Fila atualizada.");
  },
  "manage-shifts": () => {
    if (!agentPanel) return;
    agentPanel.querySelectorAll(".agent-card").forEach((card) => {
      const badge = card.querySelector(".status-badge");
      if (!badge) return;
      badge.classList.toggle("busy");
      badge.classList.toggle("online");
      badge.textContent = badge.classList.contains("busy") ? "Pausa" : "Online";
    });
    showToast("Escalas atualizadas.");
  },
  "create-automation": () => {
    const name = window.prompt("Nome da automacao:", "Automacao WhatsApp");
    if (!name || !flowsTable) return;
    const actions = document.createElement("div");
    actions.appendChild(createActionButton("Editar", "flow-edit"));
    actions.appendChild(createActionButton("Duplicar", "flow-clone"));
    const row = createTableRow([name, "Ativo", "Sim"], actions);
    flowsTable.appendChild(row);
    showToast("Automacao criada.");
  },
  "reply-now": () => {
    const tab = document.querySelector('[data-target="atendimentos"]');
    if (tab) setActiveTab(tab);
    showToast("Abrindo atendimento para resposta.");
  },
  "save-profile": () => {
    showToast("Perfil salvo.");
  },
  "manage-api": () => {
    window.alert("Acesse o backend FastAPI em /health para validar integracoes.");
  },
  "update-preferences": () => {
    showToast("Preferencias atualizadas.");
  },
};

const handleActionClick = (event) => {
  const button = event.currentTarget;
  const action = button.dataset.action;
  const handler = actionHandlers[action];
  if (handler) {
    handler(button);
    return;
  }
  const message = actionMessages[action] || "Acao executada.";
  showToast(message);
};

actionButtons.forEach((button) => {
  button.addEventListener("click", handleActionClick);
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
