import { useState } from "react";
import { ConversationDetail } from "./components/ConversationDetail";
import { ConversationList } from "./components/ConversationList";
import { NewConversationForm } from "./components/NewConversationForm";

export function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Mini Inbox</h1>
        <NewConversationForm onCreated={setSelectedId} />
        <ConversationList selectedId={selectedId} onSelect={setSelectedId} />
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
