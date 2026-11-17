import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Download, Tv, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EventQRCode({ code, eventName = 'Family Event', size = 180, showControls = true }) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  const eventUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/event/${code}`
    : `https://genealogy.app/event/${code}`;

  const kioskUrl = `/kiosk/${code}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(eventUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const svgElement = qrRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size * 2;
    canvas.height = size * 2;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${eventName.replace(/\s+/g, '_')}_Event_QR_${code}.png`;
        downloadLink.href = pngUrl;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex flex-col items-center">
      {/* QR Code Container */}
      <div
        ref={qrRef}
        className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center hover:shadow-md transition-shadow"
      >
        <QRCodeSVG
          value={eventUrl}
          size={size}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: '/favicon.svg',
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>

      <p className="text-xs text-gray-400 mt-2 text-center">
        Scan to view and join event on mobile
      </p>

      {showControls && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 w-full">
          <button
            onClick={handleCopyLink}
            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-sm transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied!' : 'Copy Link'}
          </button>

          <button
            onClick={handleDownloadQR}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-sm transition-all"
            title="Download QR as PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PNG</span>
          </button>

          <Link
            to={kioskUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Tv className="w-3.5 h-3.5" />
            Launch Kiosk
          </Link>
        </div>
      )}
    </div>
  );
}

