'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User } from 'next-auth';
import { Button } from './ui/button';

const Navbar = () => {
	const { data: session } = useSession();
	const user: User = session?.user;

	return (
		<nav className="bg-gradient-to-r from-gray-950 via-indigo-950 to-gray-900 shadow-lg text-white">
			<div className="container mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between">
				<a
					href="#"
					className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 text-transparent bg-clip-text mb-3 md:mb-0"
				>
					Anonymous Messaging
				</a>

				<div className="flex items-center gap-4">
					{session ? (
						<>
							<span className="text-sm text-indigo-200">
								Welcome {user?.username || user?.email}
							</span>
							<Button
								onClick={() => signOut()}
								className="bg-white/10 text-indigo-100 border border-white/20 hover:bg-white/20 transition rounded-xl"
								variant="outline"
							>
								Logout
							</Button>
						</>
					) : (
						<Link href="/sign-in">
							<Button
								className="bg-white/10 text-indigo-100 border border-white/20 hover:bg-white/20 transition rounded-xl"
								variant="outline"
							>
								Login
							</Button>
						</Link>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
