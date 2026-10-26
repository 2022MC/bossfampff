"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { db } from '@/lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';

interface CategoryData {
    id?: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
    type: 'Video' | 'Graphic' | 'All';
    order: number;
    visible: boolean;
    parentId?: string;
}

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProjectsOpen, setIsProjectsOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [hoveredParent, setHoveredParent] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLLIElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Load categories from Firestore
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const q = query(collection(db, "categories"));
                const snap = await getDocs(q);
                const cats = snap.docs.map(d => ({ id: d.id, ...d.data() })) as CategoryData[];
                cats.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
                setCategories(cats.filter(c => c.visible));
            } catch (error) {
                console.error("Error loading categories:", error);
            }
        };
        loadCategories();
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        setIsProjectsOpen(false);
    };

    const toggleProjects = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsProjectsOpen(!isProjectsOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProjectsOpen(false);
            }
        };
        if (isProjectsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProjectsOpen]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const navItems = [
        { name: 'Home', href: '#home' },
        { name: 'About', href: '#about' },
        { name: 'Skills', href: '#skills' },
        { name: 'Contact', href: '#contact' },
    ];

    // Build hierarchical projects menu from categories
    const parentCats = categories.filter(c => !c.parentId);
    const getChildCats = (pid: string) => categories.filter(c => c.parentId === pid);

    const handleLinkClick = (e: React.MouseEvent, href: string) => {
        closeMenu();
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.replace('#', '');
            if (pathname === '/') {
                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState(null, '', href);
                } else {
                    if (targetId === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else {
                router.push(`/${href}`);
            }
        }
    };

    const isScrolled = scrollY > 50;

    return (
        <>
        <nav className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-500 ease-out ${isScrolled ? 'py-2' : 'py-4'}`}>
            <div
                className={`
                    flex justify-between items-center px-6 h-[64px] rounded-2xl transition-all duration-500 ease-out
                    ${isScrolled
                        ? 'mx-4 w-[calc(100%-32px)] lg:w-full lg:max-w-[1200px] lg:mx-auto backdrop-blur-2xl border shadow-lg'
                        : 'max-w-[1200px] mx-auto bg-transparent border border-transparent'}
                `}
                style={isScrolled ? {
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    borderColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.9) inset'
                } : {}}
            >
                {/* Logo */}
                <div className="flex items-center">
                    <Link href="/" className="font-space text-xl font-bold flex items-center gap-2.5 transition-all duration-300 group" style={{color: 'var(--text-primary)'}}>
                        <span className="relative w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shadow-sm"
                              style={{background: 'linear-gradient(135deg, #0284c7, #0d9488)'}}>
                            <span className="text-white text-sm font-black">B</span>
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </span>
                        <span className="hidden sm:inline font-bold tracking-tight">Portfolio</span>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <ul className="hidden md:flex items-center gap-1 list-none">
                    {navItems.map((item, index) => (
                        <li key={index}>
                            <a
                                href={item.href}
                                onClick={(e) => handleLinkClick(e, item.href)}
                                className="relative font-medium text-sm px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer hover:bg-slate-900/5"
                                style={{color: 'var(--text-secondary)'}}
                                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                            >
                                {item.name}
                            </a>
                        </li>
                    ))}

                    {parentCats.length > 0 && (
                        <li className="relative" ref={dropdownRef}
                            onMouseLeave={() => setHoveredParent(null)}>
                            <button
                                onClick={toggleProjects}
                                className="flex items-center gap-1.5 cursor-pointer font-medium text-sm px-4 py-2 rounded-xl transition-all duration-300 bg-transparent border-none outline-none hover:bg-slate-900/5"
                                style={{color: 'var(--text-secondary)'}}
                                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                            >
                                Projects
                                <FaChevronDown className={`text-[9px] transition-transform duration-300 ${isProjectsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <ul className={`
                                absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 
                                p-1.5 rounded-2xl 
                                min-w-[200px] list-none
                                transition-all duration-300 ease-in-out origin-top
                                backdrop-blur-2xl
                                ${isProjectsOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}
                            `}
                            style={{
                                background: 'rgba(255, 255, 255, 0.92)',
                                backdropFilter: 'blur(24px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                                border: '1px solid rgba(255, 255, 255, 0.9)',
                                boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.9) inset'
                            }}>
                                {parentCats.map(parent => {
                                    const children = getChildCats(parent.id!);
                                    const hasChildren = children.length > 0;
                                    return (
                                        <li key={parent.id} className="relative"
                                            onMouseEnter={() => hasChildren && setHoveredParent(parent.id!)}
                                        >
                                            {hasChildren ? (
                                                <div
                                                    className="flex items-center justify-between w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-default"
                                                    style={{ color: hoveredParent === parent.id ? parent.color || '#0284c7' : 'var(--text-secondary)', background: hoveredParent === parent.id ? 'rgba(2,132,199,0.08)' : 'transparent' }}
                                                >
                                                    <span className="font-medium">{parent.icon} {parent.name}</span>
                                                    <FaChevronDown className="text-[8px] -rotate-90" />
                                                </div>
                                            ) : (
                                                <Link href={`/projects/${parent.slug}`} onClick={closeMenu}
                                                    className="block w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 font-medium"
                                                    style={{color: 'var(--text-secondary)'}}
                                                    onMouseEnter={(e) => { e.currentTarget.style.color = parent.color || '#0284c7'; e.currentTarget.style.background = 'rgba(2,132,199,0.08)'; setHoveredParent(null); }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}>
                                                    {parent.icon} {parent.name}
                                                </Link>
                                            )}

                                            {/* Flyout submenu */}
                                            {hasChildren && (
                                                <ul className={`
                                                    absolute left-full top-0 ml-1.5
                                                    p-1.5 rounded-2xl 
                                                    min-w-[200px] list-none
                                                    transition-all duration-200 ease-in-out origin-left
                                                    backdrop-blur-2xl
                                                    ${hoveredParent === parent.id ? 'opacity-100 visible translate-x-0' : 'opacity-0 invisible -translate-x-2 pointer-events-none'}
                                                `}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.92)',
                                                    backdropFilter: 'blur(24px) saturate(180%)',
                                                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                                                    border: '1px solid rgba(255, 255, 255, 0.9)',
                                                    boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.9) inset'
                                                }}>
                                                    {children.map(child => (
                                                        <li key={child.id}>
                                                            <Link href={`/projects/${child.slug}`} onClick={closeMenu}
                                                                className="block w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 font-medium"
                                                                style={{color: 'var(--text-secondary)'}}
                                                                onMouseEnter={(e) => { e.currentTarget.style.color = child.color || parent.color || '#0284c7'; e.currentTarget.style.background = 'rgba(2,132,199,0.08)'; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}>
                                                                {child.icon} {child.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>
                    )}
                </ul>

                {/* Mobile: Menu Toggle */}
                <div className="md:hidden flex items-center" style={{ zIndex: 10001 }}>
                    <button
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer border-none"
                        onClick={toggleMenu}
                        style={{
                            color: 'var(--text-primary)',
                            background: isMenuOpen ? 'rgba(2, 132, 199, 0.1)' : 'rgba(255, 255, 255, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(12px)',
                        }}
                    >
                        {isMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
                    </button>
                </div>
            </div>
        </nav>

        {/* Mobile Menu Overlay - rendered via Portal directly into document.body */}
        {isMenuOpen && typeof document !== 'undefined' && createPortal(
            <div
                id="mobile-menu-overlay"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(248, 250, 252, 0.96)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    zIndex: 99999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '32px',
                }}
            >
                {/* Close button */}
                <button
                    onClick={closeMenu}
                    style={{
                        position: 'absolute',
                        top: '24px',
                        right: '24px',
                        width: '44px',
                        height: '44px',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '1px solid rgba(255, 255, 255, 0.9)',
                        color: 'var(--text-primary)',
                        background: 'rgba(255, 255, 255, 0.85)',
                        boxShadow: '0 4px 15px rgba(15, 23, 42, 0.06)',
                        transition: 'all 0.3s',
                    }}
                >
                    <FaTimes style={{ fontSize: '18px' }} />
                </button>

                {navItems.map((item, index) => (
                    <a
                        key={index}
                        href={item.href}
                        onClick={(e) => handleLinkClick(e, item.href)}
                        style={{
                            color: 'var(--text-primary)',
                            fontSize: '24px',
                            fontWeight: 700,
                            padding: '12px 32px',
                            borderRadius: '16px',
                            transition: 'all 0.3s',
                            textDecoration: 'none',
                        }}
                    >
                        {item.name}
                    </a>
                ))}

                {parentCats.length > 0 && (
                    <>
                        <div style={{ width: '64px', height: '1px', margin: '8px 0', background: 'var(--glass-border)' }}></div>

                        {parentCats.map(parent => {
                            const children = getChildCats(parent.id!);
                            return (
                                <div key={parent.id}>
                                    {children.length > 0 ? (
                                        <>
                                            <div style={{
                                                color: parent.color || 'var(--text-tertiary)',
                                                fontSize: '13px',
                                                fontWeight: 700,
                                                padding: '12px 24px 4px',
                                                textTransform: 'uppercase' as const,
                                                letterSpacing: '2px',
                                            }}>
                                                {parent.icon} {parent.name}
                                            </div>
                                            {children.map(child => (
                                                <Link key={child.id} href={`/projects/${child.slug}`} onClick={closeMenu} style={{
                                                    color: 'var(--text-tertiary)',
                                                    fontSize: '18px',
                                                    fontWeight: 500,
                                                    padding: '8px 32px',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.3s',
                                                    textDecoration: 'none',
                                                    display: 'block',
                                                }}>
                                                    {child.icon} {child.name}
                                                </Link>
                                            ))}
                                        </>
                                    ) : (
                                        <Link href={`/projects/${parent.slug}`} onClick={closeMenu} style={{
                                            color: 'var(--text-tertiary)',
                                            fontSize: '18px',
                                            fontWeight: 500,
                                            padding: '8px 24px',
                                            borderRadius: '12px',
                                            transition: 'all 0.3s',
                                            textDecoration: 'none',
                                            display: 'block',
                                        }}>
                                            {parent.icon} {parent.name}
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}
            </div>,
            document.body
        )}
        </>
    );
};

export default Navbar;
