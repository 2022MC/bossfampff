import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUpload, FaSignOutAlt, FaBars } from 'react-icons/fa';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './AdminPage.css';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query } from 'firebase/firestore';

// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Removed Firebase Storage

// ... imports
import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const AdminPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const { logout: discordLogout } = useAuth(); // Renamed for clarity
  const { showNotification, showConfirm } = useNotification();
  const [works, setWorks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [activeTab, setActiveTab] = useState('Video'); // 'Video', 'Graphic', 'Migration'

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    type: 'Graphic', // Will be auto-set based on activeTab
    image: '',
    videoUrl: '',
    category: 'Graphic Design',
    tech: [],
    techInput: '',
    aspectRatio: '4/3',
    featured: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState(null); // For migration feedback

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

  // Set default type when tab changes
  useEffect(() => {
    if (activeTab === 'Video') {
      setFormData(prev => ({ ...prev, type: 'Video' }));
    } else if (activeTab === 'Graphic') {
      setFormData(prev => ({ ...prev, type: 'Graphic' }));
    }
    // Reload works when tab changes
    if (activeTab !== 'Migration') {
      loadWorks();
    }
  }, [activeTab]);

  // Helper to get collection name
  const getCollectionName = () => {
    return activeTab === 'Video' ? 'works_video' : 'works_graphic';
  };

  // โหลดข้อมูลจาก Firebase
  const loadWorks = React.useCallback(async () => {
    if (activeTab === 'Migration') return;

    setIsLoading(true);
    try {
      const collectionName = activeTab === 'Video' ? 'works_video' : 'works_graphic';
      // Fetch all works from the specific collection
      const q = query(collection(db, collectionName));
      const querySnapshot = await getDocs(q);
      const loadedWorks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by order (asc), fallback to createdAt (desc)
      loadedWorks.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 999999;
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
  }, [showNotification, activeTab]);

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
      const collectionName = getCollectionName();
      const updates = works.map((work, index) => {
        const workRef = doc(db, collectionName, work.id);
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

  // Migration Logic
  const handleMigration = async () => {
    if (!window.confirm("คุณต้องการย้ายข้อมูลจาก 'works' ไปยัง 'works_video' และ 'works_graphic' ใช่หรือไม่? (แนะนำให้ทำครั้งเดียว)")) return;

    setIsLoading(true);
    setMigrationStatus("กำลังเริ่มย้ายข้อมูล...");

    try {
      const oldWorksRef = collection(db, "works");
      const snapshot = await getDocs(oldWorksRef);

      let videoCount = 0;
      let graphicCount = 0;

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const targetCollection = data.type === 'Video' ? 'works_video' : 'works_graphic';

        // Add to new collection (using same ID if possible, or new ID)
        // Using addDoc creates new ID, setDoc would preserve ID but let's just create new ones to be safe and clean
        await addDoc(collection(db, targetCollection), data);

        if (data.type === 'Video') videoCount++;
        else graphicCount++;
      }

      setMigrationStatus(`ย้ายสำเร็จ! Video: ${videoCount}, Graphic: ${graphicCount}`);
      showNotification(`ย้ายข้อมูลสำเร็จ (Video: ${videoCount}, Graphic: ${graphicCount})`, 'success');

    } catch (error) {
      console.error("Migration failed:", error);
      setMigrationStatus("เกิดข้อผิดพลาดในการย้าย: " + error.message);
      showNotification("Migration Failed", 'error');
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

  // เพิ่ม tech tag
  const addTech = () => {
    if (formData.techInput.trim()) {
      setFormData({
        ...formData,
        tech: [...formData.tech, formData.techInput.trim()],
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
    setFormData({
      id: work.id,
      title: work.title || '',
      description: work.description || '',
      type: work.type || 'Graphic',
      image: work.image || '',
      videoUrl: work.videoUrl || '',
      category: work.category || 'Graphic Design',
      tech: work.tech || [],
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
        const collectionName = getCollectionName();
        await deleteDoc(doc(db, collectionName, id));
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
      if (activeTab === 'Graphic' && imageFile) {
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
      } else if (activeTab === 'Graphic' && !imageUrl) {
        // Check if existing image (editing) or validation fail
        if (!editingId) {
          showNotification('กรุณากรอกหรืออัพโหลดรูปภาพ', 'warning');
          setIsLoading(false);
          return;
        }
      }

      // Safety check: Don't save if image is still base64 (too large)
      if (activeTab === 'Graphic' && imageUrl && imageUrl.startsWith('data:image')) {
        showNotification("เกิดข้อผิดพลาด: ระบบพยายามบันทึกรูปภาพขนาดใหญ่เกินไป (Base64)", 'error');
        console.error("Attempted to save Base64 image to Firestore");
        setIsLoading(false);
        return;
      }

      if (activeTab === 'Video' && !formData.videoUrl.trim()) {
        showNotification('กรุณากรอกลิงก์วิดีโอ', 'warning');
        setIsLoading(false);
        return;
      }

      const workData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim() || 'Graphic Design',
        tech: formData.tech,
        size: { aspectRatio: formData.aspectRatio },
        featured: formData.featured,
        type: activeTab, // Explicitly set based on tab
        createdAt: Date.now()
      };

      if (activeTab === 'Graphic') {
        workData.image = imageUrl;
      } else {
        workData.videoUrl = formData.videoUrl.trim();
      }

      console.log("Saving to Firestore...", workData);
      const collectionName = getCollectionName();

      if (editingId) {
        // Update existing document
        const workRef = doc(db, collectionName, editingId);
        await updateDoc(workRef, workData);
      } else {
        // Add new document
        await addDoc(collection(db, collectionName), workData);
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
    <div className="admin-page">
      <Navbar scrollY={scrollY} />
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Admin Panel - จัดการผลงาน</h1>
          <div className="admin-header-actions">

            {/* Identity Verification Status */}
            {firebaseUser ? (
              <div className="auth-status active">
                <span className="auth-badge">✅ Verified: {firebaseUser.email}</span>
                <button className="btn-logout-firebase" onClick={handleFirebaseLogout} title="Lock Database">
                  🔒 Lock
                </button>
              </div>
            ) : (
              <div className="auth-status inactive">
                <span className="auth-badge warning">⚠️ Read-Only Mode</span>
                <button className="btn-verify" onClick={handleFirebaseLogin}>
                  🔐 Verify Identity
                </button>
              </div>
            )}

            <span className="divider">|</span>

            <button className="btn-logout" onClick={discordLogout} title="Logout">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'Video' ? 'active' : ''}`}
            onClick={() => setActiveTab('Video')}
          >
            🎥 Video Works
          </button>
          <button
            className={`tab-btn ${activeTab === 'Graphic' ? 'active' : ''}`}
            onClick={() => setActiveTab('Graphic')}
          >
            🎨 Graphic Works
          </button>
          <button
            className={`tab-btn ${activeTab === 'Migration' ? 'active' : ''}`}
            onClick={() => setActiveTab('Migration')}
            style={{ marginLeft: 'auto', backgroundColor: '#333' }}
          >
            ⚙️ Database Migration
          </button>
        </div>

        {/* Tab Actions (Only for Content Tabs) */}
        {activeTab !== 'Migration' && (
          <div className="tab-actions-bar">
            <button className="btn-save-order" onClick={handleSaveOrder} disabled={isLoading}>
              <FaSave /> บันทึกลำดับ ({activeTab})
            </button>
            <button className="btn-add" onClick={handleAddNew}>
              <FaPlus /> เพิ่มผลงาน {activeTab} ใหม่
            </button>
          </div>
        )}

        {/* ... (rest of the render same as before) */}
        {isLoading && <div className="loading-overlay">กำลังโหลด...</div>}

        {/* MIGRATION UI */}
        {activeTab === 'Migration' && (
          <div className="migration-container" style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginTop: '20px' }}>
            <h2>🔄 Database Migration Tool</h2>
            <p>เครื่องมือนี้จะทำการย้ายข้อมูลจาก Collection เก่า (`works`) ไปยัง Collection ใหม่แยกตามประเภท:</p>
            <ul style={{ listStyle: 'none', margin: '20px 0', opacity: 0.8 }}>
              <li>`works` (Video) ➡️ `works_video`</li>
              <li>`works` (Graphic) ➡️ `works_graphic`</li>
            </ul>
            <div style={{ padding: '20px', background: '#332b00', borderRadius: '8px', marginBottom: '20px', color: '#ffd700' }}>
              ⚠️ คำเตือน: ควรทำรายการนี้เพียงครั้งเดียวหลังจาก Backup ข้อมูลแล้ว
            </div>

            {migrationStatus && (
              <div className="migration-status" style={{ margin: '20px 0', fontSize: '1.2em', fontWeight: 'bold' }}>
                {migrationStatus}
              </div>
            )}

            <button
              onClick={handleMigration}
              className="btn-add"
              style={{ fontSize: '1.2rem', padding: '15px 40px', background: '#e91e63' }}
              disabled={isLoading}
            >
              🚀 เริ่มต้นการย้ายข้อมูล (Start Migration)
            </button>
          </div>
        )}

        {/* ฟอร์มเพิ่ม/แก้ไข (Show only if not migration) */}
        {showForm && activeTab !== 'Migration' && (
          <motion.div
            className="admin-form-container"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="admin-form-header">
              <h2>{editingId ? `แก้ไขผลงาน (${activeTab})` : `เพิ่มผลงานใหม่ (${activeTab})`}</h2>
              <button className="btn-close" onClick={resetForm}>
                <FaTimes />
              </button>
            </div>
            {/* ... Form Content ... */}
            <div className="admin-form">
              {/* REMOVED TYPE SELECTOR - Type is determined by Tab */}

              <div className="form-group">
                <label>ชื่อผลงาน *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="กรอกชื่อผลงาน"
                />
              </div>

              <div className="form-group">
                <label>คำอธิบาย *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="กรอกคำอธิบายผลงาน"
                  rows="3"
                />
              </div>

              {activeTab === 'Graphic' ? (
                <div className="form-group">
                  <label>รูปภาพ *</label>
                  <div className="image-upload-section">

                    <div
                      className={`upload-drop-zone ${isDragging ? 'dragging' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="drop-zone-content">
                        <FaUpload className="upload-icon-large" />
                        <p className="drop-text-main">ลากไฟล์มาวางที่นี่ หรือ คลิกเพื่อเลือกไฟล์</p>
                        <p className="drop-text-sub">รองรับ JPG, PNG, GIF</p>
                        <label className="btn-select-file">
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

                    <div className="or-divider">
                      <span>หรือใช้ลิงก์</span>
                    </div>

                    <div className="url-input-group">
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="วางลิงก์รูปภาพที่นี่..."
                        className="url-input"
                      />
                    </div>
                    {formData.image && (
                      <div className="image-preview">
                        <img src={formData.image} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label>ลิงก์วิดีโอ *</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="YouTube, Facebook, หรือ TikTok URL"
                  />
                  <small className="form-hint">รองรับ: YouTube, Facebook, TikTok</small>
                </div>
              )}


              <div className="form-group">
                <label>หมวดหมู่</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="เช่น Graphic Design, AI Art"
                />
              </div>

              <div className="form-group">
                <label>เทคโนโลยี/เครื่องมือ</label>
                <div className="tech-input-group">
                  <input
                    type="text"
                    value={formData.techInput}
                    onChange={(e) => setFormData({ ...formData, techInput: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addTech()}
                    placeholder="พิมพ์แล้วกด Enter หรือคลิกเพิ่ม"
                  />
                  <button type="button" onClick={addTech} className="btn-add-tech">เพิ่ม</button>
                </div>
                <div className="tech-tags">
                  {formData.tech.map((tech, index) => (
                    <span key={index} className="tech-tag-item">
                      {tech}
                      <button onClick={() => removeTech(index)} className="remove-tech">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Aspect Ratio</label>
                <select
                  value={formData.aspectRatio}
                  onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value })}
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

              <div className="form-group">
                <label style={{ marginBottom: '10px' }}>สถานะการแสดงผล</label>
                <div
                  className="toggle-switch-container"
                  onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                >
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </div>
                  <span className="toggle-label">
                    {formData.featured ? '✨ แสดงเป็นผลงานเด่น (Featured)' : 'ผลงานทั่วไป'}
                  </span>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleSave} className="btn-save" disabled={isLoading}>
                  <FaSave /> {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <button type="button" onClick={resetForm} className="btn-cancel" disabled={isLoading}>
                  <FaTimes /> ยกเลิก
                </button>
              </div>
            </div>
            {/* ... End Form Content ... */}

          </motion.div>
        )}

        {/* รายการผลงานแบบ Reorderable */}
        {activeTab !== 'Migration' && (
          <div className="works-list">
            <h2>รายการผลงาน {activeTab} ทั้งหมด ({works.length}) <small>(ลากเพื่อจัดลำดับ)</small></h2>
            {works.length === 0 ? (
              <div className="empty-state">
                <p>ยังไม่มีผลงาน {activeTab} กรุณาเพิ่มผลงานใหม่</p>
              </div>
            ) : (
              <div className="works-reorder-container">
                <div className="works-header-row">
                  <div className="col-drag"></div>
                  <div className="col-type">ประเภท</div>
                  <div className="col-title">ชื่อผลงาน</div>
                  <div className="col-category">หมวดหมู่</div>
                  <div className="col-featured">Featured</div>
                  <div className="col-actions">จัดการ</div>
                </div>

                <Reorder.Group axis="y" values={works} onReorder={setWorks} className="works-reorder-group">
                  {works.map((work) => (
                    <Reorder.Item key={work.id} value={work} className="work-reorder-item">
                      <div className="col-drag">
                        <span className="drag-handle"><FaBars /></span>
                      </div>
                      <div className="col-type">
                        <span className={`type-badge ${work.type === 'Graphic' ? 'graphic' : 'video'}`}>
                          {work.type === 'Graphic' ? 'Graphic' : 'Video'}
                        </span>
                      </div>
                      <div className="col-title">{work.title}</div>
                      <div className="col-category">{work.category}</div>
                      <div className="col-featured">
                        {work.featured ? (
                          <span className="featured-badge">✓</span>
                        ) : (
                          <span className="featured-badge-empty">-</span>
                        )}
                      </div>
                      <div className="col-actions">
                        <button onClick={() => handleEdit(work)} className="btn-edit">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(work.id)} className="btn-delete">
                          <FaTrash />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;
