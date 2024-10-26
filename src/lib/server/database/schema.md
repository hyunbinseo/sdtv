## Multi-file Schema

Drizzle Kit supports glob-based path-string.

Reference https://orm.drizzle.team/docs/drizzle-config-file#schema

```js
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/*'
});
```

Drizzle ORM does not and requires spread syntax.

Reference https://orm.drizzle.team/docs/rqb

```js
import { drizzle } from 'drizzle-orm/...';
import * as schema1 from './schema1';
import * as schema2 from './schema2';

const db = drizzle({ schema: { ...schema1, ...schema2 } });
```

By re-exporting schemas from a single file:

```js
import { drizzle } from 'drizzle-orm/...';
import * as schema from './schema.js';

const db = drizzle({ schema });
```
