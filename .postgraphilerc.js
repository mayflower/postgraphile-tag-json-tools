const { join } = require('path');

/**
 * @type {import("./src").PluginOptions}
 */
const tagJsonPlugin = {
  tagFileFolder: join(__dirname, 'example', 'tags'),
};

module.exports = {
  options: {
    graphileBuildOptions: {
      tagJsonPlugin,
    },
  },
};
