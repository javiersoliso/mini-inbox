import { type FormEvent, useState } from "react";
import {
  useConversation,
  useMessages,
  useSendMessage,
  useUpdateConversationStatus,
} from "../hooks/conversations";
import { formatDateTime } from "../lib/format";

interface ConversationDetailProps {
  id: string;
}

export function ConversationDetail({ id }: ConversationDetailProps) {
  const conversation = useConversation(id);
  const messages = useMessages(id);
  const sendMessage = useSendMessage(id);
  const updateStatus = useUpdateConversationStatus(id);
  const [text, setText] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage.mutate({ text }, { onSuccess: () => setText("") });
  }

  if (conversation.isPending) return <p className="muted">Cargando…</p>;
  if (conversation.isError) return <p className="error">No se encontró la conversación.</p>;

  const isResolved = conversation.data.status === "resolved";

  return (
    <section className="conversation-detail">
      <header className="detail-header">
        <div>
          <h2>{conversation.data.contactName}</h2>
          <p className="muted">
            {conversation.data.phone} · {isResolved ? "Resuelta" : "Abierta"}
          </p>
        </div>
        <button
          type="button"
          disabled={updateStatus.isPending}
          onClick={() => updateStatus.mutate({ status: isResolved ? "open" : "resolved" })}
        >
          {isResolved ? "Reabrir" : "Marcar como resuelta"}
        </button>
      </header>
      {updateStatus.isError && <p className="error">{updateStatus.error.message}</p>}

      <ol className="messages">
        {messages.data?.map((message) => (
          <li key={message.id} className={`message ${message.author}`}>
            <p>{message.text}</p>
            <time dateTime={message.sentAt}>{formatDateTime(message.sentAt)}</time>
          </li>
        ))}
      </ol>

      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Escribe una respuesta…"
          aria-label="Respuesta"
          rows={2}
        />
        <button type="submit" disabled={sendMessage.isPending || text.trim() === ""}>
          Enviar
        </button>
      </form>
      {sendMessage.isError && <p className="error">{sendMessage.error.message}</p>}
    </section>
  );
}
