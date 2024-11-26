import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CameraCapture } from '@/components/CameraCapture';
import { CameraIcon } from '@heroicons/react/24/outline';

interface AddCardFormProps {
  onSubmit: (data: {
    fullName: string;
    company: string;
    email: string;
    phone: string;
    image: string | null;
  }) => void;
  onCancel: () => void;
}

export function AddCardForm({ onSubmit, onCancel }: AddCardFormProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form with image:', !!cardImage);
    onSubmit({ ...formData, image: cardImage });
  };

  const handleCapture = (imageData: string) => {
    console.log('Image captured, length:', imageData.length);
    setCardImage(imageData);
    setShowCamera(false);
  };

  const handleStartCamera = () => {
    console.log('Starting camera capture');
    setShowCamera(true);
  };

  const handleCancelCamera = () => {
    console.log('Canceling camera capture');
    setShowCamera(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {showCamera ? (
          <div className="bg-gray-50 -mx-6 -mt-6 p-6">
            <CameraCapture onCapture={handleCapture} />
            <div className="mt-4 flex justify-end">
              <Button type="button" variant="outline" onClick={handleCancelCamera}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {cardImage ? (
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={cardImage}
                  alt="Captured business card"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={handleStartCamera}
                >
                  Retake
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full h-32 flex flex-col items-center justify-center space-y-2"
                onClick={handleStartCamera}
              >
                <CameraIcon className="h-8 w-8" />
                <span>Capture Business Card</span>
              </Button>
            )}

            <Input
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
            <Input
              name="company"
              placeholder="Company"
              value={formData.company}
              onChange={handleInputChange}
            />
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <Input
              name="phone"
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        )}
      </div>

      {!showCamera && (
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!formData.fullName}>
            Save Card
          </Button>
        </div>
      )}
    </form>
  );
}
