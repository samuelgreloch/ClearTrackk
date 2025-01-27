const fetchReceipts = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/receipts`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const receipts = await response.json();
        return receipts;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
};
