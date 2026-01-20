import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMusic, FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import './MusicPlayer.css';

const MusicPlayer = () => {
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [volume, setVolume] = useState(0.5);
    // Default: Lofi Girl - lofi hip hop radio
    const streamUrl = 'https://youtu.be/WdltGaVA1sI?si=4k3-iThXyYThJqSW';

    const togglePlay = (e) => {
        e.stopPropagation();
        setPlaying(!playing);
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        setMuted(!muted);
    };

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    return (
        <div className={`music-player-container ${expanded ? 'expanded' : ''}`}>
            {/* Hidden Player */}
            {/* Hidden Player - keeping it rendered but off-screen */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                <ReactPlayer
                    url={streamUrl}
                    playing={playing}
                    muted={muted}
                    volume={volume}
                    width="0"
                    height="0"
                    playsinline={true}
                />
            </div>

            <motion.div
                className="music-player-widget"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                onClick={toggleExpand}
            >
                {/* Minimized View (Always visible parts) */}
                <div className="player-header">
                    <div className={`visualizer-icon ${playing ? 'animating' : ''}`}>
                        <span></span><span></span><span></span><span></span>
                    </div>
                    <div className="player-info">
                        <span className="player-label">Web Radio</span>
                        <span className="player-status">{playing ? 'Now Playing' : 'Paused'}</span>
                    </div>
                    {/* Quick Controls (visible even when collapsed sometimes, or customizable) 
               For now, we keep main controls in body or just play/pause on header?
               Let's put a mini play button on header.
           */}
                    <button className="btn-mini-control" onClick={togglePlay}>
                        {playing ? <FaPause /> : <FaPlay />}
                    </button>
                </div>

                {/* Expanded Controls */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            className="player-controls-expanded"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <div className="track-info">
                                <span className="track-name">Lofi Girl Radio</span>
                                <span className="track-desc">Beats to relax/study to</span>
                            </div>

                            <div className="control-row">
                                <button className="btn-control" onClick={toggleMute}>
                                    {muted ? <FaVolumeMute /> : <FaVolumeUp />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={volume}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="volume-slider"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default MusicPlayer;
