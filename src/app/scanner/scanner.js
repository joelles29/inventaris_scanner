import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

const Scanner = () => {
    const [sku, setSku] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);
    const [purchasePrice, setPurchasePrice] = useState<number>(0);

    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "environment"
    };

    const fetchPrice = useCallback(async (sku: string) => {
        try {
            const response = await fetch('/api/getPrice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sku })
            });
            if (response.ok) {
                const data = await response.json() as { price: number };
                setPrice(data.price);
            } else {
                console.error('Failed to fetch price');
            }
        } catch (error) {
            console.error('Error fetching price:', error);
        }
    }, []);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            const image = new Image();
            image.src = imageSrc;
            image.onload = () => {
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                if (context) {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    if (code) {
                        console.log('QR Code Content:', code.data);
                        fetchPrice(code.data);
                    } else {
                        console.log('No QR code detected.');
                    }
                }
            };
        }
    }, [fetchPrice]);

    useEffect(() => {
        const interval = setInterval(capture, 100);
        return () => clearInterval(interval);
    }, [capture]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Plant Label Scanner</h1>
            {/* Further JSX elements representing the UI */}
        </div>
    );
};

export default Scanner;
