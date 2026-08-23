'use client';

import React from 'react';

const LEARNING_ROADMAP = [
  {
    title: 'The Global Network',
    subtitle: 'How the Internet Works',
    text: 'Started by demystifying the web. Explored how data packets travel across the globe via undersea cables, understanding TCP/IP protocols, DNS resolution, and the fundamental client-server model that powers the modern internet.',
  },
  {
    title: 'Computer Architecture',
    subtitle: 'Hardware & Bare Metal',
    text: 'Moved down to the metal to understand what actually processes those packets. Explored CPU instruction sets, memory hierarchies (RAM, L1/L2 Cache), and how electrical signals translate into binary logic gates.',
  },
  {
    title: 'Operating Systems',
    subtitle: 'The Software Foundation',
    text: 'Bridged the gap between hardware and software. Dove deep into Linux environments, kernel architectures, process scheduling, memory paging, and how operating systems abstract complex hardware for user applications.',
  },
  {
    title: 'Computational Logic',
    subtitle: 'Programming & Algorithms',
    text: 'Began instructing the machine. Learned to formulate precise computational procedures through programming languages. Mastered data structures, Big-O algorithmic complexity, and turning abstract logic into executable code.',
  },
  {
    title: 'Data Persistence',
    subtitle: 'Databases & State',
    text: 'Focused on how information is stored and retrieved efficiently. Mastered relational database design, query optimization, indexing strategies, and ensuring ACID compliance across large-scale stateful applications.',
  },
  {
    title: 'Systems Engineering',
    subtitle: 'Building & Orchestrating',
    text: 'Brought everything together to build scalable systems. Explored distributed architectures, decoupled services, RESTful API design, and orchestrated robust backends capable of handling real-world computational loads.',
  },
];

export default function AboutTab() {
  return (
    <div className="space-y-16">
      <div className="space-y-3">
        <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">
          Profile & Scope
        </p>
        <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
          Computer Science Journey
        </h2>
        <p className="js-reveal max-w-4xl text-sm sm:text-base md:text-lg leading-relaxed text-[var(--home-muted)]">
          I am Phion Rushandle, a Computer Science Enthusiast. My passion lies in understanding
          systems from the ground up unraveling the magic behind the screen. This is the
          mental map of how I systematically deconstructed and learned the world of computing,
          from global networks down to microscopic logic gates.
        </p>
      </div>
      {/* 
      <div className="space-y-10 py-2">
        <div className="js-reveal max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[var(--home-ink)]">
              Path of Exploration
            </p>
          </div>
          <p className="text-base leading-relaxed text-[var(--home-muted)]">
            A chronological breakdown of how I built my foundational understanding of modern technology.
          </p>
        </div>

        <div className="grid gap-6 pt-6 sm:grid-cols-2 sm:gap-8">
          {LEARNING_ROADMAP.map((item, index) => {
            return (
              <div
                key={item.title}
                data-number={String(index + 1).padStart(2, '0')}
                className="js-reveal group relative z-0 transition-transform duration-500 hover:-translate-y-1 before:pointer-events-none before:absolute before:right-0 before:top-1/2 before:-z-10 before:-translate-y-1/2 before:text-[clamp(80px,10vw,120px)] before:font-black before:leading-none before:tracking-tighter before:text-[var(--home-muted)] before:opacity-15 before:content-[attr(data-number)]">
                <div className="relative z-10 space-y-4 py-4">
                  <div>
                    <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--home-muted)]">
                      <span className="h-px w-6 bg-white/20" />
                      Phase {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-3 text-xl font-bold tracking-tight text-[var(--home-ink)] sm:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[var(--home-muted)]">
                      [ {item.subtitle} ]
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed text-[var(--home-muted)] pr-6 sm:pr-12">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div> */}
    </div>
  );
}
