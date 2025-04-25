'use client';

import { Mail } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import messages from '@/messages.json';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from '@/components/ui/carousel';

export default function Home() {
	return (
		<>
			{/* Main Content */}
			<main className="flex-grow flex flex-col items-center justify-center px-6 md:px-24 py-16 bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-800 text-white">
				<section className="text-center mb-12">
					<h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 text-transparent bg-clip-text">
						Dive into the World of Anonymous Feedback
					</h1>
					<p className="mt-4 text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto">
						Anonymous Messaging — Where your identity remains a secret.
					</p>
				</section>

				{/* Carousel for Messages */}
				<Carousel
					plugins={[Autoplay({ delay: 2500 })]}
					className="w-full max-w-2xl"
				>
					<CarouselContent>
						{messages.map((message, index) => (
							<CarouselItem key={index} className="p-4">
								<Card className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl shadow-lg transition hover:scale-[1.01]">
									<CardHeader>
										<CardTitle className="text-lg font-semibold text-white">
											{message.title}
										</CardTitle>
									</CardHeader>
									<CardContent className="flex flex-col md:flex-row items-start space-y-3 md:space-y-0 md:space-x-4 text-indigo-100">
										<Mail className="flex-shrink-0 text-indigo-300" />
										<div>
											<p className="text-sm">{message.content}</p>
											<p className="text-xs text-indigo-300 mt-1">
												{message.received}
											</p>
										</div>
									</CardContent>
								</Card>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</main>

			{/* Footer */}
			<footer className="text-center py-6 bg-gray-950 text-indigo-200 text-sm">
				© 2025 Anonymous Messaging. All rights reserved.
			</footer>
		</>
	);
}
