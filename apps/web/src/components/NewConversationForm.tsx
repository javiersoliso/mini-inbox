import { type FormEvent, useState } from "react";
import { ApiError } from "../api/client";
import { useCreateConversation } from "../hooks/conversations";

interface NewConversationFormProps {
  onCreated: (id: string) => void;
}

export function NewConversationForm({ onCreated }: NewConversationFormProps) {
  const createConversation = useCreateConversation();
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createConversation.mutate(
      { contactName, phone },
      {
        onSuccess: (conversation) => {
          setContactName("");
          setPhone("");
          onCreated(conversation.id);
        },
      },
    );
  }

  const { error } = createConversation;
  const errorText =
    error instanceof ApiError && error.details.length > 0
      ? error.details.join(". ")
      : error?.message;

  return (
    <form className="new-conversation" onSubmit={handleSubmit}>
      <input
        value={contactName}
        onChange={(event) => setContactName(event.target.value)}
        placeholder="Nombre"
        aria-label="Nombre del contacto"
      />
      <input
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="+57 300 123 4567"
        aria-label="Número de WhatsApp"
        inputMode="tel"
      />
      <button type="submit" disabled={createConversation.isPending}>
        Nueva conversación
      </button>
      {errorText && <p className="error">{errorText}</p>}
    </form>
  );
}
