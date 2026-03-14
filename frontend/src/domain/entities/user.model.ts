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


export interface Profile {
    username: string
    totalActivities: number
    totalPoints: number
    bonusReceived: number
    malusReceived: number
    reputationScore: number
}