package ClearTrack.backend;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ReceiptController {

    @Autowired
    private ReceiptRepository receiptRepository;

    @GetMapping("/")
    public String displayChartPage() {
        return "Welcome to ClearTrack";
    }

    @GetMapping(value = "/receipts")
    public List<Receipt> getReceipts() {
        return receiptRepository.findAll();
    }

    @PostMapping(value = "/save")
    public String saveReceipt(@RequestBody Receipt receipt) {
        receiptRepository.save(receipt);
        return "Receipt saved";
    }
}
