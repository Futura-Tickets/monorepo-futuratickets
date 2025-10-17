'use client';

export function EventDescription({ description }: { description: string }) {
  return (
    <section className='mb-12'>
      <h2 className='text-xl font-semibold text-white mb-4'>Description</h2>
      <div className='bg-white/5 rounded-lg p-6 border border-white/10'>
        <p className='text-gray-300'>{description}</p>
      </div>
    </section>
  );
}