import { useState } from "react";
import { ConversationDetail } from "./components/ConversationDetail";
import { ConversationList } from "./components/ConversationList";
import { NewConversationForm } from "./components/NewConversationForm";
import { StatusFilterTabs } from "./components/StatusFilterTabs";
import { useStatusFilter } from "./hooks/use-status-filter";

export function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useStatusFilter();

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Mini Inbox</h1>
        <NewConversationForm onCreated={setSelectedId} />
        <StatusFilterTabs value={statusFilter} onChange={setStatusFilter} />
        <ConversationList status={statusFilter} selectedId={selectedId} onSelect={setSelectedId} />
      </aside>
      <main className="detail">
        {selectedId ? (
          <ConversationDetail key={selectedId} id={selectedId} />
        ) : (
          <p className="muted empty">Selecciona una conversación.</p>
        )}
      </main>
    </div>
  );
}
