import { useRef, useState, useEffect, type MouseEvent, type TouchEvent } from 'react';
import Button from './Button';

interface ESignatureProps {
  onSign: (dataUrl: string) => void;
  signed: boolean;
}

export default function ESignature({ onSign, signed }: ESignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#262D33';
  }, []);

  function getPos(e: MouseEvent | TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDraw(e: MouseEvent | TouchEvent) {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    setDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e: MouseEvent | TouchEvent) {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasContent(true);
  }

  function endDraw() {
    setDrawing(false);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
  }

  function handleAccept() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSign(canvas.toDataURL());
  }

  return (
    <div>
      <p className="text-sm leading-[22px] text-qt-primary mb-2">E-Signature</p>
      <p className="text-xs text-qt-secondary mb-3">Draw your signature in the box below</p>
      <div className={`border-2 rounded-lg overflow-hidden ${signed ? 'border-qt-green' : 'border-qt-border'}`}>
        <canvas
          ref={canvasRef}
          width={560}
          height={120}
          className="w-full cursor-crosshair bg-white touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={clearSignature}
          className="text-sm text-qt-secondary hover:text-qt-primary cursor-pointer"
        >
          Clear
        </button>
        {hasContent && !signed && (
          <Button size="sm" onClick={handleAccept}>Accept signature</Button>
        )}
        {signed && (
          <span className="text-sm font-semibold text-qt-green-dark">Signature accepted</span>
        )}
      </div>
    </div>
  );
}
