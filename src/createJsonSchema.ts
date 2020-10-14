import { writeFileSync, existsSync, copyFileSync } from 'fs';
import {
  PgAttribute,
  PgClass,
  PgConstraint,
  PgEntityKind,
  PgProc,
} from 'graphile-build-pg/node8plus/plugins/PgIntrospectionPlugin';
import { Plugin } from 'postgraphile';
import { IBuild } from './IBuild';
import { join } from 'path';
import { sortEntities } from './sortEntities';
import { getOptions } from './getOptions';

class JSONSet<T> extends Set<T> {
  toJSON() {
    let arr = Array.from(this);
    arr.sort((a, b) =>
      typeof a === 'number' && typeof b === 'number'
        ? a - b
        : String(a).localeCompare(String(b))
    );
    return arr;
  }
}

export const createJsonSchema: Plugin = (builder, graphileBuildOptions) => {
  const { outputDir } = getOptions(graphileBuildOptions);

  builder.hook('init', (_, build) => {
    const {
      options,
      pgIntrospectionResultsByKind,
    } = (build as unknown) as IBuild;
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',

      title: 'JSONPgSmartTags',
      type: 'object',
      properties: {
        version: {
          type: 'number',
          minimum: 1,
        },
        config: {
          type: 'object',
          properties: {
            class: {
              type: 'object',
              properties: {} as Record<string, object>,
              additionalProperties: false,
            },
            attribute: {
              type: 'object',
              additionalProperties: {
                $ref: './pg-smart-tags.schema.json#/definitions/pgEntity',
              },
              propertyNames: {
                enum: new JSONSet<string>(),
              },
            },
            constraint: {
              type: 'object',
              additionalProperties: {
                $ref: './pg-smart-tags.schema.json#/definitions/pgEntity',
              },
              propertyNames: {
                enum: new JSONSet<string>(),
              },
            },
            procedure: {
              type: 'object',
              additionalProperties: {
                $ref: './pg-smart-tags.schema.json#/definitions/pgEntity',
              },
              propertyNames: {
                enum: new JSONSet<string>(),
              },
            },
          },
        },
      },
      definitions: {} as Record<string, object>,
    };

    for (const pgClass of pgIntrospectionResultsByKind.class
      .filter(filterSchema)
      .sort(sortEntities)) {
      const key = classKey(pgClass);
      schema.properties.config.properties.class.properties[key] = {
        $ref: `#/definitions/class:${key}`,
      };
      schema.properties.config.properties.class.properties[pgClass.name] = {
        $ref: `#/definitions/class:${key}`,
      };
      schema.definitions[`class:${key}`] = {
        type: 'object',
        properties: {
          tags: { $ref: './pg-smart-tags.schema.json#/definitions/tags' },
          description: { type: 'string' },
          ...(pgClass.attributes.length > 0 && {
            attribute: {
              type: 'object',
              additionalProperties: {
                $ref: './pg-smart-tags.schema.json#/definitions/pgEntity',
              },
              propertyNames: {
                enum: pgClass.attributes.map(pgAttribute => pgAttribute.name),
              },
            },
          }),
          ...(pgClass.constraints.length > 0 && {
            constraint: {
              type: 'object',
              additionalProperties: {
                $ref: './pg-smart-tags.schema.json#/definitions/pgEntity',
              },
              propertyNames: {
                enum: pgClass.constraints.map(
                  pgConstraint => pgConstraint.name
                ),
              },
            },
          }),
        },
      };
    }
    for (const pgEntity of ([] as Array<PgConstraint | PgProc | PgAttribute>)
      .concat(pgIntrospectionResultsByKind.attribute)
      .concat(pgIntrospectionResultsByKind.constraint)
      .concat(pgIntrospectionResultsByKind.procedure)
      .filter(filterSchema)
      .sort(sortEntities)) {
      const nameSet =
        schema.properties.config.properties[pgEntity.kind].propertyNames.enum;
      nameSet.add(pgEntity.name);
      if (pgEntity.namespace) {
        nameSet.add(`${pgEntity.namespace.name}.${pgEntity.name}`);
      }
      if (pgEntity.kind === PgEntityKind.ATTRIBUTE) {
        nameSet.add(`${pgEntity.class.name}.${pgEntity.name}`);
        if (pgEntity.class.namespace) {
          nameSet.add(
            `${pgEntity.class.namespace.name}.${pgEntity.class.name}.${pgEntity.name}`
          );
        }
      }
    }

    try {
      writeFileSync(
        join(outputDir, 'pg-database-smart-tags.schema.json'),
        JSON.stringify(schema, undefined, 2)
      );

      const referenceSchema = join(outputDir, 'pg-smart-tags.schema.json');
      if (!existsSync(referenceSchema)) {
        const referenceSchemaSrc = join(
          __dirname,
          '..',
          'pg-smart-tags.schema.json'
        );
        copyFileSync(referenceSchemaSrc, referenceSchema);
      }
    } catch (e) {
      console.error(e);
    }

    return _;

    function filterSchema(e: PgClass | PgConstraint | PgProc | PgAttribute) {
      return options.pgSchemas.includes(
        ('class' in e ? e.class.namespace : e.namespace)?.name
      );
    }
  });
};
function classKey(pgClass: PgClass) {
  return `${pgClass.namespaceName}.${pgClass.name}`;
}
