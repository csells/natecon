import { Layout } from '@/components/Layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: 'Can I attend just one day?',
    answer: 'No, tickets are $100 for both days to keep it simple. This includes all meals, snacks, and drinks for the entire event.',
  },
  {
    question: 'Is food included?',
    answer: 'Yes! Breakfast, lunch, snacks, and drinks are included both days. We\'ll have options for various dietary restrictions — just let us know when you register.',
  },
  {
    question: 'Do I need a team for the hackathon?',
    answer: 'Nope! You can join a team before or during the event, or work solo. We\'ll have time on Day 2 morning for final team formation.',
  },
  {
    question: 'What should I bring?',
    answer: 'Just your laptop and charger. We\'ll have wifi and power strips available. Everything else is provided!',
  },
  {
    question: 'Can I submit more than one talk proposal?',
    answer: 'Absolutely! Submit as many as you\'d like. We encourage diverse topics and perspectives from the community.',
  },
  {
    question: 'What\'s the refund policy?',
    answer: 'Full refund if you can\'t make it. Just let us know before the event and we\'ll process your refund promptly.',
  },
  {
    question: 'How do I contact the organizers?',
    answer: 'Use the contact form at the bottom of the page, or email us directly. We\'re happy to answer any questions!',
  },
  {
    question: 'Where exactly is the venue?',
    answer: 'NateCon 2026 will be held at the New Relic offices in San Francisco. Exact address and parking/transit info will be shared closer to the event.',
  },
  {
    question: 'What are the hackathon prize categories?',
    answer: 'We have three prize categories: Best AI Agent, Best AI Tool, and Best Overall. Winners are decided by audience applause plus Nate\'s input!',
  },
  {
    question: 'Can I present if I don\'t have a team?',
    answer: 'Yes! Solo projects are absolutely welcome in the hackathon. You\'ll still get your 3-minute demo slot just like team projects.',
  },
];

export default function FAQ() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-muted-foreground">
                Everything you need to know about NateCon 2026
              </p>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-border">
                      <AccordionTrigger className="px-6 py-4 text-left hover:text-primary hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                Still have questions?
              </p>
              <Link
                to="/contact"
                className="text-primary hover:underline font-medium"
              >
                Contact us →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
