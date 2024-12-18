package ClearTrack.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@SpringBootApplication
@RestController
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

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
