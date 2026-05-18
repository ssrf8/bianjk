import cors from "@fastify/cors";
import Fastify from "fastify";
import { assertAuthConfig, config } from "./config.js";
import { HttpError } from "./lib/httpError.js";
import { registerAuthRoutes } from "./routes/authRoutes.js";
import { registerFuturesRoutes } from "./routes/futuresRoutes.js";
import { verifyAuthToken } from "./services/authService.js";

const app = Fastify({
  logger: true,
});

assertAuthConfig();

await app.register(cors, {
  origin: false,
});

app.addHook("preHandler", async (request, reply) => {
  if (!request.url.startsWith("/api/futures/")) return;

  if (!verifyAuthToken(request.headers.authorization)) {
    return reply.status(401).send({
      ok: false,
      error: "Unauthorized.",
    });
  }
});

await registerAuthRoutes(app);
await registerFuturesRoutes(app);

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof HttpError) {
    reply.status(error.statusCode).send({
      ok: false,
      error: error.message,
      details: error.details,
    });
    return;
  }

  app.log.error(error);
  reply.status(500).send({
    ok: false,
    error: "Internal server error.",
  });
});

await app.listen({
  host: config.host,
  port: config.port,
});
