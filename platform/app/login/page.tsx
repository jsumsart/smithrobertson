import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="loginWrap">
      <section className="loginCard">
        <p className="eyebrow">Private Staff Login</p>
        <h1 className="pageTitle">Sign in to the collections platform.</h1>
        <p className="muted">
          This page is the dedicated entry point for staff and student catalogers. In the real migration, this route will
          use Supabase Auth and redirect signed-in users into the private dashboard.
        </p>
        <form className="loginForm">
          <label>
            <span>Email</span>
            <input type="email" placeholder="you@example.org" />
          </label>
          <label>
            <span>Password</span>
            <input type="password" placeholder="••••••••" />
          </label>
          <div className="buttonRow">
            <button type="button" className="buttonPrimary">
              Sign In
            </button>
            <Link href="/gallery" className="buttonSecondary">
              Back to Public Site
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
