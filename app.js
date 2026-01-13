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
const topSearchInput = document.querySelector(".top-search input");
const supportSearchInput = document.querySelector(".support-search input");
const settingsSelects = document.querySelectorAll(".settings-card select");
const settingsInputs = document.querySelectorAll(".settings-card input[type=\"text\"], .settings-card input[type=\"email\"]");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalForm = document.getElementById("modal-form");
const modalCancel = document.getElementById("modal-cancel");
const modalSubmit = document.getElementById("modal-submit");
const modalClose = document.querySelector("[data-modal-close]");
const dashboardHeader = document.querySelector("#command-center .section-header");
const campaignsTable = document.querySelector("#campanhas .table");
const funnelsGrid = document.querySelector(".funnels-grid");
const flowsTable = document.querySelector("#fluxos .table");
const connectionsGrid = document.querySelector(".connections-grid");
const contactsTable = document.querySelector("#contatos .table");
const supportList = document.querySelector(".support-list");
const serviceColumns = document.querySelector(".service-columns");

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
const getSearchItems = () => Array.from(document.querySelectorAll("[data-search-item]"));
const getSupportCards = () => Array.from(document.querySelectorAll(".support-card"));

let activeSupportKey = "techlab";
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

const downloadFile = (filename, content, type = "text/plain") => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const closeModal = () => {
  if (!modal) return;
  modal.classList.add("is-hidden");
  modal.setAttribute("aria-hidden", "true");
};

const openModal = ({ title, content, submitLabel = "Salvar", onSubmit }) => {
  if (!modal || !modalTitle || !modalBody || !modalForm || !modalSubmit) return;
  modalTitle.textContent = title;
  modalBody.innerHTML = "";
  if (typeof content === "string") {
    modalBody.innerHTML = content;
  } else if (content) {
    modalBody.appendChild(content);
  }
  modalSubmit.textContent = submitLabel;
  modal.classList.remove("is-hidden");
  modal.setAttribute("aria-hidden", "false");
  const handler = (event) => {
    event.preventDefault();
    if (onSubmit) {
      const formData = new FormData(modalForm);
      onSubmit(formData);
    }
    closeModal();
  };
  modalForm.addEventListener("submit", handler, { once: true });
};

if (modalCancel) {
  modalCancel.addEventListener("click", () => {
    closeModal();
  });
}

