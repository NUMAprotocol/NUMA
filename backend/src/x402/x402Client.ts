import { ethers } from "ethers";
import { NUMAToken__factory } from "../contracts";

/**
 * X402 Protocol Client for NUMA Marketplace
 * Handles micropayments and API call settlements
 */
export class X402Client {
  private provider: ethers.providers.Provider;
  private signer: ethers.Signer;
  private numaToken: any; // NUMAToken contract instance

  constructor(rpcUrl: string, privateKey: string, tokenAddress: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.numaToken = NUMAToken__factory.connect(tokenAddress, this.signer);
  }

  /**
   * Execute an API call with x402 payment
   */
  async executeAPICall(
    providerAddress: string,
    apiId: number,
    callData: string,
    price: bigint
  ): Promise<any> {
    // Verify agent has sufficient balance
    const agentBalance = await this.numaToken.balanceOf(
      await this.signer.getAddress()
    );
    if (agentBalance < price) {
      throw new Error("Insufficient NUMA balance for API call");
    }

    // Approve token transfer
    const approveTx = await this.numaToken.approve(providerAddress, price);
    await approveTx.wait();

    // Execute API call with payment
    const response = await this.makeAPICall(providerAddress, apiId, callData);

    // Emit payment event
    await this.emitPaymentEvent(providerAddress, apiId, price);

    return response;
  }

  private async makeAPICall(
    providerAddress: string,
    apiId: number,
    callData: string
  ): Promise<any> {
    // Implementation for making the actual API call to provider
    // This would integrate with the provider's x402-compatible endpoint

    const providerInfo = await this.getProviderInfo(providerAddress);
    const endpoint = providerInfo.endpoint;

    const response = await fetch(`${endpoint}/x402/call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-402-Signature": await this.signCall(apiId, callData),
      },
      body: JSON.stringify({
        apiId,
        callData,
        caller: await this.signer.getAddress(),
      }),
    });

    return await response.json();
  }

  private async signCall(apiId: number, callData: string): Promise<string> {
    const message = ethers.utils.solidityPack(
      ["uint256", "bytes"],
      [apiId, callData]
    );
    return await this.signer.signMessage(ethers.utils.arrayify(message));
  }

  private async emitPaymentEvent(
    providerAddress: string,
    apiId: number,
    amount: bigint
  ): Promise<void> {
    // Emit on-chain payment event for settlement
    // This would call a settlement contract
  }

  private async getProviderInfo(address: string): Promise<any> {
    // Fetch provider information from registry
  }
}
