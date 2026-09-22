export type UserRole = 'ADMIN' | 'ACCOUNTANT' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  organizationId?: string;
  organizationName?: string;
  role?: UserRole;
  createdAt: string;
}
