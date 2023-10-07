import path from "path";

type Runtime = "bun" | "node" | "unknown";

const getRuntime = (): Runtime => {
  const runtimePath = process?.env?._ || "";
  const runtime: Runtime = runtimePath.includes("bun")
    ? "bun"
    : runtimePath.includes("node")
    ? "node"
    : "unknown";

  return runtime;
};

export const setup = async () => {
  const runtime = getRuntime();
  if (runtime !== "bun") {
    console.log("This program is meant to be run with bun.");
    process.exit(1);
  }

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
