import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/login/actions"; // Import the action we just made

export default async function Navbar() {
  // 1. Check if user is logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="relative flex h-14 w-full items-center justify-between border-b border-neutral-800 bg-neutral-900 px-6">
      {/* 1. LEFT SIDE (Placeholder for future links, e.g. "Courses") */}
      <div className="hidden md:flex md:w-48"></div>

      {/* 2. CENTER (Absolute positioning keeps it perfectly centered) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Link
          href="/"
          className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-4xl font-bold text-transparent"
        >
          CrackMath
        </Link>
      </div>

      {/* 3. RIGHT SIDE (Auth State) */}
      <div className="flex w-full justify-end md:w-48">
        {user ? (
          // SCENARIO A: USER IS LOGGED IN
          <div className="flex items-center gap-4">
            {/* User Email (Subtle) */}
            <div className="hidden text-right text-xs md:block">
              <p className="text-neutral-500">Zalogowany jako</p>
              <p className="font-medium text-neutral-200">{user.email}</p>
            </div>

            {/* Avatar / Profile Circle */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {user.email?.charAt(0).toUpperCase()}
            </div>

            {/* Sign Out Button (Must be a form to call Server Action) */}
            <form action={signOut}>
              <button
                className="text-sm font-medium text-neutral-400 transition-colors hover:text-red-400"
                type="submit"
              >
                Wyloguj się
              </button>
            </form>
          </div>
        ) : (
          // SCENARIO B: USER IS NOT LOGGED IN
          <Link
            href="/login"
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition-transform hover:scale-105 hover:bg-neutral-200"
          >
            Zaloguj się
          </Link>
        )}
      </div>
    </nav>
  );
}
