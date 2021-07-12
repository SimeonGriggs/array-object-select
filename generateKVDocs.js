import sanityClient from "part:@sanity/base/client";
import { randomKey } from "@sanity/util/content";

const client = sanityClient.withConfig({ apiVersion: `2021-05-19` });

const faker = require("faker");
const slugify = require("slugify");

const count = 100;
const kvArray = [];

for (let index = 0; index < count; index++) {
  kvArray[index] = {
    _key: randomKey(12),
    _type: "kvPair",
    key: slugify(faker.commerce.productName(), { lower: true }),
    en: faker.commerce.productAdjective(),
    fr: faker.commerce.productAdjective(),
  };
}

const docs = [
  {
    _type: `kvDoc`,
    title: `Document Created With ${count} Array Items`,
    kvArray,
  },
];

const transaction = client.transaction();

docs.forEach((doc) => transaction.create(doc));

transaction
  .commit()
  .then((transactionRes) => console.log(transactionRes))
  .catch((transactionErr) => console.error(transactionErr));
