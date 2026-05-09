"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPlay, FaStar, FaMapMarkerAlt, FaEnvelope, FaFacebook } from 'react-icons/fa';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ProjectModal, { ProjectData } from '@/components/ProjectModal';
import Banner from '@/components/Banner';

interface CategoryData {
    id?: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
    type: 'Video' | 'Graphic' | 'All';
    order: number;
    visible: boolean;
}

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [category, setCategory] = useState<CategoryData | null>(null);
    const [works, setWorks] = useState<ProjectData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [selectedImage, setSelectedImage] = useState<ProjectData | null>(null);
    const [visibleCount, setVisibleCount] = useState(8);
    const [isBioExpanded, setIsBioExpanded] = useState(false);

    useEffect(() => { loadCategoryAndWorks(); }, [slug]);

    const loadCategoryAndWorks = async () => {
        setLoading(true);
        try {
            const catSnap = await getDocs(query(collection(db, "categories")));
            const cats = catSnap.docs.map(d => ({ id: d.id, ...d.data() })) as CategoryData[];
            const cat = cats.find(c => c.slug === slug);
            setCategory(cat || null);

            const worksSnap = await getDocs(query(collection(db, "works"), where("group", "==", slug)));
            const loaded = worksSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ProjectData[];
            loaded.sort((a, b) => {
                const oA = a.order !== undefined ? a.order : 999999;
                const oB = b.order !== undefined ? b.order : 999999;
                if (oA !== oB) return oA - oB;
                return (b.createdAt || 0) - (a.createdAt || 0);
            });
            setWorks(loaded);
        } catch (error) { console.error("Error:", error); }
        finally { setLoading(false); }
    };

    const getYoutubeId = (url?: string) => {
        if (!url) return null;
        const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
        return (m && m[2].length === 11) ? m[2] : null;
    };

    const getEmbedUrl = (url?: string) => {
        if (!url) return null;
        const ytId = getYoutubeId(url);
        if (ytId) return `https://www.youtube.com/embed/${ytId}`;
        if (url.includes('facebook.com')) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`;
        return null;
    };

    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedImage(null); };
        if (selectedImage) { document.addEventListener('keydown', h); document.body.style.overflow = 'hidden'; }
        return () => { document.removeEventListener('keydown', h); document.body.style.overflow = 'unset'; };
    }, [selectedImage]);

    const isGraphicCategory = category?.type === 'Graphic';
    const displayedWorks = works.slice(0, visibleCount);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-primary)'}}>
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24" style={{color: '#06b6d4'}}>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-primary)'}}>
                <div className="text-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <h1 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>ไม่พบหมวดหมู่</h1>
                    <p className="text-sm" style={{color: 'var(--text-secondary)'}}>ไม่พบหมวดหมู่ &quot;{slug}&quot;</p>
                </div>
            </div>
        );
    }

    // === GRAPHIC LAYOUT ===
    if (isGraphicCategory) {
        return (
            <div className="min-h-screen pt-[100px] pb-20 px-5" style={{backgroundColor: 'var(--bg-primary)'}}>
                <div className="max-w-[1400px] mx-auto">
                    <motion.section className="text-center mb-14" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="text-4xl mb-2 block">{category.icon}</span>
                        <span className="text-sm tracking-[4px] uppercase font-semibold flex items-center justify-center gap-3" style={{color: category.color}}>
                            <span className="w-8 h-px" style={{background: category.color}} />
                            {category.name}
                            <span className="w-8 h-px" style={{background: category.color}} />
                        </span>
                        <p className="text-base max-w-[500px] mx-auto leading-relaxed mt-3" style={{color: 'var(--text-secondary)'}}>{works.length} ผลงาน</p>
                    </motion.section>

                    {works.length === 0 ? (
                        <div className="text-center p-12" style={{color: 'var(--text-secondary)'}}>ยังไม่มีผลงานในหมวดหมู่นี้</div>
                    ) : (
                        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                            {works.map((work) => (
                                <motion.div key={work.id} className={`relative break-inside-avoid bento-card !p-0 overflow-hidden group cursor-pointer ${work.featured ? 'ring-1 ring-cyan-500/30' : ''}`}
                                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} onClick={() => setSelectedImage(work)}>
                                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: (work.size?.aspectRatio || '4/3').replace('/', '/'), background: 'rgba(0,0,0,0.2)' }}>
                                        <img src={work.image} alt={work.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                                            <div className="inline-block text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm self-start" style={{background: `${category.color}cc`}}>{work.category}</div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-space text-base font-bold mb-1.5 line-clamp-1" style={{color: 'var(--text-primary)'}}>{work.title}</h3>
                                        <p className="text-xs line-clamp-2 leading-relaxed mb-3" style={{color: 'var(--text-secondary)'}}>{work.description}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {work.tech?.map((t, i) => {
                                                const n = typeof t === 'string' ? t : t.name;
                                                const c = typeof t === 'object' ? t.color : undefined;
                                                return <span key={i} className="text-[9px] font-semibold px-2 py-0.5 rounded border" style={c ? { color: c, backgroundColor: `${c}15`, borderColor: `${c}30` } : { color: 'var(--text-tertiary)', backgroundColor: 'rgba(6,182,212,0.06)', borderColor: 'var(--glass-border)' }}>{n}</span>;
                                            })}
                                        </div>
                                    </div>
                                    {work.featured && <div className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10 flex items-center gap-1" style={{background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#000'}}>✨ ผลงานเด่น</div>}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {selectedImage && (
                        <motion.div className="fixed inset-0 z-[2000] flex items-center justify-center p-5 cursor-zoom-out"
                            style={{background: 'rgba(2, 10, 24, 0.92)', backdropFilter: 'blur(12px)'}}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)}>
                            <motion.div className="relative max-w-[1200px] w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] cursor-default"
                                style={{backgroundColor: 'var(--bg-tertiary)'}} initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()}>
                                <button className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer text-white border-none"
                                    style={{background: 'rgba(0,0,0,0.4)'}} onClick={() => setSelectedImage(null)}><FaTimes size={18} /></button>
                                <div className="w-full md:w-2/3 flex items-center justify-center overflow-hidden" style={{background: '#000'}}>
                                    {selectedImage.image && <img src={selectedImage.image} alt={selectedImage.title || ''} className="w-full h-full object-contain max-h-[50vh] md:max-h-[90vh]" />}
                                </div>
                                <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col overflow-y-auto max-h-[40vh] md:max-h-[90vh]" style={{background: 'var(--bg-secondary)', borderLeft: '1px solid var(--glass-border)'}}>
                                    <h3 className="font-space text-xl md:text-2xl font-bold mb-3" style={{color: 'var(--text-primary)'}}>{selectedImage.title}</h3>
                                    <div className="w-8 h-0.5 rounded-full mb-5" style={{background: category.color}} />
                                    <p className="leading-relaxed mb-6 text-sm" style={{color: 'var(--text-secondary)'}}>{selectedImage.description}</p>
                                    <div className="mt-auto">
                                        <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{color: 'var(--text-tertiary)'}}>Technologies</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedImage.tech?.map((t, i) => {
                                                const n = typeof t === 'string' ? t : t.name;
                                                const c = typeof t === 'object' ? t.color : undefined;
                                                return <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={c ? { color: c, backgroundColor: `${c}15`, borderColor: `${c}30` } : { color: 'var(--text-secondary)', backgroundColor: 'rgba(6,182,212,0.06)', borderColor: 'var(--glass-border)' }}>{n}</span>;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // === VIDEO / ALL LAYOUT ===
    return (
        <div style={{backgroundColor: 'var(--bg-primary)'}}>
            <Banner />
            <section className="py-[80px] md:py-[100px] px-4 md:px-5 relative min-h-screen">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 z-0" style={{background: 'radial-gradient(circle at 100% 0%, rgba(6, 182, 212, 0.06) 0%, transparent 60%)'}}></div>
                </div>
                <div className="max-w-[1280px] mx-auto relative z-1">
                    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 md:gap-12 items-start">
                        {/* Left Sidebar: Profile Card */}
                        <motion.div className="bento-card !p-7 relative lg:sticky lg:top-24" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                            <div className="relative mb-6">
                                <div className="relative w-28 h-28 mx-auto lg:mx-0">
                                    <div className="w-full h-full rounded-full overflow-hidden shadow-lg p-[2px]" style={{background: 'linear-gradient(135deg, #06b6d4, #14b8a6, #3b82f6)'}}>
                                        <div className="w-full h-full rounded-full overflow-hidden" style={{background: 'var(--bg-tertiary)'}}>
                                            <img src="/Profile.jpg" alt="Profile" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#10b981', border: '3px solid var(--bg-tertiary)' }}></div>
                                </div>
                            </div>
                            <h2 className="text-xl font-bold mb-1 text-center lg:text-left" style={{color: 'var(--text-primary)'}}>BossFam</h2>
                            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4 text-xs font-medium" style={{color: 'var(--text-tertiary)'}}>
                                <FaMapMarkerAlt /><span>Bangkok Thailand</span>
                            </div>
                            <p className="text-sm mb-5 leading-relaxed text-center lg:text-left" style={{color: 'var(--text-secondary)'}}>
                                he/him<br /><br />
                                Base in Bangkok TH Editor, Beginner Colorist Service ...
                                {!isBioExpanded && <span className="cursor-pointer hover:underline ml-1 font-medium" style={{color: '#06b6d4'}} onClick={() => setIsBioExpanded(true)}>Read more</span>}
                                {isBioExpanded && <span><br />Short Film , Music Video , Content Online , Youtube , Tiktok/Reel<br /><span className="cursor-pointer hover:underline mt-2 inline-block font-medium" style={{color: '#06b6d4'}} onClick={() => setIsBioExpanded(false)}>Show less</span></span>}
                            </p>
                            <div className="flex flex-col gap-3 mb-6 items-center lg:items-start">
                                <a href="mailto:nathasit.mac@gmail.com" className="flex items-center gap-3 text-sm font-medium transition-colors duration-200" style={{color: 'var(--text-primary)'}} onMouseEnter={(e) => (e.currentTarget.style.color = '#06b6d4')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}>
                                    <FaEnvelope className="text-base" /><span>nathasit.mac@gmail.com</span>
                                </a>
                                <a href="https://www.facebook.com/nathasit.opachalermpan.2025/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium transition-colors duration-200" style={{color: 'var(--text-primary)'}} onMouseEnter={(e) => (e.currentTarget.style.color = '#06b6d4')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}>
                                    <FaFacebook className="text-base" /><span>Nathasit Opachalermpan</span>
                                </a>
                            </div>
                        </motion.div>

                        {/* Right Content */}
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>{works.length} {category.type === 'Video' ? 'videos' : 'ผลงาน'}</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {displayedWorks.map((project, index) => {
                            const embedUrl = getEmbedUrl(project.videoUrl);
                            const hasVideo = embedUrl !== null;
                            return (
                                <motion.div key={project.id || index} className={`bento-card !p-0 overflow-hidden group flex flex-col h-full relative ${project.featured ? 'ring-1 ring-yellow-500/30' : ''}`}
                                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }}>
                                    {project.featured && (
                                        <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1"
                                            style={{background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#000'}}><FaStar className="text-[9px]" /> ผลงานเด่น</div>
                                    )}
                                    <div className="relative w-full aspect-video bg-black overflow-hidden cursor-pointer" onClick={() => !project.videoUrl?.includes('facebook.com') && setSelectedProject(project)}>
                                        {hasVideo ? (
                                            project.videoUrl?.includes('facebook.com') ? (
                                                <iframe src={embedUrl || ''} title={project.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
                                            ) : (
                                                <div className="w-full h-full relative group">
                                                    <img src={project.image || (getYoutubeId(project.videoUrl) ? `https://img.youtube.com/vi/${getYoutubeId(project.videoUrl)}/maxresdefault.jpg` : '')}
                                                        alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        onError={(e) => { const t = e.target as HTMLImageElement; const y = getYoutubeId(project.videoUrl); if (y && t.src.includes('maxresdefault')) t.src = `https://img.youtube.com/vi/${y}/hqdefault.jpg`; }} />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                                                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                                        <div className="w-14 h-14 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg"
                                                            style={{background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)'}}>
                                                            <FaPlay className="text-white text-lg ml-0.5" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <img src={project.image || 'https://via.placeholder.com/800x450'} alt={project.title} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow cursor-pointer" onClick={() => setSelectedProject(project)}>
                                        <h3 className="font-bold text-base mb-2 line-clamp-1" style={{color: 'var(--text-primary)'}}>{project.title}</h3>
                                        <div className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{color: 'var(--text-secondary)'}}>{project.description}</div>
                                        <div className="mt-auto flex flex-wrap gap-1.5">
                                            {project.tech?.map((t, i) => {
                                                const n = typeof t === 'string' ? t : t.name;
                                                const c = typeof t === 'object' ? t.color : undefined;
                                                return <span key={i} className="text-[11px] font-medium px-2.5 py-1 rounded-md border" style={c ? { backgroundColor: `${c}15`, color: c, borderColor: `${c}30` } : { backgroundColor: 'rgba(6,182,212,0.08)', color: 'var(--text-secondary)', borderColor: 'rgba(6,182,212,0.12)' }}>{n}</span>;
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                            {visibleCount < works.length && (
                                <div className="mt-14 flex justify-center">
                                    <button onClick={() => setVisibleCount(p => p + 4)} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-1 cursor-pointer border-none"
                                        style={{color: 'var(--text-primary)', border: '1px solid var(--glass-border)', background: 'transparent'}}>Load more</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <AnimatePresence>
                {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
            </AnimatePresence>
        </div>
    );
}
