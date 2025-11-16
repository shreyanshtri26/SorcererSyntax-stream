import React, { useState } from 'react';
import './ShareButtons.css';

const ShareButtons = ({ url, title, currentTheme = 'devil' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setTooltipMessage('Link copied!');
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setTooltipMessage('Failed to copy');
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      });
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out ${title}: ${url}`);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Check out ${title}`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`share-buttons theme-${currentTheme}`}>
      <button
        className="share-btn copy-btn"
        onClick={handleCopyLink}
        title="Copy link"
        aria-label="Copy link to clipboard"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
        </svg>
        <span>Copy</span>
      </button>

      <button
        className="share-btn whatsapp-btn"
        onClick={handleWhatsAppShare}
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span>WhatsApp</span>
      </button>

      <button
        className="share-btn twitter-btn"
        onClick={handleTwitterShare}
        title="Share on Twitter"
        aria-label="Share on Twitter"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
        </svg>
        <span>Twitter</span>
      </button>

      <button
        className="share-btn facebook-btn"
        onClick={handleFacebookShare}
        title="Share on Facebook"
        aria-label="Share on Facebook"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span>Facebook</span>
      </button>

      {showTooltip && (
        <div className="share-tooltip" role="alert">
          {tooltipMessage}
        </div>
      )}
    </div>
  );
};

export default ShareButtons;
