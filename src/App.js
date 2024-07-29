
import React, { useState, useEffect } from 'react';
import QRScanner from './components/QRScanner';
import axios from 'axios';

const App = () => {
  const [sku, setSku] = useState('');
  const [amount, setAmount] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleScan = (text) => {
    const url = new URL(text);
    const pathParts = url.pathname.split('/');
    const skuNumber = pathParts[pathParts.length - 1].replace('.png', '');
    setSku(skuNumber);
    setMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { sku, amount, purchasePrice };
    axios.post('https://your-backend-api-endpoint.com/save', data)
      .then(response => setMessage('Data saved successfully!'))
      .catch(error => setMessage('Error saving data!'));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-md rounded-lg">
        {!manualEntry && <QRScanner onScan={handleScan} />}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center">
            <label htmlFor="manualEntry" className="text-sm font-medium text-gray-700">Manual Entry</label>
            <input type="checkbox" id="manualEntry" checked={manualEntry} onChange={() => setManualEntry(!manualEntry)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          </div>
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU</label>
            <input type="text" id="sku" value={sku} onChange={(e) => setSku(e.target.value)} readOnly={!manualEntry} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">Purchase Price</label>
            <input type="number" id="purchasePrice" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
          </div>
          <div>
            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700">
              Save
            </button>
          </div>
        </form>
        <div className={`mt-4 text-green-600 fade-in ${visible ? 'visible' : ''}`}>
          {message}
        </div>
      </div>
    </div>
  );
};

export default App;
