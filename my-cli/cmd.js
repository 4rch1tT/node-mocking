#!/usr/bin/env node
import got from "got";
import minimist from "minimist";
import commist from "commist";

const API = "http://localhost:3000";

const categories = ["confectionery", "electronics"];

const usage = (msg = "Back office for My App") => {
  console.log(`\n${msg}\n`);
  console.log("add:");
  console.log("  order: my-cli add order <id> --amount=<int> --api=<string>");
  console.log("         my-cli add order <id> -n=<int> --api=<string>\n");
  console.log("list:");
  console.log("  cats   my-cli list cats");
  console.log("  ids:   my-cli list ids --cat=<string> --api=<string>");
  console.log("  ids:   my-cli list ids -c=<string> --api=<string>");
};
const argv = process.argv.slice(2);
const args = minimist(argv, {
  alias: { amount: "n" },
  string: ["api"],
  default: { api: API },
});
if (args._.length < 1) {
  usage();
  process.exit(1);
}

const [id] = args._;
const { amount, api } = args;

if (Number.isInteger(amount) === false) {
  usage("Error: --amount flag is required and must be an integer");
  process.exit(1);
}

try {
  await got.post(`${api}/prders/${id}`, {
    json: { amount },
  });
} catch (err) {
  console.log(err.message);
  process.exit(1);
}
