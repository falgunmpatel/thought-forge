"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";
import { Eye } from "lucide-react";
import Image from "next/image";

export default function SignInForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [hidePassword, setHidePassword] = useState(true);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if (result?.error) {
      if (result.error === "Configuration") {
        toast({
          title: "Login Failed",
          description: "Incorrect username or password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    }

    if (result?.url) {
      router.replace("/dashboard");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white/80">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md border-4 border-black/40">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-serif from-neutral-500 tracking-tight lg:text-2xl mb-6">
            Welcome Back to <br />
            <span className="font-extrabold font-sans bg-black text-white p-1 px-2 rounded-xl">
              Thought Forge
            </span>
          </h1>
          <p className="mb-4">
            <span className="font-semibold text-blue-600">Sign in</span>
            &nbsp;to continue your secret conversations
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} placeholder="thought@xyz.com" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      placeholder="********"
                      type={hidePassword ? "password" : "text"}
                      value={field.value}
                    />

                    <Button
                      type="button"
                      onClick={() => {
                        setHidePassword(!hidePassword);
                        setTimeout(() => {
                          setHidePassword(true);
                        }, 500);
                      }}
                    >
                      <Eye />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <Button
            className="w-full flex gap-1"
            onClick={() => signIn("google")}
          >
            <Image src="/google.svg" alt="google" width={16} height={16} />
            SignIn with Google
          </Button>
        </div>
        <div className="text-center mt-4">
          <p>
            Not a member yet?{" "}
            <Link
              href="/sign-up"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
