#!/usr/bin/env node
import {mkdir, writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const DEFAULT_SOURCE = "http://localhost:8080/v3/api-docs";
const source = process.env.OPENAPI_SOURCE ?? DEFAULT_SOURCE;

const resolvedOutput =
  process.env.OPENAPI_DEST ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../docs/api/openapi.json");

async function run() {
  console.log(`[openapi:pull] Fetching spec from ${source}`);
  const response = await fetch(source, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI spec (${response.status} ${response.statusText})`);
  }

  const payload = await response.text();
  await mkdir(path.dirname(resolvedOutput), {recursive: true});
  await writeFile(resolvedOutput, payload);
  console.log(`[openapi:pull] Saved to ${resolvedOutput}`);
}

run().catch((error) => {
  console.error("[openapi:pull] Unable to fetch OpenAPI spec", error);
  process.exitCode = 1;
});

