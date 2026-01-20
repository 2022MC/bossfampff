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

        <div className="tab-actions-bar">
          <button className="btn-save-order" onClick={handleSaveOrder} disabled={isLoading}>
            <FaSave /> บันทึกลำดับ
          </button>
          <button className="btn-add" onClick={handleAddNew}>
            <FaPlus /> เพิ่มผลงานใหม่
          </button>
        </div>

        {isLoading && <div className="loading-overlay">กำลังโหลด...</div>}

        {/* ฟอร์มเพิ่ม/แก้ไข */}
        {showForm && (
          <motion.div
            className="admin-form-container"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="admin-form-header">
              <h2>{editingId ? `แก้ไขผลงาน` : `เพิ่มผลงานใหม่`}</h2>
              <button className="btn-close" onClick={resetForm}>
                <FaTimes />
              </button>
            </div>

            <div className="admin-form">
              <div className="form-group">
                <label>ประเภทผลงาน *</label>
                <div className="type-selector">
                  <button
                    type="button"
                    className={`type-btn ${formData.type === 'Graphic' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, type: 'Graphic' })}
                  >
                    🎨 Graphic
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${formData.type === 'Video' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, type: 'Video' })}
                  >
                    🎥 Video
                  </button>
                </div>
              </div>

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

              {formData.type === 'Graphic' ? (
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
                <div className="color-selector">
                  {TAG_COLORS.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      className={`color-btn ${selectedColor === color.hex ? 'active' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setSelectedColor(color.hex)}
                      title={color.name}
                    />
                  ))}

                  {/* Custom Color Button */}
                  <label
                    className={`color-btn custom-color-btn ${!TAG_COLORS.some(c => c.hex === selectedColor) ? 'active' : ''}`}
                    title="Custom Color"
                  >
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                    />
                    <div className="rainbow-bg"></div>
                  </label>
                </div>

                <div className="tech-input-group">
                  <input
                    type="text"
                    value={formData.techInput}
                    onChange={(e) => setFormData({ ...formData, techInput: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addTech()}
                    placeholder="พิมพ์ชื่อเครื่องมือ..."
                  />
                  <button type="button" onClick={addTech} className="btn-add-tech">เพิ่ม</button>
                </div>
                <div className="tech-tags">
                  {formData.tech.map((tech, index) => {
                    const techName = typeof tech === 'string' ? tech : tech.name;
                    const techColor = typeof tech === 'string' ? '#3B82F6' : tech.color;

                    return (
                      <span
                        key={index}
                        className="tech-tag-item"
                        style={{
                          backgroundColor: `${techColor}20`,
                          color: techColor,
                          borderColor: `${techColor}50`
                        }}
                      >
                        {/* Hidden Color Picker for Direct Editing */}
                        <input
                          type="color"
                          value={techColor}
                          onChange={(e) => updateTagColor(index, e.target.value)}
                          className="tag-color-picker"
                          title="Click to change color"
                        />

                        {techName}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent color picker trigger if clicking remove
                            removeTech(index);
                          }}
                          className="remove-tech"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
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
          </motion.div>
        )}

        {/* รายการผลงานแบบ Reorderable */}

        <div className="works-list">
          <h2>รายการผลงานทั้งหมด ({works.length}) <small>(ลากเพื่อจัดลำดับ)</small></h2>
          {works.length === 0 ? (
            <div className="empty-state">
              <p>ยังไม่มีผลงาน กรุณาเพิ่มผลงานใหม่</p>
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
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;
