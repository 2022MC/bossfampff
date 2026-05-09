"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, Reorder, AnimatePresence, useDragControls } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUpload, FaSignOutAlt, FaBars, FaLayerGroup, FaEye, FaEyeSlash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { SketchPicker } from 'react-color';
import AdminGuard from '@/components/AdminGuard';
import { ProjectData } from '@/components/ProjectModal';

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

export default function AdminPage() {
    return (
        <AdminGuard>
            <AdminContent />
        </AdminGuard>
    );
}

function AdminContent() {
    const [scrollY, setScrollY] = useState(0);
    const { logout: discordLogout } = useAuth();
    const { showNotification, showConfirm } = useNotification();

    const [showColorPicker, setShowColorPicker] = useState(false);
    const [activeTagColorIndex, setActiveTagColorIndex] = useState<number | null>(null);
    const [works, setWorks] = useState<ProjectData[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Category states
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [categoryForm, setCategoryForm] = useState<CategoryData>({ name: '', slug: '', icon: '📁', color: '#06b6d4', type: 'All', order: 0, visible: true });
    const [showCategorySection, setShowCategorySection] = useState(false);
    const CATEGORY_ICONS = ['📁', '🎥', '🎨', '🤖', '📸', '🎬', '🎵', '💻', '📱', '🎮', '✏️', '🖼️', '📐', '🔧', '⭐'];

    const handleReorder = (newOrder: ProjectData[]) => {
        setWorks(newOrder);
        setHasUnsavedChanges(true);
    };

    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

    const [formData, setFormData] = useState<ProjectData & { techInput: string; aspectRatio: string }>({
        id: undefined,
        title: '',
        description: '',
        type: 'Graphic',
        image: '',
        videoUrl: '',
        category: 'Graphic Design',
        tech: [],
        techInput: '',
        aspectRatio: '4/3',
        featured: false,
        client: '',
        year: '',
        challenge: '',
        solution: '',
        demo: '',
        group: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                if (user.email !== 'nathasit.mac@gmail.com') {
                    await signOut(auth);
                    showNotification(`⛔️ เข้าไม่ได้: อีเมล ${user.email} ไม่มีสิทธิ์ใช้งานหน้านี้\n(สงวนสิทธิ์เฉพาะ Admin เท่านั้น)`, 'error');
                    setFirebaseUser(null);
                    return;
                }
            }
            setFirebaseUser(user);
        });
        return () => unsubscribe();
    }, [showNotification]);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const loadWorks = useCallback(async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, "works"));
            const querySnapshot = await getDocs(q);
            const loadedWorks = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ProjectData[];
            loadedWorks.sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : 999999;
                const orderB = b.order !== undefined ? b.order : 999999;
                if (orderA !== orderB) return orderA - orderB;
                return (b.createdAt || 0) - (a.createdAt || 0);
            });
            setWorks(loadedWorks);
        } catch (error: any) {
            console.error("Error loading works:", error);
            showNotification("โหลดข้อมูลไม่สำเร็จ: " + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => { loadWorks(); loadCategories(); }, [loadWorks]);

    const loadCategories = async () => {
        try {
            const q = query(collection(db, "categories"));
            const snap = await getDocs(q);
            const cats = snap.docs.map(d => ({ id: d.id, ...d.data() })) as CategoryData[];
            cats.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
            setCategories(cats);
        } catch (error) { console.error("Error loading categories:", error); }
    };

    const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, '-').replace(/^-|-$/g, '') || 'untitled';

    const resetCategoryForm = () => {
        setCategoryForm({ name: '', slug: '', icon: '📁', color: '#06b6d4', type: 'All', order: categories.length, visible: true });
        setEditingCategoryId(null); setShowCategoryForm(false);
    };

    const handleSaveCategory = async () => {
        if (!firebaseUser) { showNotification('กรุณายืนยันตัวตนก่อน', 'warning'); handleFirebaseLogin(); return; }
        if (!categoryForm.name.trim()) { showNotification('กรุณากรอกชื่อหมวดหมู่', 'warning'); return; }
        setIsLoading(true);
        try {
            const slug = categoryForm.slug || generateSlug(categoryForm.name);
            const data = { ...categoryForm, slug, name: categoryForm.name.trim() };
            delete (data as any).id;
            if (editingCategoryId) {
                await updateDoc(doc(db, 'categories', editingCategoryId), data);
            } else {
                await addDoc(collection(db, 'categories'), data);
            }
            resetCategoryForm(); await loadCategories();
            showNotification('บันทึกหมวดหมู่สำเร็จ!', 'success');
        } catch (err: any) { showNotification('บันทึกไม่สำเร็จ: ' + err.message, 'error'); }
        finally { setIsLoading(false); }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!firebaseUser) { showNotification('กรุณายืนยันตัวตนก่อน', 'warning'); return; }
        const ok = await showConfirm('ลบหมวดหมู่นี้?');
        if (!ok) return;
        setIsLoading(true);
        try { await deleteDoc(doc(db, 'categories', id)); await loadCategories(); showNotification('ลบแล้ว', 'success'); }
        catch (err: any) { showNotification('ลบไม่สำเร็จ: ' + err.message, 'error'); }
        finally { setIsLoading(false); }
    };

    const handleEditCategory = (cat: CategoryData) => {
        setCategoryForm({ ...cat }); setEditingCategoryId(cat.id || null); setShowCategoryForm(true);
    };

    const handleToggleCategoryVisibility = async (cat: CategoryData) => {
        if (!firebaseUser) { showNotification('กรุณายืนยันตัวตนก่อน', 'warning'); return; }
        try {
            await updateDoc(doc(db, 'categories', cat.id!), { visible: !cat.visible });
            await loadCategories();
        } catch (err: any) { showNotification('อัปเดตไม่สำเร็จ', 'error'); }
    };

    const handleFirebaseLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error("Firebase Login Error:", error);
            showNotification("ยืนยันตัวตนไม่สำเร็จ: " + error.message, 'error');
        }
    };

    const handleFirebaseLogout = async () => {
        try { await signOut(auth); } catch (error) { console.error("Firebase Logout Error:", error); }
    };

    const handleSaveOrder = async () => {
        if (!firebaseUser) { showNotification("กรุณายืนยันตัวตนด้วย Google ก่อนบันทึกลำดับ", 'warning'); handleFirebaseLogin(); return; }
        setIsLoading(true);
        try {
            const updates = works.map((work, index) => {
                const workRef = doc(db, "works", work.id!);
                return updateDoc(workRef, { order: index });
            });
            await Promise.all(updates);
            showNotification("บันทึกลำดับเรียบร้อยแล้ว", 'success');
        } catch (error) {
            console.error("Error saving order:", error);
            showNotification("บันทึกลำดับไม่สำเร็จ", 'error');
        } finally {
            setIsLoading(false);
            setHasUnsavedChanges(false);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = (file: File) => {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => { setFormData(prev => ({ ...prev, image: reader.result as string })); };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) { processFile(file); }
        else if (file) { showNotification("กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น", 'warning'); }
    };

    const uploadToCloudinary = async (file: File) => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        if (!cloudName || !uploadPreset) throw new Error("Cloudinary configuration missing.");
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", uploadPreset);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${file.type.startsWith('video') ? 'video' : 'image'}/upload`, { method: "POST", body: fd });
        if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error?.message || "Upload failed"); }
        const data = await response.json();
        return data.secure_url;
    };

    const TAG_COLORS = [
        { name: 'Cyan', hex: '#06b6d4' },
        { name: 'Teal', hex: '#14b8a6' },
        { name: 'Blue', hex: '#3b82f6' },
        { name: 'Green', hex: '#10B981' },
        { name: 'Red', hex: '#EF4444' },
        { name: 'Yellow', hex: '#F59E0B' },
        { name: 'Purple', hex: '#8B5CF6' },
        { name: 'Pink', hex: '#EC4899' },
    ];

    const pickerStyles = {
        default: {
            picker: { background: '#0c1f3d', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(6,182,212,0.15)', padding: '16px', width: '260px', color: '#fff' },
            controls: { display: 'flex', paddingTop: '12px' },
            input: { background: '#071428', border: '1px solid rgba(6,182,212,0.15)', boxShadow: 'none', color: '#fff', fontFamily: 'inherit', borderRadius: '8px' },
            label: { color: '#7eb8c9', fontWeight: '600', textTransform: 'uppercase' as const, fontSize: '11px' }
        }
    };

    const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].hex);

    const addTech = () => {
        if (formData.techInput.trim()) {
            const newTag = { name: formData.techInput.trim(), color: selectedColor };
            setFormData({ ...formData, tech: [...(formData.tech || []), newTag], techInput: '' });
        }
    };

    const removeTech = (index: number) => {
        setFormData({ ...formData, tech: (formData.tech || []).filter((_, i) => i !== index) });
    };

    const updateTagColor = (index: number, newColor: string) => {
        const updatedTech = [...(formData.tech || [])] as any[];
        if (typeof updatedTech[index] === 'string') { updatedTech[index] = { name: updatedTech[index], color: newColor }; }
        else { updatedTech[index].color = newColor; }
        setFormData({ ...formData, tech: updatedTech });
    };

    const resetForm = () => {
        setFormData({ id: undefined, title: '', description: '', type: 'Graphic', image: '', videoUrl: '', category: 'Graphic Design', tech: [], techInput: '', aspectRatio: '4/3', featured: false, client: '', year: '', challenge: '', solution: '', demo: '', group: '' });
        setImageFile(null); setEditingId(null); setShowForm(false); setSelectedColor(TAG_COLORS[0].hex);
    };

    const handleAddNew = () => {
        if (!firebaseUser) { showNotification("กรุณายืนยันตัวตนด้วย Google ก่อนทำรายการแก้ไข", 'warning'); handleFirebaseLogin(); return; }
        resetForm(); setShowForm(true);
    };

    const handleEdit = (work: ProjectData) => {
        if (!firebaseUser) { showNotification("กรุณายืนยันตัวตนด้วย Google ก่อนทำรายการแก้ไข", 'warning'); handleFirebaseLogin(); return; }
        const formattedTech = (work.tech || []).map(t => { if (typeof t === 'string') return { name: t, color: TAG_COLORS[0].hex }; return t; });
        setFormData({ id: work.id, title: work.title || '', description: work.description || '', type: work.type || 'Graphic', image: work.image || '', videoUrl: work.videoUrl || '', category: work.category || 'Graphic Design', tech: formattedTech, techInput: '', aspectRatio: work.size?.aspectRatio || '4/3', featured: work.featured || false, client: work.client || '', year: work.year?.toString() || '', challenge: work.challenge || '', solution: work.solution || '', demo: work.demo || '', group: work.group || '' });
        setEditingId(work.id || null); setImageFile(null); setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!firebaseUser) { showNotification("กรุณายืนยันตัวตนด้วย Google ก่อนทำรายการแก้ไข", 'warning'); handleFirebaseLogin(); return; }
        const isConfirmed = await showConfirm('คุณแน่ใจหรือไม่ว่าต้องการลบผลงานนี้?');
        if (isConfirmed) {
            setIsLoading(true);
            try { await deleteDoc(doc(db, "works", id)); setWorks(works.filter(w => w.id !== id)); showNotification("ลบเรียบร้อยแล้ว", 'success'); }
            catch (error: any) { console.error("Error deleting doc:", error); showNotification("ลบไม่สำเร็จ: " + error.message, 'error'); }
            finally { setIsLoading(false); }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseUser) { showNotification("กรุณายืนยันตัวตนด้วย Google ก่อนทำรายการแก้ไข", 'warning'); return; }
        if (!formData.title?.trim()) { showNotification('กรุณากรอกชื่อผลงาน', 'warning'); return; }
        setIsLoading(true);
        try {
            let imageUrl = formData.image;
            if (formData.type === 'Graphic' && imageFile) {
                try { imageUrl = await uploadToCloudinary(imageFile); }
                catch (uploadError: any) { showNotification("อัพโหลดรูปภาพไม่สำเร็จ: " + uploadError.message, 'error'); setIsLoading(false); return; }
            } else if (formData.type === 'Graphic' && !imageUrl && !editingId) { showNotification('กรุณากรอกหรืออัพโหลดรูปภาพ', 'warning'); setIsLoading(false); return; }
            if (formData.type === 'Graphic' && imageUrl && imageUrl.startsWith('data:image')) { showNotification("เกิดข้อผิดพลาด: ระบบพยายามบันทึกรูปภาพขนาดใหญ่เกินไป", 'error'); setIsLoading(false); return; }
            if (formData.type === 'Video' && !formData.videoUrl?.trim()) { showNotification('กรุณากรอกลิงก์วิดีโอ', 'warning'); setIsLoading(false); return; }

            const workData: any = { title: formData.title?.trim(), description: formData.description?.trim(), category: formData.category?.trim() || 'Graphic Design', tech: formData.tech, size: { aspectRatio: formData.aspectRatio }, featured: formData.featured, type: formData.type, createdAt: Date.now(), client: formData.client?.trim() || '', year: formData.year?.toString().trim() || '', challenge: formData.challenge?.trim() || '', solution: formData.solution?.trim() || '', demo: formData.demo?.trim() || '', group: formData.group || '' };
            if (formData.type === 'Graphic') { workData.image = imageUrl; } else { workData.videoUrl = formData.videoUrl?.trim(); }

            if (editingId) { const workRef = doc(db, "works", editingId); await updateDoc(workRef, workData); }
            else { await addDoc(collection(db, "works"), workData); }
            resetForm(); await loadWorks(); showNotification('บันทึกข้อมูลสำเร็จ!', 'success');
        } catch (error: any) { console.error("Error saving document:", error); showNotification("บันทึกไม่สำเร็จ: " + error.message, 'error'); }
        finally { setIsLoading(false); }
    };

    const [fontSizeLevel, setFontSizeLevel] = useState(1);
    const FONT_SCALES = ['0.875rem', '1rem', '1.125rem', '1.25rem'];

    const inputStyle = "admin-input";

    return (
        <div className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: 'var(--bg-primary)', fontSize: FONT_SCALES[fontSizeLevel] }}>
            {/* Background decoration */}
            <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] blur-[80px] z-[1] pointer-events-none"
                 style={{background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 60%)'}} />

            <div className="pt-[120px] max-w-[1200px] mx-auto px-5 pb-[60px] relative z-[2]">
                
                {/* Header */}
                <div className="bento-card !p-6 md:!p-8 mb-8 flex flex-wrap justify-between items-center gap-5">
                    <div className="flex flex-col gap-1">
                        <h1 className="font-space text-[1.8em] font-bold tracking-[-0.5px] leading-tight flex items-center gap-3" style={{color: 'var(--text-primary)'}}>
                            <span className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                  style={{background: 'linear-gradient(135deg, #06b6d4, #14b8a6)', color: '#fff'}}>⚙</span>
                            Admin Panel
                        </h1>
                        <p className="text-[0.85em]" style={{color: 'var(--text-secondary)'}}>จัดการข้อมูลและผลงานทั้งหมดที่นี่</p>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center ml-auto">
                        {/* Font Size Controls */}
                        <div className="flex items-center gap-0.5 p-1 rounded-xl" style={{background: 'rgba(6, 182, 212, 0.06)', border: '1px solid var(--glass-border)'}}>
                            <button onClick={() => setFontSizeLevel(prev => Math.max(0, prev - 1))} disabled={fontSizeLevel === 0}
                                className="w-8 h-8 flex items-center justify-center rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer border-none"
                                style={{color: 'var(--text-secondary)', background: 'transparent'}}>
                                <span className="text-xs font-bold">A-</span>
                            </button>
                            <div className="w-px h-4 mx-0.5" style={{background: 'var(--glass-border)'}}></div>
                            <button onClick={() => setFontSizeLevel(prev => Math.min(3, prev + 1))} disabled={fontSizeLevel === 3}
                                className="w-8 h-8 flex items-center justify-center rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer border-none"
                                style={{color: 'var(--text-secondary)', background: 'transparent'}}>
                                <span className="text-lg font-bold">A+</span>
                            </button>
                        </div>

                        {/* Auth Status */}
                        {firebaseUser ? (
                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)'}}>
                                <span className="text-xs font-semibold flex items-center gap-1.5" style={{color: '#10b981'}}>✅ Verified: {firebaseUser.email}</span>
                                <button className="w-7 h-7 p-0 flex items-center justify-center rounded-lg cursor-pointer text-xs transition-all duration-200 border-none"
                                    style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}
                                    onClick={handleFirebaseLogout}>🔒</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)'}}>
                                <span className="text-xs font-semibold flex items-center gap-1.5" style={{color: '#f59e0b'}}>⚠️ Read-Only</span>
                                <button className="px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all duration-200 flex items-center gap-1.5 border-none"
                                    style={{background: '#f59e0b', color: '#071428'}}
                                    onClick={handleFirebaseLogin}>🔐 Verify</button>
                            </div>
                        )}

                        <div className="w-px h-8 mx-1" style={{background: 'var(--glass-border)'}}></div>

                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 border-none hover:-translate-y-0.5"
                            style={{background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.15)'}}
                            onClick={discordLogout}>
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex justify-end gap-3 mb-6">
                    <button
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 border-none ${hasUnsavedChanges ? 'animate-pulse' : ''}`}
                        style={{
                            background: hasUnsavedChanges ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'rgba(16, 185, 129, 0.08)',
                            color: hasUnsavedChanges ? '#fff' : '#10b981',
                            border: hasUnsavedChanges ? 'none' : '1px solid rgba(16, 185, 129, 0.2)',
                            boxShadow: hasUnsavedChanges ? '0 0 20px rgba(245, 158, 11, 0.3)' : 'none',
                            opacity: (!hasUnsavedChanges || isLoading) ? 0.6 : 1,
                            cursor: (!hasUnsavedChanges || isLoading) ? 'not-allowed' : 'pointer',
                        }}
                        onClick={handleSaveOrder}
                        disabled={isLoading || !hasUnsavedChanges}
                    >
                        <FaSave /> {hasUnsavedChanges ? 'บันทึกลำดับ (ยังไม่บันทึก)' : 'ลำดับบันทึกแล้ว'}
                    </button>
                    <button
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 text-white hover:-translate-y-0.5 border-none"
                        style={{background: 'linear-gradient(135deg, #06b6d4, #14b8a6)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'}}
                        onClick={handleAddNew}
                    >
                        <FaPlus /> เพิ่มผลงานใหม่
                    </button>
                </div>


                {/* Category Management Section */}
                <div className="bento-card !p-0 mb-8 overflow-hidden">
                    <button
                        className="w-full flex items-center justify-between p-5 md:p-6 cursor-pointer border-none transition-all duration-300"
                        style={{ background: 'transparent', color: 'var(--text-primary)' }}
                        onClick={() => setShowCategorySection(!showCategorySection)}
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}><FaLayerGroup /></span>
                            <div className="text-left">
                                <h2 className="font-space text-base font-bold" style={{ color: 'var(--text-primary)' }}>จัดการหมวดหมู่</h2>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{categories.length} หมวดหมู่</p>
                            </div>
                        </div>
                        {showCategorySection ? <FaChevronUp className="text-sm" style={{ color: 'var(--text-tertiary)' }} /> : <FaChevronDown className="text-sm" style={{ color: 'var(--text-tertiary)' }} />}
                    </button>

                    <AnimatePresence>
                        {showCategorySection && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="px-5 md:px-6 pb-6" style={{ borderTop: '1px solid var(--glass-border)' }}>
                                    {/* Category List */}
                                    <div className="mt-5 flex flex-col gap-2 mb-5">
                                        {categories.length === 0 ? (
                                            <p className="text-sm text-center py-6" style={{ color: 'var(--text-tertiary)' }}>ยังไม่มีหมวดหมู่</p>
                                        ) : categories.map(cat => (
                                            <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
                                                <span className="text-xl">{cat.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{cat.name}</div>
                                                    <div className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>/{cat.slug} · {cat.type}</div>
                                                </div>
                                                <button onClick={() => handleToggleCategoryVisibility(cat)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 border-none text-xs" style={{ background: cat.visible ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: cat.visible ? '#10b981' : '#ef4444' }}>
                                                    {cat.visible ? <FaEye /> : <FaEyeSlash />}
                                                </button>
                                                <button onClick={() => handleEditCategory(cat)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 border-none text-xs" style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4' }}><FaEdit /></button>
                                                <button onClick={() => handleDeleteCategory(cat.id!)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 border-none text-xs" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><FaTrash /></button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add/Edit Category Form */}
                                    {showCategoryForm ? (
                                        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
                                            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{editingCategoryId ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] uppercase tracking-[2px] font-bold" style={{ color: 'var(--text-tertiary)' }}>ชื่อ *</label>
                                                    <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: generateSlug(e.target.value) })} placeholder="เช่น Video Projects" className={inputStyle} />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] uppercase tracking-[2px] font-bold" style={{ color: 'var(--text-tertiary)' }}>Slug</label>
                                                    <input type="text" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} placeholder="auto-generated" className={inputStyle} />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] uppercase tracking-[2px] font-bold" style={{ color: 'var(--text-tertiary)' }}>ประเภท</label>
                                                    <select value={categoryForm.type} onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value as any })} className={inputStyle}>
                                                        <option value="All">All</option>
                                                        <option value="Video">Video</option>
                                                        <option value="Graphic">Graphic</option>
                                                    </select>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] uppercase tracking-[2px] font-bold" style={{ color: 'var(--text-tertiary)' }}>Icon</label>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {CATEGORY_ICONS.map(icon => (
                                                            <button key={icon} type="button" onClick={() => setCategoryForm({ ...categoryForm, icon })} className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 border-none text-base ${categoryForm.icon === icon ? 'scale-110' : ''}`} style={{ background: categoryForm.icon === icon ? 'rgba(6,182,212,0.15)' : 'var(--bg-tertiary)', border: categoryForm.icon === icon ? '1px solid rgba(6,182,212,0.3)' : '1px solid transparent' }}>{icon}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={handleSaveCategory} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 text-white border-none" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }} disabled={isLoading}><FaSave /> บันทึก</button>
                                                <button onClick={resetCategoryForm} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 border-none" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}><FaTimes /> ยกเลิก</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => { if (!firebaseUser) { showNotification('กรุณายืนยันตัวตนก่อน', 'warning'); handleFirebaseLogin(); return; } setShowCategoryForm(true); }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 border-dashed border-2 hover:-translate-y-0.5" style={{ background: 'transparent', color: '#8b5cf6', borderColor: 'rgba(139,92,246,0.2)' }}><FaPlus /> เพิ่มหมวดหมู่ใหม่</button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: 'rgba(2, 10, 24, 0.8)', backdropFilter: 'blur(8px)'}}>
                        <div className="flex flex-col items-center gap-4">
                            <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24" style={{color: '#06b6d4'}}>
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            <span className="text-sm font-semibold" style={{color: 'var(--text-secondary)'}}>กำลังโหลด...</span>
                        </div>
                    </div>
                )}

                {/* Form */}
                {showForm && (
                    <motion.div
                        className="bento-card !p-8 md:!p-10 mb-12"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="flex justify-between items-center mb-8 pb-5" style={{borderBottom: '1px solid var(--glass-border)'}}>
                            <h2 className="font-space text-xl font-bold bg-clip-text text-transparent" style={{backgroundImage: 'linear-gradient(135deg, #22d3ee, #2dd4bf)'}}>
                                {editingId ? 'แก้ไขผลงาน' : 'เพิ่มผลงานใหม่'}
                            </h2>
                            <button className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:rotate-90 border-none"
                                style={{background: 'rgba(6, 182, 212, 0.08)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)'}}
                                onClick={resetForm}><FaTimes /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Type Toggle */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1" style={{color: 'var(--text-tertiary)'}}>ประเภทผลงาน *</label>
                                <div className="flex gap-2 p-1 rounded-xl w-fit" style={{background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)'}}>
                                    <button type="button"
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 border-none min-w-[120px] justify-center`}
                                        style={{
                                            background: formData.type === 'Graphic' ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                                            color: formData.type === 'Graphic' ? '#06b6d4' : 'var(--text-secondary)',
                                            border: formData.type === 'Graphic' ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent'
                                        }}
                                        onClick={() => setFormData({ ...formData, type: 'Graphic' })}>🎨 Graphic</button>
                                    <button type="button"
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 border-none min-w-[120px] justify-center`}
                                        style={{
                                            background: formData.type === 'Video' ? 'rgba(239, 68, 68, 0.12)' : 'transparent',
                                            color: formData.type === 'Video' ? '#ef4444' : 'var(--text-secondary)',
                                            border: formData.type === 'Video' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent'
                                        }}
                                        onClick={() => setFormData({ ...formData, type: 'Video' })}>🎥 Video</button>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1" style={{color: 'var(--text-tertiary)'}}>ชื่อผลงาน *</label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="กรอกชื่อผลงาน" className={inputStyle} />
                            </div>

                            {/* Description */}
                            <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1" style={{color: 'var(--text-tertiary)'}}>คำอธิบาย *</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="กรอกคำอธิบายผลงาน" rows={3} className={`${inputStyle} resize-y min-h-[120px] leading-relaxed`} />
                            </div>

                            {/* Image/Video URL */}
                            {formData.type === 'Graphic' ? (
                                <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                                    <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1" style={{color: 'var(--text-tertiary)'}}>รูปภาพ *</label>
                                    <div className="flex flex-col gap-4">
                                        <div
                                            className={`w-full min-h-[200px] border-2 border-dashed rounded-2xl flex justify-center items-center transition-all duration-300 cursor-pointer relative overflow-hidden ${isDragging ? 'scale-[1.01]' : ''}`}
                                            style={{
                                                borderColor: isDragging ? '#06b6d4' : 'var(--glass-border)',
                                                background: isDragging ? 'rgba(6, 182, 212, 0.05)' : 'rgba(6, 182, 212, 0.02)'
                                            }}
                                            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                                        >
                                            <div className="text-center p-6 pointer-events-none">
                                                <FaUpload className="text-4xl mb-4 mx-auto" style={{color: 'var(--text-tertiary)'}} />
                                                <p className="text-sm font-semibold mb-1" style={{color: 'var(--text-primary)'}}>ลากไฟล์มาวางที่นี่ หรือ คลิกเพื่อเลือกไฟล์</p>
                                                <p className="text-xs mb-4" style={{color: 'var(--text-tertiary)'}}>รองรับ JPG, PNG, GIF</p>
                                                <label className="pointer-events-auto inline-block px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 text-white"
                                                    style={{background: 'linear-gradient(135deg, #06b6d4, #14b8a6)', boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)'}}>
                                                    เลือกไฟล์
                                                    <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center my-1 relative">
                                            <div className="h-px flex-1" style={{background: 'var(--glass-border)'}} />
                                            <span className="px-3 text-[10px] uppercase tracking-[2px] font-semibold" style={{color: 'var(--text-tertiary)'}}>หรือใช้ลิงก์</span>
                                            <div className="h-px flex-1" style={{background: 'var(--glass-border)'}} />
                                        </div>
                                        <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="วางลิงก์รูปภาพที่นี่..." className={inputStyle} />
                                        {formData.image && (
                                            <div className="rounded-2xl overflow-hidden" style={{border: '1px solid var(--glass-border)'}}>
                                                <img src={formData.image} alt="Preview" className="w-full h-auto block" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1" style={{color: 'var(--text-tertiary)'}}>ลิงก์วิดีโอ *</label>
                                    <input type="text" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} placeholder="YouTube, Facebook, หรือ TikTok URL" className={inputStyle} />
                                    <small className="text-[11px] mt-1 pl-1 opacity-60" style={{color: 'var(--text-tertiary)'}}>รองรับ: YouTube, Facebook, TikTok</small>
                                </div>
                            )}

                            {/* Group (Category) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1" style={{color: 'var(--text-tertiary)'}}>กลุ่มหมวดหมู่ (Group)</label>
                                <select value={formData.group || ''} onChange={(e) => setFormData({ ...formData, group: e.target.value })} className={inputStyle}>
                                    <option value="">-- ไม่ระบุ --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1" style={{color: 'var(--text-tertiary)'}}>หมวดหมู่ (แสดง)</label>
                                <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="เช่น Graphic Design, AI Art" className={inputStyle} />
                            </div>

                            {/* Group (Category) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1" style={{color: 'var(--text-tertiary)'}}>กลุ่มหมวดหมู่ (Navbar)</label>
                                <select value={formData.group || ''} onChange={(e) => setFormData({ ...formData, group: e.target.value })} className={inputStyle}>
                                    <option value="">-- ไม่ระบุ --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</option>
                                    ))}
                                </select>
                                <small className="text-[11px] mt-0.5 pl-1 opacity-60" style={{color: 'var(--text-tertiary)'}}>เลือกกลุ่มเพื่อแสดงในหน้าหมวดหมู่</small>
                            </div>

                            {/* Client */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1" style={{color: 'var(--text-tertiary)'}}>ลูกค้า / Client</label>
                                <input type="text" value={formData.client || ''} onChange={(e) => setFormData({ ...formData, client: e.target.value })} placeholder="เช่น Personal Project, ชื่อลูกค้า" className={inputStyle} />
                            </div>

                            {/* Year */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1" style={{color: 'var(--text-tertiary)'}}>ปี / Year</label>
                                <input type="text" value={formData.year || ''} onChange={(e) => setFormData({ ...formData, year: e.target.value })} placeholder={`เช่น ${new Date().getFullYear()}`} className={inputStyle} />
                            </div>

                            {/* Demo Link */}
                            <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1" style={{color: 'var(--text-tertiary)'}}>ลิงก์ Demo / Live</label>
                                <input type="text" value={formData.demo || ''} onChange={(e) => setFormData({ ...formData, demo: e.target.value })} placeholder="https://example.com (ถ้ามี)" className={inputStyle} />
                            </div>

                            {/* Challenge */}
                            <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1" style={{color: 'var(--text-tertiary)'}}>ความท้าทาย / The Challenge</label>
                                <textarea value={formData.challenge || ''} onChange={(e) => setFormData({ ...formData, challenge: e.target.value })} placeholder="อธิบายความท้าทายของโปรเจกต์นี้ (ถ้ามี)" rows={3} className={`${inputStyle} resize-y min-h-[100px] leading-relaxed`} />
                            </div>

                            {/* Solution */}
                            <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1" style={{color: 'var(--text-tertiary)'}}>แนวทางแก้ไข / The Solution</label>
                                <textarea value={formData.solution || ''} onChange={(e) => setFormData({ ...formData, solution: e.target.value })} placeholder="อธิบายแนวทางแก้ไขของโปรเจกต์นี้ (ถ้ามี)" rows={3} className={`${inputStyle} resize-y min-h-[100px] leading-relaxed`} />
                            </div>

                            {/* Tech Tags */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1" style={{color: 'var(--text-tertiary)'}}>เทคโนโลยี/เครื่องมือ</label>
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    {TAG_COLORS.map(color => (
                                        <button key={color.name} type="button"
                                            className={`w-6 h-6 rounded-full cursor-pointer transition-all duration-200 relative hover:scale-110 border-none`}
                                            style={{
                                                backgroundColor: color.hex,
                                                outline: selectedColor === color.hex ? `2px solid ${color.hex}` : 'none',
                                                outlineOffset: '2px'
                                            }}
                                            onClick={() => setSelectedColor(color.hex)} title={color.name} />
                                    ))}
                                    <div className="relative">
                                        <div className="w-6 h-6 rounded-full cursor-pointer transition-all duration-200 overflow-hidden flex items-center justify-center hover:scale-110"
                                            style={{outline: !TAG_COLORS.some(c => c.hex === selectedColor) ? `2px solid ${selectedColor}` : 'none', outlineOffset: '2px'}}
                                            onClick={() => setShowColorPicker(!showColorPicker)}>
                                            <div className="w-full h-full bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)] rounded-full"></div>
                                        </div>
                                        {showColorPicker && (
                                            <div className="absolute z-[100] top-9 left-0">
                                                <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                                                <SketchPicker color={selectedColor} onChange={(color: any) => setSelectedColor(color.hex)} disableAlpha={true} styles={pickerStyles as any} presetColors={[]} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={formData.techInput} onChange={(e) => setFormData({ ...formData, techInput: e.target.value })} onKeyPress={(e) => e.key === 'Enter' && addTech()} placeholder="พิมพ์ชื่อเครื่องมือ..." className={inputStyle} />
                                    <button type="button" onClick={addTech} className="px-5 rounded-2xl font-semibold cursor-pointer transition-all duration-300 border-none text-sm"
                                        style={{background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)'}}>เพิ่ม</button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {(formData.tech || []).map((tech, index) => {
                                        const techName = typeof tech === 'string' ? tech : tech.name;
                                        const techColor = typeof tech === 'string' ? '#06b6d4' : tech.color;
                                        return (
                                            <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium relative"
                                                style={{ backgroundColor: `${techColor}15`, color: techColor, border: `1px solid ${techColor}30` }}>
                                                <div className="absolute inset-0 cursor-pointer z-[1] rounded-lg" onClick={() => setActiveTagColorIndex(index)} title="Click to change color" />
                                                {activeTagColorIndex === index && (
                                                    <div className="absolute z-[100] top-full left-0">
                                                        <div className="fixed inset-0" onClick={() => setActiveTagColorIndex(null)} />
                                                        <SketchPicker color={techColor} onChange={(color: any) => updateTagColor(index, color.hex)} disableAlpha={true} styles={pickerStyles as any} presetColors={[]} />
                                                    </div>
                                                )}
                                                {techName}
                                                <button onClick={(e) => { e.stopPropagation(); removeTech(index); }}
                                                    className="relative z-[2] w-4 h-4 flex items-center justify-center rounded-full text-xs transition-all duration-200 cursor-pointer border-none"
                                                    style={{background: 'rgba(255,255,255,0.1)', color: 'inherit'}}>×</button>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Aspect Ratio */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1" style={{color: 'var(--text-tertiary)'}}>Aspect Ratio</label>
                                <select value={formData.aspectRatio} onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value })} className={inputStyle}>
                                    <option value="16/9">16:9 (กว้าง)</option>
                                    <option value="4/3">4:3 (ปกติ)</option>
                                    <option value="1/1">1:1 (สี่เหลี่ยมจัตุรัส)</option>
                                    <option value="21/9">21:9 (Ultrawide)</option>
                                    <option value="3/4">3:4 (แนวตั้ง)</option>
                                    <option value="9/16">9:16 (แนวตั้งยาว)</option>
                                    <option value="1/1.414">1:1.414 (A4)</option>
                                </select>
                            </div>

                            {/* Featured Toggle */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[2px] font-bold pl-1 mb-1" style={{color: 'var(--text-tertiary)'}}>สถานะการแสดงผล</label>
                                <div className="flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 cursor-pointer w-fit"
                                    style={{background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)'}}
                                    onClick={() => setFormData({ ...formData, featured: !formData.featured })}>
                                    <div className="relative inline-block w-[48px] h-[26px] group">
                                        <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="opacity-0 w-0 h-0 peer" />
                                        <span className="absolute cursor-pointer inset-0 transition-all duration-400 rounded-full peer-checked:before:translate-x-[22px]"
                                            style={{
                                                background: formData.featured ? '#06b6d4' : 'var(--bg-tertiary)',
                                                border: formData.featured ? '1px solid transparent' : '1px solid var(--glass-border)',
                                            }}>
                                            <span className="absolute w-[18px] h-[18px] left-[3px] bottom-[3px] rounded-full transition-all duration-300"
                                                style={{
                                                    background: formData.featured ? '#fff' : 'var(--text-tertiary)',
                                                    transform: formData.featured ? 'translateX(22px)' : 'translateX(0)'
                                                }}></span>
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold transition-colors duration-300" style={{color: formData.featured ? '#06b6d4' : 'var(--text-secondary)'}}>
                                        {formData.featured ? '✨ ผลงานเด่น (Featured)' : 'ผลงานทั่วไป'}
                                    </span>
                                </div>
                            </div>

                            {/* Save/Cancel */}
                            <div className="col-span-1 md:col-span-2 flex gap-4 mt-4 pt-6" style={{borderTop: '1px solid var(--glass-border)'}}>
                                <button type="button" onClick={handleSave}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-base font-bold cursor-pointer transition-all duration-300 text-white disabled:opacity-50 disabled:cursor-not-allowed border-none hover:-translate-y-0.5"
                                    style={{background: 'linear-gradient(135deg, #06b6d4, #14b8a6)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'}}
                                    disabled={isLoading}>
                                    <FaSave /> {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                                </button>
                                <button type="button" onClick={resetForm}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-base font-bold cursor-pointer transition-all duration-300 disabled:opacity-50 border-none"
                                    style={{background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)'}}
                                    disabled={isLoading}>
                                    <FaTimes /> ยกเลิก
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Work List */}
                <div className="mt-10">
                    <h2 className="text-lg font-bold mb-5 flex items-baseline gap-3" style={{color: 'var(--text-primary)'}}>
                        รายการผลงานทั้งหมด ({works.length})
                        <small className="text-xs font-medium opacity-60" style={{color: 'var(--text-secondary)'}}>ลากเพื่อจัดลำดับ</small>
                    </h2>
                    {works.length === 0 ? (
                        <div className="text-center py-16 px-5 rounded-2xl border-2 border-dashed"
                             style={{color: 'var(--text-secondary)', borderColor: 'var(--glass-border)', background: 'rgba(6, 182, 212, 0.02)'}}>
                            <div className="text-4xl mb-3 opacity-30">📁</div>
                            <p>ยังไม่มีผลงาน กรุณาเพิ่มผลงานใหม่</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {/* Header Row — hidden on mobile */}
                            <div className="hidden lg:grid grid-cols-[50px_90px_2fr_1.5fr_70px_100px] px-5 pb-3 text-[10px] uppercase tracking-[2px] font-bold" style={{color: 'var(--text-tertiary)'}}>
                                <div className="flex justify-center items-center"></div>
                                <div className="flex items-center">ประเภท</div>
                                <div className="flex items-center">ชื่อผลงาน</div>
                                <div className="flex items-center">หมวดหมู่</div>
                                <div className="flex items-center justify-center">Featured</div>
                                <div className="flex items-center justify-end">จัดการ</div>
                            </div>

                            <Reorder.Group axis="y" values={works} onReorder={handleReorder} className="flex flex-col gap-2 list-none p-0 m-0">
                                {works.map((work) => (
                                    <SortableProjectItem key={work.id} work={work} handleEdit={handleEdit} handleDelete={handleDelete} />
                                ))}
                            </Reorder.Group>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface SortableProjectItemProps {
    work: ProjectData;
    handleEdit: (work: ProjectData) => void;
    handleDelete: (id: string) => void;
}

function SortableProjectItem({ work, handleEdit, handleDelete }: SortableProjectItemProps) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={work}
            dragListener={false}
            dragControls={controls}
            whileDrag={{ scale: 1.02, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", zIndex: 100 }}
            className="grid grid-cols-1 lg:grid-cols-[50px_90px_2fr_1.5fr_70px_100px] p-4 lg:p-5 rounded-2xl items-center transition-all duration-200 group"
            style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-secondary)'
            }}
        >
            <div className="hidden lg:flex justify-center items-center">
                <span className="text-lg opacity-40 cursor-grab hover:opacity-100 transition-all duration-200 p-2 touch-none"
                    style={{color: 'var(--text-secondary)'}}
                    onPointerDown={(e) => controls.start(e)}>
                    <FaBars />
                </span>
            </div>
            <div className="flex items-center mb-2 lg:mb-0">
                <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-[0.5px] uppercase`}
                    style={{
                        background: work.type === 'Graphic' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: work.type === 'Graphic' ? '#06b6d4' : '#ef4444',
                        border: `1px solid ${work.type === 'Graphic' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}>
                    {work.type === 'Graphic' ? 'Graphic' : 'Video'}
                </span>
            </div>
            <div className="font-medium text-sm line-clamp-1 pr-4 mb-1 lg:mb-0" style={{color: 'var(--text-primary)'}}>{work.title}</div>
            <div className="text-sm line-clamp-1 pr-4 mb-2 lg:mb-0" style={{color: 'var(--text-secondary)'}}>{work.category}</div>
            <div className="hidden lg:flex justify-center items-center">
                {work.featured ? (
                    <span className="inline-flex w-6 h-6 rounded-full text-white items-center justify-center text-xs"
                        style={{background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'}}>✓</span>
                ) : (
                    <span className="inline-block w-6 text-center opacity-20" style={{color: 'var(--text-secondary)'}}>-</span>
                )}
            </div>
            <div className="flex gap-2 justify-end">
                <button onClick={() => handleEdit(work)} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 border-none"
                    style={{background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4'}}>
                    <FaEdit className="text-sm" />
                </button>
                <button onClick={() => handleDelete(work.id!)} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 border-none"
                    style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}>
                    <FaTrash className="text-sm" />
                </button>
            </div>
        </Reorder.Item>
    );
}
