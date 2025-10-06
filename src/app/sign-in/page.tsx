'use client';

import { Button } from '@/components/ui/button';
import { Github, Linkedin } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
    return (
        <div className="dark relative flex h-screen items-center">
            <div className="h-full bg-primary w-full" />
            <div className="flex bg-background absolute h-7/8 w-7/8 rounded-2xl flex-col items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="text-center">
                    <h1 className="text-primary font-(family-name:--font-caprasimo)">webjam</h1>
                </div>
                <div className="flex flex-col items-center gap-2 mt-10 w-xs">
                    <Button
                        variant="default"
                        className="w-full"
                        onClick={() => signIn('github', { redirectTo: '/dashboard/home' })}
                    >
                        <Github />
                        Sign in with GitHub
                    </Button>
                    <p className="text-xs text-muted-foreground">or</p>
                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => signIn('linkedin', { redirectTo: '/dashboard/home' })}
                    >
                        <Linkedin /> Sign in with LinkedIn
                    </Button>
                </div>
            </div>
        </div>
    );
}
