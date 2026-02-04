'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Trash2 } from "lucide-react"
import { deleteMember } from "@/app/actions"
import { useState } from "react"

type Member = {
    id: string
    user: {
        name: string | null
        email: string
        image: string | null
    }
}

type MembersListProps = {
    members: Member[]
    groupId: string
}

export function MembersList({ members, groupId }: MembersListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (memberId: string) => {
        if (!confirm("Are you sure you want to remove this member?")) {
            return
        }

        setDeletingId(memberId)
        try {
            await deleteMember(memberId, groupId)
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to delete member")
        } finally {
            setDeletingId(null)
        }
    }

    if (members.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Members
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No members yet</p>
                        <p className="text-sm">Add your first member to get started</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Members ({members.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex flex-col">
                                <span className="font-medium">{member.user.name || member.user.email}</span>
                                {member.user.name && (
                                    <span className="text-sm text-muted-foreground">{member.user.email}</span>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDelete(member.id)}
                                disabled={deletingId === member.id}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
