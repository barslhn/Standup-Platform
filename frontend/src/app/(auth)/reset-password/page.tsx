"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft, Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useResetPassword } from "@/modules/auth/hooks/useResetPassword";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/modules/auth/schemas/reset-password.schema";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const { onSubmit } = useResetPassword(token);

    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: "", confirmPassword: "" },
        mode: "onSubmit",
    });

    return (
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl px-8 pb-10 pt-16 mt-10">

            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white px-10 py-3 rounded-b-2xl rounded-t-xl shadow-md whitespace-nowrap">
                <h2 className="text-xl font-semibold tracking-wide">Create New Password</h2>
            </div>

            <Link
                href="/login"
                className="absolute left-6 top-8 text-slate-400 hover:text-slate-800 transition-colors"
            >
                <ArrowLeft className="h-6 w-6" />
            </Link>

            <div className="mt-8">
                <div className="text-center mb-8">
                    <p className="text-slate-500 text-sm px-2">
                        Please create a new and secure password for your account.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" autoComplete="off" noValidate>

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
                                                New Password
                                            </label>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="text-slate-400 hover:text-slate-600 transition-colors outline-none"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                                <Lock className="text-slate-400 h-5 w-5 pointer-events-none peer-focus:text-blue-400 transition-colors" />
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="ml-4" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem className="relative">
                                    <FormControl>
                                        <div className="relative">
                                            <input
                                                {...field}
                                                type={showConfirmPassword ? "text" : "password"}
                                                id="confirmPassword"
                                                className="peer w-full h-14 bg-transparent border-2 border-slate-200 rounded-full px-6 pr-14 text-slate-800 outline-none focus:border-blue-400 transition-all duration-300"
                                                placeholder=" "
                                                autoComplete="new-password"
                                            />
                                            <label
                                                htmlFor="confirmPassword"
                                                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm bg-white px-1.5 transition-all duration-200 pointer-events-none peer-focus:top-0 peer-focus:text-[12px] peer-focus:text-blue-400 peer-focus:font-medium [&:not(:placeholder-shown)]:top-0 [&:not(:placeholder-shown)]:text-[12px] [&:not(:placeholder-shown)]:text-slate-500 [&:not(:placeholder-shown)]:font-medium"
                                            >
                                                Confirm New Password
                                            </label>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="text-slate-400 hover:text-slate-600 transition-colors outline-none"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                                <Lock className="text-slate-400 h-5 w-5 pointer-events-none peer-focus:text-blue-400 transition-colors" />
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="ml-4" />
                                </FormItem>
                            )}
                        />

                        <button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className="w-full h-14 flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-full font-medium transition-colors shadow-lg shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed mt-8 text-base"
                        >
                            {form.formState.isSubmitting ? "Updating..." : "Update My Password"}
                            <CheckCircle2 className="h-4 w-4 ml-1" />
                        </button>
                    </form>
                </Form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
            <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
