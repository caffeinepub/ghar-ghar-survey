import { Button } from "@/components/ui/button";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface SignaturePadHandle {
  getSignature: () => string;
  clear: () => void;
  isEmpty: () => boolean;
}

interface Props {
  value?: string;
  onChange?: (base64: string) => void;
}

const SignaturePad = forwardRef<SignaturePadHandle, Props>(
  ({ value, onChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const lastPos = useRef<{ x: number; y: number } | null>(null);
    const cachedRect = useRef<DOMRect | null>(null);
    const [empty, setEmpty] = useState(true);
    const [touched, setTouched] = useState(false);

    useImperativeHandle(ref, () => ({
      getSignature: () => {
        const canvas = canvasRef.current;
        if (!canvas) return "";
        return canvas.toDataURL("image/png");
      },
      clear: () => clearCanvas(),
      isEmpty: () => empty,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (value) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setEmpty(false);
        };
        img.src = value;
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setEmpty(true);
        setTouched(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const getPos = (e: TouchEvent | MouseEvent) => {
        const rect = cachedRect.current ?? canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if ("touches" in e && e.touches.length > 0) {
          return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY,
          };
        }
        return {
          x: ((e as MouseEvent).clientX - rect.left) * scaleX,
          y: ((e as MouseEvent).clientY - rect.top) * scaleY,
        };
      };

      const drawLine = (
        from: { x: number; y: number },
        to: { x: number; y: number },
      ) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = "#1a1a2e";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      };

      const onStart = (e: TouchEvent | MouseEvent) => {
        e.preventDefault();
        cachedRect.current = canvas.getBoundingClientRect();
        isDrawing.current = true;
        lastPos.current = getPos(e);
        setTouched(true);
      };

      const onMove = (e: TouchEvent | MouseEvent) => {
        e.preventDefault();
        if (!isDrawing.current || !lastPos.current) return;
        const pos = getPos(e);
        drawLine(lastPos.current, pos);
        lastPos.current = pos;
        setEmpty(false);
      };

      const onEnd = (e: TouchEvent | MouseEvent) => {
        e.preventDefault();
        if (isDrawing.current) {
          isDrawing.current = false;
          lastPos.current = null;
          cachedRect.current = null;
          onChange?.(canvas.toDataURL("image/png"));
        }
      };

      const opts: AddEventListenerOptions = { passive: false };
      canvas.addEventListener("touchstart", onStart, opts);
      canvas.addEventListener("touchmove", onMove, opts);
      canvas.addEventListener("touchend", onEnd, opts);
      canvas.addEventListener("mousedown", onStart, opts);
      canvas.addEventListener("mouseup", onEnd, opts);
      canvas.addEventListener("mouseleave", onEnd, opts);

      const onMouseMove = (e: MouseEvent) => {
        if (isDrawing.current) onMove(e);
      };
      canvas.addEventListener("mousemove", onMouseMove, opts);

      return () => {
        canvas.removeEventListener("touchstart", onStart);
        canvas.removeEventListener("touchmove", onMove);
        canvas.removeEventListener("touchend", onEnd);
        canvas.removeEventListener("mousedown", onStart);
        canvas.removeEventListener("mouseup", onEnd);
        canvas.removeEventListener("mouseleave", onEnd);
        canvas.removeEventListener("mousemove", onMouseMove);
      };
    }, [onChange]);

    const clearCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setEmpty(true);
        setTouched(false);
        onChange?.("");
      }
    };

    return (
      <div className="space-y-2">
        <div
          className="border-2 border-dashed border-primary/40 rounded-lg overflow-hidden bg-white"
          style={{ touchAction: "none" }}
        >
          <canvas
            ref={canvasRef}
            width={600}
            height={180}
            className="signature-canvas w-full block"
            data-ocid="survey.signature.canvas_target"
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            यहाँ हस्ताक्षर करें (उँगली या माउस से)
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearCanvas}
          >
            साफ़ करें
          </Button>
        </div>
        {touched && empty && (
          <p className="text-xs text-destructive">हस्ताक्षर आवश्यक है</p>
        )}
      </div>
    );
  },
);

SignaturePad.displayName = "SignaturePad";
export default SignaturePad;
