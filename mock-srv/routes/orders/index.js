"use strict";

module.exports = async function (fastify, opts) {
  fastify.get("/:category", { websocket: true }, async (conn, request) => {
    conn.send(JSON.stringify({ id: "A1", total: 3 }));
  });
};
