export { default as createProxyServer, closeProxyServer } from "./server";
export { default as createProxyClient } from "./client";

import createSwarm from "./client/swarm";
import createDht from "./client/dht";

const createSwarmClient = opts => {
  return createSwarm(opts);
};

const createDhtClient = opts => {
  return createDht(opts);
};

export { createSwarmClient, createDhtClient };
