package ClearTrack.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReceiptService {
    private final ReceiptRepository receiptRepository;

    @Autowired
    public ReceiptService(ReceiptRepository receiptRepository) {
        this.receiptRepository = receiptRepository;
    }

    public List<Receipt> getAllReceipts() {
        return receiptRepository.findAll(); // Returns all receipts from the database
    }

    public Receipt saveReceipt(Receipt receipt) {
        return receiptRepository.save(receipt); // Saves a receipt to the database
    }
}
