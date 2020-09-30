import {
  PgAttribute,
  PgClass,
  PgConstraint,
  PgProc,
} from 'graphile-build-pg/node8plus/plugins/PgIntrospectionPlugin';

export function sortEntities(
  a: PgClass | PgConstraint | PgProc | PgAttribute,
  b: PgClass | PgConstraint | PgProc | PgAttribute
) {
  const aSchema =
    'namespaceName' in a ? a.namespaceName : a.class.namespaceName;
  const bSchema =
    'namespaceName' in b ? b.namespaceName : b.class.namespaceName;
  return aSchema.localeCompare(bSchema) * 100 + a.name.localeCompare(b.name);
}
