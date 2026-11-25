import type { StatusFilter } from "@mini-inbox/types";
import { useConversations } from "../hooks/conversations";
import { formatDateTime } from "../lib/format";

const EMPTY_TEXT: Record<StatusFilter, string> = {
  open: "No hay conversaciones abiertas.",
  resolved: "No hay conversaciones resueltas.",
  all: "No hay conversaciones.",
};

interface ConversationListProps {
  status: StatusFilter;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ status, selectedId, onSelect }: ConversationListProps) {
  const { data: conversations, isPending, isError } = useConversations(status);

  if (isPending) return <p className="muted">Cargando…</p>;
  if (isError) return <p className="error">No se pudo cargar la bandeja.</p>;
  if (conversations.length === 0) return <p className="muted">{EMPTY_TEXT[status]}</p>;

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
            {conversation.status === "resolved" && <span className="badge">Resuelta</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}
