import { ToolConfig } from "./all-tools";

interface FetchMarketcapArgs {
  count: number;
  term: string;
}

interface DexScreenerTokenData {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels: string[];
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: {
      buys: number;
      sells: number;
    };
    h1: {
      buys: number;
      sells: number;
    };
    h6: {
      buys: number;
      sells: number;
    };
    h24: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info: {
    imageUrl: string;
    header: string;
    openGraph: string;
    websites: {
      label: string;
      url: string;
    }[];
    socials: {
      type: string;
      url: string;
    }[];
  };
  boosts: {
    active: number;
  };
}

function formatMarketcap(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toFixed(0);
}

export const fetchMarketcap: ToolConfig<FetchMarketcapArgs> = {
  definition: {
    type: "function",
    function: {
      name: "fetch_marketcap",
      description: "Fetch marketcap of Solana tokens using the DexScreener API",
      parameters: {
        type: "object",
        properties: {
          count: {
            type: "number",
            description: "The number of tokens to fetch (maximum 30)",
          },
          term: {
            type: "string",
            description: "Search term for token mint address",
          },
        },
        required: ["count", "term"],
      },
    },
  },
  handler: async ({ count, term }: FetchMarketcapArgs) => {
    try {
      if (count > 30) count = 30;

      const chainId = "solana";
      const tokenAddresses = term.split(",").slice(0, count).join(",");

      const response = await fetch(
        `https://api.dexscreener.com/tokens/v1/${chainId}/${tokenAddresses}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch market cap data: ${response.statusText}`
        );
      }

      const data = (await response.json()) as DexScreenerTokenData[];

      if (data.length === 0) {
        return {
          success: true,
          message: `No results found for term: "${term}"`,
        };
      }

      const results = data.map((tokenData) => ({
        symbol: tokenData.baseToken.symbol,
        mintAddress: tokenData.baseToken.address,
        marketcap: tokenData.marketCap,
      }));

      results.forEach(({ symbol, mintAddress, marketcap }) => {
        console.log(`${symbol} | ${mintAddress} | Marketcap: ${marketcap}`);
      });

      return results[0].marketcap;
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
