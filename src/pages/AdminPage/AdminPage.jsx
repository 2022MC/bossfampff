import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUpload, FaSignOutAlt, FaBars } from 'react-icons/fa';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
// import './AdminPage.css'; // Removed CSS import
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query } from 'firebase/firestore';

// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Removed Firebase Storage
import { SketchPicker } from 'react-color';

// ... imports
import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const AdminPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const { logout: discordLogout } = useAuth(); // Renamed for clarity
  const { showNotification, showConfirm } = useNotification();

  // Color Picker State
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTagColorIndex, setActiveTagColorIndex] = useState(null);
  const [works, setWorks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);



  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    type: 'Graphic',
    image: '',
    videoUrl: '',
    category: 'Graphic Design',
    tech: [],
    techInput: '',
    aspectRatio: '4/3',
    featured: false
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    // Monitor Firebase Auth State
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Enforce strict email check
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
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // โหลดข้อมูลจาก Firebase
  const loadWorks = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all works, then sort client-side to handle missing 'order' fields gracefully
      const q = query(collection(db, "works"));
      const querySnapshot = await getDocs(q);
      const loadedWorks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by order (asc), fallback to createdAt (desc)
      loadedWorks.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 999999; // New items go to end
        const orderB = b.order !== undefined ? b.order : 999999;

        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return (b.createdAt || 0) - (a.createdAt || 0);
      });

      setWorks(loadedWorks);
    } catch (error) {
      console.error("Error loading works:", error);
      showNotification("โหลดข้อมูลไม่สำเร็จ: " + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadWorks();
  }, [loadWorks]);

  // Firebase Logins
  const handleFirebaseLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Firebase Login Error:", error);
      showNotification("ยืนยันตัวตนไม่สำเร็จ: " + error.message, 'error');
    }
  };

  const handleFirebaseLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase Logout Error:", error);
    }
  };

  const handleSaveOrder = async () => {
    if (!firebaseUser) {
      showNotification("กรุณายืนยันตัวตนด้วย Google ก่อนบันทึกลำดับ", 'warning');
      handleFirebaseLogin();
      return;
    }

    setIsLoading(true);
    try {
      const updates = works.map((work, index) => {
        const workRef = doc(db, "works", work.id);
        return updateDoc(workRef, { order: index });
      });

      await Promise.all(updates);
      showNotification("บันทึกลำดับเรียบร้อยแล้ว", 'success');
    } catch (error) {
      console.error("Error saving order:", error);
      showNotification("บันทึกลำดับไม่สำเร็จ", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // จัดการอัพโหลดรูปภาพ (เลือกไฟล์)
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setImageFile(file);
    // Create local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result })); // Preview only
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    } else if (file) {
      showNotification("กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น", 'warning');
    }
  };

  const uploadToCloudinary = async (file) => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration missing. Please check .env file.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${file.type.startsWith('video') ? 'video' : 'image'}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  };

  // Available colors for tags
  const TAG_COLORS = [
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Green', hex: '#10B981' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Yellow', hex: '#F59E0B' },
    { name: 'Purple', hex: '#8B5CF6' },
    { name: 'Pink', hex: '#EC4899' },
    { name: 'Gray', hex: '#64748B' }
  ];

  // Custom Dark Styles for SketchPicker
  const pickerStyles = {
    default: {
      picker: {
        background: '#1e293b', // Slate-800
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '16px',
        width: '260px',
        color: '#fff'
      },
      controls: {
        display: 'flex',
        paddingTop: '12px'
      },
      input: {
        background: '#0f172a', // Slate-900
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: 'none',
        color: '#fff',
        fontFamily: 'inherit',
        borderRadius: '8px'
      },
      label: {
        color: '#94a3b8', // Slate-400
        fontWeight: '600',
        textTransform: 'uppercase',
        fontSize: '11px'
      }
    }
  };

  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].hex);

  // เพิ่ม tech tag
  const addTech = () => {
    if (formData.techInput.trim()) {
      const newTag = {
        name: formData.techInput.trim(),
        color: selectedColor
      };

      setFormData({
        ...formData,
        tech: [...formData.tech, newTag],
        techInput: ''
      });
    }
  };

  // ลบ tech tag
  const removeTech = (index) => {
    setFormData({
      ...formData,
      tech: formData.tech.filter((_, i) => i !== index)
    });
  };

  // อัพเดทสีของ Tag ที่มีอยู่แล้ว
  const updateTagColor = (index, newColor) => {
    const updatedTech = [...formData.tech];
    if (typeof updatedTech[index] === 'string') {
      updatedTech[index] = { name: updatedTech[index], color: newColor };
    } else {
      updatedTech[index].color = newColor;
    }
    setFormData({ ...formData, tech: updatedTech });
  };

  // รีเซ็ตฟอร์ม
  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      description: '',
      type: 'Graphic',
      image: '',
      videoUrl: '',
      category: 'Graphic Design',
      tech: [],
      techInput: '',
      aspectRatio: '4/3',
      featured: false
    });
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
    setSelectedColor(TAG_COLORS[0].hex);
  };


  // เปิดฟอร์มสำหรับเพิ่มผลงานใหม่
  const handleAddNew = () => {
    if (!firebaseUser) {
      showNotification("กรุณายืนยันตัวตนด้วย Google ก่อนทำรายการแก้ไข", 'warning');
      handleFirebaseLogin();
      return;
    }
    resetForm();
    setShowForm(true);
  };

  // เปิดฟอร์มสำหรับแก้ไข
  const handleEdit = (work) => {
    if (!firebaseUser) {
      showNotification("กรุณายืนยันตัวตนด้วย Google ก่อนทำรายการแก้ไข", 'warning');
      handleFirebaseLogin();
      return;
    }

    // Convert legacy string tags to objects
    const formattedTech = (work.tech || []).map(t => {
      if (typeof t === 'string') {
        return { name: t, color: TAG_COLORS[0].hex }; // Default blue
      }
      return t;
    });

    setFormData({
      id: work.id,
      title: work.title || '',
      description: work.description || '',
      type: work.type || 'Graphic',
      image: work.image || '',
      videoUrl: work.videoUrl || '',
      category: work.category || 'Graphic Design',
      tech: formattedTech,
      techInput: '',
      aspectRatio: work.size?.aspectRatio || '4/3',
      featured: work.featured || false
    });
    setEditingId(work.id);
    setImageFile(null); // Reset file selection
    setShowForm(true);
  };

  // ลบผลงาน
  const handleDelete = async (id) => {
    if (!firebaseUser) {
      showNotification("กรุณายืนยันตัวตนด้วย Google ก่อนทำรายการแก้ไข", 'warning');
      handleFirebaseLogin();
      return;
    }

    const isConfirmed = await showConfirm('คุณแน่ใจหรือไม่ว่าต้องการลบผลงานนี้? การกระทำนี้ไม่สามารถย้อนกลับได้');

    if (isConfirmed) {
      setIsLoading(true);
      try {
        await deleteDoc(doc(db, "works", id));
        setWorks(works.filter(w => w.id !== id));
        showNotification("ลบเรียบร้อยแล้ว", 'success');
      } catch (error) {
        console.error("Error deleting doc:", error);
        showNotification("ลบไม่สำเร็จ (คุณอาจไม่มีสิทธิ์): " + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // บันทึกผลงาน
  const handleSave = async (e) => {
    e.preventDefault();

    if (!firebaseUser) {
      showNotification("กรุณายืนยันตัวตนด้วย Google ก่อนทำรายการแก้ไข", 'warning');
      return;
    }

    if (!formData.title.trim()) {
      showNotification('กรุณากรอกชื่อผลงาน', 'warning');
      return;
    }

    setIsLoading(true);
    console.log("Starting save process...");

    try {
      let imageUrl = formData.image; // Initially base64 or existing URL

      // Upload new image if selected
      if (formData.type === 'Graphic' && imageFile) {
        console.log("Uploading image...", imageFile.name);
        try {
          imageUrl = await uploadToCloudinary(imageFile);
          console.log("Upload success, URL:", imageUrl);
        } catch (uploadError) {
          console.error("Upload failed:", uploadError);
          showNotification("อัพโหลดรูปภาพไม่สำเร็จ: " + uploadError.message, 'error');
          setIsLoading(false);
          return;
        }
      } else if (formData.type === 'Graphic' && !imageUrl) {
        // Check if existing image (editing) or validation fail
        if (!editingId) {
          showNotification('กรุณากรอกหรืออัพโหลดรูปภาพ', 'warning');
          setIsLoading(false);
          return;
        }
      }

      // Safety check: Don't save if image is still base64 (too large)
      if (formData.type === 'Graphic' && imageUrl && imageUrl.startsWith('data:image')) {
        showNotification("เกิดข้อผิดพลาด: ระบบพยายามบันทึกรูปภาพขนาดใหญ่เกินไป (Base64)", 'error');
        console.error("Attempted to save Base64 image to Firestore");
        setIsLoading(false);
        return;
      }

      if (formData.type === 'Video' && !formData.videoUrl.trim()) {
        showNotification('กรุณากรอกลิงก์วิดีโอ', 'warning');
        setIsLoading(false);
        return;
      }

      const workData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim() || 'Graphic Design',
        tech: formData.tech, // Now saves array of objects
        size: { aspectRatio: formData.aspectRatio },
        featured: formData.featured,
        type: formData.type,
        createdAt: Date.now()
      };

      if (formData.type === 'Graphic') {
        workData.image = imageUrl;
      } else {
        workData.videoUrl = formData.videoUrl.trim();
      }

      console.log("Saving to Firestore...", workData);

      if (editingId) {
        // Update existing document
        const workRef = doc(db, "works", editingId);
        await updateDoc(workRef, workData);
      } else {
        // Add new document
        await addDoc(collection(db, "works"), workData);
      }

      console.log("Save successful!");
      resetForm();
      await loadWorks(); // Reload to see updates
      showNotification('บันทึกข้อมูลสำเร็จ!', 'success');

    } catch (error) {
      console.error("Error saving document:", error);
      showNotification("บันทึกไม่สำเร็จ (คุณอาจไม่มีสิทธิ์): " + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-x-hidden">
      {/* Background Effects (Subtle for Admin) */}
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_60%)] blur-[80px] z-[1] pointer-events-none" />

      <Navbar scrollY={scrollY} />

      <div className="pt-[120px] max-w-[1200px] mx-auto px-5 pb-[60px] relative z-[2]">
        <div className="flex flex-wrap justify-between items-center mb-[50px] gap-5 bg-glass-bg backdrop-blur-md p-6 md:p-8 rounded-[24px] border border-glass-border shadow-lg transition-all duration-300">
          <h1 className="font-space text-[28px] font-bold text-text-primary -tracking-[0.5px]">Admin Panel - จัดการผลงาน</h1>
          <div className="flex flex-wrap gap-3 items-center ml-auto">

            {/* Identity Verification Status */}
            {firebaseUser ? (
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
                <span className="text-[13px] font-semibold text-green-400 flex items-center gap-1.5">✅ Verified: {firebaseUser.email}</span>
                <button
                  className="bg-transparent border border-green-500/50 text-green-400 w-7 h-7 p-0 flex items-center justify-center rounded-full cursor-pointer text-xs transition-all duration-200 hover:bg-green-500/20"
                  onClick={handleFirebaseLogout}
                  title="Lock Database"
                >
                  🔒
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30">
                <span className="text-[13px] font-semibold text-yellow-500 flex items-center gap-1.5">⚠️ Read-Only Mode</span>
                <button
                  className="bg-yellow-400 text-slate-900 border-none px-3.5 py-1.5 rounded-[20px] font-bold text-xs cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:bg-yellow-300 hover:-translate-y-px"
                  onClick={handleFirebaseLogin}
                >
                  🔐 Verify Identity
                </button>
              </div>
            )}

            <span className="text-border-color text-2xl font-light mx-2">|</span>

            <button
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:-translate-y-0.5"
              onClick={discordLogout}
              title="Logout"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-4 px-10 mb-5 border-b border-white/5 pb-2.5">
          <button
            className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            onClick={handleSaveOrder}
            disabled={isLoading}
          >
            <FaSave /> บันทึกลำดับ
          </button>
          <button
            className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 bg-primary text-white shadow-glow-primary hover:bg-secondary hover:-translate-y-0.5"
            onClick={handleAddNew}
          >
            <FaPlus /> เพิ่มผลงานใหม่
          </button>
        </div>

        {isLoading && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center text-white text-xl font-bold">กำลังโหลด...</div>}

        {/* ฟอร์มเพิ่ม/แก้ไข */}
        {showForm && (
          <motion.div
            className="bg-bg-tertiary backdrop-blur-[20px] border border-glass-border rounded-[24px] p-10 mb-[60px] shadow-2xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex justify-between items-center mb-[30px] pb-5 border-b border-border-color">
              <h2 className="font-space text-2xl font-bold bg-gradient-text bg-clip-text text-transparent">{editingId ? `แก้ไขผลงาน` : `เพิ่มผลงานใหม่`}</h2>
              <button
                className="w-10 h-10 rounded-xl bg-bg-secondary border border-border-color text-text-secondary cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-primary hover:text-white hover:rotate-90 hover:border-primary"
                onClick={resetForm}
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[30px]">
              <div className="flex flex-col gap-2.5">
                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary pl-1">ประเภทผลงาน *</label>
                <div className="flex gap-2.5 bg-bg-secondary p-1.5 rounded-[16px] border border-border-color w-fit mb-2.5">
                  <button
                    type="button"
                    className={`flex items-center justify-center gap-2 px-6 py-2.5 border border-transparent rounded-xl bg-transparent text-text-secondary text-[15px] font-semibold cursor-pointer transition-all duration-300 min-w-[140px] hover:text-text-primary hover:bg-white/5 ${formData.type === 'Graphic' ? '!bg-bg-tertiary !text-text-primary shadow-sm !border-border-color !text-indigo-400 !bg-indigo-500/10 !border-indigo-500/30' : ''}`}
                    onClick={() => setFormData({ ...formData, type: 'Graphic' })}
                  >
                    🎨 Graphic
                  </button>
                  <button
                    type="button"
                    className={`flex items-center justify-center gap-2 px-6 py-2.5 border border-transparent rounded-xl bg-transparent text-text-secondary text-[15px] font-semibold cursor-pointer transition-all duration-300 min-w-[140px] hover:text-text-primary hover:bg-white/5 ${formData.type === 'Video' ? '!bg-bg-tertiary !text-text-primary shadow-sm !border-border-color !text-rose-400 !bg-rose-500/10 !border-rose-500/30' : ''}`}
                    onClick={() => setFormData({ ...formData, type: 'Video' })}
                  >
                    🎥 Video
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary pl-1">ชื่อผลงาน *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="กรอกชื่อผลงาน"
                  className="w-full px-5 py-4 bg-bg-secondary border border-border-color rounded-[16px] text-text-primary text-[15px] font-sans transition-all duration-300 outline-none focus:bg-primary/5 focus:border-primary focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] focus:-translate-y-px"
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-2.5">
                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary pl-1">คำอธิบาย *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="กรอกคำอธิบายผลงาน"
                  rows="3"
                  className="w-full px-5 py-4 bg-bg-secondary border border-border-color rounded-[16px] text-text-primary text-[15px] font-sans transition-all duration-300 outline-none focus:bg-primary/5 focus:border-primary focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] focus:-translate-y-px resize-y min-h-[120px] leading-relaxed"
                />
              </div>

              {formData.type === 'Graphic' ? (
                <div className="col-span-1 md:col-span-2 flex flex-col gap-2.5">
                  <label className="text-xs uppercase tracking-widest font-bold text-text-secondary pl-1">รูปภาพ *</label>
                  <div className="flex flex-col gap-5">

                    <div
                      className={`w-full min-h-[240px] border-2 border-dashed border-border-color rounded-[20px] bg-slate-900/30 flex justify-center items-center transition-all duration-300 cursor-pointer relative overflow-hidden hover:bg-slate-900/50 hover:border-primary ${isDragging ? 'bg-indigo-500/10 border-primary scale-[1.01]' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="text-center p-[30px] pointer-events-none group">
                        <FaUpload className="text-[56px] text-text-tertiary mb-5 transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1.5 mx-auto" />
                        <p className="text-base font-semibold text-text-primary mb-2">ลากไฟล์มาวางที่นี่ หรือ คลิกเพื่อเลือกไฟล์</p>
                        <p className="text-[13px] text-text-secondary mb-6">รองรับ JPG, PNG, GIF</p>
                        <label className="pointer-events-auto inline-block px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 shadow-glow-primary hover:bg-secondary hover:-translate-y-0.5">
                          เลือกไฟล์จากเครื่อง
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-center my-2.5 relative">
                      <div className="h-px bg-border-color flex-1" />
                      <span className="px-4 text-text-secondary text-[11px] uppercase tracking-[2px] font-semibold">หรือใช้ลิงก์</span>
                      <div className="h-px bg-border-color flex-1" />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="วางลิงก์รูปภาพที่นี่..."
                        className="w-full px-5 py-4 bg-bg-secondary border border-border-color rounded-[16px] text-text-primary text-[15px] font-sans transition-all duration-300 outline-none focus:bg-primary/5 focus:border-primary focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] focus:-translate-y-px"
                      />
                    </div>
                    {formData.image && (
                      <div className="mt-2.5 rounded-[16px] overflow-hidden border border-border-color shadow-xl">
                        <img src={formData.image} alt="Preview" className="w-full h-auto block" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs uppercase tracking-widest font-bold text-text-secondary pl-1">ลิงก์วิดีโอ *</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="YouTube, Facebook, หรือ TikTok URL"
                    className="w-full px-5 py-4 bg-bg-secondary border border-border-color rounded-[16px] text-text-primary text-[15px] font-sans transition-all duration-300 outline-none focus:bg-primary/5 focus:border-primary focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] focus:-translate-y-px"
                  />
                  <small className="text-xs text-text-secondary mt-1.5 pl-1 opacity-70">รองรับ: YouTube, Facebook, TikTok</small>
                </div>
              )}


              <div className="flex flex-col gap-2.5">
                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary pl-1">หมวดหมู่</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="เช่น Graphic Design, AI Art"
                  className="w-full px-5 py-4 bg-bg-secondary border border-border-color rounded-[16px] text-text-primary text-[15px] font-sans transition-all duration-300 outline-none focus:bg-primary/5 focus:border-primary focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] focus:-translate-y-px"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary pl-1">เทคโนโลยี/เครื่องมือ</label>
                <div className="flex gap-2 mb-3">
                  {TAG_COLORS.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 border-transparent cursor-pointer transition-all duration-200 relative hover:scale-110 ${selectedColor === color.hex ? 'border-white shadow-[0_0_0_2px_var(--primary-color)] scale-110' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setSelectedColor(color.hex)}
                      title={color.name}
                    />
                  ))}

                  {/* Custom Color Button */}
                  <div className="relative">
                    <div
                      className={`w-6 h-6 rounded-full border-2 border-transparent cursor-pointer transition-all duration-200 relative overflow-hidden flex items-center justify-center hover:scale-110 ${!TAG_COLORS.some(c => c.hex === selectedColor) ? 'border-white shadow-[0_0_0_2px_var(--primary-color)] scale-110' : ''}`}
                      title="Custom Color"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    >
                      <div className="w-full h-full bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)] rounded-full"></div>
                    </div>
                    {showColorPicker && (
                      <div className="absolute z-[100] top-9 left-0">
                        <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                        <SketchPicker
                          color={selectedColor}
                          onChange={(color) => setSelectedColor(color.hex)}
                          disableAlpha={true}
                          styles={pickerStyles}
                          presetColors={[]}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.techInput}
                    onChange={(e) => setFormData({ ...formData, techInput: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addTech()}
                    placeholder="พิมพ์ชื่อเครื่องมือ..."
                    className="w-full px-5 py-4 bg-bg-secondary border border-border-color rounded-[16px] text-text-primary text-[15px] font-sans transition-all duration-300 outline-none focus:bg-primary/5 focus:border-primary focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] focus:-translate-y-px"
                  />
                  <button type="button" onClick={addTech} className="px-6 bg-indigo-500/10 border border-indigo-500/30 rounded-[16px] text-indigo-400 font-semibold cursor-pointer transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary">เพิ่ม</button>
                </div>
                <div className="flex flex-wrap gap-2.5 mt-3.5">
                  {formData.tech.map((tech, index) => {
                    const techName = typeof tech === 'string' ? tech : tech.name;
                    const techColor = typeof tech === 'string' ? '#3B82F6' : tech.color;

                    return (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-border-color rounded-full text-[13px] font-medium shadow-sm relative"
                        style={{
                          backgroundColor: `${techColor}20`,
                          color: techColor,
                          borderColor: `${techColor}50`
                        }}
                      >
                        {/* SketchPicker for Direct Tag Editing */}
                        <div
                          className="absolute inset-0 cursor-pointer z-[1]"
                          onClick={() => setActiveTagColorIndex(index)}
                          title="Click to change color"
                        />

                        {activeTagColorIndex === index && (
                          <div className="absolute z-[100] top-full left-0">
                            <div className="fixed inset-0" onClick={() => setActiveTagColorIndex(null)} />
                            <SketchPicker
                              color={techColor}
                              onChange={(color) => updateTagColor(index, color.hex)}
                              disableAlpha={true}
                              styles={pickerStyles}
                              presetColors={[]}
                            />
                          </div>
                        )}

                        {techName}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent color picker trigger if clicking remove
                            removeTech(index);
                          }}
                          className="relative z-[2] bg-white/10 rounded-full border-none text-text-secondary cursor-pointer w-[18px] h-[18px] flex items-center justify-center transition-all duration-200 hover:bg-red-500 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary pl-1">Aspect Ratio</label>
                <select
                  value={formData.aspectRatio}
                  onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value })}
                  className="w-full px-5 py-4 bg-bg-secondary border border-border-color rounded-[16px] text-text-primary text-[15px] font-sans transition-all duration-300 outline-none focus:bg-primary/5 focus:border-primary focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] focus:-translate-y-px"
                >
                  <option value="16/9">16:9 (กว้าง)</option>
                  <option value="4/3">4:3 (ปกติ)</option>
                  <option value="1/1">1:1 (สี่เหลี่ยมจัตุรัส)</option>
                  <option value="21/9">21:9 (Ultrawide)</option>
                  <option value="3/4">3:4 (แนวตั้ง)</option>
                  <option value="9/16">9:16 (แนวตั้งยาว)</option>
                  <option value="1/1.414">1:1.414 (A4)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary pl-1 mb-2.5 block">สถานะการแสดงผล</label>
                <div
                  className="flex items-center gap-4 p-3 bg-bg-secondary rounded-[16px] border border-border-color transition-all duration-300 cursor-pointer w-fit hover:border-primary"
                  onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                >
                  <div className="relative inline-block w-[52px] h-[28px] group">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="opacity-0 w-0 h-0 peer"
                    />
                    <span className="absolute cursor-pointer inset-0 bg-bg-tertiary transition-all duration-400 rounded-[34px] border border-border-color peer-checked:bg-primary peer-checked:border-transparent before:absolute before:content-[''] before:h-5 before:w-5 before:left-[3px] before:bottom-[3px] before:bg-text-secondary before:transition-all before:duration-400 before:rounded-full peer-checked:before:translate-x-6 peer-checked:before:bg-white group-hover:before:shadow-sm"></span>
                  </div>
                  <span className={`text-[15px] font-semibold transition-colors duration-300 ${formData.featured ? 'text-primary' : 'text-text-secondary'}`}>
                    {formData.featured ? '✨ แสดงเป็นผลงานเด่น (Featured)' : 'ผลงานทั่วไป'}
                  </span>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 flex gap-5 mt-5 pt-[30px] border-t border-border-color">
                <button type="button" onClick={handleSave} className="flex-1 flex items-center justify-center gap-2.5 p-4 border-none rounded-[16px] text-base font-bold cursor-pointer transition-all duration-300 bg-primary text-white shadow-glow-primary hover:-translate-y-0.5 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" disabled={isLoading}>
                  <FaSave /> {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <button type="button" onClick={resetForm} className="flex-1 flex items-center justify-center gap-2.5 p-4 border rounded-[16px] text-base font-bold cursor-pointer transition-all duration-300 bg-transparent text-text-secondary border-border-color hover:bg-white/5 hover:text-white hover:border-text-primary disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
                  <FaTimes /> ยกเลิก
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* รายการผลงานแบบ Reorderable */}

        <div className="mt-[60px]">
          <h2 className="text-xl font-bold text-text-primary mb-[25px] flex items-baseline gap-3">
            รายการผลงานทั้งหมด ({works.length}) <small className="text-sm font-medium text-text-secondary opacity-70">(ลากเพื่อจัดลำดับ)</small>
          </h2>
          {works.length === 0 ? (
            <div className="text-center py-20 px-5 text-text-secondary bg-white/[0.02] rounded-[20px] border-2 border-dashed border-border-color">
              <p>ยังไม่มีผลงาน กรุณาเพิ่มผลงานใหม่</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-[50px_100px_2fr_1.5fr_80px_120px] px-5 pb-[15px] text-xs uppercase tracking-widest font-bold text-text-secondary opacity-70">
                <div className="flex justify-center items-center"></div>
                <div className="flex items-center">ประเภท</div>
                <div className="flex items-center">ชื่อผลงาน</div>
                <div className="flex items-center">หมวดหมู่</div>
                <div className="flex items-center justify-center">Featured</div>
                <div className="flex items-center justify-end">จัดการ</div>
              </div>

              <Reorder.Group axis="y" values={works} onReorder={setWorks} className="flex flex-col gap-3 list-none p-0 m-0">
                {works.map((work) => (
                  <Reorder.Item key={work.id} value={work} className="grid grid-cols-[50px_100px_2fr_1.5fr_80px_120px] p-5 border border-border-color rounded-[16px] bg-bg-tertiary backdrop-blur-[10px] text-text-secondary items-center cursor-grab transition-all duration-200 hover:bg-indigo-500/5 hover:border-primary hover:translate-x-1 active:cursor-grabbing active:scale-[0.99] group">
                    <div className="flex justify-center items-center">
                      <span className="text-xl text-text-secondary opacity-30 cursor-grab transition-opacity duration-200 group-hover:opacity-100"><FaBars /></span>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-[0.5px] uppercase border ${work.type === 'Graphic'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                        {work.type === 'Graphic' ? 'Graphic' : 'Video'}
                      </span>
                    </div>
                    <div className="font-medium text-[15px] text-text-primary">{work.title}</div>
                    <div className="">{work.category}</div>
                    <div className="flex justify-center items-center">
                      {work.featured ? (
                        <span className="inline-flex w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white items-center justify-center text-sm shadow-[0_2px_8px_rgba(245,158,11,0.4)]">✓</span>
                      ) : (
                        <span className="inline-block w-7 text-center text-text-secondary opacity-20">-</span>
                      )}
                    </div>
                    <div className="flex gap-2.5 justify-end">
                      <button onClick={() => handleEdit(work)} className="w-9 h-9 rounded-[10px] border-none flex items-center justify-center cursor-pointer transition-all duration-200 bg-indigo-500/10 text-indigo-400 hover:bg-primary hover:text-white">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(work.id)} className="w-9 h-9 rounded-[10px] border-none flex items-center justify-center cursor-pointer transition-all duration-200 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white">
                        <FaTrash />
                      </button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;
