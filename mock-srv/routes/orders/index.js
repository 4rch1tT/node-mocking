"use strict";

module.exports = async function (fastify, opts) {
  fastify.get("/:category", { websocket: true }, (connection, request) => {
    const category = request.params.category;

    // Send current orders
    for (const order of fastify.currentOrders(category)) {
      connection.send(JSON.stringify(order));
    }

    // Stream realtime orders
    (async () => {
      for await (const order of fastify.realtimeOrders(category)) {
        if (connection.readyState >= connection.CLOSING) break;
        try {
          connection.send(JSON.stringify(order));
        } catch (err) {
          console.error("Failed to send order:", err);
          break;
        }
      }
    })();

    // Lifecycle events
    connection.on("close", (code, reason) => {
      console.log(`Socket closed: ${code} ${reason}`);
    });

    connection.on("error", (err) => {
      console.error("Socket error:", err);
    });
  });
};
