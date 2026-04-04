const steps = [
  { num: "1", title: "Поиск",      description: "Найдите нужный товар и выберите даты аренды в нашем интерактивном каталоге." },
  { num: "2", title: "Аренда",     description: "Подтвердите аренду — смарт-контракт автоматически заблокирует залог в escrow." },
  { num: "3", title: "Управление", description: "Просматривайте аренды в дашборде. Держите NFT или продайте на маркетплейсе." },
  { num: "4", title: "Возврат",    description: "Верните товар. Оператор подтверждает — залог автоматически возвращается вам." },
];

export const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="py-20 px-6"
      style={{ borderTop: "1px solid var(--divider)" }}
    >
      <div className="max-w-3xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-4"
          style={{ letterSpacing: "-0.02em", color: "var(--text-1)" }}
        >
          Как это работает?
        </h2>
        <p className="text-center text-lg mb-14" style={{ color: "var(--text-3)" }}>
          Четыре шага — от поиска до возврата залога
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
          {steps.map(({ num, title, description }) => (
            <div key={num} className="flex items-start gap-5">
              <div
                className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <span
                  className="text-xl font-bold leading-none"
                  style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}
                >
                  {num}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1.5" style={{ color: "var(--text-1)" }}>
                  {title}
                </h3>
                <p className="text-lg leading-relaxed" style={{ color: "var(--text-3)" }}>
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