if (modalClose) {
  modalClose.addEventListener("click", () => {
    closeModal();
  });
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

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

const createField = ({ label, name, type = "text", placeholder = "", value = "", required = false }) => {
  const wrapper = document.createElement("label");
  wrapper.textContent = label;
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.placeholder = placeholder;
  input.value = value;
  if (required) input.required = true;
  wrapper.appendChild(input);
  return wrapper;
};

const activateTabById = (targetId) => {
  const tab = Array.from(tabs).find((item) => item.dataset.target === targetId);
  if (tab) setActiveTab(tab);
};

const getKanbanCards = () =>
  Array.from(document.querySelectorAll(".kanban-column")).flatMap((column) =>
    Array.from(column.querySelectorAll(".kanban-card")).map((card) => ({
      stage: column.querySelector("h2")?.textContent?.trim() || "",
      title: card.querySelector("h3")?.textContent?.trim() || "",
      description: card.querySelector("p")?.textContent?.trim() || "",
      tag: card.querySelector(".tag")?.textContent?.trim() || "",
    }))
  );

const addCampaignRow = ({ id, name, status, contacts, replies }) => {
  if (!campaignsTable) return;
  const row = document.createElement("div");
  row.className = "table-row";
  row.dataset.searchItem = "";
  row.dataset.draggable = "true";
  row.innerHTML = `
    <span>${id}</span>
    <span>${name}</span>
    <span>${status}</span>
    <span>${contacts}</span>
    <span>${replies}</span>
    <span>
      <button class="ghost" type="button" data-action="campaign-edit">Editar</button>
    </span>
  `;
  campaignsTable.appendChild(row);
  makeDraggable(row);
};

const addFunnelCard = ({ title, department, leads, sends }) => {
  if (!funnelsGrid) return;
  const card = document.createElement("article");
  card.className = "funnel-card";
  card.dataset.searchItem = "";
  card.dataset.draggable = "true";
  card.innerHTML = `
    <h3>${title}</h3>
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
  funnelsGrid.appendChild(card);
  makeDraggable(card);
};

const addFlowRow = ({ name, status, live }) => {
  if (!flowsTable) return;
  const row = document.createElement("div");
  row.className = "table-row";
  row.dataset.searchItem = "";
  row.dataset.draggable = "true";
  row.innerHTML = `
    <span>${name}</span>
    <span>${status}</span>
    <span>${live}</span>
    <span>
      <button class="ghost" type="button" data-action="flow-edit">Editar</button>
      <button class="ghost" type="button" data-action="flow-clone">Duplicar</button>
    </span>
  `;
  flowsTable.appendChild(row);
  makeDraggable(row);
};

const addConnectionCard = ({ name, channel, status }) => {
  if (!connectionsGrid) return;
  const card = document.createElement("article");
  card.className = "connection-card";
  card.dataset.searchItem = "";
  card.dataset.draggable = "true";
  const isOnline = status.toLowerCase() === "conectado";
  card.innerHTML = `
    <h3>Nome: ${name}</h3>
    <p>${channel}</p>
    <div class="header-actions">
      <button class="ghost" type="button" data-action="import-contacts">Importar contatos</button>
      <button class="ghost" type="button" data-action="disconnect">${isOnline ? "Desconectar" : "Conectar"}</button>
    </div>
  `;
  if (!isOnline) card.classList.add("is-inactive");
  connectionsGrid.appendChild(card);
  makeDraggable(card);
};

const addContactRow = ({ name, phone, state, tag }) => {
  if (!contactsTable) return;
  const row = document.createElement("div");
  row.className = "table-row";
  row.dataset.searchItem = "";
  row.dataset.draggable = "true";
  row.innerHTML = `
    <span>${name}</span>
    <span>${phone}</span>
    <span>${state}</span>
    <span>${tag}</span>
    <span>
      <button class="ghost" type="button" data-action="contact-chat">Chat</button>
      <button class="ghost" type="button" data-action="contact-edit">Editar</button>
    </span>
  `;
  contactsTable.appendChild(row);
  makeDraggable(row);
};

const addSupportCard = ({ key, name, channel, preview }) => {
  if (!supportList) return;
  const card = document.createElement("button");
  card.className = "support-card";
  card.type = "button";
  card.dataset.chat = key;
  card.dataset.draggable = "true";
  card.dataset.searchItem = "";
  card.innerHTML = `<strong>${name}</strong><span>${channel}</span><p>${preview}</p>`;
  supportList.appendChild(card);
  makeDraggable(card);
  attachSupportCardHandlers(card);
};

const addServiceColumn = ({ name }) => {
  if (!serviceColumns) return;
  const column = document.createElement("div");
  column.className = "service-column";
  column.innerHTML = `<h4>${name}</h4>`;
  serviceColumns.appendChild(column);
};

const actionHandlers = {
  "filter-crm": () => {
    const field = createField({
      label: "Buscar no CRM",
      name: "query",
      placeholder: "Digite nome, tag ou descrição",
    });
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(field);
    openModal({
      title: "Filtrar CRM",
      content: container,
      submitLabel: "Aplicar",
      onSubmit: (formData) => {
        const query = formData.get("query")?.toString() || "";
        const results = filterItems(getSearchItems(), query);
        showToast(`Filtro aplicado (${results} resultados).`);
      },
    });
  },
  "export-crm": () => {
    const rows = getKanbanCards();
    const csv = ["Etapa,Titulo,Descricao,Tag"]
      .concat(
        rows.map(
          (row) =>
            `"${row.stage}","${row.title}","${row.description}","${row.tag}"`
        )
      )
      .join("\n");
    downloadFile("crm.csv", csv, "text/csv");
    showToast("Exportação do CRM pronta.");
  },
  notifications: (button) => {
    button.classList.toggle("is-on");
    const isOn = button.classList.contains("is-on");
    button.textContent = isOn ? "Notificações ativas" : "Notificações";
    showToast(isOn ? "Notificações ativadas." : "Notificações pausadas.");
  },
  profile: () => {
    activateTabById("settings");
    showToast("Perfil aberto em Settings.");
  },
  "refresh-dashboard": () => {
    const stamp = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    let badge = document.getElementById("dashboard-last-updated");
    if (!badge && dashboardHeader) {
      badge = document.createElement("span");
      badge.id = "dashboard-last-updated";
      badge.className = "status-badge";
      dashboardHeader.appendChild(badge);
    }
    if (badge) badge.textContent = `Atualizado às ${stamp}`;
    showToast("Dashboard atualizado.");
  },
  "export-dashboard": () => {
    const metrics = Array.from(document.querySelectorAll("#command-center .metric-card")).map(
      (card) => ({
        label: card.querySelector("p")?.textContent || "",
        value: card.querySelector("h3")?.textContent || "",
      })
    );
    const activities = Array.from(document.querySelectorAll("#command-center .activity-card li")).map(
      (item) => item.textContent.trim()
    );
    downloadFile("dashboard.json", JSON.stringify({ metrics, activities }, null, 2), "application/json");
    showToast("Exportação do dashboard concluída.");
  },
  "collapse-config": () => {
    const grid = document.querySelector(".config-grid");
    if (!grid) return;
    grid.classList.toggle("is-collapsed");
    showToast(grid.classList.contains("is-collapsed") ? "Configurações recolhidas." : "Configurações expandidas.");
  },
  "open-plugin": () => {
    openModal({
      title: "Plug-ins",
      content: "<p>Gerencie integrações adicionais e habilite módulos do marketplace.</p>",
      submitLabel: "Entendi",
    });
  },
  "lead-status": () => {
    const field = createField({ label: "Novo status", name: "status", placeholder: "Ex: Qualificado" });
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(field);
    openModal({
      title: "Status de Lead",
      content: container,
      submitLabel: "Adicionar",
      onSubmit: () => showToast("Status criado com sucesso."),
    });
  },
  "quick-messages": () => {
    openModal({
      title: "Mensagens rápidas",
      content: "<p>Adicione atalhos de respostas rápidas para sua equipe.</p>",
      submitLabel: "Salvar",
      onSubmit: () => showToast("Mensagens rápidas atualizadas."),
    });
  },
  labels: () => {
    openModal({
      title: "Etiquetas",
      content: "<p>Organize tags para segmentar contatos e conversas.</p>",
      submitLabel: "Salvar",
      onSubmit: () => showToast("Etiquetas atualizadas."),
    });
  },
  "closure-reasons": () => {
    openModal({
      title: "Motivos de fechamento",
      content: "<p>Defina motivos padrão para fechamento de negócios.</p>",
      submitLabel: "Salvar",
      onSubmit: () => showToast("Motivos atualizados."),
    });
  },
  "templates-sync": () => {
    openModal({
      title: "Templates WhatsApp",
      content: "<p>Sincronize templates aprovados na API oficial.</p>",
      submitLabel: "Sincronizar",
      onSubmit: () => showToast("Templates sincronizados."),
    });
  },
  "users-config": () => {
    openModal({
      title: "Gestao de usuarios",
      content: "<p>Convide, remova ou atualize permissoes dos usuarios.</p>",
      submitLabel: "Fechar",
    });
  },
  departments: () => {
    openModal({
      title: "Departamentos",
      content: "<p>Crie e organize departamentos para distribuição de leads.</p>",
      submitLabel: "Fechar",
    });
  },
  "custom-fields": () => {
    openModal({
      title: "Campos customizados",
      content: "<p>Personalize formulários com novos campos para leads.</p>",
      submitLabel: "Salvar",
      onSubmit: () => showToast("Campos customizados atualizados."),
    });
  },
  "refresh-campaigns": () => {
    showToast("Campanhas atualizadas.");
  },
  "new-campaign": () => {
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(createField({ label: "Nome da campanha", name: "name", required: true }));
    openModal({
      title: "Nova campanha WhatsApp",
      content: container,
      submitLabel: "Criar",
      onSubmit: (formData) => {
        const name = formData.get("name")?.toString() || "Campanha WA";
        const id = Date.now().toString().slice(-4);
        addCampaignRow({ id, name, status: "Rascunho", contacts: "0", replies: "0" });
        showToast("Campanha criada.");
      },
    });
  },
  "new-campaign-waba": () => {
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(createField({ label: "Nome da campanha", name: "name", required: true }));
    openModal({
      title: "Nova campanha WABA",
      content: container,
      submitLabel: "Criar",
      onSubmit: (formData) => {
        const name = formData.get("name")?.toString() || "Campanha WABA";
        const id = Date.now().toString().slice(-4);
        addCampaignRow({ id, name, status: "Programada", contacts: "0", replies: "0" });
        showToast("Campanha WABA criada.");
      },
    });
  },
  "campaign-edit": (button) => {
    const row = button.closest(".table-row");
    if (!row) return;
    const name = row.children[1]?.textContent || "Campanha";
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(createField({ label: "Status", name: "status", value: row.children[2]?.textContent || "" }));
    openModal({
      title: `Editar ${name}`,
      content: container,
      submitLabel: "Atualizar",
      onSubmit: (formData) => {
        row.children[2].textContent = formData.get("status")?.toString() || "Atualizada";
        showToast("Campanha atualizada.");
      },
    });
  },
  "campaign-report": (button) => {
    const row = button.closest(".table-row");
    const name = row?.children[1]?.textContent || "Campanha";
    openModal({
      title: `Relatorio ${name}`,
      content: "<p>Relatorio gerado com métricas de envio e conversao.</p>",
      submitLabel: "Fechar",
    });
  },
  "funnels-refresh": () => showToast("Funis atualizados."),
  "funnels-history": () => {
    openModal({
      title: "Historico de envios",
      content: "<p>Ultimos envios: 28, 32, 40.</p>",
      submitLabel: "Fechar",
    });
  },
  "funnels-new": () => {
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(createField({ label: "Nome do funil", name: "name", required: true }));
    container.appendChild(createField({ label: "Departamento", name: "department", required: true }));
    openModal({
      title: "Novo funil",
      content: container,
      submitLabel: "Criar",
      onSubmit: (formData) => {
        addFunnelCard({
          title: formData.get("name")?.toString() || "Novo funil",
          department: formData.get("department")?.toString() || "Comercial",
          leads: "0",
          sends: "0",
        });
        showToast("Funil criado.");
      },
    });
  },
  "funnels-edit": (button) => {
    const card = button.closest(".funnel-card");
    if (!card) return;
    const title = card.querySelector("h3")?.textContent || "Funil";
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(createField({ label: "Novo nome", name: "name", value: title }));
    openModal({
      title: "Editar funil",
      content: container,
      submitLabel: "Salvar",
      onSubmit: (formData) => {
        card.querySelector("h3").textContent = formData.get("name")?.toString() || title;
        showToast("Funil atualizado.");
      },
    });
  },
  "funnels-copy": (button) => {
    const card = button.closest(".funnel-card");
    if (!card) return;
    addFunnelCard({
      title: `${card.querySelector("h3")?.textContent} (copia)`,
      department: card.querySelector("p")?.textContent.replace("Departamento: ", "") || "Comercial",
      leads: card.querySelector(".funnel-stats span")?.textContent?.replace(" leads", "") || "0",
      sends: card.querySelectorAll(".funnel-stats span")[1]?.textContent?.replace(" envios", "") || "0",
    });
    showToast("Funil duplicado.");
  },
  "flow-add": () => {
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(createField({ label: "Nome do fluxo", name: "name", required: true }));
    openModal({
      title: "Adicionar fluxo",
      content: container,
      submitLabel: "Criar",
      onSubmit: (formData) => {
        addFlowRow({ name: formData.get("name")?.toString() || "Novo fluxo", status: "Ativo", live: "Nao" });
        showToast("Fluxo criado.");
      },
    });
  },
  "flow-edit": (button) => {
    const row = button.closest(".table-row");
    if (!row) return;
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(createField({ label: "Nome", name: "name", value: row.children[0]?.textContent || "" }));
    openModal({
      title: "Editar fluxo",
      content: container,
      submitLabel: "Salvar",
      onSubmit: (formData) => {
        row.children[0].textContent = formData.get("name")?.toString() || row.children[0].textContent;
        showToast("Fluxo atualizado.");
      },
    });
  },
  "flow-clone": (button) => {
    const row = button.closest(".table-row");
    if (!row) return;
    addFlowRow({
      name: `${row.children[0]?.textContent} (copia)`,
      status: row.children[1]?.textContent || "Ativo",
      live: row.children[2]?.textContent || "Nao",
    });
    showToast("Fluxo duplicado.");
  },
  "toggle-inactive": (button) => {
    const isHidden = button.dataset.state === "hidden";
    button.dataset.state = isHidden ? "visible" : "hidden";
    connectionsGrid?.querySelectorAll(".connection-card").forEach((card) => {
      const isInactive = card.classList.contains("is-inactive");
      card.style.display = !isHidden && isInactive ? "none" : "";
    });
    showToast(isHidden ? "Inativos exibidos." : "Inativos ocultados.");
  },
  "notify-me": () => showToast("Notificacoes configuradas."),
  "add-connection": () => {
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(createField({ label: "Nome da conexao", name: "name", required: true }));
    container.appendChild(createField({ label: "Canal", name: "channel", placeholder: "WhatsApp v4" }));
    openModal({
      title: "Nova conexao",
      content: container,
      submitLabel: "Adicionar",
      onSubmit: (formData) => {
        addConnectionCard({
          name: formData.get("name")?.toString() || "Nova conexao",
          channel: formData.get("channel")?.toString() || "WhatsApp v4",
          status: "Conectado",
        });
        showToast("Conexao adicionada.");
      },
    });
  },
  "import-contacts": () => {
    openModal({
      title: "Importar contatos",
      content: "<p>Envie seu arquivo CSV na area de importacao do CRM.</p>",
      submitLabel: "Fechar",
    });
  },
  disconnect: (button) => {
    const card = button.closest(".connection-card");
    if (!card) return;
    const isInactive = card.classList.toggle("is-inactive");
    const statusLine = card.querySelector("p");
    if (statusLine) {
      statusLine.textContent = isInactive
        ? `${statusLine.textContent.split("•")[0].trim()} • Desconectado`
        : `${statusLine.textContent.split("•")[0].trim()} • Conexao estabelecida`;
    }
    button.textContent = isInactive ? "Conectar" : "Desconectar";
    showToast(isInactive ? "Conexao desconectada." : "Conexao reativada.");
  },
  "contacts-add": () => {
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(createField({ label: "Nome", name: "name", required: true }));
    container.appendChild(createField({ label: "WhatsApp", name: "phone", required: true }));
    container.appendChild(createField({ label: "Estado", name: "state", placeholder: "SP" }));
    container.appendChild(createField({ label: "Tag", name: "tag", placeholder: "Lead" }));
    openModal({
      title: "Adicionar contato",
      content: container,
      submitLabel: "Adicionar",
      onSubmit: (formData) => {
        addContactRow({
          name: formData.get("name")?.toString() || "Novo contato",
          phone: formData.get("phone")?.toString() || "+55",
          state: formData.get("state")?.toString() || "-",
          tag: formData.get("tag")?.toString() || "Lead",
        });
        showToast("Contato adicionado.");
      },
    });
  },
  "contacts-import": () => {
    const container = document.createElement("div");
    container.className = "modal-fields";
    const textarea = document.createElement("textarea");
    textarea.name = "csv";
    textarea.placeholder = "Nome,Telefone,Estado,Tag";
    container.appendChild(textarea);
    openModal({
      title: "Importar contatos",
      content: container,
      submitLabel: "Importar",
      onSubmit: (formData) => {
        const text = formData.get("csv")?.toString() || "";
        text
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .forEach((line) => {
            const [name, phone, state, tag] = line.split(",").map((item) => item.trim());
            if (name && phone) {
              addContactRow({ name, phone, state: state || "-", tag: tag || "Lead" });
            }
          });
        showToast("Contatos importados.");
      },
    });
  },
  "contacts-delete": () => {
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(createField({ label: "Nome ou telefone", name: "term" }));
    openModal({
      title: "Remover contatos",
      content: container,
      submitLabel: "Remover",
      onSubmit: (formData) => {
        const term = formData.get("term")?.toString() || "";
        const rows = Array.from(contactsTable?.querySelectorAll(".table-row") || []);
        rows.forEach((row) => {
          if (row.classList.contains("table-head")) return;
          const text = row.textContent;
          if (term && text.includes(term)) row.remove();
        });
        showToast("Contatos removidos.");
      },
    });
  },
  "contacts-export": () => {
    const rows = Array.from(contactsTable?.querySelectorAll(".table-row") || []).filter(
      (row) => !row.classList.contains("table-head")
    );
    const csv = ["Nome,WhatsApp,Estado,Tag"]
      .concat(
        rows.map((row) => {
          const cols = Array.from(row.querySelectorAll("span"));
          return `"${cols[0]?.textContent || ""}","${cols[1]?.textContent || ""}","${cols[2]?.textContent || ""}","${cols[3]?.textContent || ""}"`;
        })
      )
      .join("\n");
    downloadFile("contatos.csv", csv, "text/csv");
    showToast("Exportacao de contatos concluida.");
  },
  "contact-chat": (button) => {
    const row = button.closest(".table-row");
    if (!row) return;
    const name = row.children[0]?.textContent || "Contato";
    const key = name.toLowerCase().replace(/\s+/g, "-");
    if (!chatData[key]) {
      chatData[key] = {
        title: name,
        channel: "WhatsApp • Contato",
        messages: [{ text: "Olá! Vamos iniciar a conversa.", time: "Agora", type: "incoming" }],
      };
      addSupportCard({ key, name, channel: "WhatsApp • Novo", preview: "Conversa iniciada." });
    }
    activateTabById("atendimentos");
    renderChat(key);
    showToast("Chat do contato aberto.");
  },
  "contact-edit": (button) => {
    const row = button.closest(".table-row");
    if (!row) return;
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(createField({ label: "Nome", name: "name", value: row.children[0]?.textContent || "" }));
    container.appendChild(createField({ label: "WhatsApp", name: "phone", value: row.children[1]?.textContent || "" }));
    openModal({
      title: "Editar contato",
      content: container,
      submitLabel: "Salvar",
      onSubmit: (formData) => {
        row.children[0].textContent = formData.get("name")?.toString() || row.children[0].textContent;
        row.children[1].textContent = formData.get("phone")?.toString() || row.children[1].textContent;
        showToast("Contato atualizado.");
      },
    });
  },
  "agent-panel": () => {
    openModal({
      title: "Painel de agentes",
      content: "<p>Monitoramento em tempo real de agentes e status.</p>",
      submitLabel: "Fechar",
    });
  },
  "new-support": () => {
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(createField({ label: "Nome do cliente", name: "name", required: true }));
    container.appendChild(createField({ label: "Canal", name: "channel", placeholder: "WhatsApp" }));
    openModal({
      title: "Novo atendimento",
      content: container,
      submitLabel: "Criar",
      onSubmit: (formData) => {
        const name = formData.get("name")?.toString() || "Novo cliente";
        const key = name.toLowerCase().replace(/\s+/g, "-");
        chatData[key] = {
          title: name,
          channel: `${formData.get("channel")?.toString() || "WhatsApp"} • Novo`,
          messages: [{ text: "Atendimento iniciado.", time: "Agora", type: "incoming" }],
        };
        addSupportCard({ key, name, channel: chatData[key].channel, preview: "Atendimento iniciado." });
        renderChat(key);
        showToast("Atendimento criado.");
      },
    });
  },
  "tag-chat": () => {
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(createField({ label: "Etiqueta", name: "tag", placeholder: "VIP" }));
    openModal({
      title: "Etiquetas do chat",
      content: container,
      submitLabel: "Aplicar",
      onSubmit: (formData) => {
        const tag = formData.get("tag")?.toString();
        if (tag) chatChannel.textContent = `${chatChannel.textContent.split(" • ")[0]} • ${tag}`;
        showToast("Etiqueta aplicada.");
      },
    });
  },
  "transfer-chat": () => {
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(createField({ label: "Agente destino", name: "agent", placeholder: "Camila Santos" }));
    openModal({
      title: "Transferir atendimento",
      content: container,
      submitLabel: "Transferir",
      onSubmit: (formData) => {
        const agent = formData.get("agent")?.toString() || "Agente";
        showToast(`Atendimento transferido para ${agent}.`);
      },
    });
  },
  "omni-dashboard": () => {
    activateTabById("omnichannel");
    showToast("Painel omnichannel aberto.");
  },
  "create-queue": () => {
    const container = document.createElement("div");
    container.className = "modal-fields";
    container.appendChild(createField({ label: "Nome da fila", name: "name", required: true }));
    openModal({
      title: "Criar fila",
      content: container,
      submitLabel: "Criar",
      onSubmit: (formData) => {
        addServiceColumn({ name: formData.get("name")?.toString() || "Nova fila" });
        showToast("Fila criada.");
      },
    });
  },
  sla: () => openModal({ title: "SLA", content: "<p>Defina tempo maximo de resposta por canal.</p>", submitLabel: "Salvar", onSubmit: () => showToast("SLA atualizado.") }),
  routing: () => openModal({ title: "Regras de distribuicao", content: "<p>Configure regras por habilidade e prioridade.</p>", submitLabel: "Salvar", onSubmit: () => showToast("Regras salvas.") }),
  "manage-shifts": () => openModal({ title: "Escalas", content: "<p>Gerencie turnos e pausas da equipe.</p>", submitLabel: "Fechar" }),
  "create-automation": () => openModal({ title: "Automacao", content: "<p>Crie automacoes para respostas e follow-up.</p>", submitLabel: "Salvar", onSubmit: () => showToast("Automacao criada.") }),
  "reply-now": () => {
    activateTabById("atendimentos");
    renderChat(activeSupportKey);
    showToast("Abrindo conversa para responder.");
  },
  "save-profile": () => {
    showToast("Perfil salvo.");
  },
  "manage-api": () => openModal({ title: "API", content: "<p>Gerencie tokens e webhooks da sua conta.</p>", submitLabel: "Fechar" }),
  "update-preferences": () => {
    showToast("Preferencias atualizadas.");
  },
};

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    const handler = actionHandlers[action];
    if (handler) {
      handler(button);
      return;
    }
    const message = actionMessages[action] || "Ação executada.";
    showToast(message);
  });
});

if (topSearchInput) {
  topSearchInput.addEventListener("input", (event) => {
    filterItems(getSearchItems(), event.target.value);
  });
  topSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const query = event.target.value.trim();
      const results = filterItems(getSearchItems(), query);
      showToast(
        `Busca global: ${query || "todos os resultados"} (${results} encontrados)`
      );
    }
  });
}

if (supportSearchInput) {
  supportSearchInput.addEventListener("input", (event) => {
    filterItems(getSupportCards(), event.target.value);
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

let chatData = {
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
  activeSupportKey = key;
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

const attachSupportCardHandlers = (card) => {
  card.addEventListener("click", () => {
    getSupportCards().forEach((item) => item.classList.remove("is-active"));
    card.classList.add("is-active");
    renderChat(card.dataset.chat);
  });
};

getSupportCards().forEach(attachSupportCardHandlers);

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
    if (chatData[activeSupportKey]) {
      chatData[activeSupportKey].messages.push({ text: trimmedMessage, time, type: "outgoing" });
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatForm.reset();
  });
}
