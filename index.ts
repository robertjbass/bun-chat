import { OpenAIClient } from "./openAiClient";
import { setup } from "./setup";

export const main = async () => {
  const OPENAI_API_KEY = await setup();

  const client = new OpenAIClient(
    OPENAI_API_KEY
    // "You are a very funny assistand. You're helpful but super funny."
  );

  await client.prompt();
};

main();
