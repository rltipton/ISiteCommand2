/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BlogPost } from './Blog';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  HardHat, 
  ArrowUpRight 
} from 'lucide-react';

export default function LatestUpdates() {
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchLatest = () => {
      try {
        const stored = localStorage.getItem('tjd_blog_posts');
        if (stored) {
          const parsed = JSON.parse(stored) as BlogPost[];
          // Take the top 2 posts
          setLatestPosts(parsed.slice(0, 2));
        } else {
          // Fall back to seed approximations
          const fallback: BlogPost[] = [
            {
              id: 'post-1',
              title: 'The Art of Final Grading: Preparing Solid Building Pads in Georgia Red Clay',
              slug: 'art-of-final-grading-georgia-red-clay',
              summary: 'Our clay holds moisture, posing unique challenges. Learn how dual-slope laser transits and precise compaction standards keep site pads bone dry and structurally sound.',
              category: 'Grading & Site Prep',
              author: 'TJ Darley',
              readTime: '5 min read',
              date: 'June 10, 2026',
              likes: 24,
              content: ''
            },
            {
              id: 'post-2',
              title: 'Forestry Mulching vs. Traditional Bulldozing: Preserving Topsoil on Wooded Acreage',
              slug: 'forestry-mulching-vs-traditional-bulldozing',
              summary: 'Discover why high-flow Fecon mulchers on compact track loaders are vastly superior to traditional scrape clearing when clearing selectively.',
              category: 'Forestry Mulching',
              author: 'Kyle Simmons',
              readTime: '4 min read',
              date: 'May 28, 2026',
              likes: 18,
              content: ''
            }
          ];
          setLatestPosts(fallback);
        }
      } catch (err) {
        console.error("Failed to load blog posts in preview cards:", err);
      }
    };

    fetchLatest();

    // Recheck if an update happens
    window.addEventListener('tjd_blog_posts_changed', fetchLatest);
    return () => {
      window.removeEventListener('tjd_blog_posts_changed', fetchLatest);
    };
  }, []);

  const handleOpenPost = (slug: string) => {
    window.location.hash = `#blog/${slug}`;
  };

  const handleSeeAll = () => {
    window.location.hash = '#blog';
  };

  return (
    <section className="bg-slate-950 py-20 border-t border-b border-slate-900 text-left relative overflow-hidden" id="latest-updates-feed">
      {/* Decorative Grid and Accents */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none"></div>
      <div className="absolute -top-12 left-10 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-12">
        
        {/* Title Group */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-900">
          <div className="space-y-3">
            <span className="font-mono text-xs text-brand-orange font-bold uppercase tracking-widest inline-flex items-center gap-2 bg-amber-950/40 border border-brand-orange/30 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              NATIVE LEARNING PLATFORM
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight leading-none">
              Professional Site-Prep <br />
              <span className="text-brand-orange">& Construction Knowledge Base</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Skip external servers and cumbersome blog logs. Read our native guides on compaction densities, forestry mulching safety, and Georgia red clay final grades.
            </p>
          </div>

          <button
            onClick={handleSeeAll}
            className="group inline-flex items-center gap-2 py-3 px-5 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 rounded-lg text-xs font-bold text-slate-300 uppercase tracking-wider transition-all duration-150 shrink-0 self-start md:self-auto"
          >
            <span>View All Knowledge Posts</span>
            <ChevronRight className="w-4 h-4 text-brand-orange group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Operations Status Board - Left column */}
          <div className="lg:col-span-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-900 space-y-5">
            <h3 className="font-display font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <HardHat className="w-4.5 h-4.5 text-brand-orange" />
              <span>Middle GA Compliance Update</span>
            </h3>

            <div className="space-y-4 text-xs leading-relaxed font-sans">
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-850 space-y-2">
                <span className="font-mono font-bold text-[10px] text-brand-orange block uppercase tracking-wider">&bull; Red Clay Moisture standards</span>
                <p className="text-slate-400">
                  Daily Proctor density tests ensure structural pad clay reaches exactly <strong>95% compaction limits</strong> before footing excavations.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-850 space-y-2">
                <span className="font-mono font-bold text-[10px] text-emerald-400 block uppercase tracking-wider">&bull; Silt Control Mandates</span>
                <p className="text-slate-400">
                  Our operators hold active GSWCC blue-card authorizations. Silt screen wire-backing and turbidity curtains are pre-calculated for all lakeside lots.
                </p>
              </div>

              <div className="p-3 bg-slate-950/20 rounded-xl border border-dashed border-slate-800 text-[11.5px] text-slate-300 italic flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  &ldquo;Direct, native operations reporting saves weeks of delay over slow external web folders!&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Core Blog Cards - Right Columns */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => handleOpenPost(post.slug)}
                className="bg-slate-900/65 hover:bg-slate-900 border border-slate-800/80 hover:border-brand-orange/55 rounded-2xl p-6 cursor-pointer group transition-all duration-200 flex flex-col justify-between shadow-lg h-full"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="px-2 py-0.5 bg-slate-950 border border-slate-850 text-brand-orange rounded font-bold uppercase text-[9px] tracking-wider">
                      {post.category}
                    </span>
                    <span className="text-slate-500">{post.date}</span>
                  </div>

                  <h4 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-brand-orange transition-colors tracking-tight leading-snug">
                    {post.title}
                  </h4>

                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-950 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-mono inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    {post.readTime}
                  </span>

                  <span className="text-xs font-bold text-slate-350 group-hover:text-brand-orange transition-colors flex items-center gap-0.5 uppercase tracking-wider text-[10px]">
                    <span>Read Tips</span>
                    <ArrowUpRight className="w-4 h-4 text-brand-orange opacity-80" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
