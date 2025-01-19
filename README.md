
![Logo](https://res.cloudinary.com/ddrmeqhbp/image/upload/v1737251225/xxxhcofwbv6g0xc8sc1w.png)

# BlinxAI Agent Framework
##### The BlinxAI Framework open-source code allows users to create AI agents directly in their CLI, with BlinxAI acting as a co-pilot to help build them. The BlinxAI API enables interaction with the AI agents created using the BlinxAI Framework's open-source code.

### 🌟 Key Features
- Agent Interaction: Use natural language queries to interact with deployed agents.
- Market Analysis: Fetch real-time blockchain data, including market cap, top token holders, and trading activity
- Trend Insights: Discover trending tokens and analyze trading patterns.
- Custom Queries: Execute powerful custom queries for advanced data analysis.
- Bitquery Integration: Seamlessly integrates with Bitquery APIs to fetch blockchain data.

### 🛠 Framework Capabilities:
- Token Interaction: Query token metrics such as market cap and top holders.
- Trading Analysis: Identify trending tokens and analyze transaction data.
- Customizable Commands: Easily define custom scripts for agent interaction and deployment.
- Cross-Platform: Fully compatible with modern Node.js environments.

## 🚀 Quick Start
### Prerequisites
- Node.js (>= 16.x)
- npm (or yarn) installed
- A valid Bitquery API key
- read .env.example for rest of the Prerequisites

### Installation 
1. Clone the repository
``` bash 
git clone https://github.com/useBlinxAi/blinx-ai-cli.git
cd blinx-ai-cli
```
2. Install dependencies:
``` bash
npm install
```
3. Set up environment variables: Create a .env file in the root directory and add the following variables:
 
```bash
PRIVATE_KEYPAIR=<YOUR_PRIVATE_KEYPAIR>
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY> 
RPC_ENDPOINT=https://api.mainnet-beta.solana.com 
BITQUERY_API_KEY=<YOUR_BITQUERY_API_KEY>
```
4. Build the Agent
```bash
npm run build
```

## 🚀 Run the Agent
```bash
npm run start
```

## Dependencies

The project utilizes the following dependencies:

| Dependency         | Version  | Description                                                                 |
|--------------------|----------|-------------------------------------------------------------------------|
| `@solana/web3.js`          | ^1.98.0  | Interact with Solana blockchain.	                             |
| `dotenv`             | ^16.4.7   | Load environment variables from a .env file.           |
| `node-fetch`           | ^3.3.2  | Lightweight HTTP client for making API requests.                            |
| `openai`           | ^4.77.3  | Integration with OpenAI APIs for natural language queries.              |
| `bs58`          | ^6.0.0	  | Base58 encoding/decoding for Solana addresses.	                             |
| `readline`          | ^1.3.0	  | Provides CLI-based interactive input functionality.	                             |


## Dev Dependencies

The project utilizes the following development dependencies:

| Dependency         | Version  | Purpose                                                                 |
|--------------------|----------|-------------------------------------------------------------------------|
| `typescript`          | ^5.7.3  | Strongly-typed JavaScript for scalable and reliable code.	                                      |
| `ts-node`   | ^10.9.2  | Execute TypeScript code without transpiling it first.                          |                       

## 🔧 How It Works
- Bitquery Integration: Fetches real-time and historical blockchain data for queries.
- Command Parsing: Processes user commands to route them to the appropriate functionality.
- Customizable Framework: Modify or extend the framework to suit your specific needs.

## 🤝 Contribution
We welcome contributions! To get started:

- Fork the repository.
- Create a new branch (feature/my-feature).
- Make your changes and commit them.
- Open a pull request.
