import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex w-full items-center justify-center border-b border-neutral-800 bg-neutral-900 p-4">
      <div className="flex gap-4">
        <Link
          href="/"
          className="bg-linear-to-br from-cyan-300 to-blue-400 bg-clip-text text-4xl font-bold text-transparent transition-opacity hover:opacity-70"
        >
          CrackMath
        </Link>
      </div>
    </nav>
  );
}
