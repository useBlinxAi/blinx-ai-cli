import { Connection, VersionedTransaction, Keypair } from "@solana/web3.js";
import { config } from "dotenv";
import bs58 from "bs58";
import fetch from "node-fetch";
import { ToolConfig } from "./all-tools.js";

config();

const RPC_ENDPOINT =
  process.env.RPC_ENDPOINT || "https://api.mainnet-beta.solana.com";
const web3Connection = new Connection(RPC_ENDPOINT, "confirmed");

interface TradeToolArgs {
  mintAddress: string;
  amount: number;
  destination: string;
  action: string;
  pool: string;
}

const allowedPools = ["pump", "raydium", "auto"];

export const tradeTool: ToolConfig<TradeToolArgs> = {
  definition: {
    type: "function",
    function: {
      name: "trade",
      description: "buy and sell token using pumpportal API",
      parameters: {
        type: "object",
        properties: {
          mintAddress: {
            type: "string",
            pattern: "[1-9A-HJ-NP-Za-km-z]{32,44}",
          },
          amount: {
            type: "number",
          },
          destination: {
            type: "string",
            pattern: "[1-9A-HJ-NP-Za-km-z]{32,44}",
          },
          action: {
            type: "string",
          },
          pool: {
            type: "string",
            enum: allowedPools,
          },
        },
        required: ["mintAddress", "amount", "destination", "action", "pool"],
      },
    },
  },
  handler: async ({ mintAddress, amount, action, pool }: TradeToolArgs) => {
    try {
      if (!allowedPools.includes(pool)) {
        throw new Error(
          `Invalid pool specified! Allowed values: ${allowedPools.join(", ")}`
        );
      }

      const secretKey = process.env.PRIVATE_KEYPAIR;
      if (!secretKey) {
        throw new Error("PRIVATE_KEYPAIR is not set in the .env file!");
      }

      const decodedSecretKey = bs58.decode(secretKey);
      if (decodedSecretKey.length !== 64) {
        throw new Error("Invalid private key length!");
      }

      const signerKeyPair = Keypair.fromSecretKey(decodedSecretKey);

      const response = await fetch("https://pumpportal.fun/api/trade-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicKey: signerKeyPair.publicKey.toBase58(),
          action: action,
          mint: mintAddress,
          denominatedInSol: "false",
          amount: amount,
          slippage: 10,
          priorityFee: 0.00001,
          pool: pool,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.arrayBuffer();
      const tx = VersionedTransaction.deserialize(new Uint8Array(data));
      tx.sign([signerKeyPair]);

      const signature = await web3Connection.sendTransaction(tx);
      return {
        success: true,
        signature,
        message: `Transaction successful: https://solscan.io/tx/${signature}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Trade failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  },
};
