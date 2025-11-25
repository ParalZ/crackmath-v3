import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <form className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
        <h1 className="mb-4 text-2xl font-bold text-white">Welcome Back</h1>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-400">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-400">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {/* FormAction allows us to have two buttons doing different things */}
          <button
            formAction={login}
            className="rounded-lg bg-white px-4 py-3 font-bold text-black hover:bg-neutral-200"
          >
            Log in
          </button>
          <button
            formAction={signup}
            className="rounded-lg border border-neutral-700 px-4 py-3 font-bold text-white hover:bg-neutral-800"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
