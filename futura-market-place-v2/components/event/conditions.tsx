'use client';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface Condition {
  title: string;
  description: string;
}

export function EventConditions({ conditions }: { conditions: Condition[] }) {
  if (!conditions?.length) return null;

  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-white mb-4">Conditions</h2>
      <div className="bg-white/5 rounded-lg border border-white/10">
        <Accordion type="single" collapsible>
          {conditions.map((condition, index) => (
            <AccordionItem key={index} value={`condition-${index}`}>
              <AccordionTrigger className="px-6 pt-6">{condition.title}</AccordionTrigger>
              <AccordionContent className="px-6 pb-6">{condition.description}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}