"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // 1. Get data from form
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 2. Sign in using Supabase Auth
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // In a real app, you'd return the error to display it
    console.error(error);
    redirect("/login?error=Invalid credentials");
  }

  revalidatePath("/", "layout");
  redirect("/"); // Redirect to courses after login
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // This is important if you want to redirect them after email verification
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error(error);
    redirect("/login?error=Could not sign up");
  }

  revalidatePath("/", "layout");
  redirect("/login?message=Check email to continue sign in process");
}

// ... keep your imports and login/signup functions ...

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Refresh the page to update the UI
  revalidatePath("/", "layout");
  redirect("/login");
}
