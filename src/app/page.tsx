'use client';

import { redirect, useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const pageParam = searchParams?.get("page") ?? btoa("dashboard");

  return redirect(`/dashboard?page=${pageParam}`);
}
