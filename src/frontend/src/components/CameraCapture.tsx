import { Button } from "@/components/ui/button";
import { Camera, Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { useCamera } from "../camera/useCamera";

interface Props {
  value?: string;
  onChange?: (base64: string) => void;
}

export default function CameraCapture({ value, onChange }: Props) {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string>(value || "");

  const {
    isActive,
    isSupported,
    error,
    isLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: "environment",
    quality: 0.85,
    format: "image/jpeg",
  });

  const handleOpenCamera = async () => {
    setShowCamera(true);
    await startCamera();
  };

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCapturedPhoto(base64);
        onChange?.(base64);
        stopCamera();
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    stopCamera();
    setShowCamera(false);
  };

  const handleRetake = () => {
    setCapturedPhoto("");
    onChange?.("");
    handleOpenCamera();
  };

  if (isSupported === false) {
    return (
      <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
        इस डिवाइस पर कैमरा उपलब्ध नहीं है
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {capturedPhoto ? (
        <div className="relative">
          <img
            src={capturedPhoto}
            alt="Captured"
            className="w-full max-h-48 object-cover rounded-lg border border-border"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2 w-full"
            onClick={handleRetake}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            पुनः फोटो लें
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-16 border-dashed border-2 border-primary/40 text-primary"
          onClick={handleOpenCamera}
          data-ocid="survey.photo.upload_button"
        >
          <Camera className="w-5 h-5 mr-2" />
          लाइव फोटो खींचें
        </Button>
      )}

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black/80">
            <span className="text-white text-sm font-medium">फोटो लें</span>
            <button
              type="button"
              onClick={handleClose}
              className="text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {error && (
            <div className="p-4 bg-red-900 text-white text-sm">
              त्रुटि: {error.message}
            </div>
          )}

          <div className="p-6 bg-black/80 flex justify-center">
            <button
              type="button"
              onClick={handleCapture}
              disabled={isLoading || !isActive}
              className="w-16 h-16 rounded-full bg-white disabled:opacity-50 flex items-center justify-center"
            >
              <Check className="w-8 h-8 text-black" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
