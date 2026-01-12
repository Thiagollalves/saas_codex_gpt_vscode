"use client";

import { useMemo, useState, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";

const navItems = [
  { id: "command", label: "Command Center" },
  { id: "crm", label: "CRM" },
  { id: "marketing", label: "Marketing" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "settings", label: "Settings" }
];

const summaryFallback = {
  totalLeads: 3428,
  activeConversations: 218,
  salesRevenue: 452318,
  conversionRate: 5.4
};

const chartFallback = [
  { day: "Seg", value: 34 },
  { day: "Ter", value: 58 },
  { day: "Qua", value: 41 },
  { day: "Qui", value: 73 },
  { day: "Sex", value: 86 },
  { day: "Sáb", value: 22 },
  { day: "Dom", value: 12 }
];

const initialColumns = [
  {
    id: "novos",
    title: "Novos leads",
    items: [
      { id: "lead-instagram", title: "Campanha Instagram • 42 leads" },
      { id: "lead-ebook", title: "Landing Ebook • 18 leads" }
    ]
  },
  {
    id: "qualificacao",
    title: "Qualificação",
    items: [
      { id: "lead-score", title: "Score > 70 • 12 leads" },
      { id: "bot-qualificador", title: "Bot qualificador ativo" }
    ]
  },
  {
    id: "proposta",
    title: "Proposta enviada",
    items: [
      { id: "tempo-medio", title: "Tempo médio: 2h 15m" },
      { id: "conversao", title: "Conversão: 38%" }
    ]
  },
  {
    id: "fechamento",
    title: "Fechamento",
    items: [
      { id: "receita-projetada", title: "Receita projetada R$ 210k" },
      { id: "equipe-sla", title: "Equipe 03 • 92% SLA" }
    ]
  }
];

const storageKey = "nexus-growth:kanban";

type Summary = typeof summaryFallback;

type Column = {
  id: string;
  title: string;
  items: { id: string; title: string }[];
};

type SortableItemProps = {
  id: string;
  title: string;
};

const fetchJson = async <T,>(url: string, fallback: T): Promise<T> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return fallback;
    }
    return (await response.json()) as T;
  } catch (error) {
    return fallback;
  }
};

const SortableItem = ({ id, title }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="border border-zinc-800 bg-zinc-950/80 p-3 text-xs text-zinc-300">
        {title}
      </Card>
    </div>
  );
};

