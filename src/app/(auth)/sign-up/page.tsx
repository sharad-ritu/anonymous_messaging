'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { singUpSchema } from '@/schemas/signUpSchema';
import { ApiResponse } from '@/types/ApiResponse';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Page = () => {
	const [username, setUsername] = useState<string>('');
	const [usernameMessage, setUsernameMessage] = useState<string>('');
	const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const debounced= useDebounceCallback(setUsername, 400);

	const { toast } = useToast();
	const router = useRouter();

	const form = useForm<z.infer<typeof singUpSchema>>({
		resolver: zodResolver(singUpSchema),
		defaultValues: {
			username: '',
			email: '',
			password: '',
		},
	});

	useEffect(() => {
		const checkUsernameUniqueness = async () => {
			if (username) {
				setIsCheckingUsername(true);
				setUsernameMessage('');
				try {
					const response = await axios.get(`/api/check-username-unique?username=${username}`);
					setUsernameMessage(response.data.message);
				} catch (error) {
					const axiosError = error as AxiosError<ApiResponse>;
					setUsernameMessage(axiosError.response?.data.message ?? 'Error checking username uniqueness');
				} finally {
					setIsCheckingUsername(false);
				}
			}
		};
		checkUsernameUniqueness();
	}, [username]);

	const onSubmit = async (data: z.infer<typeof singUpSchema>) => {
		setIsSubmitting(true);
		try {
			const response = await axios.post<ApiResponse>('/api/sign-up', data);
			console.log(response);
			if (response && response.status === 201 && response.data.success) {
				toast({
					title: 'Signup Success',
					description: response.data.message,
				});
			} else {
				toast({
					title: 'Error',
					description: response.data.message || 'Something went wrong. Please try again.',
					variant: 'destructive',
				});
			}
			router.replace(`/verify/${username}`);
		} catch (error) {
			console.error('Error signing up:', error);
			const axiosError = error as AxiosError<ApiResponse>;
			toast({
				title: 'Signup Failed',
				description: axiosError.response?.data.message || 'Something went wrong. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-800">
			<div className="w-full max-w-md p-8 space-y-8 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl shadow-xl">
				<div className="text-center">
					<h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 text-transparent bg-clip-text mb-4">
						Welcome to Anonymous Messaging
					</h1>
					<p className="text-indigo-200 text-sm">Create your account and keep your identity private.</p>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Username Field */}
						<FormField
							name="username"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-indigo-100">Username</FormLabel>
									<FormControl>
										<Input
											placeholder="Your username"
											{...field}
											className="bg-white/10 text-white border border-white/20 placeholder:text-indigo-300"
											onChange={(e) => {
												field.onChange(e);
												debounced(e.target.value);
											}}
										/>
									</FormControl>
									{isCheckingUsername && <Loader2 className="animate-spin text-indigo-300 h-4 w-4 mt-1" />}
									<p className={`text-sm ${usernameMessage === 'Username is unique' ? 'text-green-400' : 'text-red-400'}`}>
										{usernameMessage}
									</p>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Email Field */}
						<FormField
							name="email"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-indigo-100">Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="Your email"
											{...field}
											className="bg-white/10 text-white border border-white/20 placeholder:text-indigo-300"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Password Field */}
						<FormField
							name="password"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-indigo-100">Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type={showPassword ? 'text' : 'password'}
												placeholder="Your password"
												{...field}
												className="bg-white/10 text-white border border-white/20 placeholder:text-indigo-300 pr-10"
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowPassword(!showPassword)}
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4 text-indigo-400" />
												) : (
													<Eye className="h-4 w-4 text-indigo-400" />
												)}
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Submit Button */}
						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing Up...
								</>
							) : (
								'Sign Up'
							)}
						</Button>
					</form>
				</Form>

				{/* Already have account */}
				<div className="text-center mt-4 text-indigo-200 text-sm">
					<p>
						Already a member?{' '}
						<Link
							href="/sign-in"
							className="text-sky-400 hover:text-sky-300 underline transition"
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Page;
