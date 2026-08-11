/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Tag, 
  Clock, 
  ArrowLeft, 
  Calendar, 
  User, 
  Sparkles, 
  Share2, 
  Heart, 
  Search, 
  Filter, 
  CheckCircle2, 
  ChevronRight, 
  MessageSquare,
  Bookmark,
  ThumbsUp,
  Sliders,
  HardHat,
  Truck,
  Award
} from 'lucide-react';

interface BlogProps {
  onBackToHome: () => void;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; // supports simple markdown or paragraphs
  category: 'Grading & Site Prep' | 'Forestry Mulching' | 'Erosion Control' | 'Fleet & Crew News';
  author: string;
  readTime: string;
  date: string;
  likes: number;
  featured?: boolean;
}

const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'The Art of Final Grading: Preparing Solid Building Pads in Georgia Red Clay',
    slug: 'art-of-final-grading-georgia-red-clay',
    summary: 'Our red clay holds moisture, posing unique challenges. Learn how dual-slope laser transits and precise compaction standards keep site pads bone dry and structurally sound.',
    category: 'Grading & Site Prep',
    author: 'TJ Darley',
    readTime: '5 min read',
    date: 'June 10, 2026',
    likes: 24,
    featured: true,
    content: `### The Challenge of Georgia Red Clay

If you've ever worked in Middle Georgia, you know our soil. Underneath a thin layer of topsoil lies deep, dense, sticky **Georgia Red Clay**. Rich in iron oxide and highly cohesive, red clay is incredible for carrying structural loads, but it possesses one critical flaw: **it is highly impermeable and holds water like a sponge**.

When prepping a new warehouse foundation in Warner Robins or driving stakes for a lakeside residential lot in Greensboro, getting the subgrade right is the difference between a lifetime of structural stability and a wet basement nightmare.

---

### Phase 1: Moisture Management & Aeration

Before a single tire rolls onto the building pad, we have to look at the sky and the dirt. Clear, dry days are optimum, but waiting forever for weather isn't practical. 

1. **Aerating the Soil**: We use heavy discs and scarifying teeth on bulldozers to rip up the top 6 to 12 inches of moist clay, exposing it to the wind and Middle Georgia sun.
2. **Verifying Moisture Content**: Compaction cannot occur when the clay is "soupy" or "dusty." There is a perfect sweet spot of moisture—referred to as the Optimum Moisture Content (OMC).

---

### Phase 2: Utilizing Laser-Guided Precision

At TJ Darley Construction, we don't believe in "eyeballing" the grade. We deploy **John Deere 700K SmartGrade GPS Bulldozers**. 

- **How it works**: A rotating dual-slope laser transmitter on a stationary tripod communicates directly with sensors mounted on our bulldozer blades. 
- **The Result**: The blade automatically rises and falls to match the digital site plan, leaving behind a perfectly flat pad with a micro-slope of 1% directly toward drainage easements to shed rain immediately.

---

### Phase 3: Compaction and Density Verification

Once the grade is established, we bring in our heavy vibratory compactors. Clay requires **kneading action**, not just flat rollers. We utilize custom "sheepsfoot" rollers that penetrate into the clay, squeezing out air pockets and pockets of moisture.

We verify compaction via standard sand-cone testing or dynamic cone penetrometers. Any pad we deliver is certified to reach at least **95% Standard Proctor Density**, ensuring a solid slab for concrete contractors that will never settle or crack over the decades.

> **Professional Grade Tip**: Always clear away and redirect superficial runoff *before* starting excavation. Building a secure temporary diversion berm uphill keeps your work area dry, saving thousands in dry-out delays.`
  },
  {
    id: 'post-2',
    title: 'Forestry Mulching vs. Traditional Bulldozing: Preserving Topsoil on Wooded Acreage',
    slug: 'forestry-mulching-vs-traditional-bulldozing',
    summary: 'Discover why high-flow Fecon mulchers on compact track loaders are vastly superior to traditional scrape clearing when clearing lakeside and residential property lines.',
    category: 'Forestry Mulching',
    author: 'Kyle Simmons',
    readTime: '4 min read',
    date: 'May 28, 2026',
    likes: 18,
    featured: false,
    content: `### Traditional Clearing: The Aggressive Standard

For decades, clearing a lot meant calling in a mammoth bulldozer to scrape everything in its path. Bulldozers push down trees, rip up root balls, and push all material into a giant burning pile or haul-away dumpster. 

While effective for heavy commercial foundations, this process has massive drawbacks for selective residential clearing, especially around **Lake Oconee or the steep slopes of Macon**:

- It leaves behind gaping craters from pulled tree root systems.
- It scrapes away 3 to 4 inches of premium organic black topsoil.
- It exposes bare subsoil clay directly to heavy rains, triggering flash erosion and silt runoff.

---

### The Forestry Mulching Alternative

We operate high-flow **Fecon forestry mulchers** mounted on compact, low-ground-pressure track loaders. Instead of pulling trees out by the roots, our high-speed carbide drum teeth instantly chew standing brush, sweetgums, briars, and scrub pines down to tree-stump level from the top down.

---

### Why Mulching Reigns Superior for Acreage

1. **Protective Soil Barrier**: Mulching turns unwanted timber and thick underbrush into an instant, organic blanket of high-quality wood chips. This layer cushions the soil against torrential rain, prevents weeds from taking root, and naturally cools the subgrade.
2. **Selective Acreage Preservation**: Want to build your home nestled amidst gorgeous mature oaks and tall hickories? A forestry mulcher can navigate tightly between premium trees, removing only the messy understory briars and saplings without cutting or wounding the critical root networks of surrounding trees.
3. **Zero Mud, Zero Hauling**: There are no giant burning piles of wood smoke to annoy neighboring lot owners, and zero costly dump-truck aggregate transport fees. Everything stays on site, decomposing naturally into premium rich loam over the seasons.

---

### When to Choose Mulching:
If you are preparing a pasture, opening property line easements, clearing walking trails, or cleaning up a wooded lakefront lot, **Forestry Mulching is 100% the superior investment** in time, visual aesthetics, and environmental stewardship.`
  },
  {
    id: 'post-3',
    title: 'Understanding Site Erosion: GSWCC Best Practices for Middle Georgia Clearings',
    slug: 'erosion-control-gswcc-best-practices',
    summary: 'Silt fences, sediment ponds, and state compliance cards. What every Middle Georgia landowner needs to know about erosion before clearing land near local water buffers.',
    category: 'Erosion Control',
    author: 'Terry Vance',
    readTime: '6 min read',
    date: 'April 15, 2026',
    likes: 12,
    featured: false,
    content: `### The Importance of Sediment Integrity

Every single bucket of dirt moved in the state of Georgia is subject to the **Georgia Soil and Water Conservation Commission (GSWCC)** regulations. Erosion controls aren't just bureaucratic red tape—they protect municipal creek basins, prevent downstream neighbor litigation, and preserve your property's value.

With heavy local rainstorms, a single cleared acre of bare soil can lose up to **30 tons of soil** in a single year to rain runoff if left unguarded.

---

### Key Requirements of typical Georgia Land Disturbance Permits

If you plan to disturb more than one acre of land—or are clearing within 25 to 50 feet of any lake, pond, or stream—you must establish standard controls:

#### 1. Type "C" Silt Filtering Barriers
Traditional wire-backed black fabric fencing is placed along downhill contours where water exits. Silt fences allow pooling water to slowly filter out, trapping the suspended mud on your lot instead of washing into storm sewers.

#### 2. Rip-Rap Rock Check Dams
For channelized ditches or slopes, we build localized dams of 2" to 4" crushed granite. This slows down the velocity of rushing storm runoff, dissipating water energy and preventing deep gully scouring.

#### 3. Temporary Seeding & Straw Cover
If a cleared site is expected to remain idle for more than 14 days, regulations mandate applying light grass seed and wheat straw coverage to physically pin down loose soil particles.

---

### Our GSWCC "Blue Card" Crew Guarantee

At TJ Darley Construction, our foreman and operators carry active GSWCC certifications. We:
- Read local watershed topographic maps before grading.
- Install heavy-duty turbidity curtains when dredging or clearing lakeside property lines.
- Coordinate compliance inspections with county engineers, ensuring your project passes final authorization without costly state administrative fines.`
  },
  {
    id: 'post-4',
    title: 'Heavy Equip Fleet Focus: Upgrading to LGP (Low Ground Pressure) Tracks',
    slug: 'fleet-upgrades-low-ground-pressure-tracks',
    summary: 'How our heavy machinery investment allows us to clearing wet timber and clay valleys in seasons where other excavation contractors get stuck in the mud.',
    category: 'Fleet & Crew News',
    author: 'TJ Darley',
    readTime: '3 min read',
    date: 'March 30, 2026',
    likes: 31,
    featured: false,
    content: `### Why Machine Footprint Matters

When people look at heavy crawlers, they see massive raw iron tons. A standard excavator can weigh over 38,000 lbs. If configured with narrow metal tracks, all those tons focus into a tiny contact point with the dirt. 

On wet Georgia red clay or sandy marsh edges near Lake Oconee, a standard machine sinks instantly, spinning track rollers and turning a tight project schedule into a multi-thousand-dollar extraction headache.

---

### Enter LGP Track Shoes

To keep projects running year-round, we’ve outfitted our primary excavation crawlers with custom **LGP (Low Ground Pressure) tracks**.

- **Standard Tracks**: Typically 20 inches wide, exerting roughly 7.5 to 9.0 pounds per square inch (PSI) on the subsoil.
- **LGP Tracks**: Feature massive, extra-wide 30 to 36-inch triangular steel cleats, dissipating weight across a wider footprint to drop ground pressure to only **4.2 PSI**.

> **The Comparison**: For perspective, a standard adult stepping in hiking boots exerts roughly **8.0 PSI** on the ground. Our 17-ton Cat excavator equipped with LGP tracks actually exerts *half the footprint pressure* of a human foot!

---

### Real-World Project Benefits

1. **Faster Progress**: We can start digging immediately after rain showers while competitor contractors wait days for saturated subsoil clay to dry.
2. **Minimal Turf Rutting**: On residential estates, LGP tracks glide over established turf without creating deep compacted ruts that require weeks of topsoil repairs.
3. **Damp Access**: Allows forestry mulchers to easily access marsh drainage ditches, creek beds, and thick, wet swamps to complete retention pond repairs safely.`
  }
];

