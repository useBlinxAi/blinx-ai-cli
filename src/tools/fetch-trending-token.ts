import { config } from "dotenv";
import { ToolConfig } from "./all-tools";
import fetch from "node-fetch";

config();

const BITQUERY_API_URL = "https://streaming.bitquery.io/eap";
const BITQUERY_API_KEY = process.env.BIQUERY_API_KEY;

interface FetchTrendingTokensArgs {
  amount: number;
}

interface BitqueryResponse<T> {
  data?: {
    Solana?: T;
  };
}

interface TradeCurrency {
  Name?: string;
  MintAddress?: string;
  Symbol?: string;
}

interface DEXTrade {
  Currency: TradeCurrency;
}

export const fetchTrendingTokens: ToolConfig<FetchTrendingTokensArgs> = {
  definition: {
    type: "function",
    function: {
      name: "fetch_trending_tokens",
      description: "fetch trending Solana tokens using BITQUERY API",
      parameters: {
        type: "object",
        properties: {
          amount: {
            type: "number",
          },
        },
        required: ["amount"],
      },
    },
  },
  handler: async ({ amount }: FetchTrendingTokensArgs) => {
    try {
      const query = `
query MyQuery {
  Solana {
    DEXTradeByTokens(
      where: {Transaction: {Result: {Success: true}}, Trade: {Side: {Currency: {MintAddress: {is: "So11111111111111111111111111111111111111112"}}}}, Block: {Time: {since: "2024-08-15T04:19:00Z"}}}
      orderBy: {}
      limit: {count: ${amount}}
    ) {
      Trade {
        Currency {
          Name
          MintAddress
          Symbol
        }
        start: PriceInUSD
        min5: PriceInUSD(
          minimum: Block_Time
          if: {Block: {Time: {after: "2024-08-15T05:14:00Z"}}}
        )
        end: PriceInUSD(maximum: Block_Time)
        Side {
          Currency {
            Symbol
            Name
            MintAddress
          }
        }
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
        throw new Error(
          `Failed to fetch trending tokens: ${response.statusText}`
        );
      }

      const data = (await response.json()) as BitqueryResponse<{
        DEXTradeByTokens: { Trade: DEXTrade }[];
      }>;
      const trades = data?.data?.Solana?.DEXTradeByTokens || [];

      if (trades.length === 0) {
        return {
          success: true,
          message: "No trending token found",
        };
      }

      trades.forEach(({ Trade }) => {
        const name = Trade.Currency.Name || "Unknown Token";
        const mintAddress = Trade.Currency.MintAddress || "Unknown Address";

        console.log(`${mintAddress} | ${name}`);
      });

      return trades;
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch trending token: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  },
};
