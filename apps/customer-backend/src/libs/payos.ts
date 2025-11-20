import { PayOS } from "@payos/node";
import { config } from "../config/env.config.js";

const payos = new PayOS({
  clientId: config.payos.clientId,
  apiKey: config.payos.apiKey,
  checksumKey: config.payos.checksumKey
});

export default payos;

