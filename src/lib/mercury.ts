import axios from "axios";

const MERCURY_BASE_URL = "https://api.mercury.com/api/v1";

export async function getMercuryClient(apiToken: string) {
  const client = axios.create({
    baseURL: MERCURY_BASE_URL,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
  });

  return {
    async getAccounts() {
      const { data } = await client.get("/accounts");
      return data.accounts;
    },

    async getTransactions(accountId: string, params?: { offset?: number; limit?: number; start?: string; end?: string }) {
      const { data } = await client.get(`/account/${accountId}/transactions`, { params });
      return data.transactions;
    },
  };
}
