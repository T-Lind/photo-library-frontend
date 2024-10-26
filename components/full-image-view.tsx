import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import api, { Image } from '@/lib/api'

interface FullImageViewProps {
    image: Image
    onClose: () => void
    showDate: boolean
}

export default function FullImageView({ image, onClose, showDate }: FullImageViewProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Full Image View</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-6 w-6" />
                    </Button>
                </div>
                <img
                    src={api.getImageUrl(image.image_id)}
                    alt={`Full size image from ${image.date}`}
                    className="w-full h-auto"
                />
                <div className="mt-4">
                    {showDate && (
                        <p className="text-sm text-gray-500">Date: {new Date(image.date).toLocaleDateString()}</p>
                    )}
                    <p className="text-sm text-gray-500">Location: {image.location}</p>
                </div>
            </div>
        </div>
    )
}
