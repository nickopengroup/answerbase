/**
 * Phase 0 smoke test: embed "hello world" via OpenRouter and print the
 * vector length. Expected: 1536 (EMBEDDING_DIM).
 *
 * Run: node --env-file=.env.local scripts/smoke-embeddings.ts
 */
import { embed, EMBEDDING_DIM } from "../lib/embeddings.ts";

async function main() {
  const [vector] = await embed(["hello world"]);
  console.log(`Vector length: ${vector.length}`);
  console.log(`First 5 values: ${vector.slice(0, 5).join(", ")}`);
  if (vector.length !== EMBEDDING_DIM) {
    console.error(
      `FAIL: expected ${EMBEDDING_DIM}, got ${vector.length}.`,
    );
    process.exit(1);
  }
  console.log(`OK: dimension matches EMBEDDING_DIM (${EMBEDDING_DIM}).`);
}

main().catch((err) => {
  console.error("Smoke test failed:");
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
