import axios from "axios";
import crypto from "crypto";

const BINANCE_BASE_URL = "https://api.binance.com";

export async function getBinanceClient(apiKey: string, apiSecret: string) {
  function sign(queryString: string) {
    return crypto.createHmac("sha256", apiSecret).update(queryString).digest("hex");
  }

  const client = axios.create({
    baseURL: BINANCE_BASE_URL,
    headers: { "X-MBX-APIKEY": apiKey },
  });

  return {
    async getAccountInfo() {
      const timestamp = Date.now();
      const query = `timestamp=${timestamp}`;
      const signature = sign(query);
      const { data } = await client.get(`/api/v3/account?${query}&signature=${signature}`);
      return data;
    },

    async getRecentTrades(symbol: string = "BTCUSDT", limit: number = 10) {
      const { data } = await client.get(`/api/v3/myTrades`, {
        params: {
          symbol,
          limit,
          timestamp: Date.now(),
          signature: sign(`symbol=${symbol}&limit=${limit}&timestamp=${Date.now()}`),
        },
      });
      return data;
    },
  };
}
