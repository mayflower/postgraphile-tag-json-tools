import { Plugin } from 'postgraphile';
import { readdirSync } from 'fs';
import { join } from 'path';
import { makePgSmartTagsFromFilePlugin } from 'postgraphile/plugins';
import { makePluginByCombiningPlugins } from 'graphile-utils';
import { getOptions } from './getOptions';

export const loadSmartTags: Plugin = (builder, graphileBuildOptions) => {
  const { outputDir, jsonExtension } = getOptions(graphileBuildOptions);

  const metaPlugins = readdirSync(outputDir)
    .filter(file => file.endsWith(`.tags.${jsonExtension}`))
    .map(file => makePgSmartTagsFromFilePlugin(join(outputDir, file)));

  const combinedPlugin = makePluginByCombiningPlugins(...metaPlugins);
  return combinedPlugin(builder, graphileBuildOptions);
};
