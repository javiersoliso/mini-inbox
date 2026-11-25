import { useConversations } from "../hooks/conversations";
import { formatDateTime } from "../lib/format";

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const { data: conversations, isPending, isError } = useConversations();

  if (isPending) return <p className="muted">Cargando…</p>;
  if (isError) return <p className="error">No se pudo cargar la bandeja.</p>;
  if (conversations.length === 0) return <p className="muted">No hay conversaciones.</p>;

  return (
    <ul className="conversation-list">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <button
            type="button"
            className={conversation.id === selectedId ? "conversation selected" : "conversation"}
            onClick={() => onSelect(conversation.id)}
          >
            <span className="conversation-header">
              <strong>{conversation.contactName}</strong>
              <time dateTime={conversation.lastMessageAt}>
                {formatDateTime(conversation.lastMessageAt)}
              </time>
            </span>
            <span className="preview">{conversation.lastMessage || "Sin mensajes"}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
