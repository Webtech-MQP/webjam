'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Linkedin } from 'lucide-react';
import { motion } from 'motion/react';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
    return (
        <div className="dark relative flex h-screen items-center">
            <motion.div
                className="h-full bg-primary w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            />
            <motion.div
                className="flex bg-background absolute h-7/8 w-7/8 rounded-2xl flex-col items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                <div className="text-center">
                    <h1 className="text-primary font-(family-name:--font-caprasimo)">webjam</h1>
                </div>
                <Card className="mt-4 w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Sign in to your account</CardTitle>
                        <CardDescription>Select a provider to sign in. If you don&apos;t have an account, you can create one after signing in.</CardDescription>
                    </CardHeader>
                    <CardContent></CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button
                            variant="default"
                            className="w-full"
                            onClick={() => signIn('github', { redirectTo: '/dashboard/home' })}
                        >
                            <Github />
                            Sign in with GitHub
                        </Button>
                        <Button
                            variant="default"
                            className="w-full"
                            onClick={() => signIn('linkedin', { redirectTo: '/dashboard/home' })}
                        >
                            <Linkedin /> Sign in with LinkedIn
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
