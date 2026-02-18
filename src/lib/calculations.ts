/**
 * Balance Calculation Engine
 *
 * Pure functions — no database calls. Pass in the data already fetched
 * by the group page Prisma query.
 */

export type MemberInfo = {
    id: string
    name: string // display name (user.name ?? user.email)
}

export type MemberBalance = {
    member: MemberInfo
    totalPaid: number   // sum of expenses this member paid for
    totalOwed: number   // sum of splits assigned to this member
    balance: number     // totalPaid - totalOwed (positive = is owed money, negative = owes money)
}

export type Transaction = {
    from: MemberInfo
    to: MemberInfo
    amount: number
}

export type SettlementPlan = {
    balances: MemberBalance[]
    transactions: Transaction[]
}

// ─── Input shapes (match what Prisma returns) ──────────────────────────────

type SplitInput = {
    amount: number
    member: { id: string; user: { name: string | null; email: string } }
}

type ExpenseInput = {
    amount: number
    payer: { id: string; user: { name: string | null; email: string } }
    splits: SplitInput[]
}

type MemberInput = {
    id: string
    user: { name: string | null; email: string }
}

export type SettlementInput = {
    id: string
    amount: number
    note: string | null
    fromId: string
    toId: string
    settledAt: Date
    from: { id: string; user: { name: string | null; email: string } }
    to: { id: string; user: { name: string | null; email: string } }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function displayName(user: { name: string | null; email: string }): string {
    return user.name || user.email
}

function round2(n: number): number {
    return Math.round(n * 100) / 100
}

// ─── Core functions ────────────────────────────────────────────────────────

/**
 * Calculate each member's net balance.
 *
 * balance > 0 → this member is owed money by others
 * balance < 0 → this member owes money to others
 * balance = 0 → settled
 */
export function calculateMemberBalances(
    members: MemberInput[],
    expenses: ExpenseInput[],
    settlements: SettlementInput[] = []
): MemberBalance[] {
    // Initialise counters keyed by memberId
    const paid: Record<string, number> = {}
    const owed: Record<string, number> = {}

    for (const m of members) {
        paid[m.id] = 0
        owed[m.id] = 0
    }

    for (const expense of expenses) {
        // Credit the payer for the full amount
        if (paid[expense.payer.id] !== undefined) {
            paid[expense.payer.id] += expense.amount
        }

        // Charge each member for their split share
        for (const split of expense.splits) {
            if (owed[split.member.id] !== undefined) {
                owed[split.member.id] += split.amount
            }
        }
    }

    // Factor in recorded settlements:
    // A settlement "from A to B" means A paid B — treat it as:
    //   A.paid += amount  (A spent money to settle)
    //   B.owed += amount  (B's debt is offset)
    for (const s of settlements) {
        if (paid[s.fromId] !== undefined) paid[s.fromId] += s.amount
        if (owed[s.toId] !== undefined) owed[s.toId] += s.amount
    }

    return members.map(m => {
        const totalPaid = round2(paid[m.id])
        const totalOwed = round2(owed[m.id])
        return {
            member: { id: m.id, name: displayName(m.user) },
            totalPaid,
            totalOwed,
            balance: round2(totalPaid - totalOwed),
        }
    })
}

/**
 * Simplify debts: produce the minimum number of transactions that settles
 * all balances using a greedy two-pointer approach on sorted creditor /
 * debtor lists.
 */
export function simplifyDebts(balances: MemberBalance[]): Transaction[] {
    const transactions: Transaction[] = []

    // Work with mutable copies, ignore already-settled members
    const creditors = balances
        .filter(b => b.balance > 0.01)
        .map(b => ({ member: b.member, amount: b.balance }))
        .sort((a, b) => b.amount - a.amount) // largest first

    const debtors = balances
        .filter(b => b.balance < -0.01)
        .map(b => ({ member: b.member, amount: Math.abs(b.balance) }))
        .sort((a, b) => b.amount - a.amount) // largest first

    let ci = 0 // creditor index
    let di = 0 // debtor index

    while (ci < creditors.length && di < debtors.length) {
        const credit = creditors[ci]
        const debt = debtors[di]

        const settlement = round2(Math.min(credit.amount, debt.amount))

        transactions.push({
            from: debt.member,
            to: credit.member,
            amount: settlement,
        })

        credit.amount = round2(credit.amount - settlement)
        debt.amount = round2(debt.amount - settlement)

        if (credit.amount < 0.01) ci++
        if (debt.amount < 0.01) di++
    }

    return transactions
}

/**
 * Top-level convenience function: given raw Prisma data, return both the
 * per-member balances and the optimal settlement transaction list.
 */
export function getSettlementPlan(
    members: MemberInput[],
    expenses: ExpenseInput[],
    settlements: SettlementInput[] = []
): SettlementPlan {
    const balances = calculateMemberBalances(members, expenses, settlements)
    const transactions = simplifyDebts(balances)
    return { balances, transactions }
}
