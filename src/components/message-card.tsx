import { X } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { Button } from './ui/button';

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

const MessageCard = ({message, onMessageDelete}: MessageCardProps) => {
	const { toast } = useToast();

	const handleDeleteConfirm = async () => {
		try {
			const response = await axios.delete<ApiResponse>(
				`/api/delete-message/${message._id}`
			);
			toast({
				title: response.data.message,
			});
			onMessageDelete(message._id);

		} catch (error) {
			const axiosError = error as AxiosError<ApiResponse>;
			toast({
				title: 'Error',
				description:
          axiosError.response?.data.message ?? 'Failed to delete message',
				variant: 'destructive',
			});
		}
	};

	return (
		<Card className="bg-white/10 border border-white/10 backdrop-blur-sm text-white rounded-2xl shadow-lg p-4">
			<CardHeader>
				<div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-3">
					<CardTitle className="text-base md:text-lg font-semibold text-white">
						{message.content}
					</CardTitle>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="destructive"
								className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md"
							>
								<X className="w-4 h-4" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent className="bg-gray-900 text-white border border-white/10 rounded-xl">
							<AlertDialogHeader>
								<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
								<AlertDialogDescription className="text-sm text-indigo-200">
									This action cannot be undone. This will permanently delete this message.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel className="bg-white/10 text-indigo-100 hover:bg-white/20 transition rounded-md">
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleDeleteConfirm}
									className="bg-red-600 hover:bg-red-700 text-white rounded-md"
								>
									Continue
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
				<div className="text-sm text-indigo-300 mt-2">
					{dayjs(message.createdAt).format('MMM D, YYYY h:mm A')}
				</div>
			</CardHeader>
			<CardContent>{/* Optional: Add extra content here */}</CardContent>
		</Card>
	);
};

export default MessageCard;
