"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/Logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const kirishSxemasi = z.object({
  email: z.string().email("Email manzil noto'g'ri formatda"),
  parol: z.string().min(1, "Parolni kiriting"),
});

type KirishForma = z.infer<typeof kirishSxemasi>;

export default function AdminKirishPage() {
  const router = useRouter();
  const [xato, setXato] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<KirishForma>({
    resolver: zodResolver(kirishSxemasi),
  });

  async function onSubmit(qiymatlar: KirishForma) {
    setXato(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: qiymatlar.email,
      password: qiymatlar.parol,
    });

    if (error) {
      setXato("Email yoki parol noto'g'ri");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <Logo size="lg" withText priority />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin panelga kirish</CardTitle>
          <CardDescription>Boshqaruv paneli</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Elektron pochta</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="parol">Parol</Label>
              <Input
                id="parol"
                type="password"
                autoComplete="current-password"
                {...register("parol")}
              />
              {errors.parol && (
                <p className="text-sm text-destructive">{errors.parol.message}</p>
              )}
            </div>

            {xato && <p className="text-sm text-destructive">{xato}</p>}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Kirilmoqda..." : "Kirish"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
