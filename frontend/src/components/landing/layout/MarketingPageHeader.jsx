export function MarketingPageHeader({ title, description }) {
  return (
    <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">{title}</h1>
      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">{description}</p>
      )}
    </div>
  );
}
