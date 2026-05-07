import Link from "next/link";

type Props = {
  brandName: string;
};

export function PublicSiteHeader({ brandName }: Props) {
  return (
    <header className="publicHeader">
      <Link href="/" className="brandLink">
        {brandName}
      </Link>
      <nav className="publicNav">
        <Link href="/gallery" className="navButton navButton--solid">
          Digital Gallery
        </Link>
        <Link href="/archive" className="navButton">
          Archive
        </Link>
        <Link href="/login" className="navButton">
          Log In
        </Link>
      </nav>
    </header>
  );
}
