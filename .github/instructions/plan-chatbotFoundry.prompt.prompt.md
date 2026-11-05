## Plan: Chatbot Foundry desde cero

Construir una aplicación de una sola vista siguiendo la arquitectura ya fijada por `.github/copilot-instructions.md`: navegador -> Express -> Microsoft Foundry. El proyecto está actualmente compuesto por configuración; se añadirán solo los archivos necesarios, sin framework frontend, TypeScript, dotenv ni claves API.

**Pasos**
1. Añadir `package.json` como ES Modules y declarar solo dependencias usadas: Express 5, `@azure/ai-projects` 2.x y `@azure/identity`. Configurar `start` (`node server.js`), `dev` (Node con `--env-file-if-exists=.env` y `--watch`) y `create-agent` (Node con carga opcional de `.env`).
2. Implementar `server.js`: resolver recursos estáticos desde `import.meta.dirname`, servir `public/`, exponer `GET /health` con `{ status: "ok" }` y `POST /api/chat`. Crear una sola vez `AIProjectClient`/cliente OpenAI con `getOpenAIClient` y `DefaultAzureCredential`; validar mensaje de 1 a 2000 caracteres; crear conversación si no llega `conversation_id`; llamar `responses.create` con el `agent_reference` cuyo nombre es `FOUNDRY_AGENT_NAME`; devolver respuesta y `conversation_id`. Traducir fallos de Foundry a 502 genérico sin filtrar trazas.
3. En paralelo con el backend, crear `public/index.html`, `public/styles.css` y `public/app.js` para un chat en español, adaptable desde 360 px y compatible con preferencia de tema oscuro. El cliente mantiene `conversation_id` solo en memoria de página, usa `textContent` al renderizar respuestas, deshabilita envío mientras espera y muestra «Escribiendo…».
4. Añadir `scripts/create-agent.js` con `AIProjectClient` y autenticación por `DefaultAzureCredential`; crear una nueva versión del agente `kind: "prompt"` con nombre, deployment e instrucciones configurados mediante variables de entorno. Validar las variables requeridas y reportar errores sin exponer credenciales.
5. Revisar dependencias/scripts contra los imports y ejecutar verificaciones locales; probar manualmente el intercambio multi-turno y los casos de error descritos abajo.

**Archivos relevantes**
- `c:\Users\Catalina\Documents\CPFIA\Proyecto IA\package.json` — ES Modules, scripts y dependencias.
- `c:\Users\Catalina\Documents\CPFIA\Proyecto IA\server.js` — API Express, clientes Foundry y archivos estáticos.
- `c:\Users\Catalina\Documents\CPFIA\Proyecto IA\public\index.html` — estructura accesible del chat.
- `c:\Users\Catalina\Documents\CPFIA\Proyecto IA\public\styles.css` — presentación responsive y temas.
- `c:\Users\Catalina\Documents\CPFIA\Proyecto IA\public\app.js` — burbujas, envío, estado de espera y continuidad de conversación.
- `c:\Users\Catalina\Documents\CPFIA\Proyecto IA\scripts\create-agent.js` — creación/versionado del agente prompt.
- Configuración que se consulta y conserva: `.github/copilot-instructions.md`, `.github/instructions/backened.instructions.md`, `.github/instructions/frontend.instructions.md`, `.gitignore` y el `.env` existente (no leer ni sobrescribir valores locales).

**Verificación**
1. `npm run dev` en Node 24 y `Invoke-RestMethod http://localhost:3000/health` devuelve `status: ok`.
2. En el navegador, enviar una pregunta y luego un seguimiento; ambas solicitudes deben conservar el mismo `conversation_id` y el agente debe tener contexto.
3. Enviar mensaje vacío/solo espacios y comprobar HTTP 422; comprobar también que más de 2000 caracteres se rechazan con 422.
4. Ejecutar `npm run create-agent` con permisos/variables configurados y confirmar que se crea una nueva versión `kind: "prompt"`; confirmar además que faltas de configuración se reportan claramente.
5. Revisar que `npm start` inicia el servidor y que las dependencias declaradas cubren todos los imports. No desplegar ni modificar recursos de Azure como parte de este alcance.

**Decisiones**
- Usar variables `FOUNDRY_PROJECT_ENDPOINT`, `FOUNDRY_AGENT_NAME`, `FOUNDRY_MODEL_DEPLOYMENT` y `FOUNDRY_AGENT_INSTRUCTIONS`; nunca incorporar endpoints reales, tokens ni claves al código.
- Repetir `create-agent` crea una nueva versión del agente con el mismo nombre.
- La experiencia visual será un chat en español sobrio, sin marca ni identidad visual aportada.
- `conversation_id` se mantiene en memoria del navegador y se reinicia al recargar, conforme a la instrucción frontend local.
- Mantener la arquitectura Express y las instrucciones/configuración existentes; fuera de alcance: despliegue Azure, frameworks, pruebas con servicios reales automatizadas o nuevas funciones de producto.