import schemaTypes from 'all:part:@sanity/base/schema-type'
import createSchema from 'part:@sanity/base/schema-creator'

import kv from './documents/kv'
import kvPair from './objects/kvPair'

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([
    // Objects
    kvPair,

    // Documents
    kv
  ]),
})
