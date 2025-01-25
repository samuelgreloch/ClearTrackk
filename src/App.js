// Importing necessary libraries
import React, { useState, useRef, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import Webcam from 'react-webcam';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

function App() {
    const [receipts, setReceipts] = useState([]);
    const [scanResult, setScanResult] = useState(null);
    const [timeFilter, setTimeFilter] = useState('day');
    const [useWebcam, setUseWebcam] = useState(false);
    const webcamRef = useRef(null);

    const handleAddReceipt = (event) => {
        const file = event.target.files[0];
        if (file) {
            processImage(file);
        }
    };

    const processImage = (image) => {
        Tesseract.recognize(image, 'eng', { logger: (info) => console.log(info) })
            .then(({ data: { text } }) => {
                const newReceipt = parseReceipt(text);
                setReceipts([...receipts, newReceipt]);
            })
            .catch((error) => console.error('Error scanning receipt:', error));
    };

    const parseReceipt = (text) => {
        const vendorMatch = text.match(/(.*Restaurant|.*Cafe|.*Diner)/i);
        const vendorName = vendorMatch ? vendorMatch[0] : 'Unknown Vendor';

        const dateMatch = text.match(/\d{2}\/\d{2}\/\d{4}/);
        const date = dateMatch ? new Date(dateMatch[0]) : new Date();

        const totalMatch = text.match(/TOTAL\s*\$([0-9\.]+)/i);
        const totalPrice = totalMatch ? parseFloat(totalMatch[1]) : 0;

        return {
            vendorName,
            date,
            totalPrice,
            rawText: text,
        };
    };

    const processDataForGraph = () => {
        const filteredReceipts = receipts.filter((receipt) => {
            const now = new Date();
            const receiptDate = new Date(receipt.date);

            if (timeFilter === 'day') {
                return now.toDateString() === receiptDate.toDateString();
            } else if (timeFilter === 'week') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return receiptDate >= oneWeekAgo;
            } else if (timeFilter === 'month') {
                return (
                    receiptDate.getMonth() === now.getMonth() &&
                    receiptDate.getFullYear() === now.getFullYear()
                );
            }
            return false;
        });

        const dataCounts = filteredReceipts.reduce((acc, receipt) => {
            const date = new Date(receipt.date).toDateString();
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        const totalSales = filteredReceipts.reduce((sum, receipt) => sum + receipt.totalPrice, 0);
        const totalReceipts = filteredReceipts.length;

        return {
            data: {
                labels: Object.keys(dataCounts),
                datasets: [
                    {
                        label: 'Receipts Scanned',
                        data: Object.values(dataCounts),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            summary: {
                totalSales,
                totalReceipts,
            },
        };
    };

    const captureFromWebcam = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        fetch(imageSrc)
            .then((res) => res.blob())
            .then((blob) => processImage(blob))
            .catch((error) => console.error('Error capturing webcam image:', error));
    }, [webcamRef]);

    return (
        <div>
            <h1>Restaurant Receipt Scanner</h1>

            <div>
                <button onClick={() => setUseWebcam(!useWebcam)}>
                    {useWebcam ? 'Use File Upload' : 'Use Webcam'}
                </button>
            </div>

            {useWebcam ? (
                <div>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width={400}
                        style={{ marginBottom: '20px' }}
                    />
                    <button onClick={captureFromWebcam}>Capture and Scan</button>
                </div>
            ) : (
                <div>
                    <input type="file" accept="image/*" onChange={handleAddReceipt} />
                    <p>Upload a vendor receipt to scan it.</p>
                </div>
            )}

            {scanResult && (
                <div>
                    <h2>Scan Result</h2>
                    <pre>{JSON.stringify(scanResult, null, 2)}</pre>
                </div>
            )}

            <div>
                <h2>Financial Insights</h2>
                <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
                    <p>
                        <strong>Total Sales:</strong> ${processDataForGraph().summary.totalSales.toFixed(2)}
                    </p>
                    <p>
                        <strong>Total Receipts Scanned:</strong> {processDataForGraph().summary.totalReceipts}
                    </p>
                </div>
            </div>

            <div>
                <h2>Receipts Graph</h2>
                <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                </select>

                <Bar data={processDataForGraph().data} />
            </div>
        </div>
    );
}

export default App;