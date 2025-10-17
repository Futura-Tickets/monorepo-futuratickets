import fs from "fs";
import path from "path";

/**
 * Export contract ABIs to /abi directory for easy backend integration
 */

const contracts = ["FuturaEvent", "FuturaEventFactory"];

const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
const abiDir = path.join(__dirname, "..", "abi");

// Ensure abi directory exists
if (!fs.existsSync(abiDir)) {
  fs.mkdirSync(abiDir, { recursive: true });
}

console.log("📦 Exporting ABIs...\n");

contracts.forEach((contractName) => {
  const artifactPath = path.join(
    artifactsDir,
    `${contractName}.sol`,
    `${contractName}.json`
  );

  if (!fs.existsSync(artifactPath)) {
    console.error(`❌ Artifact not found: ${artifactPath}`);
    return;
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  const abi = artifact.abi;

  // Save ABI
  const abiPath = path.join(abiDir, `${contractName}.json`);
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));

  console.log(`✅ ${contractName}.json`);
});

// Create index.ts for easy imports
const indexContent = `// Auto-generated ABI exports
${contracts
  .map(
    (name) => `import ${name}ABI from "./${name}.json";
export { ${name}ABI };`
  )
  .join("\n")}

export default {
${contracts.map((name) => `  ${name}: ${name}ABI`).join(",\n")}
};
`;

fs.writeFileSync(path.join(abiDir, "index.ts"), indexContent);
console.log(`✅ index.ts\n`);

console.log("📦 ABIs exported successfully!");
console.log(`📁 Location: ${abiDir}`);
