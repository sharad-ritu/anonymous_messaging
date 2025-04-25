'use client';

import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { verifySchema } from '@/schemas/verifySchema';
import { ApiResponse } from '@/types/ApiResponse';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Verify() {
	const router = useRouter();
	const params = useParams<{username: string}>();
	const {toast} = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const form = useForm<z.infer<typeof verifySchema>>({
		resolver: zodResolver(verifySchema),
	});

	const onSubmit = async (data: z.infer<typeof verifySchema>) => {
		setIsLoading(true);
		try {
			const response = await axios.post<ApiResponse>('/api/verify-code', {
				username: params.username,
				code: data.code,
			});

			toast({
				title: 'Success',
				description: response.data.message,
			});

			router.replace('/sign-in');
		} catch (error) {
			const axiosError = error as AxiosError<ApiResponse>;
			toast({
				title: 'Verification Failed',
				description:
          axiosError.response?.data.message ??
          'An error occurred. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-800">
			<div className="w-full max-w-md p-8 space-y-8 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl shadow-xl">
				<div className="text-center">
					<h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 text-transparent bg-clip-text mb-4">
						Verify Your Account
					</h1>
					<p className="text-indigo-200 text-sm">
						Enter the verification code sent to your email
					</p>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							name="code"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-indigo-100">Verification Code</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="123456"
											className="bg-white/10 text-white border border-white/20 placeholder:text-indigo-300"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							disabled={isLoading}
							className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
								</>
							) : (
								'Verify'
							)}
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
