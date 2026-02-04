import { Card, CardContent } from "@/components/ui/card"
import { Receipt, Calendar } from "lucide-react"

type GroupHeaderProps = {
    groupName: string
    createdAt: Date
    memberCount: number
}

export function GroupHeader({ groupName, createdAt, memberCount }: GroupHeaderProps) {
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(createdAt))

    return (
        <Card className="bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border-violet-200/50">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                                <Receipt className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{groupName}</h1>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Created {formattedDate}
                                    </span>
                                    <span>
                                        {memberCount} {memberCount === 1 ? 'member' : 'members'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
