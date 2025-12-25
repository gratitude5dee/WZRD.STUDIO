import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  allowMultiple?: boolean;
}

export const FAQAccordion = ({ items, allowMultiple = false }: FAQAccordionProps) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleIndex = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
      );
      return;
    }

    setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
  };

  const faqSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }),
    [items]
  );

  return (
    <section className="py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">FAQ</p>
          <h2 className="mt-4 text-3xl font-semibold text-white md:text-5xl">
            Everything you need to know
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {items.map((item, index) => {
            const isOpen = openIndexes.includes(index);
            return (
              <div
                key={item.question}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(index)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${index}`}
                >
                  <span className="text-base font-semibold text-white">{item.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-sm text-white/70">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQAccordion;
