"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Languages } from "lucide-react";
import { z } from "zod";

import { useLogin } from "@/hooks/use-login";
import { Button } from "@/components/button";
import { FormAlert, FormField, TextInput, fieldDescribedBy } from "@/components/form";
import { ThemeToggle } from "@/components/navigation/main/theme-toggle";
import { usePreferences } from "@/components/providers/preferences-provider";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid.")
    .max(150, "Email maksimal 150 karakter."),
  password: z
    .string()
    .min(1, "Password wajib diisi.")
    .min(6, "Password minimal 6 karakter.")
    .max(255, "Password maksimal 255 karakter."),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm({ notice }: { notice?: string }) {
  const { submit, loginError } = useLogin();
  const { locale, toggleLocale, t } = usePreferences();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await submit({ email: values.email, password: values.password });
  };

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#4d7f4c] px-4 py-10 dark:bg-[#0d1d15]">
      {/* Organic layered forest wave shapes matching Figma AS-Login */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 1024"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full"
      >
        <path
          d="M-80,-40 C260,120 420,420 180,680 C-40,920 260,1080 560,1060 L-80,1060 Z"
          className="fill-[#2f5b3a]/70 dark:fill-[#142a1f]/80"
        />
        <path
          d="M860,-60 C1020,240 840,560 1120,760 C1300,890 1480,820 1520,1080 L1520,-60 Z"
          className="fill-[#376247]/75 dark:fill-[#163023]/75"
        />
        <path
          d="M-60,520 C240,420 480,640 720,860 C880,1010 1180,980 1500,720 L1500,1080 L-60,1080 Z"
          className="fill-[#264b33]/55 dark:fill-[#0a1610]/70"
        />
      </svg>

      {/* Subtle centered TNGL emblem watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[min(780px,92vw)] -translate-x-1/2 -translate-y-1/2 opacity-10"
      >
        <Image
          src="/images/logo-tngl.png"
          alt=""
          fill
          sizes="780px"
          className="object-contain"
          priority
        />
      </div>

      {/* Top-right language & theme switchers */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
        <button
          type="button"
          onClick={toggleLocale}
          aria-label={t("switchLanguage")}
          title={t("switchLanguage")}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/25 bg-surface/95 px-2.5 text-xs font-bold uppercase tracking-wider text-ink-soft shadow-sm backdrop-blur transition hover:border-primary hover:bg-surface"
        >
          <Languages aria-hidden="true" className="size-4" />
          <span>{locale.toUpperCase()}</span>
        </button>
        <ThemeToggle />
      </div>

      {/* Centered Login Card (Figma AS-Login) */}
      <section className="relative z-10 w-full max-w-[520px] rounded-[24px] border border-border/60 bg-surface px-6 py-9 shadow-2xl sm:px-11 sm:py-12">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3.5 relative size-12 overflow-hidden rounded-full bg-surface-muted p-1 ring-1 ring-line">
            <Image
              src="/images/logo-tngl.png"
              alt="Logo Taman Nasional Gunung Leuser"
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
          <h1 className="text-[1.75rem] font-extrabold tracking-tight text-ink sm:text-[2rem]">
            {locale === "en" ? "Login to Account" : "Masuk ke Akun"}
          </h1>
          <p className="mt-2 text-sm font-medium text-ink-soft">
            {locale === "en"
              ? "Please enter your email and password to continue"
              : "Masukkan email dan kata sandi Anda untuk melanjutkan"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <FormField
            label={locale === "en" ? "Email address:" : "Alamat email:"}
            htmlFor="email"
            required
            error={errors.email?.message}
          >
            <TextInput
              id="email"
              type="email"
              autoComplete="email"
              placeholder="konservasi@bbtngl.go.id"
              invalid={errors.email !== undefined}
              aria-describedby={fieldDescribedBy(
                "email",
                false,
                errors.email !== undefined,
              )}
              className="h-12 rounded-[8px] border-border bg-surface-muted px-4"
              {...register("email")}
            />
          </FormField>

          <FormField
            label={locale === "en" ? "Password" : "Kata sandi"}
            htmlFor="password"
            required
            error={errors.password?.message}
          >
            <div className="relative">
              <TextInput
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={locale === "en" ? "Enter your password" : "Masukkan kata sandi"}
                invalid={errors.password !== undefined}
                aria-describedby={fieldDescribedBy(
                  "password",
                  false,
                  errors.password !== undefined,
                )}
                className="h-12 rounded-[8px] border-border bg-surface-muted px-4 pr-11"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
                className="absolute inset-y-0 right-3 flex items-center text-ink-soft transition hover:text-primary"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="size-5" />
                ) : (
                  <Eye aria-hidden="true" className="size-5" />
                )}
              </button>
            </div>
          </FormField>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink-soft">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="size-4 rounded border-border accent-primary"
            />
            {locale === "en" ? "Remember Password" : "Ingat saya"}
          </label>

          {notice !== undefined && notice !== "" ? (
            <FormAlert message={notice} />
          ) : null}

          {loginError !== undefined && loginError !== null && loginError !== "" ? (
            <FormAlert message={loginError} />
          ) : null}

          <Button
            type="submit"
            size="lg"
            loading={isSubmitting}
            className="mt-1 h-12 w-full rounded-[8px] bg-accent text-base font-bold text-white hover:bg-primary"
          >
            {isSubmitting
              ? locale === "en"
                ? "Signing in..."
                : "Memproses..."
              : locale === "en"
                ? "Sign In"
                : "Masuk"}
          </Button>
        </form>

        <div className="mt-6 rounded-xl border border-line bg-surface-muted/70 px-4 py-3 text-center text-sm text-ink-soft">
          {locale === "en" ? "Visiting Gunung Leuser National Park? " : "Ingin berkunjung ke TN Gunung Leuser? "}
          <Link href="/register" className="font-bold text-primary hover:underline">
            {locale === "en" ? "Register visitor account" : "Daftar akun pengunjung"}
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Balai Taman Nasional Gunung Leuser · Wildlife Monitoring System
        </p>
      </section>
    </main>
  );
}
