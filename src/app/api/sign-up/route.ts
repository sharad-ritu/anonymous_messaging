import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import userModel from '@/model/User';

import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

export async function POST(req: Request) {
	await dbConnect();

	try {
		const { username, email, password } = await req.json();
	} catch (error) {
		console.error('Error signing up:', error);
		return Response.json(
			{
				success: false,
				message: 'Failed to sign up',
			},
			{
				status: 500,
			}
		);
	}
}
