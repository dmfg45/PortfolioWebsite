const socials = [
  { href: "https://www.linkedin.com/in/andregracacd", label: "LinkedIn" },
  { href: "https://www.youtube.com/channel/UCJLs_z8Nn18JWUj1bGkdC7Q", label: "YouTube" },
  { href: "https://twitter.com/AndrGraa1", label: "Twitter" },
  { href: "https://www.facebook.com/andre.graca.31", label: "Facebook" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 py-10 text-sm text-white/50">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-light/40 to-transparent" />
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p>&copy; {new Date().getFullYear()} André Graça. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-6">
          {socials.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-white"
            >
              {social.label}
            </a>
          ))}
        </div>
        <a href="/admin/login" className="transition-colors hover:text-white">
          Admin
        </a>
      </div>
    </footer>
  );
}
