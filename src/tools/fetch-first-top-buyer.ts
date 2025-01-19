import { config } from "dotenv";
import { ToolConfig } from "./all-tools";

config();

const BITQUERY_API_URL = "https://streaming.bitquery.io/eap";
const BITQUERY_API_KEY = process.env.BITQUERY_API_KEY;

interface FetchFirstTopBuyerArgs {
  mintAddress: string;
  count: number;
}

interface TradeBuy {
  Amount: string;
  Account: {
    Token: {
      Owner: string;
    };
  };
}

interface DEXTrade {
  Trade: {
    Buy: TradeBuy;
  };
}

interface BitqueryResponse<T> {
  data?: {
    Solana?: T;
  };
}

export const fetchFirstTopBuyer: ToolConfig<FetchFirstTopBuyerArgs> = {
  definition: {
    type: "function",
    function: {
      name: "fetch_first_top_buyer",
      description: "Fetch first top buyers of a token using BITQUERY API",
      parameters: {
        type: "object",
        properties: {
          mintAddress: {
            type: "string",
            pattern: "[1-9A-HJ-NP-Za-km-z]{32,44}",
          },
          count: {
            type: "number",
          },
        },
        required: ["mintAddress", "count"],
      },
    },
  },
  handler: async ({ count, mintAddress }: FetchFirstTopBuyerArgs) => {
    try {
      const query = `
        query MyQuery {
          Solana {
            DEXTrades(
              where: {
                Trade: {
                  Buy: {
                    Currency: {
                      MintAddress: { is: "${mintAddress}" }
                    }
                  }
                }
              }
              limit: { count: ${count} }
              orderBy: { ascending: Block_Time }
            ) {
              Trade {
                Buy {
                  Amount
                  Account {
                    Token {
                      Owner
                    }
                  }
                }
              }
            }
          }
        }`;

      const response = await fetch(BITQUERY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": BITQUERY_API_KEY!,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch top buyers: ${response.statusText}`);
      }

      const data = (await response.json()) as BitqueryResponse<{
        DEXTrades: DEXTrade[];
      }>;

      const trades = data?.data?.Solana?.DEXTrades || [];

      if (trades.length === 0) {
        console.log(`No top buyers found for MintAddress: ${mintAddress}`);
        return {
          success: true,
          message: `No top buyers found for MintAddress: ${mintAddress}`,
          data: [],
        };
      }

      console.log(`Top ${count} buyers for: ${mintAddress}`);

      const results = trades.map(({ Trade }) => {
        const amount = Trade.Buy.Amount || "0.000000";
        const owner = Trade.Buy.Account.Token.Owner || "Unknown Owner Address";

        console.log(`Amount: ${amount} | Owner: ${owner}`);
        return { amount, owner };
      });

      return results;
    } catch (error) {
      console.error("Fetch execution failed:", error);
      return {
        success: false,
        message: `Fetch failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  },
};
