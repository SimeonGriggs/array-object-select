import React from "react";
import { Stack, Button, Text, Box } from "@sanity/ui";

export default function Option({ value, payload }) {
  const subtitle = {...payload}
  
  delete subtitle._key
  delete subtitle._type
  delete subtitle.key

  return (
    <Button style={{ width: `100%`, border: 0 }} mode="bleed">
      <Stack space={3}>
        <Box>
          <Text size={2}>{payload?.key}</Text>
        </Box>
        <Box>
          <Text size={1}>{JSON.stringify(subtitle)}</Text>
        </Box>
      </Stack>
    </Button>
  );
}
