import { Badge } from "@/components/ui/badge";
import { displayStatus, statusTone } from "@/lib/format/status";
import { cn } from "@/lib/utils";

export function StatusBadge({
  value,
  className,
}: {
  value: string | null | undefined;
  className?: string;
}) {
  const tone = statusTone(value);
  return (
    <Badge variant={tone} className={cn("font-mono uppercase tracking-wide", className)}>
      {displayStatus(value)}
    </Badge>
  );
}
