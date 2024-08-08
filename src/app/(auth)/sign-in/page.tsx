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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Bot, Loader2 } from "lucide-react";
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { error } from "console";

export default function SignInForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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
      if (result.error === "CredentialsSignin") {
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
    <div className="flex flex-col items-center justify-center h-screen w-full gap-6 bg-black">
      <div className="p-4 w-[40%]">
        <div className="flex flex-col items-center justify-center gap-3 text-white">
          <h1 className="text-4xl font-bold text-center text-balance">
            Thought Forge
          </h1>
          <Bot className="animate-spin" />
          <p className="text-center mt-2 text-lg">Login to account</p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 text-white"
          >
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email"
                      {...field}
                      className="text-black"
                    />
                  </FormControl>
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
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="password"
                      {...field}
                      className="text-black"
                    />
                  </FormControl>
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
          <p className="text-white">
            Create a new account ?{" "}
            <Link href="/sign-up" className="text-blue-400 hover:text-blue-600">
              SignUp
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
