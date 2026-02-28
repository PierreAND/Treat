export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string,
    username: string,
    password: string
}