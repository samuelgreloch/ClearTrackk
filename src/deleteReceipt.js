const deleteReceipt = async (id) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/delete/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.text();
        return result;
    } catch (error) {
        console.error('There was a problem with the delete operation:', error);
    }
};
