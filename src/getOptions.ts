import { Options } from 'graphile-build';

export function getOptions(graphileBuildOptions: Options) {
  const outputDir = graphileBuildOptions.tagJsonPlugin?.tagFileFolder;
  if (!outputDir) {
    throw new Error(
      'please specify `graphileBuildOptions.tagJsonPlugin.tagFileFolder`'
    );
  }
  return { outputDir };
}
