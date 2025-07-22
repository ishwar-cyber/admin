export interface Login {
    username: string,
    password: string
}

export interface LoginResponse {
    success: boolean
    message: string
    token: string
    user: User
}
export interface User {
    _id?: string
    email?: string,
    username?: string
    name?: string
    role?: string
}