import { fetchFirstTopBuyer } from "./fetch-first-top-buyer.js";
import { fetchMarketcap } from "./fetch-marketcap.js";
import { fetchTopHolders } from "./fetch-top-holders.js";
import { fetchTrendingTokens } from "./fetch-trending-token.js";
import { tradeTool } from "./trade.js";

export interface ToolConfig<T = any> {
  definition: {
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: {
        type: "object";
        properties: Record<string, unknown>;
        required: string[];
      };
    };
  };
  handler: (args: T) => Promise<any>;
}

export const tools: Record<string, ToolConfig> = {
  // READ
  fetch_trending_tokens: fetchTrendingTokens,
  fetch_top_holders: fetchTopHolders,
  fetch_marketcap: fetchMarketcap,
  fetch_first_top_buyer: fetchFirstTopBuyer,

  // WRITE
  trade: tradeTool,
};
