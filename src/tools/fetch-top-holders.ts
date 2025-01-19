import { config } from "dotenv";
import { ToolConfig } from "./all-tools";

config();

const BITQUERY_API_URL = "https://streaming.bitquery.io/eap";
const BITQUERY_API_KEY = process.env.BITQUERY_API_KEY;

interface FetchTopHoldersArgs {
  mintAddress: string;
}

interface BalanceUpdate {
  Account: {
    Address: string;
  };
  Holding: string;
}

interface BitqueryResponse<T> {
  data?: {
    Solana?: T;
  };
}

export const fetchTopHolders: ToolConfig<FetchTopHoldersArgs> = {
  definition: {
    type: "function",
    function: {
      name: "fetch_top_holders",
      description: "Fetch the top holders of a token using the BITQUERY API",
      parameters: {
        type: "object",
        properties: {
          mintAddress: {
            type: "string",
            pattern: "[1-9A-HJ-NP-Za-km-z]{32,44}",
          },
        },
        required: ["mintAddress"],
      },
    },
  },
  handler: async ({ mintAddress }: FetchTopHoldersArgs) => {
    try {
      const query = `
      query MyQuery {
        Solana(dataset: realtime) {
          BalanceUpdates(
            limit: { count: 10 }
            orderBy: { descendingByField: "BalanceUpdate_Holding_maximum" }
            where: {
              BalanceUpdate: {
                Currency: {
                  MintAddress: { is: "${mintAddress}" }
                }
              }
              Transaction: { Result: { Success: true } }
            }
          ) {
            BalanceUpdate {
              Account {
                Address
              }
              Holding: PostBalance(maximum: Block_Slot)
            }
          }
        }
      }
      `;

      const response = await fetch(BITQUERY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": BITQUERY_API_KEY!,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch top holders: ${response.statusText}`);
      }

      const data = (await response.json()) as BitqueryResponse<{
        BalanceUpdates: { BalanceUpdate: BalanceUpdate }[];
      }>;
      const balanceUpdates = data?.data?.Solana?.BalanceUpdates || [];

      if (balanceUpdates.length === 0) {
        return {
          success: true,
          message: `No top holders found for MintAddress: ${mintAddress}`,
          data: [],
        };
      }

      const results = balanceUpdates.map(({ BalanceUpdate }) => {
        const address = BalanceUpdate?.Account?.Address || "Unknown Address";
        const holding = BalanceUpdate?.Holding
          ? parseFloat(BalanceUpdate.Holding).toFixed(6)
          : "0.000000";
        return { address, holding };
      });

      console.log(`Top 10 holders for: ${mintAddress}`);
      results.forEach(({ address, holding }) => {
        console.log(`${address} | Holdings: ${holding}`);
      });

      return results;
    } catch (error) {
      return {
        success: false,
        message: `Fetch failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  },
};