export default function Blog({ onBackToHome }: BlogProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likedPosts, setLikedPosts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tjd_liked_posts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync state with localStorage to allow management via staff dashboard
  useEffect(() => {
    const loadPosts = () => {
      const stored = localStorage.getItem('tjd_blog_posts');
      if (stored) {
        setPosts(JSON.parse(stored));
      } else {
        localStorage.setItem('tjd_blog_posts', JSON.stringify(DEFAULT_BLOG_POSTS));
        setPosts(DEFAULT_BLOG_POSTS);
      }
    };

    loadPosts();
    
    // Listen for custom trigger to reload posts if they are edited in Operations Hub
    window.addEventListener('tjd_blog_posts_changed', loadPosts);
    return () => {
      window.removeEventListener('tjd_blog_posts_changed', loadPosts);
    };
  }, []);

  // Check URL slug on mount to support direct linking
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#blog/')) {
      const slug = hash.replace('#blog/', '');
      const matched = posts.find(p => p.slug === slug);
      if (matched) {
        setSelectedPost(matched);
      }
    }
  }, [posts]);

  // Handle Likes
  const handleLike = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updatedLikes = [...likedPosts];
    let increment = 1;

    if (likedPosts.includes(postId)) {
      updatedLikes = updatedLikes.filter(id => id !== postId);
      increment = -1;
    } else {
      updatedLikes.push(postId);
    }

    setLikedPosts(updatedLikes);
    localStorage.setItem('tjd_liked_posts', JSON.stringify(updatedLikes));

    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        return { ...p, likes: p.likes + increment };
      }
      return p;
    });

    setPosts(updatedPosts);
    localStorage.setItem('tjd_blog_posts', JSON.stringify(updatedPosts));
    // Trigger update in other listening components (Operations Hub)
    window.dispatchEvent(new Event('tjd_blog_posts_changed'));
  };

  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    window.location.hash = `#blog/${post.slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClosePost = () => {
    setSelectedPost(null);
    window.location.hash = '#blog';
  };

  // Filter Logic
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Grading & Site Prep', 'Forestry Mulching', 'Erosion Control', 'Fleet & Crew News'];

  // Identify featured post dynamically
  const featuredPost = filteredPosts.find(p => p.featured) || filteredPosts[0];

  return (
    <div className="bg-slate-900 border-t-4 border-brand-orange text-white min-h-screen font-sans pb-24 text-left">
      
      {/* 1. Header Hero Banner */}
      <div className="relative py-16 md:py-20 bg-slate-950 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        <div className="absolute bottom-5 right-10 w-72 h-72 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-6">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors duration-150 p-2 bg-slate-900 rounded-lg border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4 text-brand-orange" />
            <span>Return to Main Site</span>
          </button>

          <div className="space-y-4 max-w-4xl">
            <span className="font-display font-black text-xs tracking-widest text-brand-orange uppercase bg-amber-950/40 border border-brand-orange/30 px-3.5 py-1.5 rounded-full inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              NATIVE PROJECT UPDATES & DRILLING SECRETS
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-none">
              The Site-Prep <br className="hidden sm:inline" />
              Learning <span className="text-brand-orange">Knowledge Base</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-medium">
              We replace cumbersome external files with our beautiful, direct site-prep and forestry logs. Follow along for professional construction techniques used in Lake Oconee, Greensboro, and Middle Georgia.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Layout Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {selectedPost ? (
          
          /* DETAILED ARTICLE VIEW */
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
            
            {/* Nav Row */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <button
                onClick={handleClosePost}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-brand-orange" />
                <span>Back to Updates Grid</span>
              </button>
              
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span>{selectedPost.date}</span>
                <span>&bull;</span>
                <span className="text-emerald-450 font-bold">{selectedPost.category}</span>
              </div>
            </div>

            {/* Article Head */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-brand-orange transition-colors text-[10px] font-mono font-black text-brand-orange uppercase rounded">
                  {selectedPost.category}
                </span>
                <span className="text-xs text-slate-400 font-mono inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {selectedPost.readTime}
                </span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-white leading-tight tracking-tight">
                {selectedPost.title}
              </h1>
              
              <div className="flex justify-between items-center p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-full font-black text-xs text-brand-orange">
                    {selectedPost.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Written by {selectedPost.author}</p>
                    <p className="text-[10px] text-slate-400 font-mono">TJ Darley Operator Crew</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleLike(selectedPost.id, e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                      likedPosts.includes(selectedPost.id)
                        ? 'bg-amber-955 border-brand-orange text-brand-orange font-bold font-sans'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{selectedPost.likes}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content body with beautiful styled headers and subheaders */}
            <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-6 font-sans">
              {selectedPost.content.split('\n').map((paragraph, index) => {
                const text = paragraph.trim();
                
                if (text.startsWith('###')) {
                  return (
                    <h3 key={index} className="font-display font-black text-white text-lg sm:text-xl pt-6 pb-2 tracking-tight flex items-center gap-2 border-b border-slate-900">
                      <span className="w-1.5 h-6 bg-brand-orange rounded-full inline-block" />
                      {text.replace('###', '')}
                    </h3>
                  );
                }

                if (text.startsWith('####')) {
                  return (
                    <h4 key={index} className="font-display font-black text-slate-100 text-base pt-4 pb-1">
                      {text.replace('####', '')}
                    </h4>
                  );
                }

                if (text.startsWith('>')) {
                  return (
                    <div key={index} className="bg-slate-950/60 border-l-4 border-brand-orange p-4 rounded-r-xl my-4 italic text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {text.replace('>', '')}
                    </div>
                  );
                }

                if (text.startsWith('-') || text.startsWith('*')) {
                  return (
                    <li key={index} className="ml-5 list-disc text-slate-350 text-xs sm:text-sm py-1 font-medium">
                      {text.replace(/^[-*]\s*/, '')}
                    </li>
                  );
                }

                if (text.startsWith('1.') || text.startsWith('2.') || text.startsWith('3.')) {
                  return (
                    <div key={index} className="pl-2 py-1.5 text-xs sm:text-sm text-slate-300 flex gap-2">
                      <span className="font-black font-mono text-brand-orange shrink-0 bg-amber-950/40 border border-brand-orange/30 px-1.5 py-0.5 rounded leading-none h-fit mt-0.5">{text.split('.')[0]}</span>
                      <p>{text.replace(/^\d+\.\s*/, '')}</p>
                    </div>
                  );
                }

                if (text === '---') {
                  return <hr key={index} className="border-slate-800/80 my-8" />;
                }

                if (!text) return null;

                return (
                  <p key={index} className="text-slate-300 leading-relaxed text-xs sm:text-sm md:text-[14.5px] whitespace-pre-line" dangerouslySetInnerHTML={{
                    __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
                  }} />
                );
              })}
            </div>

            {/* Newsletter Callout or Next steps */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-xl mt-12">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-brand-orange" />
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">Trust Your Prep with Experts</h3>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed max-w-xl font-sans">
                  Whether you need GSWCC sediment certification, laser-precise land compaction, or high-flow forestry mulching near Lake Oconee, TJ Darley has the fleet and operators to execute on time.
                </p>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={onBackToHome}
                    className="py-2.5 px-4 bg-brand-orange hover:bg-brand-darkorange text-white text-[11px] font-black uppercase rounded-lg tracking-wider transition-colors"
                  >
                    Get a Ballpark Estimate
                  </button>
                  <button
                    onClick={handleClosePost}
                    className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-[11px] font-bold uppercase rounded-lg tracking-wider transition-colors"
                  >
                    Browse Other Articles
                  </button>
                </div>
              </div>
            </div>

          </div>

        ) : (

          /* BLOG POSTS GRID & SEARCH LIST */
          <div className="space-y-12">
            
            {/* Search and Filters Header */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
              
              {/* Search input */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search site-prep posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none focus:border-brand-orange transition-colors"
                />
              </div>

              {/* Categorical swappers */}
              <div className="flex flex-wrap gap-1.5 justify-center w-full md:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-brand-orange text-white font-bold shadow-md shadow-amber-900/30'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat === 'All' ? 'View All' : cat}
                  </button>
                ))}
              </div>

            </div>

            {/* Featured Post (Highlighted on top if search is empty) */}
            {!searchTerm && selectedCategory === 'All' && featuredPost && (
              <div 
                onClick={() => handleSelectPost(featuredPost)}
                className="bg-slate-950 border border-slate-800/80 rounded-3xl overflow-hidden cursor-pointer hover:border-brand-orange transition-all duration-300 shadow-2xl group grid grid-cols-1 md:grid-cols-12"
              >
                <div className="p-6 sm:p-8 md:p-10 md:col-span-12 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-amber-955 text-brand-orange border border-brand-orange/40 text-[10px] uppercase tracking-wider font-mono font-black rounded-lg inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-brand-orange animate-spin" />
                        FEATURED DEEP DIVE
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{featuredPost.date} &bull; {featuredPost.readTime}</span>
                    </div>

                    <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white group-hover:text-brand-orange transition-colors leading-tight tracking-tight">
                      {featuredPost.title}
                    </h2>
                    
                    <p className="text-slate-350 text-sm leading-relaxed font-sans max-w-3xl">
                      {featuredPost.summary}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-slate-900 flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="py-1 px-1.5 bg-slate-900 border border-slate-800 rounded text-brand-orange uppercase font-bold font-mono">
                        {featuredPost.author.slice(0, 2).toUpperCase()}
                      </div>
                      <span>By <strong className="text-white">{featuredPost.author}</strong> &bull; Site Tech Lead</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handleLike(featuredPost.id, e)}
                        className={`btn-like flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${
                          likedPosts.includes(featuredPost.id)
                            ? 'bg-amber-955 text-brand-orange border border-brand-orange'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{featuredPost.likes}</span>
                      </button>
                      
                      <span className="text-brand-orange font-bold text-xs tracking-wider uppercase group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                        <span>Read Full Post</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Grid List */}
            {filteredPosts.length === 0 ? (
              <div className="p-16 text-center text-slate-400 bg-slate-950 border border-slate-850 rounded-2xl">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-pulse" />
                <h3 className="font-display font-bold text-base text-white">No updates matched your criteria</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Try clearing your search keyword or switching between high-visibility categories.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                  className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold uppercase rounded border border-slate-800"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="blog-articles-container">
                {filteredPosts
                  .filter(p => !(!searchTerm && selectedCategory === 'All' && p.featured))
                  .map((post) => {
                    return (
                      <div 
                        key={post.id}
                        onClick={() => handleSelectPost(post)}
                        className="bg-slate-950/80 border border-slate-800/80 rounded-2xl overflow-hidden cursor-pointer hover:border-brand-orange hover:bg-slate-950 transition-all duration-200 flex flex-col justify-between shadow-lg group p-6"
                      >
                        <div className="space-y-3.5">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="px-2 py-0.5 bg-slate-900 text-brand-orange border border-slate-800 group-hover:border-brand-orange/40 transition-colors rounded text-[10px] font-bold uppercase">
                              {post.category}
                            </span>
                            <span className="text-slate-500">{post.date}</span>
                          </div>

                          <h3 className="font-display font-bold text-lg text-white group-hover:text-brand-orange transition-colors tracking-tight leading-snug">
                            {post.title}
                          </h3>

                          <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed font-sans line-clamp-3">
                            {post.summary}
                          </p>
                        </div>

                        <div className="pt-5 mt-5 border-t border-slate-900 flex justify-between items-center text-xs">
                          <span className="font-mono text-slate-500 text-[11px] inline-flex items-center gap-1 hover:text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                            {post.readTime}
                          </span>

                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => handleLike(post.id, e)}
                              className={`flex items-center gap-1 py-1 px-2.5 rounded transition-all ${
                                likedPosts.includes(post.id)
                                  ? 'bg-amber-955 text-brand-orange font-bold font-sans text-[11px]'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{post.likes}</span>
                            </button>

                            <span className="text-xs font-bold text-slate-400 group-hover:text-brand-orange transition-colors flex items-center gap-0.5 uppercase tracking-wider text-[10px] font-display">
                              <span>Read</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Native updates footer badge */}
            <div className="bg-slate-950/40 p-6 rounded-2xl border border-dashed border-slate-850 text-center text-xs text-slate-400 space-y-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-450 font-black block">Operational Ledger Verification</span>
              <p className="max-w-xl mx-auto">
                These logs are maintained directly inside our Middle Georgia construction hub database. Authorized operators can submit site updates, safety logs, and field metrics via the private console panel.
              </p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
