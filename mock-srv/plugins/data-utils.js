"use strict";

const { promisify } = require("util");
const fp = require("fastify-plugin");
const timeout = promisify(setTimeout);

const orders = {
  A1: { total: 3 },
  A2: { total: 7 },
  B1: { total: 101 },
};

const catToPrefix = {
  electronics: "A",
  confectionery: "B",
};

// Async generator for realtime updates
async function* realtimeOrdersSimulator() {
  const ids = Object.keys(orders);
  while (true) {
    const delta = Math.floor(Math.random() * 7) + 1;
    const id = ids[Math.floor(Math.random() * ids.length)];
    orders[id].total += delta;
    const { total } = orders[id];

    // Derive category from prefix
    const category = Object.keys(catToPrefix).find((cat) =>
      id.startsWith(catToPrefix[cat]),
    );

    yield { id, total, category, status: "confirmed" };
    await timeout(1500);
  }
}

// Sync generator for current orders
function* currentOrders(category) {
  const idPrefix = catToPrefix[category];
  if (!idPrefix) return;
  const ids = Object.keys(orders).filter((id) => id[0] === idPrefix);
  for (const id of ids) {
    yield { id, ...orders[id], category, status: "confirmed" };
  }
}

const calculateID = (idPrefix, data) => {
  const sorted = [...new Set(data.map(({ id }) => id))];
  const next = Number(sorted.pop().slice(1)) + 1;
  return `${idPrefix}${next}`;
};

module.exports = fp(async function (fastify, opts) {
  fastify.decorate("currentOrders", currentOrders);
  fastify.decorate("realtimeOrders", realtimeOrdersSimulator);
  fastify.decorateRequest("mockDataInsert", function insert(category, data) {
    const request = this;
    const idPrefix = catToPrefix[category];
    const id = calculateID(idPrefix, data);
    orders[id] = { total: 0 };
    data.push({ id, ...request.body, category, status: "pending" });
  });
});
