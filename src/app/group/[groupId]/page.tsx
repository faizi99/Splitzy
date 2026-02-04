import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { GroupHeader } from "./components/GroupHeader"
import { MembersList } from "./components/MembersList"
import { AddMemberDialog } from "./components/AddMemberDialog"
import { AddExpenseDialog } from "./components/AddExpenseDialog"
import { ExpensesList } from "./components/ExpensesList"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function GroupPage({
    params,
}: {
    params: Promise<{ groupId: string }>
}) {
    const groupId = (await params).groupId

    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            image: true,
                        }
                    }
                },
                orderBy: {
                    joinedAt: 'asc'
                }
            },
            expenses: {
                include: {
                    payer: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                }
                            }
                        }
                    },
                    splits: {
                        include: {
                            member: {
                                include: {
                                    user: {
                                        select: {
                                            name: true,
                                            email: true,
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    date: 'desc'
                }
            }
        },
    })

    if (!group) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="space-y-6">
                    <Link href="/">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Groups
                        </Button>
                    </Link>

                    <GroupHeader
                        groupName={group.name}
                        createdAt={group.createdAt}
                        memberCount={group.members.length}
                    />

                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Group Members</h2>
                        <AddMemberDialog groupId={groupId} />
                    </div>

                    <MembersList members={group.members} groupId={groupId} />

                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Expenses</h2>
                        {group.members.length > 0 && (
                            <AddExpenseDialog groupId={groupId} members={group.members} />
                        )}
                    </div>

                    {group.members.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground bg-card border rounded-lg">
                            <p>Add members to the group before creating expenses</p>
                        </div>
                    ) : (
                        <ExpensesList expenses={group.expenses} groupId={groupId} />
                    )}
                </div>
            </div>
        </div>
    )
}
