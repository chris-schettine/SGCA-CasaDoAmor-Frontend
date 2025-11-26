export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (limit: number, offset: number, searchText?: string) =>
    [...patientKeys.lists(), { limit, offset, searchText }] as const,
};

export const sessionKeys = {
  all: ['sessions'] as const,
  list: () => [...sessionKeys.all, 'list'] as const,
};

export const auditKeys = {
  all: ['audit'] as const,
  logins: () => [...auditKeys.all, 'logins'] as const,
};
