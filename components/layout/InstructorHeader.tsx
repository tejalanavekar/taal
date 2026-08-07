import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { SignOutButton } from "@/components/ui/SignOutButton";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/workshops", label: "Workshops" },
  { href: "/attendees", label: "Attendees" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function InstructorHeader({ name }: { name?: string | null }) {
  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="font-heading text-2xl text-accent">
            Taal
          </Link>
          <Badge color="virtual">INSTRUCTOR</Badge>
          {name && <span className="text-muted text-sm ml-1">/ {name}</span>}
        </div>
        <nav className="flex items-center gap-4 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/workshops/new"
          className="text-xs font-semibold rounded-lg px-3 py-2 bg-gradient-to-r from-accent to-accent-gradient"
        >
          + New workshop
        </Link>
        <SignOutButton />
      </div>
    </header>
  );
}
