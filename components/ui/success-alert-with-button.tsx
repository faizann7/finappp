import { Button } from "@/components/ui/button";
import { CircleCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

interface NotificationDemoProps {
    message: string;
    onClose: () => void;
}

function NotificationDemo({ message, onClose }: NotificationDemoProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for the transition to finish before calling onClose
        }, 2000); // Auto-dismiss after 2 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`fixed top-4 right-4 z-[100] max-w-[400px] rounded-lg border border-border bg-background px-4 py-3 shadow-lg shadow-black/5 transition-opacity duration-300 transform-gpu ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-20px]'}`}
        >
            <div className="flex gap-2">
                <p className="grow text-sm">
                    <CircleCheck
                        className="-mt-0.5 me-3 inline-flex text-emerald-500"
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                    />
                    {message}
                </p>
                <Button
                    variant="ghost"
                    className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
                    aria-label="Close notification"
                    onClick={onClose}
                >
                    <X
                        size={16}
                        strokeWidth={2}
                        className="opacity-60 transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                    />
                </Button>
            </div>
        </div>
    );
}

export { NotificationDemo };