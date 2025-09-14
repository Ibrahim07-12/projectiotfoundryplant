export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
