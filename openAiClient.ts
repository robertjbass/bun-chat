import path from "path";
import OpenAI from "openai";
import chalk from "chalk";
import { unlink } from "node:fs/promises";
import { main } from ".";

type Message = {
  role: "system" | "user" | "assistant" | "function";
  content: string;
};

export class OpenAIClient {
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
    await Bun.write(Bun.stdout, chalk.blue(chars));
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

    await this.addCharsToStdout("\n");
    return response;
  };

  public prompt = async () => {
    process.stdout.write("> ");
    for await (const line of console) {
      if (line === "exit") process.exit(0);

      try {
        const response = await this.createChatCompletion(line);
        this.messages.push({ role: "user", content: line });
        this.messages.push({ role: "assistant", content: response });

        process.stdout.write("\n> ");
      } catch (error: any) {
        if (error.code === "invalid_api_key") {
          console.error(
            "Invalid API Key. Please check your .askchat.json file."
          );
          const configFilePath = path.resolve(
            Bun.env.HOME as string,
            ".askchat.json"
          );
          await unlink(configFilePath);

          return main();
        }
        console.error(error);
      }
    }

    await this.prompt();
  };
}
