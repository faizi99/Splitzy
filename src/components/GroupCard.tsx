'use client'

import Link from "next/link"
import { Users, Receipt, Calendar, ChevronRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteGroup } from "@/app/actions"
import { useState } from "react"

type GroupCardProps = {
    group: {
        id: string
        name: string
        createdAt: Date
        members: unknown[]
        _count: {
            expenses: number
        }
    }
}

export function GroupCard({ group }: GroupCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!confirm(`Are you sure you want to delete "${group.name}"? This will delete all members and expenses.`)) {
            return
        }

        setIsDeleting(true)
        try {
            await deleteGroup(group.id)
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to delete group")
            setIsDeleting(false)
        }
    }

    return (
        <div className="relative group/card">
            <Link
                href={`/group/${group.id}`}
                className="block p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all border border-white/10 hover:border-white/30"
            >
                <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            {group.name}
                            <ChevronRight className="h-4 w-4 group-hover/card:translate-x-1 transition-transform" />
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-100/70">
                            <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Receipt className="h-3 w-3" />
                                {group._count.expenses} {group._count.expenses === 1 ? 'expense' : 'expenses'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Intl.DateTimeFormat('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                }).format(new Date(group.createdAt))}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="absolute top-2 right-2 text-white/60 hover:text-red-400 hover:bg-red-500/20 z-10"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}
