import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import userModel from '@/model/User';

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			id: 'credentials',
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials: any): Promise<any> {
				await dbConnect();
				try {
					const user = await userModel.findOne({
						$or: [
							{email: credentials.identifier},
							{username: credentials.identifier},
						],
					});
					if (!user) {
						throw new Error('User not found with this email');
					}
					if (!user.isVerified) {
						throw new Error('Please verify your account first');
					}
					const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
					if (isPasswordCorrect) {
						return user;
					}
					throw new Error('Incorrect password');
				} catch (error: any) {
					throw new Error(error);
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token._id = user._id?.toString();
				token.isVerified = user.isVerified;
				token.isAcceptingMessagess = user.isAcceptingMessagess;
				token.userName = user.userName;
			}
			return token;
		},
		async session({ session, token }) {
			if (token) {
				session.user._id = token._id;
				session.user.isVerified = token.isVerified;
				session.user.isAcceptingMessagess = token.isAcceptingMessagess;
				session.user.userName = token.userName;
			}
			return session;
		},
	},
	pages: {
		signIn: '/sign-in',
	},
	session: {
		strategy: 'jwt',
	},
	secret: process.env.NEXTAUTH_SECRET,
};
