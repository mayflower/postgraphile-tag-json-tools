# postgraphile-tag-json-tools

A set of plugins to

- extract smart tags from comments in your database structure
- create a schema for your tags files
- load your tags files

## The Result

See the [example folder](./example)

## Plugins

It consists of three postgraphile plugins:

### extractSmartTags

Will extract all currently loaded smart tags and write them to `${tagFileFolder}/${schema}.tags.json` files.

You will probably want to remove this plugin after a single run.

### createJsonSchema

Creates two files:

- `${tagFileFolder}/pg-database-smart-tags.schema.json`
  this file will always be updated to match your database. See [the example](./example/tags/pg-database-smart-tags.schema.json)
- `${tagFileFolder}/pg-smart-tags.schema.json`
  this file will be created, but not overridden if it exists, so you can **add additional tags here** if you want more tags to be supported. See [the example](./example/tags/pg-smart-tags.schema.json)

### loadSmartTags

This plugin will load all `${tagFileFolder}/${schema}.tags.json` files on start.

## Configuration

Set a `graphileBuildOptions.tagJsonPlugin.tagFileFolder` option to the path you want to store your tags files & schemas in.

With a `.postgraphilerc.js`, that could look like this.

```js
const { join } = require('path');

module.exports = {
  options: {
    graphileBuildOptions: {
      tagJsonPlugin: {
        tagFileFolder: join(__dirname, 'example', 'tags'),
        jsonExtension: 'json'
      }
    },
  },
};
}
```

## Command line Usage

Just append `--append-plugins postgraphile-tag-json-tools/plugins/loadSmartTags.js,postgraphile-tag-json-tools/plugins/extractSmartTags.js,postgraphile-tag-json-tools/plugins/createJsonSchema.js`

## Library Usage

```js
import {
  loadSmartTags,
  extractSmartTags,
  createJsonSchema,
} from 'postgraphile-tag-json-tools';

const postgraphileOptions = {
  // ...
  appendPlugins: [
    loadSmartTags,
    extractSmartTags,
    createJsonSchema,
    // ..
  ],
};
```
