import React, { useMemo, useState, useEffect } from "react";
import { FormBuilderInput } from "@sanity/form-builder/lib/FormBuilderInput";
import { FormField } from "@sanity/base/components";
import { randomKey } from "@sanity/util/content";
import {
  Text,
  Card,
  Inline,
  Flex,
  Button,
  Stack,
  Dialog,
  Autocomplete,
} from "@sanity/ui";
import { SearchIcon, EditIcon, AddIcon, TrashIcon } from "@sanity/icons";
import {
  PatchEvent,
  set,
  unset,
  setIfMissing,
  insert,
} from "@sanity/form-builder/PatchEvent";
import Fuse from "fuse.js/dist/fuse.min.js";

import Option from "./Option";

const ArrayObjectSelect = React.forwardRef((props, ref) => {
  const [currentOption, setCurrentOption] = useState(``);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [dialogHeader, setDialogHeader] = useState(``);

  const {
    compareValue,
    focusPath,
    markers,
    onBlur,
    onChange,
    onFocus,
    presence,
    type,
    value,
    level,
  } = props;

  // Copied from from ArrayInput.tsx
  const handleItemChange = (event, item) => {
    // const memberType = this.getMemberTypeOfItem(item)

    // if (!memberType) {
    //   // eslint-disable-next-line no-console
    //   console.log('Could not find member type of item ', item)
    //   return
    // }

    // if (memberType.readOnly) {
    //   return
    // }

    const key = item._key || randomKey(12);

    onChange(
      event
        .prefixAll({ _key: key })
        .prepend(item._key ? [] : set(key, [value.indexOf(item), "_key"]))
    );
  };

  // Edit the currently selected (or just cliced) item
  const handleEdit = (shouldOpen = true) => {
    setDialogHeader(`Edit Item`);
    setEditOpen(shouldOpen);
  };

  // Handle changes to the Autocomplete (including 'clear' button)
  const handleChange = (value = ``) => {
    setCurrentOption(value);
    handleEdit(Boolean(value));
  };

  // Create a new array item
  const handleNew = () => {
    const newKey = randomKey(12);

    setDialogHeader(`Add New Item`);
    setEditOpen(!editOpen);
    setCurrentOption(newKey);

    onChange(
      PatchEvent.from(
        setIfMissing([]),
        insert([{ _key: newKey }], "after", [-1])
      )
    );
  };

  // Remove item from array and reset states
  const handleDelete = () => {
    if (currentOption) {
      const valueIndex = value.findIndex((item) => item._key === currentOption);

      onChange(
        PatchEvent.from(
          unset(currentOption ? [{ _key: currentOption }] : [valueIndex])
        )
      );

      setCurrentOption(``);
    }
  };

  const options = useMemo(
    () =>
      value?.length
        ? value
            // Don't include items that lack _key's
            .filter((item) => item?._key)
            .map((item) => ({
              value: item._key,
              payload: item,
            }))
        : [],
    []
  );

  // Perform fuzzy search on options
  // Helpful for such large amounts of data!
  const handleQueryChange = (query, options) => {
    if (!options?.length || !query) {
      return;
    }

    const fuse = new Fuse(options, {
      keys: ["payload.en", "payload.fr", "payload.key"],
      minMatchCharLength: 2,
      threshold: 0.4,
    });

    const searchResults = fuse.search(query).map(({ item }) => item.value);

    setFilteredOptions(searchResults);
  };

  // Get an array of field names for use in a few instances in the code
  const fieldNames = type?.of?.map((f) => f.name) ?? [];

  // If Presence exist, get the presence as an array for the children of this field
  const childPresence =
    presence.length === 0
      ? presence
      : presence.filter((item) => fieldNames.includes(item.path[0]));

  // If Markers exist, get the markers as an array for the children of this field
  const childMarkers =
    markers.length === 0
      ? markers
      : markers.filter((item) => fieldNames.includes(item.path[0]));

  const firstFieldInput = React.createRef();

  return (
    <>
      <FormField
        title={type.title}
        description={type.description}
        markers={childMarkers}
        presence={childPresence}
      >
        <Stack space={3}>
          {type?.of?.length > 0 &&
            type.of.map((field) => {
              return (
                <>
                  {/* Sets the 'current' item state, does not modify the document */}
                  <Autocomplete
                    fontSize={[2, 2, 3]}
                    icon={SearchIcon}
                    id="array-object-autocomplete"
                    // Performs fuzzy search to get filtered list of values
                    onQueryChange={(query) => handleQueryChange(query, options)}
                    // Use search results to filter options
                    filterOption={(query, option) =>
                      filteredOptions.includes(option.value)
                    }
                    openButton
                    renderOption={Option}
                    renderValue={() =>
                      options?.length > 0 && currentOption
                        ? options
                            .filter((option) => option.value === currentOption)
                            .pop()?.payload.key
                        : ``
                    }
                    // TODO: Integrate slicing/lazy loading as this is slow to open before searching
                    options={options}
                    onChange={(value) => handleChange(value)}
                    disabled={!value?.length || value?.length === 0 || field.readOnly}
                    placeholder={
                      value?.length > 0
                        ? `Search ${
                            value?.length === 1
                              ? `${value?.length} Item`
                              : `${value?.length} Items`
                          }`
                        : ``
                    }
                  />
                  <Flex space={3}>
                    <Inline space={3} paddingRight={3}>
                      <Button
                        mode="ghost"
                        disabled={!currentOption || field.readOnly}
                        icon={EditIcon}
                        text="Edit"
                        onClick={() => handleEdit()}
                      />
                      <Button
                        mode="ghost"
                        disabled={!currentOption || field.readOnly}
                        icon={TrashIcon}
                        text="Delete"
                        onClick={() => handleDelete()}
                        tone="critical"
                      />
                    </Inline>
                    <Button
                      mode="ghost"
                      disabled={field.readOnly}
                      onClick={() => handleNew()}
                      icon={AddIcon}
                      text="Add New"
                      tone="positive"
                      style={{ marginLeft: `auto` }}
                    />
                  </Flex>

                  {value?.length > 0 &&
                    value
                      .filter((fieldValue) => fieldValue._key === currentOption)
                      .map((fieldValue, i) => (
                        <>
                          {editOpen && (
                            <Dialog
                              onClose={() => setEditOpen(false)}
                              width={3}
                              header={dialogHeader}
                            >
                              <Card padding={4}>
                                <FormBuilderInput
                                  level={level + 1}
                                  ref={i === 0 ? firstFieldInput : null}
                                  key={field.name}
                                  type={field.type}
                                  value={fieldValue}
                                  onChange={(patchEvent) =>
                                    handleItemChange(patchEvent, fieldValue)
                                  }
                                  path={[field.name]}
                                  // markers={fieldMarkers}
                                  focusPath={focusPath}
                                  readOnly={field.readOnly}
                                  presence={presence}
                                  onFocus={onFocus}
                                  onBlur={onBlur}
                                  compareValue={compareValue}
                                />
                              </Card>
                            </Dialog>
                          )}
                        </>
                      ))}
                </>
              );
            })}
        </Stack>
      </FormField>
      <Card paddingTop={4}>
        <Text size={1}>Debug: Current Field Value</Text>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Card>
    </>
  );
});

export default ArrayObjectSelect;
