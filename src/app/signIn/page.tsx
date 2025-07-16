"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "lucide-react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Select a provider to sign in. If you don&apos;t have an account, you
            can create one after signing in.
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            variant="default"
            className="w-full"
            onClick={() => signIn("github", { redirectTo: "/dashboard" })}
          >
            <Github />
            Sign in with GitHub
          </Button>
          <Button
            variant="default"
            className="w-full"
            onClick={() => signIn("github", { redirectTo: "/dashboard" })}
          >
            <Linkedin /> Sign in with LinkedIn
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
