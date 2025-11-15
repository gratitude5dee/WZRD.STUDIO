import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is WZRDFLOW?',
    answer: 'WZRDFLOW is an AI-powered creative workflow platform that helps you generate stunning visuals, videos, and content using state-of-the-art AI models. Build custom workflows with our intuitive visual editor.',
  },
  {
    question: 'How does the AI generation work?',
    answer: 'Our platform integrates multiple AI models for different creative tasks. Simply connect blocks in our workflow builder, configure your parameters, and let the AI generate high-quality content in seconds.',
  },
  {
    question: 'What kind of content can I create?',
    answer: 'You can create images, videos, music, text content, and more. Our platform supports various AI models for different creative needs, from photo-realistic images to abstract art and video generation.',
  },
  {
    question: 'Do I need coding knowledge?',
    answer: 'No! WZRDFLOW is designed for creators, not coders. Our visual workflow builder lets you create complex AI pipelines with simple drag-and-drop actions.',
  },
  {
    question: 'How much does it cost?',
    answer: 'We offer flexible pricing plans to suit different needs. Start with our free tier to explore the platform, then upgrade to Pro or Enterprise for advanced features and higher usage limits.',
  },
  {
    question: 'Can I use my own AI models?',
    answer: 'Our platform currently integrates with leading AI providers. We\'re working on custom model integration for Enterprise customers. Contact our sales team for more information.',
  },
];

export function FAQSection() {
  return (
    <section className="py-24 px-4 bg-black relative overflow-hidden">
      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Everything you need to know about WZRDFLOW
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl px-6 hover:border-[#e78a53]/30 transition-colors"
              >
                <AccordionTrigger className="text-left text-white hover:text-[#e78a53] transition-colors py-6 text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/60 pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
