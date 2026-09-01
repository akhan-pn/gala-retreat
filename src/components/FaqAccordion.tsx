import { faqs } from '@/content/home-sections'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type Props = {
  className?: string
}

/**
 * The home-page FAQ, as an editorial index rather than a support widget.
 *
 * One question open at a time and all of them closable, because the block is
 * a list first: a visitor should be able to read the six questions as a set
 * and open the one that is theirs. Numerals are hung in the margin the same
 * way the spaces index and the package list hang theirs, so the three blocks
 * read as one family.
 *
 * Copy lives in `src/content/home-sections.ts` — nothing is written here.
 * This is a server component; only the accordion primitive below it is
 * client-side.
 */
export default function FaqAccordion({ className = '' }: Props) {
  return (
    <Accordion type="single" collapsible className={className}>
      {faqs.map((faq, i) => (
        <AccordionItem key={faq.q} value={`faq-${i}`}>
          <AccordionTrigger>
            <span className="u-label shrink-0 tabular-nums text-accent">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="u-display-sm text-[clamp(1.1rem,2.2vw,1.5rem)] text-ink transition-colors duration-500 ease-editorial group-hover/accordion-trigger:text-accent group-data-[state=open]/accordion-trigger:text-accent">
              {faq.q}
            </span>
          </AccordionTrigger>

          {/* The answer is indented to clear the numeral so it hangs off the
              question rather than starting flush with it. */}
          <AccordionContent className="ml-[calc(2ch+1.25rem)] sm:ml-[calc(2ch+2rem)]">
            {faq.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
