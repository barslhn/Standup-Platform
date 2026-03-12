"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft, Mail, Send } from "lucide-react";

import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useForgotPassword } from "@/modules/auth/hooks/useForgotPassword";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/modules/auth/schemas/forgot-password.schema";

export default function ForgotPasswordPage() {
    const { onSubmit, isSuccess } = useForgotPassword();

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
        mode: "onSubmit",
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl px-8 pb-10 pt-16 mt-10">

                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white px-10 py-3 rounded-b-2xl rounded-t-xl shadow-md whitespace-nowrap">
                    <h2 className="text-xl font-semibold tracking-wide">I Forgot My Password</h2>
                </div>

                <Link
                    href="/login"
                    className="absolute left-6 top-8 text-slate-400 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Link>

                {isSuccess ? (
                    <div className="text-center mt-6 space-y-4">
                        <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                            <Mail className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800">Check Your Email</h3>
                        <p className="text-slate-500 text-sm leading-relaxed px-4">
                            We&apos;ve sent a password reset link to <span className="font-medium text-slate-700">{form.getValues("email")}</span>.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block w-full h-14 leading-[3.5rem] mt-6 bg-[#0F172A] hover:bg-slate-800 text-white rounded-full font-medium transition-colors shadow-lg shadow-slate-200 text-base"
                        >
                            Return to Login Screen
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8">
                        <div className="text-center mb-8">
                            <p className="text-slate-500 text-sm px-2">
                                Enter your email address and we&apos;ll send you a link to reset your password.
                            </p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" autoComplete="off" noValidate>

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
                                                        Email Address
                                                    </label>
                                                    <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none peer-focus:text-blue-400 transition-colors" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="ml-4" />
                                        </FormItem>
                                    )}
                                />

                                <button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                    className="w-full h-14 flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-full font-medium transition-colors shadow-lg shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed text-base"
                                >
                                    {form.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
                                    <Send className="h-4 w-4 ml-1" />
                                </button>
                            </form>
                        </Form>
                    </div>
                )}
            </div>
        </div>
    );
}
