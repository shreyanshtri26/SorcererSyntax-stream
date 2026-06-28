import React, { useState, useEffect } from 'react';
import './DlhdIframeModal.css';

/**
 * DlhdIframeModal – displays a DLHD stream inside a fullscreen iframe.
 * Props:
 *   - isOpen: boolean – whether the modal is shown.
 *   - onClose: () => void – callback to close the modal.
 *   - streamId: string | number – the numeric ID of the stream (e.g. 1507).
 *   - folder?: string – default folder name.
 *   - iframeUrl?: string – direct embed URL.
 */
const DlhdIframeModal = ({ isOpen, onClose, streamId, folder = 'stream', iframeUrl = null }) => {
  const [currentFolder, setCurrentFolder] = useState(folder);

  // Sync folder prop when modal changes
  useEffect(() => {
    setCurrentFolder(folder);
  }, [isOpen, folder]);

  if (!isOpen) return null;

  const folders = ['stream', 'cast', 'watch', 'plus', 'casting', 'player'];
  const src = iframeUrl || (streamId && streamId.toString().startsWith('http') 
    ? streamId 
    : `https://dlhd.pk/${currentFolder}/stream-${streamId}.php`);

  return (
    <div className="dlhd-iframe-modal" role="dialog" aria-modal="true">
      <div className="dlhd-iframe-modal__overlay" onClick={onClose} />
      <div className="dlhd-iframe-modal__content">
        <header className="dlhd-iframe-modal__header">
          <div className="dlhd-modal-title">
            <h3>{iframeUrl ? 'Live Event Stream' : `Premium Stream (ID: ${streamId})`}</h3>
          </div>
          
          <div className="dlhd-modal-controls">
            {!iframeUrl && (
              <div className="folder-selector">
                <span>Source:</span>
                {folders.map(f => (
                  <button
                    key={f}
                    className={`folder-btn ${currentFolder === f ? 'active' : ''}`}
                    onClick={() => setCurrentFolder(f)}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            
            
            <button className="dlhd-iframe-modal__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        </header>

        <div className="iframe-container">
          <iframe
            src={src}
            title={`Live Stream`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
          />
        </div>
      </div>
    </div>
  );
};

export default DlhdIframeModal;
