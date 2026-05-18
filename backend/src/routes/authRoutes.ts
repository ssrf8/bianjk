import type { FastifyInstance } from "fastify";
import { createCaptcha, login } from "../services/authService.js";

export const registerAuthRoutes = async (app: FastifyInstance) => {
  app.get("/api/auth/captcha", async () => createCaptcha());

  app.post("/api/auth/login", async (request) => login(request.body));
};
