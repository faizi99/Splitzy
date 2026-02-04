'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"
import { addMemberToGroupByUserId, getAllUsers } from "@/app/actions"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type User = {
    id: string
    name: string | null
    email: string
    image: string | null
}

type AddMemberDialogProps = {
    groupId: string
}

export function AddMemberDialog({ groupId }: AddMemberDialogProps) {
    const [open, setOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const [isFetchingUsers, setIsFetchingUsers] = useState(false)

    useEffect(() => {
        if (open && users.length === 0) {
            setIsFetchingUsers(true)
            getAllUsers()
                .then(setUsers)
                .finally(() => setIsFetchingUsers(false))
        }
    }, [open, users.length])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedUserId) {
            return
        }

        setIsLoading(true)
        try {
            await addMemberToGroupByUserId(groupId, selectedUserId)
            setSelectedUserId("")
            setOpen(false)
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to add member")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Member to Group</DialogTitle>
                        <DialogDescription>
                            Select a user from your account to add to this group.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="user">Select User</Label>
                            {isFetchingUsers ? (
                                <div className="text-sm text-muted-foreground">Loading users...</div>
                            ) : users.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    No users available. Create an account first.
                                </div>
                            ) : (
                                <Select
                                    value={selectedUserId}
                                    onValueChange={setSelectedUserId}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="user">
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.name || user.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !selectedUserId || isFetchingUsers}
                        >
                            {isLoading ? "Adding..." : "Add Member"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
