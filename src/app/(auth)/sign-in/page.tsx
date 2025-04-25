'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInSchema } from '@/schemas/signInSchema';
import { useToast } from '@/hooks/use-toast';

export default function SignInForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const form = useForm<z.infer<typeof signInSchema>>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			identifier: '',
			password: '',
		},
	});

	const { toast } = useToast();
	const onSubmit = async (data: z.infer<typeof signInSchema>) => {
		setIsLoading(true);
		const result = await signIn('credentials', {
			redirect: false,
			identifier: data.identifier,
			password: data.password,
		});

		if (result?.error) {
			setIsLoading(false);
			if (result.error === 'CredentialsSignin') {
				toast({
					title: 'Login Failed',
					description: 'Incorrect username or password',
					variant: 'destructive',
				});
			} else {
				toast({
					title: 'Error',
					description: result.error,
					variant: 'destructive',
				});
			}
		}

		if (result?.url) {
			toast({
				title: 'Login Success',
				description: 'Redirecting to dashboard ...',
			});
			router.replace('/dashboard');
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-800">
			<div className="w-full max-w-md p-8 space-y-8 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl shadow-xl">
				<div className="text-center">
					<h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 text-transparent bg-clip-text mb-4">
						Welcome Back
					</h1>
					<p className="text-indigo-200 text-sm">Sign in to continue your secret conversations</p>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							name="identifier"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-indigo-100">Email/Username</FormLabel>
									<Input
										{...field}
										className="bg-white/10 text-white border border-white/20 placeholder:text-indigo-300"
									/>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							name="password"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-indigo-100">Password</FormLabel>
									<Input
										type="password"
										{...field}
										className="bg-white/10 text-white border border-white/20 placeholder:text-indigo-300"
									/>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							disabled={isLoading}
							className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition rounded-xl"
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
								</>
							) : (
								'Sign In'
							)}
						</Button>
					</form>
				</Form>

				<div className="text-center mt-4 text-indigo-200 text-sm">
					<p>
						Not a member yet?{' '}
						<Link
							href="/sign-up"
							className="text-sky-400 hover:text-sky-300 underline transition"
						>
							Sign up
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
