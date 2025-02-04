import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import userModel from '@/model/User';

import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

export async function POST(req: Request) {
	await dbConnect();

	try {
		const { username, email, password } = await req.json();

		const existingUserByUsername = await userModel.findOne({
			username,
			isVerified: true,
		});

		if (existingUserByUsername) {
			return Response.json(
				{
					success: false,
					message: 'Username already exists',
				},
				{ status: 400 }
			);
		}

		const existingUserByEmail = await userModel.findOne({
			email,
		});

		const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
		const expiryDate = new Date();
		expiryDate.setHours(expiryDate.getHours() + 1);

		if (existingUserByEmail) {
			if (existingUserByEmail.isVerified) {
				return Response.json({
					success: false,
					message: 'User already exists with this email',
				}, {
					status: 400,
				});
			}

			// user exists but is not verified
			const hashedPassword = await bcrypt.hash(password, 10);
			existingUserByEmail.password = hashedPassword;
			existingUserByEmail.verifyCode = verifyCode;
			existingUserByEmail.verifyCodeExpiry = expiryDate;

			await existingUserByEmail.save();

		} else {
			const hashedPassword = await bcrypt.hash(password, 10);

			const newUser = new userModel({
				username,
				email,
				password: hashedPassword,
				verifyCode,
				verifyCodeExpiry: expiryDate,
				isVerified: false,
				isAcceptingMessages: true,
				messages: [],
			});

			await newUser.save();
		}

		// send verification email
		const emailResponse = await sendVerificationEmail(
			email,
			username,
			verifyCode
		);

		if (!emailResponse.success) {
			return Response.json({
				success: false,
				message: emailResponse.message,
			}, {
				status: 500,
			});
		}

		return Response.json({
			success: true,
			message: 'User Registration Successful. Please verify your email',
		}, {
			status: 201,
		});

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
