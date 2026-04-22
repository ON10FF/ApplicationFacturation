import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function SignaturePad({ onSave }) {
  const sigCanvas = useRef({});
  // eslint-disable-next-line no-unused-vars
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigCanvas.current.clear();
    setIsEmpty(true);
    onSave(null);
  };

  const save = () => {
    if (sigCanvas.current.isEmpty()) return;
    // getTrimmedCanvas enlève les marges blanches = image plus légère !
    const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    setIsEmpty(false);
    onSave(dataUrl);
  };

  return (
    <div className="border border-gray-300 rounded p-2 max-w-sm">
      <p className="text-sm text-gray-500 mb-2">Signature du client ou du vendeur :</p>
      <SignatureCanvas 
        ref={sigCanvas}
        onEnd={save}
        penColor="blue"
        canvasProps={{ className: 'w-full h-32 bg-gray-50 border border-dashed rounded' }}
      />
      <button type="button" onClick={clear} className="text-red-500 text-sm mt-2">
        Effacer la signature
      </button>
    </div>
  );
}