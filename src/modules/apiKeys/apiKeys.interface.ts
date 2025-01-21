type Permissions = 'GENERAL' | 'ADMIN' | 'SUPER_ADMIN';

export interface ApiKey {
  key: string;
  permissions: Permissions[];
  comments: string[];
  version: number;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
