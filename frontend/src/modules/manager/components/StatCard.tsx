import { Card, CardContent } from "@/components/ui/card";

export interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "warning" | "success";
  active?: boolean;
  onClick?: () => void;
}

export function StatCard({ title, value, icon, variant = "default", active = false, onClick }: StatCardProps) {
  const colors = {
    default: "text-foreground",
    warning: "text-destructive",
    success: "text-green-600",
  };

  return (
    <Card
      className={`border-border bg-card shadow-sm transition-all hover:shadow-md ${active ? "border-primary/60" : ""
        }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left"
      >
        <CardContent className="flex min-h-28 items-center justify-between p-4">
          <div>
            <p className="text-[11px] text-muted-foreground">{title}</p>
            <p className={`text-4xl font-semibold leading-none ${colors[variant]}`}>{value}</p>
          </div>
          <div className="text-muted-foreground/90">{icon}</div>
        </CardContent>
      </button>
    </Card>
  );
}