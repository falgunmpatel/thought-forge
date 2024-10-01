"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { User } from "next-auth";

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user as User;

  return (
    <nav className="p-4 md:p-6 shadow-md backdrop-blur-lg w-full">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* <a className="text-xl font-bold mb-4 md:mb-0">Thought Forge</a> */}
        <a
          href="#"
          className="text-xl font-bold font-sans bg-[#000] p-1 px-2 rounded-xl border-[#888484] border-2 text-[#fff]"
        >
          Thought Forge
        </a>
        {session ? (
          <>
            <span className="mr-4">Welcome, {user.username || user.email}</span>
            <Button
              onClick={() => signOut()}
              className="w-full md:w-auto border-black border-2 text-black hover:border-black hover:text-black hover:scale-105 hover:bg-[#e2e2e2] font-semibold"
              variant="outline"
            >
              Logout
            </Button>
          </>
        ) : (
          <Link href="/sign-in">
            <Button
              className="w-full md:w-auto border-black border-2 text-black hover:border-black hover:text-black hover:scale-105 hover:bg-[#e2e2e2] font-semibold"
              variant={"outline"}
            >
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
