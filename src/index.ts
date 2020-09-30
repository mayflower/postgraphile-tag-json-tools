export interface PluginOptions {
  tagFileFolder: string;
}

declare module 'graphile-build' {
  interface Options {
    tagJsonPlugin?: Partial<PluginOptions>;
  }
}

export { createJsonSchema } from './createJsonSchema';
export { extractSmartTags } from './extractSmartTags';
export { loadSmartTags } from './loadSmartTags';
