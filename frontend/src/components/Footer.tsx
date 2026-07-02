export default function Footer() {
  return (
    <footer className="border-t border-charcoal/10 dark:border-white/5 py-12 px-6 lg:px-12 transition-colors duration-500">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6">
        <img src="/logo.svg" alt="TubeDigest" className="w-[180px] opacity-60 dark:opacity-80 dark:invert transition-opacity duration-500" />

        <div className="flex items-center gap-6">
          <a href="#" className="text-[13px] text-charcoal/50 dark:text-grey-medium hover:text-charcoal dark:hover:text-white transition-colors">
            About
          </a>
          <a href="#" className="text-[13px] text-charcoal/50 dark:text-grey-medium hover:text-charcoal dark:hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="text-[13px] text-charcoal/50 dark:text-grey-medium hover:text-charcoal dark:hover:text-white transition-colors">
            Terms
          </a>
        </div>

        <span className="text-[13px] text-charcoal/50 dark:text-grey-medium transition-colors duration-500">
          &copy; 2025 TubeDigest
        </span>
      </div>
    </footer>
  );
}
