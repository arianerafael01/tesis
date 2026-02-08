// user data 
const users = [
  {
    name: "instituto etchegoyen",
    email: "admin@instituto-etchegoyen.edu.ar",
    password: "institucion123",
    image: '/images/users/user-1.jpg',
  },
  
]

export type User = (typeof users)[number]

export const getUserByEmail = (email: string) => {
  return users.find((user) => user.email === email)
}