export default function HomePage() {
  const [activeNav, setActiveNav] = useState(navItems[0].id);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [chartData, setChartData] = useState<typeof chartFallback | null>(null);
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [whatsappStatus, setWhatsappStatus] = useState("INITIALIZING");
  const [whatsappQr, setWhatsappQr] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 2000,
        tolerance: 5
      }
    })
  );

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Column[];
        setColumns(parsed);
      } catch (error) {
        localStorage.removeItem(storageKey);
      }
    }
  }, []);

  useEffect(() => {
    fetchJson<Summary>("/api/analytics/summary", summaryFallback).then((data) => {
      setSummary(data);
    });
    fetchJson("/api/analytics/chart-data", chartFallback).then((data) => {
      setChartData(data);
    });
    fetchJson<{ status: string }>("/api/whatsapp/status", { status: "DISCONNECTED" }).then((data) => {
      setWhatsappStatus(data.status);
    });
    fetchJson<{ status: string; qr: string }>("/api/whatsapp/qr", { status: "DISCONNECTED", qr: "" }).then(
      (data) => {
        setWhatsappStatus(data.status);
        setWhatsappQr(data.qr);
      }
    );
  }, []);

  const refreshQr = () => {
    fetchJson<{ status: string; qr: string }>("/api/whatsapp/qr", { status: "DISCONNECTED", qr: "" }).then(
      (data) => {
        setWhatsappStatus(data.status);
        setWhatsappQr(data.qr);
      }
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const sourceColumn = columns.find((column) => column.items.some((item) => item.id === active.id));
    const targetColumn = columns.find((column) => column.items.some((item) => item.id === over.id));

    if (!sourceColumn || !targetColumn) {
      return;
    }

    if (sourceColumn.id === targetColumn.id) {
      const columnItems = sourceColumn.items;
      const oldIndex = columnItems.findIndex((item) => item.id === active.id);
      const newIndex = columnItems.findIndex((item) => item.id === over.id);
      const updatedItems = arrayMove(columnItems, oldIndex, newIndex);
      const updatedColumns = columns.map((column) =>
        column.id === sourceColumn.id ? { ...column, items: updatedItems } : column
      );
      setColumns(updatedColumns);
      localStorage.setItem(storageKey, JSON.stringify(updatedColumns));
      return;
    }

    const activeItem = sourceColumn.items.find((item) => item.id === active.id);
    if (!activeItem) {
      return;
    }

    const updatedColumns = columns.map((column) => {
      if (column.id === sourceColumn.id) {
        return {
          ...column,
          items: column.items.filter((item) => item.id !== active.id)
        };
      }
      if (column.id === targetColumn.id) {
        const newItems = [...column.items, activeItem];
        return { ...column, items: newItems };
      }
      return column;
    });

    setColumns(updatedColumns);
    localStorage.setItem(storageKey, JSON.stringify(updatedColumns));
  };

  const resetKanban = () => {
    setColumns(initialColumns);
    localStorage.setItem(storageKey, JSON.stringify(initialColumns));
  };

  const kpiCards = useMemo(
    () => [
      {
        title: "Total Leads",
        value: summary?.totalLeads ?? 0,
        delta: "+20,1% no mês",
        icon: "👥"
      },
      {
        title: "Conversas ativas",
        value: summary?.activeConversations ?? 0,
        delta: "+180 na última hora",
        icon: "💬"
      },
      {
        title: "Receita de vendas",
        value: summary?.salesRevenue ? `R$ ${summary.salesRevenue.toLocaleString("pt-BR")}` : "R$ 0",
        delta: "+19% no mês",
        icon: "💰"
      },
      {
        title: "Taxa de conversão",
        value: summary?.conversionRate ? `${summary.conversionRate}%` : "0%",
        delta: "+2,1% no mês",
        icon: "📈"
      }
    ],
    [summary]
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="flex min-h-screen">
        <aside className="flex w-64 flex-col border-r border-zinc-800 bg-black/40 px-6 py-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500 text-xl font-bold">N</div>
            <div>
              <div className="text-sm font-semibold">Growth OS</div>
              <div className="text-xs text-zinc-400">Nexus Edition</div>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`rounded-xl px-3 py-2 text-left text-sm transition ${
                  activeNav === item.id
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:bg-zinc-900/60"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs text-zinc-300">
            <p>Teste gratuito de 14 dias</p>
            <Button className="mt-3 w-full" variant="secondary">
              Ativar conta
            </Button>
          </div>
        </aside>

        <main className="flex-1 px-8 py-8">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase text-zinc-500">Growth OS • Command Center</p>
              <h1 className="text-2xl font-semibold">Bem-vindo, time Nexus</h1>
              <p className="text-sm text-zinc-400">
                KPIs em tempo real, automações inteligentes e performance multicanal.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost">Relatórios</Button>
              <Button variant="ghost">Exportar</Button>
              <Button>Nova campanha</Button>
            </div>
          </header>

          <section className="grid gap-6">
            <div className="grid gap-4 lg:grid-cols-4">
              {summary
                ? kpiCards.map((card) => (
                    <Card key={card.title} className="bg-zinc-900/70">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>{card.title}</span>
                        <span className="rounded-full bg-white/5 px-2 py-1 text-base">{card.icon}</span>
                      </div>
                      <div className="text-2xl font-semibold">{card.value}</div>
                      <div className="text-xs text-sky-300">{card.delta}</div>
                    </Card>
                  ))
                : Array.from({ length: 4 }).map((_, index) => (
                    <Card key={`skeleton-${index}`}>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="mt-4 h-8 w-24" />
                      <Skeleton className="mt-3 h-3 w-20" />
                    </Card>
                  ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <Card>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Overview (Mensagens enviadas)</h2>
                  <p className="text-sm text-zinc-400">Dados de /api/analytics/chart-data</p>
                </div>
                <div className="h-64">
                  {chartData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
                        <YAxis stroke="#71717a" fontSize={12} />
                        <Tooltip
                          cursor={{ fill: "rgba(255,255,255,0.05)" }}
                          contentStyle={{ background: "#18181b", border: "1px solid #27272a" }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Skeleton className="h-full w-full" />
                  )}
                </div>
              </Card>
              <Card>
                <h2 className="text-lg font-semibold">Atividades recentes</h2>
                <ul className="mt-4 grid gap-3 text-sm text-zinc-300">
                  <li className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                    <div className="font-semibold">Lead #2043</div>
                    <div className="text-xs text-zinc-500">Iniciou conversa no WhatsApp</div>
                    <div className="text-xs text-zinc-500">agora</div>
                  </li>
                  <li className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                    <div className="font-semibold">Lead #1987</div>
                    <div className="text-xs text-zinc-500">Comprou plano Growth</div>
                    <div className="text-xs text-zinc-500">2 min atrás</div>
                  </li>
                  <li className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                    <div className="font-semibold">Equipe SDR</div>
                    <div className="text-xs text-zinc-500">Meta diária atingida</div>
                    <div className="text-xs text-zinc-500">1h atrás</div>
                  </li>
                </ul>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <h3 className="text-base font-semibold">Omnichannel Queue</h3>
                <p className="text-sm text-zinc-400">Distribuição inteligente com SLA por canal.</p>
                <Button variant="ghost" className="mt-4">
                  Gerenciar filas
                </Button>
              </Card>
              <Card>
                <h3 className="text-base font-semibold">Playbooks & Scripts</h3>
                <p className="text-sm text-zinc-400">Biblioteca de cadências e respostas vencedoras.</p>
                <Button variant="ghost" className="mt-4">
                  Abrir playbooks
                </Button>
              </Card>
              <Card>
                <h3 className="text-base font-semibold">Revenue Intelligence</h3>
                <p className="text-sm text-zinc-400">Alertas de risco e próximas melhores ações.</p>
                <Button variant="ghost" className="mt-4">
                  Ver insights
                </Button>
              </Card>
            </div>
          </section>

          <section className="mt-10 grid gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Pipeline Kanban</h2>
                <p className="text-sm text-zinc-400">Arraste após 2 segundos de toque.</p>
              </div>
              <Button variant="ghost" onClick={resetKanban}>
                Resetar quadro
              </Button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
              <div className="flex h-full overflow-x-auto gap-4 rounded-2xl border border-zinc-800 bg-black/30 p-4 scrollbar-hide">
                {columns.map((column) => (
                  <div
                    key={column.id}
                    className="w-[280px] shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
                  >
                    <h3 className="mb-4 text-sm font-semibold text-zinc-200">{column.title}</h3>
                    <SortableContext items={column.items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                      <div className="grid gap-3">
                        {column.items.map((item) => (
                          <SortableItem key={item.id} id={item.id} title={item.title} />
                        ))}
                      </div>
                    </SortableContext>
                  </div>
                ))}
              </div>
            </DndContext>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <h2 className="text-lg font-semibold">Orquestração WhatsApp</h2>
              <p className="text-sm text-zinc-400">
                Status atual: <span className="text-emerald-400">{whatsappStatus}</span>
              </p>
              <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-center text-xs text-zinc-400">
                  {whatsappQr ? (
                    <img src={whatsappQr} alt="QR Code WhatsApp" className="h-40 w-40 rounded-xl bg-white p-2" />
                  ) : (
                    <Skeleton className="h-40 w-40" />
                  )}
                  <span className="mt-3">Escaneie para conectar</span>
                </div>
                <div className="grid gap-3 text-sm text-zinc-300">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="ghost" onClick={refreshQr}>
                      Atualizar QR Code
                    </Button>
                    <Button variant="secondary">Reiniciar sessão</Button>
                    <Button>Configurar chatbot</Button>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                    Keyword dispatcher ativo: <span className="text-sky-300">30 regras</span>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                    Tempo médio de resposta: <span className="text-sky-300">1m 12s</span>
                  </div>
                </div>
              </div>
            </Card>
            <Card>
              <h2 className="text-lg font-semibold">IA Copilot</h2>
              <p className="text-sm text-zinc-400">Resumo automático de conversas e sugestões.</p>
              <ul className="mt-4 grid gap-3 text-sm text-zinc-300">
                <li className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                  Gerou 12 resumos hoje
                </li>
                <li className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                  34 leads prontos para upgrade
                </li>
                <li className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                  Playbook recomendado: Upsell Pro
                </li>
              </ul>
              <Button className="mt-4 w-full">Treinar modelo</Button>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
