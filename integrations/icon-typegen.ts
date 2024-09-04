import { readdir } from "node:fs/promises";
import { join, parse } from "node:path";
import { type AstroIntegration, type AstroIntegrationLogger } from "astro";

const INTEGRATION_NAME = "icon-typegen";

function removeFileExtension(path: string) {
  const { dir, name } = parse(path);

  return join(dir, name);
}

function unionType(values: string[]) {
  return values.map((value) => JSON.stringify(value)).join(" | ");
}

async function getTypeDefinitions(
  sourceDirectory: string,
  { logger }: { logger: AstroIntegrationLogger }
) {
  const files = await readdir(sourceDirectory, { recursive: true });
  const filesWithoutExtensions = files.map(removeFileExtension);

  const typeDefinitions = `
declare module 'astro-icons' {
  export type IconName = ${unionType(filesWithoutExtensions)};
}
  `.trim();

  logger.debug("Icon types generated");

  return typeDefinitions;
}

/**
 * @param path Relative to srcDir
 */
export function iconTypegen(path: string): AstroIntegration {
  return {
    name: INTEGRATION_NAME,
    hooks: {
      "astro:config:done": async ({ config, injectTypes, logger }) => {
        const sourceDirectory = join(config.srcDir.pathname, path);
        const typeDefinitions = await getTypeDefinitions(sourceDirectory, {
          logger,
        });

        injectTypes({
          content: typeDefinitions,
          filename: "icons.d.ts",
        });
      },
    },
  };
}
