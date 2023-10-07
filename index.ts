import { OpenAIClient } from "./openAiClient";
import { setup } from "./setup";

export const main = async () => {
  const OPENAI_API_KEY = await setup();

  const client = new OpenAIClient(
    OPENAI_API_KEY,
    "You are an AI assistant designed to help software engineers to build better software."
  );

  await client.prompt();
};

main();
