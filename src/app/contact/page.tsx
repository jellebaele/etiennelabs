'use client';

import { useState } from 'react';
import { sendEmail } from '../actions/emails';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // toast({
    //   title: 'Message sent!',
    //   description: "Thanks for reaching out. I'll get back to you soon.",
    // });

    try {
      sendEmail({ senderName: name, senderEmail: email, message: message });
    } catch (error) {
      console.error('failed sending: ' + error);
    }

    setName('');
    setEmail('');
    setMessage('');
  };
  return (
    <>
      <div className='flex items-center gap-3 mb-4'>
        <div className='w-3 h-3 bg-primary' />
        <h1 className='text-4xl md:text-5xl font-bold'>Contact</h1>
      </div>

      <section className='container'>
        <p className='text-muted-foreground mb-6 font-mono text-sm'>
          Got a question, idea, or just want to say hello? Drop me a message.
        </p>

        <form
          onSubmit={handleSubmit}
          className='space-y-6'>
          <div>
            <label className='block font-mono text-xs uppercase tracking-wider mb-2 text-muted-foreground'>
              Name
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className='w-full retro-border px-4 py-3 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary'
              placeholder='Your name'
            />
          </div>

          <div>
            <label className='block font-mono text-xs uppercase tracking-wider mb-2 text-muted-foreground'>
              Email
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full retro-border px-4 py-3 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary'
              placeholder='your@email.com'
            />
          </div>

          <div>
            <label className='block font-mono text-xs uppercase tracking-wider mb-2 text-muted-foreground'>
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              className='w-full retro-border px-4 py-3 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none'
              placeholder="What's on your mind?"
            />
          </div>

          <button
            type='submit'
            className='bg-primary text-primary-foreground border-2 border-foreground retro-shadow px-8 py-3 font-mono text-sm uppercase tracking-wider hover:-translate-y-0.5 transition-transform'>
            Send Message
          </button>
        </form>
      </section>
    </>
  );
};

export default ContactPage;
