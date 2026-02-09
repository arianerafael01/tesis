'use server'
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export const loginUser = async (data: any) => {
  try {
    const response = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    
    if (response?.error) {
      return { error: "Credenciales inválidas" };
    }
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales inválidas" };
        default:
          return { error: "Error al iniciar sesión" };
      }
    }
    return { error: "Error al iniciar sesión" };
  }
};