const languages = [
  { id: "en", title: "English", isDefault: true },
  { id: "fr", title: "French" },
];

export default {
  name: "kvPair",
  title: "KV Pair",
  type: "object",
  fields: [
    { name: "key", title: "Key", type: "string" },
    ...languages.map((lang) => ({
      name: lang.id,
      title: lang.title,
      type: "string",
    })),
  ],
};
