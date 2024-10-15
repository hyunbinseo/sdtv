// If the SQL schema is declared in multiple files,
// Reference https://orm.drizzle.team/docs/rqb

// Method 1:
// import * as schema from './schema.js';
// const db = drizzle(client, { schema });

// Method 2:
// import { schema1 } from './schema/schema1.js';
// import { schema2 } from './schema/schema2.js';
// const db = drizzle(client, { schema: { ...schema1, ...schema2 } });

export * from './schema/login.ts';
export * from './schema/profile.ts';
export * from './schema/role.ts';
export * from './schema/session.ts';
export * from './schema/sessionBan.ts';
export * from './schema/user.ts';
