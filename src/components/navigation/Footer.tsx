import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function Footer() {
  return (
    <footer className="footer">
      <span>{BRAND} {"//"} PASSWORDLESS AUTHENTICATION</span>
      <Link href="/about">HOW IT WORKS</Link>
    </footer>
  );
}
