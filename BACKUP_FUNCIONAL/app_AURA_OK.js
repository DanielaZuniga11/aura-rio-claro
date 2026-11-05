const form = document.querySelector("#chat-form");
const input = document.querySelector("#message");
const thread = document.querySelector("#thread");
const sendButton = document.querySelector("#send-button");
const newChatButton = document.querySelector("#new-chat");
const typingIndicator = document.querySelector("#typing-indicator");

let conversationId = null;
let isSending = false;

function addMessage(role, text) {
  const message = document.createElement("article");
  message.className = `message message--${role}`;
  message.dataset.dynamic = "true";

  const content = document.createElement("div");
  content.className = "message-content";

  const meta = document.createElement("div");
  meta.className = "message-meta";

  const label = document.createElement("span");
  label.textContent = role === "user" ? "Tú" : "Asistente";
  meta.append(label);

  const bubble = document.createElement("p");
  bubble.className = "message-bubble";
  bubble.textContent = text;
  content.append(meta, bubble);

  if (role === "assistant") {
    const mark = document.createElement("span");
    mark.className = "assistant-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "C";
    message.append(mark, content);
  } else {
    message.append(content);
  }

  thread.append(message);
  thread.scrollTo({ top: thread.scrollHeight, behavior: "smooth" });
}

function resizeInput() {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
}

function setSending(sending) {
  isSending = sending;
  sendButton.disabled = sending;
  newChatButton.disabled = sending;
  typingIndicator.hidden = !sending;
}

input.addEventListener("input", resizeInput);

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = input.value.trim();

  if (isSending || message.length === 0 || message.length > 2000) {
    return;
  }

  addMessage("user", message);
  input.value = "";
  resizeInput();
  setSending(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, conversation_id: conversationId }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || "No se pudo procesar tu consulta.");
    }

    conversationId = result.conversation_id || conversationId;
    addMessage("assistant", result.reply || "No recibí una respuesta. Inténtalo de nuevo.");
  } catch {
    addMessage("assistant", "No se pudo obtener una respuesta. Inténtalo de nuevo en unos momentos.");
  } finally {
    setSending(false);
    input.focus();
  }
});

newChatButton.addEventListener("click", () => {
  if (isSending) {
    return;
  }

  conversationId = null;
  thread.querySelectorAll('[data-dynamic="true"]').forEach((message) => message.remove());
  input.value = "";
  resizeInput();
  input.focus();
});