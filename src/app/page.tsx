import { redirect } from "next/navigation";

interface DashboardPageProps {
  searchParams: { page?: string };
}

// ✅ Force dynamic rendering to bypass prerender issues (redirect pages don't need static prerender)
export const dynamic = 'force-dynamic';

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  const pageParam = searchParams?.page ?? btoa("dashboard");

  return redirect(`/dashboard?page=${pageParam}`);
}