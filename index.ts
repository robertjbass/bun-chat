import OpenAI from "openai";

type Message = {
  role: "system" | "user" | "assistant" | "function";
  content: string;
};

class OpenAIClient {
  private openai: OpenAI;
  private messages: Message[] = [];

  constructor(apiKey: string, systemMessage?: string) {
    this.openai = new OpenAI({ apiKey });
    this.messages.push({
      role: "system",
      content: systemMessage || "You are a helpful assistant.",
    });

    console.log("Start chatting with the assistant. Type exit to exit.");
  }

  private addCharsToStdout = async (chars: string) => {
    await Bun.write(Bun.stdout, chars);
  };

  private createChatCompletion = async (prompt: string): Promise<string> => {
    const stream = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [...this.messages, { role: "user", content: prompt }],
      stream: true,
    });

    let response = "";
    for await (const part of stream) {
      const token = part.choices[0]?.delta?.content || "";
      response += token;
      await this.addCharsToStdout(token);
    }

    await this.addCharsToStdout("\n\n");
    return response;
  };

  public prompt = async () => {
    process.stdout.write("> ");
    for await (const line of console) {
      if (line === "exit") process.exit(0);
      const response = await this.createChatCompletion(line);
      this.messages.push({ role: "user", content: line });
      this.messages.push({ role: "assistant", content: response });

      process.stdout.write("\n> ");
    }

    await this.prompt();
  };
}

const client = new OpenAIClient(
  Bun.env.OPENAI_API_KEY as string,
  "You are a very funny assistand. You're helpful but super funny."
);

await client.prompt();
