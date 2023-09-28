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
  }

  private addCharsToStdout = async (chars: string) => {
    await Bun.write(Bun.stdout, chars);
  };

  private createChatCompletion = async (prompt: string) => {
    const stream = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [...this.messages, { role: "user", content: prompt }],
      stream: true,
    });

    for await (const part of stream) {
      const token = part.choices[0]?.delta?.content || "";
      await this.addCharsToStdout(token);
    }

    this.addCharsToStdout("\n\n");
  };

  public prompt = async () => {
    process.stdout.write("User: ");
    for await (const line of console) {
      this.createChatCompletion(line);
    }

    await this.prompt();
  };
}

const client = new OpenAIClient(
  Bun.env.OPENAI_API_KEY as string,
  "You are a very funny assistand. You're helpful but super funny."
);

await client.prompt();
