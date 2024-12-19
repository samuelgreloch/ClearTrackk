package ClearTrack.frontend;

import ClearTrack.backend.Receipt;
import ClearTrack.backend.ReceiptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class ReceiptViewController {

    @Autowired
    private ReceiptRepository receiptRepository;

    // Render the receipts page (HTML)
    @GetMapping("/frontend")
    public String displayReceiptsPage(Model model) {
        List<Receipt> receipts = receiptRepository.findAll();
        model.addAttribute("receipts", receipts);
        return "index";  // This will render src/main/resources/templates/index.html
    }

    // Handle the form submission for adding a new receipt
    @PostMapping("/save")
    public String saveReceipt(@ModelAttribute Receipt receipt) {
        receiptRepository.save(receipt);
        return "redirect:/";  // After saving, redirect to the home page
    }

    // Handle the delete action for a receipt
    @GetMapping("/delete/{id}")
    public String deleteReceipt(@PathVariable long id) {
        receiptRepository.deleteById(id);
        return "redirect:/";  // Redirect to the home page after deleting
    }
}
