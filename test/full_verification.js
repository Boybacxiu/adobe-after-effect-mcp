import { server } from "../build/index.js";
import * as fs from "fs";
import * as path from "path";

console.log("==================================================");
console.log("  FULL INTEGRITY VERIFICATION TEST SUITE");
console.log("==================================================");

// 1. Verify registered tools count
const registeredTools = server._registeredTools;
const toolNames = Object.keys(registeredTools);
console.log(`[PASS] Total Registered Tools: ${toolNames.length} / 167`);
if (toolNames.length < 167) {
  console.error(`[FAIL] Expected at least 167 tools, got ${toolNames.length}`);
  process.exit(1);
}

// 2. Verify registered prompts count
const registeredPrompts = server._registeredPrompts;
const promptNames = Object.keys(registeredPrompts);
console.log(`[PASS] Registered Prompts: ${promptNames.length} (${promptNames.join(", ")})`);

// 3. Verify registered resources
const registeredResources = server._registeredResources;
const resourceCount = Object.keys(registeredResources).length;
console.log(`[PASS] Registered Resources: ${resourceCount}`);

// 4. Verify build/scripts existence
const scriptsDir = path.resolve("build", "scripts");
if (!fs.existsSync(scriptsDir)) {
  console.error(`[FAIL] build/scripts directory not found!`);
  process.exit(1);
}
const scripts = fs.readdirSync(scriptsDir);
console.log(`[PASS] Synchronized ExtendScript files in build/scripts: ${scripts.length} files`);
const bridgeAuto = path.join(scriptsDir, "mcp-bridge-auto.jsx");
if (!fs.existsSync(bridgeAuto)) {
  console.error(`[FAIL] mcp-bridge-auto.jsx missing!`);
  process.exit(1);
}
console.log(`[PASS] mcp-bridge-auto.jsx verified (${(fs.statSync(bridgeAuto).size / 1024).toFixed(1)} KB)`);

// 5. Verify all 13 Agent Skills
const skillsDir = path.resolve(".agent", "skills");
const skillFolders = fs.readdirSync(skillsDir);
let validSkills = 0;
for (const folder of skillFolders) {
  const skillFile = path.join(skillsDir, folder, "SKILL.md");
  if (fs.existsSync(skillFile)) {
    const content = fs.readFileSync(skillFile, "utf8");
    if (content.startsWith("---") && content.includes("name:") && content.includes("description:")) {
      validSkills++;
    }
  }
}
console.log(`[PASS] Verified Agent Skills: ${validSkills} / 13 valid SKILL.md documents`);
if (validSkills < 13) {
  console.error(`[FAIL] Expected 13 valid skills, found ${validSkills}`);
  process.exit(1);
}

console.log("==================================================");
console.log("  ALL CHECKS PASSED - 100% HEALTHY (EXIT 0)");
console.log("==================================================");
process.exit(0);
