export default function PrivacyPolicy() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 text-base leading-7 text-gray-100">
      <header className="mb-10 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm opacity-80">
          Effective date: <span className="font-medium">{today}</span>
        </p>
      </header>

      <section className="mb-8">
        <p className="opacity-90">
          We respect your privacy. This website does not collect, store, or share any personal information from its
          visitors. Any cookies used are only for essential site functionality and do not track you for advertising or
          analytics purposes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Contact Us</h2>
        <p className="opacity-90">
          If you have any questions about this Privacy Policy, you can contact us at:
          <br />
          <strong>Email:</strong> sarfaraz.8.kh@gmail.com
        </p>
      </section>
    </main>
  );
}
