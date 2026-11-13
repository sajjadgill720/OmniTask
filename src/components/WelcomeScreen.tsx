import React from 'react';
import { ArrowRight, StickyNote, LayoutGrid, Timer, Shield } from 'lucide-react';

export function WelcomeScreen({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  return <div className="launch-page">
    <nav className="launch-nav"><a href="#" className="launch-brand"><StickyNote size={24} /> Omni Sticky <span>Beta</span></a><a href="/privacy.html">Privacy & data</a></nav>
    <main className="launch-hero">
      <div>
        <p className="launch-eyebrow">A little space for your next big thing</p>
        <h1>Clear your head.<br /><em>Make room to do.</em></h1>
        <p className="launch-description">Turn loose thoughts into colorful sticky notes. Plan on a board, connect ideas on a canvas, and settle into one focused task.</p>
        <div className="launch-actions"><button onClick={onStart}>Start your workspace <ArrowRight size={18} /></button><button className="secondary" onClick={onDemo}>Explore sample notes</button></div>
        <p className="launch-note">Free beta · No account required · Best on a larger screen</p>
      </div>
      <div className="launch-board" aria-label="Example sticky note board">
        <div className="launch-board-title">A calmer kind of planning <span>YOUR SPACE</span></div>
        <div className="launch-note-card yellow"><span>TO DO</span><strong>One small step<br />is a good start.</strong><small>☐ Write down what matters<br />☐ Choose what’s next</small></div>
        <div className="launch-note-card green"><span>IN PROGRESS</span><strong>Less juggling.<br />More focus.</strong><small>One task at a time.</small></div>
        <div className="launch-note-card pink"><span>DONE</span><strong>Make a little<br />room to breathe.</strong><small>✓ Celebrate the small wins</small></div>
      </div>
    </main>
    <section className="launch-features" aria-label="What you can do">
      <article><LayoutGrid /><h2>See your next step</h2><p>Move notes from To Do to In Progress to Done. Keep related work in projects.</p></article>
      <article><Timer /><h2>Give it your attention</h2><p>Use a focus timer and optional ambient sounds to make space for your work.</p></article>
      <article><Shield /><h2>Know where it lives</h2><p>Your work is saved in this browser on this device. Export backups to keep a portable copy.</p></article>
    </section>
    <footer className="launch-footer"><p>No cloud sync or collaboration yet. Clearing browser data deletes local work. Browser and desktop workspaces are separate.</p><a href="/help.html">Getting started & feedback</a><a href="/privacy.html">Privacy & data</a></footer>
  </div>;
}
