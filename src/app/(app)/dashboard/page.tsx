'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ApiResponse } from '@/types/ApiResponse';
import { Message } from '@/model/User';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { acceptMessagesSchema } from '@/schemas/acceptMessageSchema';
import MessageCard from '@/components/message-card';

function UserDashboard() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSwitchLoading, setIsSwitchLoading] = useState(false);

	const { toast } = useToast();

	const handleDeleteMessage = (messageId: string) => {
		setMessages(messages.filter((message) => message._id !== messageId));
	};

	const { data: session } = useSession();

	const form = useForm({
		resolver: zodResolver(acceptMessagesSchema),
	});

	const { register, watch, setValue } = form;
	const acceptMessages = watch('acceptMessages');

	const fetchAcceptMessages = useCallback(async () => {
		setIsSwitchLoading(true);
		try {
			const response = await axios.get<ApiResponse>('/api/accept-messages');
			setValue('acceptMessages', response.data.isAcceptingMessages);
		} catch (error) {
			const axiosError = error as AxiosError<ApiResponse>;
			toast({
				title: 'Error',
				description:
          axiosError.response?.data.message ??
          'Failed to fetch message settings',
				variant: 'destructive',
			});
		} finally {
			setIsSwitchLoading(false);
		}
	}, [setValue, toast]);

	const fetchMessages = useCallback(
		async (refresh: boolean = false) => {
			setIsLoading(true);
			setIsSwitchLoading(false);
			try {
				const response = await axios.get<ApiResponse>('/api/get-messages');
				setMessages(response.data.messages || []);
				if (refresh) {
					toast({
						title: 'Refreshed Messages',
						description: 'Showing latest messages',
					});
				}
			} catch (error) {
				const axiosError = error as AxiosError<ApiResponse>;
				toast({
					title: 'Error',
					description:
            axiosError.response?.data.message ?? 'Failed to fetch messages',
					variant: 'destructive',
				});
			} finally {
				setIsLoading(false);
				setIsSwitchLoading(false);
			}
		},
		[setIsLoading, setMessages, toast]
	);

	// Fetch initial state from the server
	useEffect(() => {
		if (!session || !session.user) {return;}

		fetchMessages();

		fetchAcceptMessages();
	}, [session, setValue, toast, fetchAcceptMessages, fetchMessages]);

	// Handle switch change
	const handleSwitchChange = async () => {
		try {
			const response = await axios.post<ApiResponse>('/api/accept-messages', {
				acceptMessages: !acceptMessages,
			});
			setValue('acceptMessages', !acceptMessages);
			toast({
				title: response.data.message,
				variant: 'default',
			});
		} catch (error) {
			const axiosError = error as AxiosError<ApiResponse>;
			toast({
				title: 'Error',
				description:
          axiosError.response?.data.message ??
          'Failed to update message settings',
				variant: 'destructive',
			});
		}
	};

	if (!session || !session.user) {
		return <div></div>;
	}

	const { username } = session.user as User;

	const baseUrl = `${window.location.protocol}//${window.location.host}`;
	const profileUrl = `${baseUrl}/u/${username}`;

	const copyToClipboard = () => {
		navigator.clipboard.writeText(profileUrl);
		toast({
			title: 'URL Copied!',
			description: 'Profile URL has been copied to clipboard.',
		});
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-800">
			<div className="w-full max-w-6xl p-8 space-y-8 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl shadow-xl">
				<h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 text-transparent bg-clip-text mb-6">
					User Dashboard
				</h1>

				{/* Unique Link Section */}
				<div className="mb-6">
					<h2 className="text-lg font-semibold text-indigo-100 mb-2">Copy Your Unique Link</h2>
					<div className="flex items-center">
						<input
							type="text"
							value={profileUrl}
							disabled
							className="bg-white/10 text-white border border-white/20 p-2 rounded-md mr-2 placeholder:text-indigo-300 w-full md:w-[400px]"
						/>
						<Button
							onClick={copyToClipboard}
							className="bg-indigo-600 hover:bg-indigo-700 text-white transition rounded-xl"
						>
      Copy
						</Button>
					</div>
				</div>

				{/* Accept Messages Switch */}
				<div className="mb-6 flex items-center">
					<Switch
						{...register('acceptMessages')}
						checked={acceptMessages}
						onCheckedChange={handleSwitchChange}
						disabled={isSwitchLoading}
					/>
					<span className="ml-3 text-sm text-indigo-100">
						Accept Messages:{' '}
						<span className={acceptMessages ? 'text-green-500' : 'text-red-500'}>
							{acceptMessages ? 'On' : 'Off'}
						</span>
					</span>
				</div>

				{/* Refresh Button */}
				<Button
					className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition rounded-xl"
					onClick={(e) => {
						e.preventDefault();
						fetchMessages(true);
					}}
				>
					{isLoading ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
							Refreshing...
						</>
					) : (
						<>
							<RefreshCcw className="h-4 w-4 mr-2" />
							Refresh
						</>
					)}
				</Button>

				{/* Messages */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{messages.length > 0 ? (
						messages.map((message) => (
							<MessageCard
								key={message._id}
								message={message}
								onMessageDelete={handleDeleteMessage}
							/>
						))
					) : (
						<p className="text-indigo-200">No messages to display.</p>
					)}
				</div>
			</div>
		</div>
	);
}

export default UserDashboard;
