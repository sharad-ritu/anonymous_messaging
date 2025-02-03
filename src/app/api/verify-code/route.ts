import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { usernameValidation } from '@/schemas/signUpSchema';
import { verifySchema } from '@/schemas/verifySchema';

const VerifyCodeSchema = z.object({
	username: usernameValidation,
}).merge(verifySchema);

export async function POST(request: Request) {
	await dbConnect();

	try {
		const body = await request.json();
		const parsedData = VerifyCodeSchema.safeParse(body);

		if (!parsedData.success) {
			return Response.json(
				{ success: false, message: parsedData.error.format().username?._errors[0] || parsedData.error.format().code?._errors[0] || 'Invalid data' },
				{ status: 400 }
			);
		}
		const { username, code } = body;
		const decodedUsername = decodeURIComponent(username);
		const user = await UserModel.findOne({ username: decodedUsername });

		if (!user) {
			return Response.json(
				{ success: false, message: 'User not found' },
				{ status: 404 }
			);
		}

		// Check if the code is correct and not expired
		const isCodeValid = user.verifyCode === code;
		const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

		if (isCodeValid && isCodeNotExpired) {
			// Update the user's verification status
			user.isVerified = true;
			await user.save();

			return Response.json(
				{ success: true, message: 'Account verified successfully' },
				{ status: 200 }
			);
		} else if (!isCodeNotExpired) {
			// Code has expired
			return Response.json(
				{
					success: false,
					message:
            'Verification code has expired. Please sign up again to get a new code.',
				},
				{ status: 400 }
			);
		}
		// Code is incorrect
		return Response.json(
			{ success: false, message: 'Incorrect verification code' },
			{ status: 400 }
		);

	} catch (error) {
		console.error('Error verifying user:', error);
		return Response.json(
			{ success: false, message: 'Error verifying user' },
			{ status: 500 }
		);
	}
}
