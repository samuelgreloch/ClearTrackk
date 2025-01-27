const saveReceipt = async (receipt) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(receipt)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.text();
        return result;
    } catch (error) {
        console.error('There was a problem with the post operation:', error);
    }
};
