"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useLogin } from "@/modules/auth/hooks/useLogin";
import { loginSchema, type LoginFormData } from "@/modules/auth/schemas/login.schema";
import { Lock, Mail, LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { onSubmit } = useLogin();
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  React.useEffect(() => {
    form.setFocus("email");
  }, [form]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl px-8 pb-10 pt-16 mt-10">

        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white px-10 py-3 rounded-b-2xl rounded-t-xl shadow-md">
          <h2 className="text-xl font-semibold tracking-wide">Login</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4" autoComplete="off" noValidate>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormControl>
                    <div className="relative">
                      <input
                        {...field}
                        type="email"
                        id="email"
                        className="peer w-full h-14 bg-transparent border-2 border-slate-200 rounded-full px-6 text-slate-800 outline-none focus:border-blue-400 transition-all duration-300"
                        placeholder=" "
                        autoComplete="new-password"
                      />
                      <label
                        htmlFor="email"
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm bg-white px-1.5 transition-all duration-200 pointer-events-none peer-focus:top-0 peer-focus:text-[12px] peer-focus:text-blue-400 peer-focus:font-medium [&:not(:placeholder-shown)]:top-0 [&:not(:placeholder-shown)]:text-[12px] [&:not(:placeholder-shown)]:text-slate-500 [&:not(:placeholder-shown)]:font-medium"
                      >
                        Email
                      </label>
                      <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none peer-focus:text-blue-400 transition-colors" />
                    </div>
                  </FormControl>
                  <FormMessage className="ml-4" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormControl>
                    <div className="relative">
                      <input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className="peer w-full h-14 bg-transparent border-2 border-slate-200 rounded-full px-6 pr-14 text-slate-800 outline-none focus:border-blue-400 transition-all duration-300"
                        placeholder=" "
                        autoComplete="new-password"
                      />
                      <label
                        htmlFor="password"
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm bg-white px-1.5 transition-all duration-200 pointer-events-none peer-focus:top-0 peer-focus:text-[12px] peer-focus:text-blue-400 peer-focus:font-medium [&:not(:placeholder-shown)]:top-0 [&:not(:placeholder-shown)]:text-[12px] [&:not(:placeholder-shown)]:text-slate-500 [&:not(:placeholder-shown)]:font-medium"
                      >
                        Password
                      </label>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-600 transition-colors outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                        <Lock className="text-slate-400 h-5 w-5 pointer-events-none peer-focus:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="ml-4" />
                </FormItem>
              )}
            />

            <div className="flex justify-end pr-2 relative z-[100] mt-2">
              <Link href="/forgot-password" title="forgot-password" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors block py-2">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full h-14 flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-full font-medium transition-colors shadow-lg shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed text-base"
            >
              {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
              <LogIn className="h-4 w-4" />
            </button>
          </form>
        </Form>

        <p className="text-center mt-8 text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-slate-900 hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}