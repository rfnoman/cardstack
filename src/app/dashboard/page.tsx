import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import CardList from "@/components/CardList";
import AddCardButton from "@/components/AddCardButton";
import LogoutButton from "@/components/LogoutButton";
import Logo from "@/components/Logo";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const cards = await db.card.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { sharedWith: { some: { id: session.user.id } } },
      ],
    },
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Logo />
              <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <AddCardButton />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Business Cards</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and organize your professional connections
          </p>
        </div>
        <div className="mt-8">
          <CardList cards={cards} />
        </div>
      </main>
    </div>
  );
}
