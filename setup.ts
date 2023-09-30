import path from "path";

export const setup = async () => {
  let OPENAI_API_KEY = Bun.env.OPENAI_API_KEY as string;
  const configFilePath = path.resolve(Bun.env.HOME as string, ".askchat.json");

  const file = Bun.file(configFilePath, { type: "application/json" });
  const fileExists = await file.exists();

  if (!fileExists) {
    process.stdout.write("Enter your Open AI Key:\n");

    let inputReceived = false;
    for await (const line of console) {
      if (!inputReceived) {
        OPENAI_API_KEY = line;
        inputReceived = true;
        break;
      }
    }

    const fileContents = JSON.stringify({ OPENAI_API_KEY });
    await Bun.write(configFilePath, fileContents);
  } else {
    const fileText = await file.text();
    OPENAI_API_KEY = JSON.parse(fileText).OPENAI_API_KEY;
  }

  return OPENAI_API_KEY;
};
