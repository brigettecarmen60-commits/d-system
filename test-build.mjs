import { buildCognitivePrompt, buildCognitiveUserMessage } from "./src/config/prompts/cognitive.ts";
import { writeFileSync } from "fs";

const system = buildCognitivePrompt();
const user = buildCognitiveUserMessage({ niche: "家庭教育" });

writeFileSync("test-system.txt", system);
writeFileSync("test-user.txt", user);

console.log(`System: ${system.length} chars (~${Math.round(system.length/3.5)} tokens)`);
console.log(`User: ${user.length} chars (~${Math.round(user.length/3.5)} tokens)`);
console.log("Files written to test-system.txt and test-user.txt");
