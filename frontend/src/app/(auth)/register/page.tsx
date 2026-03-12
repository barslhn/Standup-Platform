"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useRegister } from "@/modules/auth/hooks/useRegister";
import { registerSchema, type RegisterFormData } from "@/modules/auth/schemas/register.schema";
import { ROLE_OPTIONS, TEAM_OPTIONS } from "@/modules/auth/constants/register-options";
import { Lock, Mail, UserPlus, User, Briefcase, Users, Eye, EyeOff } from "lucide-react";
import React from "react";

export default function RegisterPage() {
  const { onSubmit } = useRegister();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      team: TEAM_OPTIONS[0].value,
      role: "EMPLOYEE",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedRole = useWatch({ control: form.control, name: "role" });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4 py-12">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl px-8 pb-10 pt-16 mt-8">

        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white px-10 py-3 rounded-b-2xl rounded-t-xl shadow-md">
          <h2 className="text-xl font-semibold tracking-wide">Register</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2" autoComplete="off" noValidate>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormControl>
                    <div className="relative">
                      <input
                        {...field}
                        type="text"
                        id="name"
                        className="peer w-full h-12 bg-transparent border-2 border-slate-200 rounded-full px-6 text-slate-800 outline-none focus:border-blue-400 transition-colors"
                        placeholder=" "
                        autoComplete="new-password"
                      />
                      <label
                        htmlFor="name"
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm bg-white px-1.5 transition-all duration-200 pointer-events-none peer-focus:top-0 peer-focus:text-[12px] peer-focus:text-blue-400 peer-focus:font-medium [&:not(:placeholder-shown)]:top-0 [&:not(:placeholder-shown)]:text-[12px] [&:not(:placeholder-shown)]:text-slate-500 [&:not(:placeholder-shown)]:font-medium"
                      >
                        Name Surname
                      </label>
                      <User className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none peer-focus:text-blue-400 transition-colors" />
                    </div>
                  </FormControl>
                  <FormMessage className="ml-4 text-xs" />
                </FormItem>
              )}
            />

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
                        className="peer w-full h-12 bg-transparent border-2 border-slate-200 rounded-full px-6 text-slate-800 outline-none focus:border-blue-400 transition-colors"
                        placeholder=" "
                        autoComplete="new-password"
                      />
                      <label
                        htmlFor="email"
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm bg-white px-1.5 transition-all duration-200 pointer-events-none peer-focus:top-0 peer-focus:text-[12px] peer-focus:text-blue-400 peer-focus:font-medium [&:not(:placeholder-shown)]:top-0 [&:not(:placeholder-shown)]:text-[12px] [&:not(:placeholder-shown)]:text-slate-500 [&:not(:placeholder-shown)]:font-medium"
                      >
                        Email
                      </label>
                      <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none peer-focus:text-blue-400 transition-colors" />
                    </div>
                  </FormControl>
                  <FormMessage className="ml-4 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormControl>
                    <div className="relative">
                      <select
                        {...field}
                        id="role"
                        className="peer w-full h-12 bg-white border-2 border-slate-200 rounded-full px-6 text-slate-800 outline-none focus:border-blue-400 transition-colors appearance-none cursor-pointer relative z-10 bg-transparent"
                      >
                        <option value="" disabled hidden></option>
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                      <label
                        htmlFor="role"
                        className="absolute left-5 top-0 -translate-y-1/2 text-[12px] text-slate-500 bg-white px-1.5 transition-all duration-200 peer-focus:text-blue-400 font-medium z-20 pointer-events-none"
                      >
                        Role
                      </label>
                      <Briefcase className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none peer-focus:text-blue-400 transition-colors z-20" />
                    </div>
                  </FormControl>
                  <FormMessage className="ml-4 text-xs" />
                </FormItem>
              )}
            />

            {selectedRole === "EMPLOYEE" && (
              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormControl>
                      <div className="relative">
                        <select
                          {...field}
                          id="team"
                          className="peer w-full h-12 bg-white border-2 border-slate-200 rounded-full px-6 text-slate-800 outline-none focus:border-blue-400 transition-colors appearance-none cursor-pointer relative z-10 bg-transparent"
                        >
                          <option value="" disabled hidden></option>
                          {TEAM_OPTIONS.map((team: { value: string; label: string }) => (
                            <option key={team.value} value={team.value}>{team.label}</option>
                          ))}
                        </select>
                        <label
                          htmlFor="team"
                          className="absolute left-5 top-0 -translate-y-1/2 text-[12px] text-slate-500 bg-white px-1.5 transition-all duration-200 peer-focus:text-blue-400 font-medium z-20 pointer-events-none"
                        >
                          Team
                        </label>
                        <Users className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none peer-focus:text-blue-400 transition-colors z-20" />
                      </div>
                    </FormControl>
                    <FormMessage className="ml-4 text-xs" />
                  </FormItem>
                )}
              />
            )}

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
                        className="peer w-full h-12 bg-transparent border-2 border-slate-200 rounded-full px-6 pr-12 text-slate-800 outline-none focus:border-blue-400 transition-colors"
                        placeholder=" "
                        autoComplete="new-password"
                      />
                      <label
                        htmlFor="password"
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm bg-white px-1.5 transition-all duration-200 pointer-events-none peer-focus:top-0 peer-focus:text-[12px] peer-focus:text-blue-400 peer-focus:font-medium [&:not(:placeholder-shown)]:top-0 [&:not(:placeholder-shown)]:text-[12px] [&:not(:placeholder-shown)]:text-slate-500 [&:not(:placeholder-shown)]:font-medium"
                      >
                        Password
                      </label>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-600 transition-colors outline-none"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <Lock className="text-slate-400 h-4 w-4 pointer-events-none peer-focus:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="ml-4 text-xs" />
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
                        className="peer w-full h-12 bg-transparent border-2 border-slate-200 rounded-full px-6 pr-12 text-slate-800 outline-none focus:border-blue-400 transition-colors"
                        placeholder=" "
                        autoComplete="new-password"
                      />
                      <label
                        htmlFor="confirmPassword"
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm bg-white px-1.5 transition-all duration-200 pointer-events-none peer-focus:top-0 peer-focus:text-[12px] peer-focus:text-blue-400 peer-focus:font-medium [&:not(:placeholder-shown)]:top-0 [&:not(:placeholder-shown)]:text-[12px] [&:not(:placeholder-shown)]:text-slate-500 [&:not(:placeholder-shown)]:font-medium"
                      >
                        Confirm Password
                      </label>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-slate-400 hover:text-slate-600 transition-colors outline-none"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <Lock className="text-slate-400 h-4 w-4 pointer-events-none peer-focus:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="ml-4 text-xs" />
                </FormItem>
              )}
            />

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full h-12 flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-full font-medium transition-colors shadow-lg shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed mt-8 text-base"
            >
              {form.formState.isSubmitting ? "Signing up..." : "Sign Up"}
              <UserPlus className="h-4 w-4" />
            </button>
          </form>
        </Form>

        <p className="text-center mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-slate-900 hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}