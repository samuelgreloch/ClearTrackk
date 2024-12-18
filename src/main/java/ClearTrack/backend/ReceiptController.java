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

    @PutMapping(value = "update/{id}")
    public String updateReceipt(@PathVariable long id, @RequestBody Receipt receipt) {
        Receipt updatedReceipt = receiptRepository.findById(id).get();
        updatedReceipt.setPrice(receipt.getPrice());
        updatedReceipt.setQuantity(receipt.getQuantity());
        updatedReceipt.setDate(receipt.getDate());
        updatedReceipt.setItemName(receipt.getItemName());
        updatedReceipt.setVendorName(receipt.getVendorName());
        updatedReceipt.setTotalPrice(receipt.getTotalPrice());
        receiptRepository.save(updatedReceipt);
        return "Receipt updated";
        }

        @DeleteMapping(value="delete/{id}")
        public String deleteReceipt(@PathVariable long id) {
         Receipt deleteReceipt = receiptRepository.findById(id).get();
         receiptRepository.delete(deleteReceipt);
         return "Receipt deleted"+ id;
        }


}
