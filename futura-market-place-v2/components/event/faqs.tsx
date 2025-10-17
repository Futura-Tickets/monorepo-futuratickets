'use client';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface FAQ {
  title: string;
  description: string;
}

export function EventFAQs({ faqs }: { faqs: FAQ[] }) {
  if (!faqs?.length) return null;

  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-white mb-4">FAQs</h2>
      <div className="bg-white/5 rounded-lg border border-white/10">
        <Accordion type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className="px-6 pt-6">{faq.title}</AccordionTrigger>
              <AccordionContent className="px-6 pb-6">{faq.description}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}