import logo from './logo.svg';
import './App.css';
import Tesseract from 'tesseract.js';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import {useState} from "react";

function App(){
    const [receipts, setReceipts] = useState([]);
    const [scanResult, setScanResult] = useState(null);
    const [timeFilter, setTimeFilter] = useState('day');

    const handleAddReceipt = (event) => {
        const file = event.targret.files[0];
        if (file) {
            Tesseract.recognize(file, 'eng',{logger: (info)=> console.log(info)
            })
                .then(({data: { text } })=> {
                    const newReceipt = { text, data: new Date() };
                    setReceipts ([...receipts, newReceipt]);
                })
                .catch((error)=> console.error('Error scanning receipt:', error));
        }
    };

    const processDataForGraph = () => {
        const filteredReceipts = receipts.filter((receipt) => {
            const now = new Date();
            const receiptDate = new Date(receipt.date);
            if (timeFilter === 'day') {
                return (
                    now.toDateString() === receiptDate.DateString()
                );
            } else if (timeFilter === 'week') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate()-7);
                return receiptDate >= oneWeekAgo;
            }   else if (timeFilter === 'month'){
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

        return {
            labels: Object.keys(dataCounts),
            datasets: [
                {
                    label: 'Receipts Scanned',
                    data: Object.values(dataCounts),
                    backgroundColor: 'rgba(75,192,192,0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };

    return (
        <div>
            <h1>Restaurant Receipt Scanner</h1>

            <div>
                <input type="file" accept="image/*" onChange={handleAddReceipt} />
                <p>Upload a vendor receipt to scan it.</p>
            </div>

            {scanResult && (
                <div>
                    <h2>Scan Result</h2>
                    <pre>{scanResult}</pre>
                </div>
            )}

            <div>
                <h2>Receipts Graph</h2>
                <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                </select>

                <Bar data={processDataForGraph()} />
            </div>
        </div>
    );
}

export default App;

