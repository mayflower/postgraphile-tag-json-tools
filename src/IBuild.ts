import {
  PgAttribute,
  PgClass,
  PgConstraint,
  PgProc,
} from 'graphile-build-pg/node8plus/plugins/PgIntrospectionPlugin';

export interface IBuild {
  options: Record<string, any>;
  pgIntrospectionResultsByKind: {
    class: PgClass[];
    attribute: PgAttribute[];
    constraint: PgConstraint[];
    procedure: PgProc[];
  };
}
