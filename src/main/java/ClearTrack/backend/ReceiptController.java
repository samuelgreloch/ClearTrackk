package ClearTrack.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ReceiptController {

    @Autowired
    private ReceiptRepository receiptRepository;

    // Render the receipts page (HTML)
  /*  @GetMapping("/")
    public String displayReceiptsPage(Model model) {
        List<Receipt> receipts = receiptRepository.findAll();
        model.addAttribute("receipts", receipts);
        return "index"; // Points to src/main/resources/templates/index.html
    }*/

    // API Endpoint to fetch receipts (for Postman or other REST clients)
    @GetMapping("/api/receipts")
    @ResponseBody
    public List<Receipt> getReceipts() {
        return receiptRepository.findAll();
    }

    // API Endpoint to save receipt (for Postman or other REST clients)
    @PostMapping("/api/save")
    @ResponseBody
    public String saveReceipt(@RequestBody Receipt receipt) {
        receiptRepository.save(receipt);
        return "Receipt saved";
    }

    // API Endpoint to update receipt (for Postman or other REST clients)
    @PutMapping("/api/update/{id}")
    @ResponseBody
    public String updateReceipt(@PathVariable long id, @RequestBody Receipt receipt) {
        Receipt updatedReceipt = receiptRepository.findById(id).orElseThrow();
        updatedReceipt.setPrice(receipt.getPrice());
        updatedReceipt.setQuantity(receipt.getQuantity());
        updatedReceipt.setDate(receipt.getDate());
        updatedReceipt.setItemName(receipt.getItemName());
        updatedReceipt.setVendorName(receipt.getVendorName());
        updatedReceipt.setTotalPrice(receipt.getTotalPrice());
        receiptRepository.save(updatedReceipt);
        return "Receipt updated";
    }

    // API Endpoint to delete receipt (for Postman or other REST clients)
    @DeleteMapping("/api/delete/{id}")
    @ResponseBody
    public String deleteReceipt(@PathVariable long id) {
        Receipt deleteReceipt = receiptRepository.findById(id).orElseThrow();
        receiptRepository.delete(deleteReceipt);
        return "Receipt deleted with ID: " + id;
    }
}
