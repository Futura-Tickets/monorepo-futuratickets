import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the FuturaEventFactory contract
 * This is deployed once and used to create individual event contracts
 */
const deployFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("=".repeat(60));
  console.log("Deploying FuturaEventFactory...");
  console.log("Deployer:", deployer);
  console.log("=".repeat(60));

  const factoryDeployment = await deploy("FuturaEventFactory", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
    waitConfirmations: hre.network.name === "hardhat" ? 1 : 5,
  });

  console.log("\n" + "=".repeat(60));
  console.log("✅ FuturaEventFactory deployed!");
  console.log("Address:", factoryDeployment.address);
  console.log("Transaction:", factoryDeployment.transactionHash);
  console.log("=".repeat(60) + "\n");

  // Verify on block explorer if not local network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations before verification...");
    await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30s

    try {
      await hre.run("verify:verify", {
        address: factoryDeployment.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on block explorer");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️  Contract already verified");
      } else {
        console.error("❌ Verification failed:", error.message);
      }
    }
  }

  // Save deployment info
  console.log("\n📝 Save this address to your backend .env:");
  console.log(`FACTORY_CONTRACT_ADDRESS=${factoryDeployment.address}`);
};

export default deployFactory;
deployFactory.tags = ["FuturaEventFactory", "factory", "all"];
