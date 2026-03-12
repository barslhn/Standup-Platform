import { Search } from "lucide-react";

export function EmptyUpdatesState({
    title,
    description,
    actions,
}: {
    title: string;
    description: string;
    actions?: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Search className="h-4 w-4" />
            </div>
            <p className="text-base font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            {actions && <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{actions}</div>}
        </div>
    );
}
