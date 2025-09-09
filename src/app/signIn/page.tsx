'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Linkedin } from 'lucide-react';
import { motion } from 'motion/react';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
    return (
        <div className="flex h-screen items-center">
            <motion.div
                className="h-full bg-primary basis-2/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            />
            <motion.div
                className="flex flex-col items-center justify-center h-full basis-3/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                <div className='text-center'>
                    <h1 className="text-primary">Webjam</h1>
                    <h2>Sign in to your account</h2>
                </div>
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Login to your account</CardTitle>
                        <CardDescription>Select a provider to sign in. If you don&apos;t have an account, you can create one after signing in.</CardDescription>
                    </CardHeader>
                    <CardContent></CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button
                            variant="default"
                            className="w-full"
                            onClick={() => signIn('github', { redirectTo: '/dashboard' })}
                        >
                            <Github />
                            Sign in with GitHub
                        </Button>
                        <Button
                            variant="default"
                            className="w-full"
                            onClick={() => signIn('github', { redirectTo: '/dashboard' })}
                        >
                            <Linkedin /> Sign in with LinkedIn
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
