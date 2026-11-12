import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

// Testes automáticos das funções sem interface (cliente da API, erros e formatação).
// O fuso horário é fixado para os testes da conversão de UTC para a hora local serem reprodutíveis.
process.env.TZ = "Europe/Lisbon";

export default defineConfig((env) =>
  mergeConfig(
    viteConfig(env),
    defineConfig({
      test: {
        include: ["src/**/*.test.ts"],
        environment: "node",
        restoreMocks: true,
        unstubGlobals: true,
      },
    }),
  ),
);
