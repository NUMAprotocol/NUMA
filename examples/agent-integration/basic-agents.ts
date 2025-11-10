/**
 * Example AI Agent integration with NUMA Marketplace
 * Demonstrates autonomous API discovery and usage
 */
import { NumaAgent } from "@numa-network/agent-sdk";

class FinancialAnalysisAgent extends NumaAgent {
  private budget = BigInt(1000000); // 1 NUMA in wei

  constructor() {
    super({
      name: "FinancialAnalysisAgent",
      specialization: "financial-data",
      minProviderReputation: 80,
      strategy: "balanced",
    });
  }

  async analyzeCompany(companySymbol: string): Promise<AnalysisResult> {
    const task = `Get current stock price, news sentiment, and financial metrics for ${companySymbol}`;

    try {
      // Autonomous API discovery and execution
      const result = await this.discoverAndExecute(task, this.budget);

      // Process the data
      const analysis = this.processFinancialData(result.data);

      return {
        company: companySymbol,
        analysis,
        dataSources: result.sources,
        totalCost: result.totalCost,
      };
    } catch (error) {
      console.error(`Analysis failed for ${companySymbol}:`, error);
      throw error;
    }
  }

  private processFinancialData(rawData: any): FinancialAnalysis {
    // AI-powered analysis of the retrieved data
    return {
      sentiment: this.analyzeSentiment(rawData.news),
      metrics: this.calculateMetrics(rawData.financials),
      recommendation: this.generateRecommendation(rawData),
    };
  }
}

// Usage example
const agent = new FinancialAnalysisAgent();

// The agent autonomously discovers and uses the best data sources
agent.analyzeCompany("AAPL").then((result) => {
  console.log("Autonomous analysis result:", result);
});
