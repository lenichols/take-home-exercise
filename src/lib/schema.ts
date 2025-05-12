import type { AdapterAccountType } from 'next-auth/adapters';
import {
  boolean,
  integer,
  jsonb,
  serial,
  pgTable,
  varchar,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { int } from 'drizzle-orm/mysql-core';

