import ArrayObjectSelect from "../../src/components/ArrayObjectSelect";

export default {
  name: "kvDoc",
  title: "Key Value Doc",
  type: "document",
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: "kvArray",
      title: "KV Array",
      type: "array",
      inputComponent: ArrayObjectSelect,
      of: [{ type: "kvPair" }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'kvArray.length',
    },
  },
};
