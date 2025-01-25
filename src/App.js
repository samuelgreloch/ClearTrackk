import React, { useState, useRef, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import Webcam from 'react-webcam';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

function App() {
    const [receipts, setReceipts] = useState([]);
    const [timeFilter, setTimeFilter] = useState('day');
    const [useWebcam, setUseWebcam] = useState(false);
    const [editingReceipt, setEditingReceipt] = useState(null); // Track which receipt is being edited
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
                console.log("OCR Output:", text); // Log the OCR text for debugging
                const newReceipt = parseReceipt(text);
                setReceipts([...receipts, newReceipt]);
            })
            .catch((error) => console.error('Error scanning receipt:', error));
    };

    const parseReceipt = (text) => {
        console.log("Parsed OCR Text:", text);

        const vendorMatch = text.match(/Vendor[:\s]*(.*?)(\n|$)/i);
        const vendorName = vendorMatch ? vendorMatch[1].trim() : 'Unknown Vendor';

        const itemMatch = text.match(/Item[:\s]*(.*?)(\n|$)/i);
        const itemName = itemMatch ? itemMatch[1].trim() : (() => {
            const fallback = text.match(/^[A-Za-z\s]+$/gm);
            return fallback ? fallback[0].trim() : 'Unknown Item';
        })();

        const priceMatch = text.match(/Price[:\s]*([\d.]+)(\n|$)/i);
        const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

        const quantityMatch = text.match(/Quantity[:\s]*(\d+)(\n|$)/i);
        const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 0;

        const totalMatch = text.match(/Total[:\s]*([\d.]+)(\n|$)/i);
        const totalPrice = totalMatch ? parseFloat(totalMatch[1]) : price * quantity;

        const dateMatch = text.match(/Date[:\s]*(\d{2}[-/\.]\d{2}[-/\.]\d{2,4})(\n|$)/i);
        const date = dateMatch ? new Date(dateMatch[1]) : new Date();

        return {
            vendorName,
            itemName,
            price,
            quantity,
            totalPrice,
            date,
            rawText: text, // Keep raw text for debugging or additional processing
        };
    };

    const handleDeleteReceipt = (index) => {
        const updatedReceipts = receipts.filter((_, i) => i !== index);
        setReceipts(updatedReceipts);
    };

    const handleEditReceipt = (index) => {
        setEditingReceipt({ ...receipts[index], index });
    };

    const saveEditReceipt = () => {
        const updatedReceipts = receipts.map((receipt, i) =>
            i === editingReceipt.index ? editingReceipt : receipt
        );
        setReceipts(updatedReceipts);
        setEditingReceipt(null);
    };

    const addNewReceipt = () => {
        setReceipts([
            ...receipts,
            {
                vendorName: 'New Vendor',
                itemName: 'New Item',
                price: 0,
                quantity: 0,
                totalPrice: 0,
                date: new Date(),
            },
        ]);
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

        const priceTrends = receipts.map((receipt) => ({
            item: receipt.itemName,
            price: receipt.price,
            date: receipt.date.toDateString(),
        }));

        return {
            data: {
                labels: priceTrends.map((entry) => entry.date),
                datasets: [
                    {
                        label: 'Price per Unit',
                        data: priceTrends.map((entry) => entry.price),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            summary: filteredReceipts,
        };
    };

    const captureFromWebcam = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        fetch(imageSrc)
            .then((res) => res.blob())
            .then((blob) => processImage(blob))
            .catch((error) => console.error('Error capturing webcam image:', error));
    }, [webcamRef, processImage]);

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

            <div>
                <h2>Receipt Details</h2>
                <button onClick={addNewReceipt}>Add Receipt</button>
                <table border="1" style={{ marginBottom: '20px', width: '100%' }}>
                    <thead>
                    <tr>
                        <th>Vendor</th>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {receipts.map((receipt, index) => (
                        <tr key={index}>
                            <td>{receipt.vendorName}</td>
                            <td>{receipt.itemName}</td>
                            <td>${receipt.price.toFixed(2)}</td>
                            <td>{receipt.quantity}</td>
                            <td>${receipt.totalPrice.toFixed(2)}</td>
                            <td>{receipt.date.toDateString()}</td>
                            <td>
                                <button onClick={() => handleDeleteReceipt(index)}>Delete</button>
                                <button onClick={() => handleEditReceipt(index)}>Edit</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {editingReceipt && (
                <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
                    <h2>Edit Receipt</h2>
                    <label>
                        Vendor:
                        <input
                            type="text"
                            value={editingReceipt.vendorName}
                            onChange={(e) =>
                                setEditingReceipt({ ...editingReceipt, vendorName: e.target.value })
                            }
                        />
                    </label>
                    <br />
                    <label>
                        Item:
                        <input
                            type="text"
                            value={editingReceipt.itemName}
                            onChange={(e) =>
                                setEditingReceipt({ ...editingReceipt, itemName: e.target.value })
                            }
                        />
                    </label>
                    <br />
                    <label>
                        Price:
                        <input
                            type="number"
                            value={editingReceipt.price}
                            onChange={(e) =>
                                setEditingReceipt({ ...editingReceipt, price: parseFloat(e.target.value) || 0 })
                            }
                        />
                    </label>
                    <br />
                    <label>
                        Quantity:
                        <input
                            type="number"
                            value={editingReceipt.quantity}
                            onChange={(e) =>
                                setEditingReceipt({ ...editingReceipt, quantity: parseInt(e.target.value) || 0 })
                            }
                        />
                    </label>
                    <br />
                    <label>
                        Total:
                        <input
                            type="number"
                            value={editingReceipt.totalPrice}
                            onChange={(e) =>
                                setEditingReceipt({
                                    ...editingReceipt,
                                    totalPrice: parseFloat(e.target.value) || 0,
                                })
                            }
                        />
                    </label>
                    <br />
                    <label>
                        Date:
                        <input
                            type="date"
                            value={editingReceipt.date.toISOString().slice(0, 10)}
                            onChange={(e) =>
                                setEditingReceipt({
                                    ...editingReceipt,
                                    date: new Date(e.target.value),
                                })
                            }
                        />
                    </label>
                    <br />
                    <button onClick={saveEditReceipt}>Save</button>
                    <button onClick={() => setEditingReceipt(null)}>Cancel</button>
                </div>
            )}

            <div>
                <h2>Price Trends</h2>
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
