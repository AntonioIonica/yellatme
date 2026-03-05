import Link from "next/link";

export default function Home() {
  return (
    <div>
      Navigation:
      <nav>
        <ul>
          <li>
            <Link href="/sign-up">Sign Up</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
