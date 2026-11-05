import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

const requiredEnvironment = [
  "FOUNDRY_PROJECT_ENDPOINT",
  "FOUNDRY_AGENT_NAME",
  "FOUNDRY_MODEL_DEPLOYMENT",
  "FOUNDRY_AGENT_INSTRUCTIONS",
];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]?.trim());

if (missingEnvironment.length > 0) {
  console.error(`Faltan variables de entorno requeridas: ${missingEnvironment.join(", ")}`);
  process.exitCode = 1;
} else {
  const projectClient = new AIProjectClient(
    process.env.FOUNDRY_PROJECT_ENDPOINT,
    new DefaultAzureCredential(),
  );

  try {
    const agent = await projectClient.agents.createVersion(process.env.FOUNDRY_AGENT_NAME, {
      kind: "prompt",
      model: process.env.FOUNDRY_MODEL_DEPLOYMENT,
      instructions: process.env.FOUNDRY_AGENT_INSTRUCTIONS,
    });

    console.log(`Agente creado: ${agent.name} (versión ${agent.version}).`);
  } catch {
    console.error("No fue posible crear el agente. Verifica la configuración y los permisos de Foundry.");
    process.exitCode = 1;
  }
}