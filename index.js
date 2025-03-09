import chalk from "chalk";
import figlet from "figlet";
import fs from "fs/promises";
import upload from "./upload.js";
import swap from "./swap.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const displayBanner = () => {
  console.log(
    chalk.cyan(
      figlet.textSync("Makmum Airdrop", {
        font: "Slant",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 80,
        whitespaceBreak: true,
      })
    )
  );
  const hakari = chalk.bgBlue("Created by https://t.me/hakaringetroll");
  console.log(hakari);
  console.log("Join To get Info airdrop : https://t.me/makmum");
};

const main = async () => {
  displayBanner();

  const wallet = (await fs.readFile("wallet.txt", "utf-8"))
    .replace(/\r/g, "")
    .split("\n")
    .filter(Boolean);

  while (true) {
    for (let i = 0; i < wallet.length; i++) {
      try {
        const px = wallet[i];
        console.log(
          chalk.yellow("🚀 Starting Create and Upload Random file text")
        );
        const uploadMessage = await upload(px);
        console.log(chalk.green(uploadMessage.message));
        console.log(chalk.green(uploadMessage.rootHash));
        // console.log(chalk.yellow("🚀 Starting Swap Token"));
        // const swapMessage = await swap(px);
        // console.log(chalk.green(swapMessage));
      } catch (error) {
        console.log(error);
      }
    }
    console.log(chalk.blue("Wait 24 Hour to Swap daily again ..."));
    await delay(86400000);
  }
};

main();
