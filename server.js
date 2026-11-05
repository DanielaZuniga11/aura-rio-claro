import express from "express";
import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";
import path from "node:path";

const projectEndpoint = process.env.FOUNDRY_PROJECT_ENDPOINT;
const agentName = process.env.FOUNDRY_AGENT_NAME;

if (!projectEndpoint || !agentName) {
  throw new Error("FOUNDRY_PROJECT_ENDPOINT and FOUNDRY_AGENT_NAME are required.");
}

const projectClient = new AIProjectClient(projectEndpoint, new DefaultAzureCredential());
const openAIClient = projectClient.getOpenAIClient();
const agentRef = {
  body: {
    agent_reference: {
      name: agentName,
      type: "agent_reference"
    }
  }
};

const app = express();
const port = Number(process.env.PORT) || 3000;
const publicDirectory = path.join(import.meta.dirname, "public");

app.use(express.json({ limit: "10kb" }));
app.use((error, _request, response, next) => {
  if (error.type === "entity.too.large") {
    return response.status(422).json({ error: "El mensaje debe tener entre 1 y 2000 caracteres." });
  }

  return next(error);
});
app.use(express.static(publicDirectory));

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post("/api/chat", async (request, response) => {
  const message = typeof request.body?.message === "string" ? request.body.message.trim() : "";
  const conversationId = request.body?.conversation_id;

  if (message.length === 0 || message.length > 2000) {
    return response.status(422).json({ error: "El mensaje debe tener entre 1 y 2000 caracteres." });
  }

  if (conversationId !== undefined && conversationId !== null && typeof conversationId !== "string") {
    return response.status(422).json({ error: "El conversation_id no es válido." });
  }

try {
  const conversation =
    conversationId || (await openAIClient.conversations.create()).id;

  const result = await openAIClient.responses.create(
    { conversation, input: message },
    agentRef,
  );

  return response.json({
    reply: result.output_text,
    conversation_id: conversation
  });

} catch (error) {
  console.error("Foundry request failed:", JSON.stringify(error, null, 2));
  console.error("STACK:", error?.stack);

  return response.status(502).json({
    error: "No fue posible obtener una respuesta en este momento."
  });
}
});

app.listen(port, () => {
  console.log(`Chatbot server listening on port ${port}`);
});