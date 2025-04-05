import { getServerSession } from 'next-auth/next';
import { User } from 'next-auth';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { authOptions } from '../auth/[...nextauth]/options';

export async function POST(request: Request) {
	// Connect to the database
	await dbConnect();

	const session = await getServerSession(authOptions);
	if (!session?.user) {
		return Response.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 }
		);
	}
	const user: User = session.user;

	const userId = user._id;
	const { acceptMessages } = await request.json();

	try {
		// Update the user's message acceptance status
		const updatedUser = await UserModel.findByIdAndUpdate(
			userId,
			{ isAcceptingMessages: acceptMessages },
			{ new: true }
		);

		if (!updatedUser) {
			// User not found
			return Response.json(
				{
					success: false,
					message: 'Unable to find user to update message acceptance status',
				},
				{ status: 404 }
			);
		}

		// Successfully updated message acceptance status
		return Response.json(
			{
				success: true,
				message: 'Message acceptance status updated successfully',
				updatedUser,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error updating message acceptance status:', error);
		return Response.json(
			{ success: false, message: 'Error updating message acceptance status' },
			{ status: 500 }
		);
	}
}


export async function GET() {
	// Connect to the database
	await dbConnect();

	// Get the user session
	const session = await getServerSession(authOptions);
	if (!session?.user) {
		return Response.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 }
		);
	}
	const user: User = session.user;

	try {
		// Retrieve the user from the database using the ID
		const foundUser = await UserModel.findById(user._id);

		if (!foundUser) {
			// User not found
			return Response.json(
				{ success: false, message: 'User not found' },
				{ status: 404 }
			);
		}

		// Return the user's message acceptance status
		return Response.json(
			{
				success: true,
				isAcceptingMessages: foundUser.isAcceptingMessages,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error retrieving message acceptance status:', error);
		return Response.json(
			{ success: false, message: 'Error retrieving message acceptance status' },
			{ status: 500 }
		);
	}
}
