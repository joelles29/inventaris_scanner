import { useState, useRef, useCallback, useEffect, use } from 'react';
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

    const baseWidth = 1280;
    const baseHeight = 720;
    const scaleFactor = Math.min(10, 2000 / baseWidth);
    const scaledWidth = Math.floor(baseWidth * scaleFactor);
    const scaledHeight = Math.floor(baseHeight * scaleFactor);

    const videoConstraints = {
        width: scaledWidth,
        height: scaledHeight,
        zoom: 5,
        facingMode: "environment"
    };

    const fetchPrice = useCallback(async (sku: string) => {
        try {
            const response = await fetch(`https://www.plant-trace.online/${sku}.html`);
            if (response.ok) {
                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                const priceElement = doc.querySelector('.detail-item .detail-value');
                if (priceElement) {
                    const priceText = priceElement.textContent?.replace(/[^0-9.]/g, '');
                    if (priceText) {
                        setPrice(parseFloat(priceText));
                    } else {
                        console.error('Price not found in the page');
                    }
                } else {
                    console.error('Price element not found in the page');
                }
            } else {
                console.error('Failed to fetch the page');
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
                if (canvas) {
                    const context = canvas.getContext('2d');
                    if (context) {
                        canvas.width = image.width;
                        canvas.height = image.height;
                        context.drawImage(image, 0, 0, canvas.width, canvas.height);
                        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height);
                        if (code) {
                            console.log('QR Code Content:', code.data);
                            context.beginPath();
                            context.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
                            context.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
                            context.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
                            context.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
                            context.closePath();
                            context.lineWidth = 5;
                            context.strokeStyle = 'green';
                            context.stroke();

                            const regex = /\/(sku\d+)\.\w+$/i;
                            const match = code.data.match(regex);
                            if (match) {
                                const detectedSku = match[1];
                                setSku(detectedSku);
                                fetchPrice(detectedSku);
                            } else {
                                setSku('SKU not found');
                            }
                        } else {
                            console.log('No QR code detected.');
                        }
                    }
                }
            };
        }
    }, [webcamRef, fetchPrice]);

    useEffect(() => {
        const interval = setInterval(() => {
            capture();
        }, 70); // Set interval to 70ms for faster scanning

        return () => clearInterval(interval);
    }, [capture]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const payload = {
            id: uuidv4(),
            InsertDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
            sku,
            matched_current_stock: 1,
            foreign_object_id: 123
        };

        try {
            const response = await fetch('/api/your-endpoint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Success:', result);
                alert('Data submitted successfully');
            } else {
                console.error('Error:', response.statusText);
                alert('Failed to submit data');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting data');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-purple-900 text-white">
            <h1 className="text-3xl font-bold mb-8">Plant Label Scanner</h1>
            <div className="relative w-24 h-24">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    width={100}
                    height={100}
                    className="w-full h-full rounded-lg border-2 border-gray-300 bg-gray-800"
                />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                />
            </div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4 bg-gray-800 bg-opacity-75 p-6 rounded-lg shadow-lg">
                <div>
                    <label htmlFor="sku" className="block text-sm font-medium">SKU:</label>
                    <input
                        type="text"
                        id="sku"
                        className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:border-indigo-500"
                        value={sku}
                        readOnly
                    />
                </div>
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium">Quantity:</label>
                    <input
                        type="number"
                        id="quantity"
                        className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:border-indigo-500"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium">Price:</label>
                    <input
                        type="number"
                        id="price"
                        step="0.01"
                        className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:border-indigo-500"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                    />
                </div>
                <div>
                    <label htmlFor="purchasePrice" className="block text-sm font-medium">Purchase Price:</label>
                    <input
                        type="number"
                        id="purchasePrice"
                        step="0.01"
                        className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:border-indigo-500"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    />
                </div>
                <button type="submit" className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md">Submit</button>
            </form>
        </div>
    );
};

export default Scanner;
