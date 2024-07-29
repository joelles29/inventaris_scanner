
import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

const QRScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReader.listVideoInputDevices()
      .then((videoInputDevices) => {
        codeReader.decodeFromVideoDevice(videoInputDevices[0].deviceId, videoRef.current, (result, error) => {
          if (result) {
            onScan(result.getText());
          }
        });
      })
      .catch((err) => console.error(err));

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream, onScan]);

  return (
    <div className="w-full aspect-w-16 aspect-h-9">
      <video ref={videoRef} className="w-full h-full object-cover" />
    </div>
  );
};

export default QRScanner;
