import { toReadonly } from '@hyunbinseo/tools';

export type Role = (typeof Roles)[number];
export const Roles = ['admin', 'superuser'] as const;
export const roles = toReadonly(new Set(Roles));
