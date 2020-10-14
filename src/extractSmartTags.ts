import { writeFile } from 'fs';
import { Plugin } from 'postgraphile';
import { IBuild } from './IBuild';

import { sortEntities } from './sortEntities';
import { getOptions } from './getOptions';

export const extractSmartTags: Plugin = (builder, graphileBuildOptions) => {
  const { outputDir, jsonExtension } = getOptions(graphileBuildOptions);

  builder.hook('init', (_, build) => {
    const {
      options,
      pgIntrospectionResultsByKind,
    } = (build as unknown) as IBuild;
    const smart = (options.pgSchemas as string[]).reduce<Record<string, {}>>(
      (acc, namespace) => {
        acc[namespace] = {
          version: 1,
          $schema: './pg-database-smart-tags.schema.json',
          config: {
            class: pgIntrospectionResultsByKind.class
              .filter(
                pgClass =>
                  pgClass.namespace && pgClass.namespace.name === namespace
              )
              .sort(sortEntities)
              .reduce<Record<string, {}>>((acc, pgClass) => {
                let attribute:
                  | Record<string, {}>
                  | undefined = pgClass.attributes
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .reduce<Record<string, {}>>((acc, pgAttr) => {
                    const tags =
                      Object.keys(pgAttr.tags).length > 0
                        ? pgAttr.tags
                        : undefined;
                    if (tags) {
                      acc[pgAttr.name] = {
                        tags,
                      };
                    }
                    return acc;
                  }, {});
                if (Object.keys(attribute).length === 0) {
                  attribute = undefined;
                }
                let constraint:
                  | Record<string, {}>
                  | undefined = pgClass.constraints
                  .sort(sortEntities)
                  .reduce<Record<string, {}>>((acc, pgConst) => {
                    if (pgConst.name.startsWith('FAKE_')) {
                      return acc;
                    }
                    const tags =
                      Object.keys(pgConst.tags).length > 0
                        ? pgConst.tags
                        : undefined;
                    if (tags) {
                      acc[pgConst.name] = {
                        tags,
                      };
                    }
                    return acc;
                  }, {});

                if (Object.keys(constraint).length === 0) {
                  constraint = undefined;
                }

                const tags =
                  Object.keys(pgClass.tags).length > 0
                    ? pgClass.tags
                    : undefined;
                if (tags || attribute)
                  acc[pgClass.namespace.name + '.' + pgClass.name] = {
                    tags,
                    attribute,
                    constraint,
                  };
                return acc;
              }, {}),
            procedure: pgIntrospectionResultsByKind.procedure
              .filter(
                pgProc =>
                  pgProc.namespace && pgProc.namespace.name === namespace
              )
              .sort(sortEntities)
              .reduce<Record<string, {}>>((acc, pgProc) => {
                if (pgProc.name.startsWith('FAKE_')) {
                  return acc;
                }
                const tags =
                  Object.keys(pgProc.tags).length > 0 ? pgProc.tags : undefined;
                if (tags) {
                  acc[pgProc.namespace.name + '.' + pgProc.name] = {
                    tags,
                  };
                }
                return acc;
              }, {}),
          },
        };
        return acc;
      },
      {}
    );

    for (const [namespace, json] of Object.entries(smart)) {
      writeFile(
        `${outputDir}/${namespace}.tags.${jsonExtension}`,
        JSON.stringify(json, undefined, 2),
        e => {
          if (e) {
            console.log(e);
          }
        }
      );
    }

    return _;
  });
};
