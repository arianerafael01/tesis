'use server'
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export const loginUser = async (data: any) => {
  try {
    const response = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: "/es/institutional/reports/weekly-schedule",
    });
    
    // If we reach here without error, login was successful
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
    // If it's a redirect (NEXT_REDIRECT), let it throw to trigger the redirect
    throw error;
  }
};