import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createGroup } from "./actions"
import { Label } from "@/components/ui/label"
import { Receipt } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { GroupCard } from "@/components/GroupCard"
import { auth } from "@/auth"
import { UserMenu } from "@/components/UserMenu"

export default async function Home() {
  const session = await auth()

  const groups = await prisma.group.findMany({
    include: {
      members: true,
      _count: {
        select: {
          expenses: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20" />

      {session?.user && (
        <div className="absolute top-4 right-4 z-20">
          <UserMenu user={session.user} />
        </div>
      )}

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl text-white">
          <CardHeader className="text-center">
            <div className="mx-auto bg-white/20 p-3 rounded-full w-fit mb-4">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Splitzy</CardTitle>
            <CardDescription className="text-gray-100/80 text-lg">
              Split expenses with friends, <br /> no login required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-100">Create New Group</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Hawaii Trip 2026"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus-visible:ring-offset-0 focus-visible:border-white/50"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-white text-indigo-600 hover:bg-gray-100 font-semibold text-lg py-6"
              >
                Start Splitting
              </Button>
            </form>
          </CardContent>
        </Card>

        {groups.length > 0 && (
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl text-white">
            <CardHeader>
              <CardTitle className="text-xl">Your Groups</CardTitle>
              <CardDescription className="text-gray-100/80">
                Click on a group to view details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <footer className="relative z-10 mt-8 text-white/60 text-sm">
        Designed for simplicity.
      </footer>
    </main>
  );
}
