'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useCompletion } from 'ai/react';
import * as z from 'zod';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { ApiResponse } from '@/types/ApiResponse';
import { messageSchema } from '@/schemas/messageSchema';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
	return messageString.split(specialChar);
};

const initialMessageString =
  'What\'s your favorite movie?||Do you have any pets?||What\'s your dream job?';

export default function SendMessage() {
	const { toast } = useToast();
	const params = useParams<{ username: string }>();
	const username = params.username;

	const {
		complete,
		completion,
		isLoading: isSuggestLoading,
		error,
	} = useCompletion({
		api: '/api/suggest-messages',
		initialCompletion: initialMessageString,
	});

	const form = useForm<z.infer<typeof messageSchema>>({
		resolver: zodResolver(messageSchema),
	});

	const messageContent = form.watch('content');

	const handleMessageClick = (message: string) => {
		form.setValue('content', message);
	};

	const [isLoading, setIsLoading] = useState(false);

	const onSubmit = async (data: z.infer<typeof messageSchema>) => {
		setIsLoading(true);
		try {
			const response = await axios.post<ApiResponse>('/api/send-message', {
				...data,
				username,
			});

			toast({
				title: response.data.message,
				variant: 'default',
			});
			form.reset({ ...form.getValues(), content: '' });
		} catch (error) {
			const axiosError = error as AxiosError<ApiResponse>;
			toast({
				title: 'Error',
				description:
          axiosError.response?.data.message ?? 'Failed to sent message',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const fetchSuggestedMessages = async () => {
		try {
			complete('');
		} catch (error) {
			console.error('Error fetching messages:', error);
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-800">
			<div className="w-full max-w-4xl p-8 space-y-8 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl shadow-xl">
				<h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 text-transparent bg-clip-text text-center mb-6">
					Public Profile Link
				</h1>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-indigo-100">Send Anonymous Message to @{username}</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Write your anonymous message here"
											className="resize-none bg-white/10 text-white border border-white/20 placeholder:text-indigo-300"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex justify-center">
							{isLoading ? (
								<Button disabled className="bg-indigo-600 hover:bg-indigo-700 text-white transition rounded-xl">
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Please wait
								</Button>
							) : (
								<Button
									type="submit"
									disabled={isLoading || !messageContent}
									className="bg-indigo-600 hover:bg-indigo-700 text-white transition rounded-xl"
								>
									Send It
								</Button>
							)}
						</div>
					</form>
				</Form>

				<div className="space-y-4 my-8">
					<div className="space-y-2">
						<Button
							onClick={fetchSuggestedMessages}
							className="my-4 bg-indigo-600 hover:bg-indigo-700 text-white transition rounded-xl"
							disabled={isSuggestLoading}
						>
							Suggest Messages
						</Button>
						<p className="text-indigo-200 text-sm">Click on any message below to select it.</p>
					</div>
					<Card className="bg-white/10 border border-white/20 text-white">
						<CardHeader>
							<h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-sky-400 text-transparent bg-clip-text">Messages</h3>
						</CardHeader>
						<CardContent className="flex flex-col space-y-4">
							{error ? (
								<p className="text-red-400">{error.message}</p>
							) : (
								parseStringMessages(completion).map((message, index) => (
									<Button
										key={index}
										variant="outline"
										className="mb-2 border border-indigo-400/30 text-indigo-500 hover:bg-indigo-700/50"
										onClick={() => handleMessageClick(message)}
									>
										{message}
									</Button>
								))
							)}
						</CardContent>
					</Card>
				</div>
				<Separator className="my-6 bg-white/20" />
				<div className="text-center">
					<div className="mb-4 text-indigo-200">Get Your Message Board</div>
					<Link href={'/sign-up'}>
						<Button className="bg-indigo-600 hover:bg-indigo-700 text-white transition rounded-xl">
							Create Your Account
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
