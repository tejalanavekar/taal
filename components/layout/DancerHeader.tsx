import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { SignOutButton } from "@/components/ui/SignOutButton";

export function DancerHeader({ email }: { email?: string | null }) {
  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
      <div className="flex items-center gap-3">
        <Link href="/explore" className="font-heading text-2xl text-accent">
          Taal
        </Link>
        <Badge color="accent">DANCER</Badge>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/profile" className="text-sm text-muted hover:text-foreground">
          {email ?? "Guest"}
        </Link>
        <SignOutButton />
      </div>
    </header>
  );
}
