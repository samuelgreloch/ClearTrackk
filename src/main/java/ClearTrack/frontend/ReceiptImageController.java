package ClearTrack.frontend;

import ClearTrack.backend.Receipt;
import ClearTrack.backend.ReceiptRepository;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.Objects;

@Controller
@RequestMapping("/receipt-image")
public class ReceiptImageController {

    @Autowired
    private ReceiptRepository receiptRepository;

    /**
     * Serve the Combine.html page.
     *
     * @return the name of the HTML file without the extension
     */
    @GetMapping("/combine")
    public String getCombinePage() {
        return "Combine"; // Spring will look for Combine.html in src/main/resources/templates
    }

    /**
     * Handle the receipt image upload and OCR processing.
     *
     * @param file the uploaded image file
     * @return a JSON response indicating success or failure
     */
    @PostMapping("/process")
    @ResponseBody
    public String processReceiptImage(@RequestParam("receiptImage") MultipartFile file) {
        // Validate if the file is not empty and is an image
        if (file.isEmpty() || !isImageFile(file)) {
            return "{\"success\": false, \"error\": \"Invalid file format or empty file.\"}";
        }

        // Save the uploaded file temporarily
        String tempDir = System.getProperty("java.io.tmpdir");
        Path tempFilePath = Path.of(tempDir, file.getOriginalFilename());

        try {
            Files.copy(file.getInputStream(), tempFilePath, StandardCopyOption.REPLACE_EXISTING);

            // Perform OCR using Tesseract
            ITesseract tesseract = new Tesseract();
            tesseract.setDatapath("/path/to/tessdata"); // Make sure this path is correct
            String extractedText = tesseract.doOCR(tempFilePath.toFile());

            System.out.println("OCR Extracted Text: \n" + extractedText);  // Log OCR output for debugging

            // Map the extracted text to a Receipt object
            Receipt receipt = mapTextToReceipt(extractedText);

            // Log the mapped receipt object for debugging
            System.out.println("Mapped Receipt: " + receipt);

            // Save or update the Receipt to the database
            receiptRepository.save(receipt); // This will update if the ID already exists or insert a new record

            // Delete the temporary file
            Files.delete(tempFilePath);

            return "{\"success\": true}";
        } catch (IOException e) {
            e.printStackTrace();
            return "{\"success\": false, \"error\": \"File processing failed: " + e.getMessage() + "\"}";
        } catch (TesseractException e) {
            e.printStackTrace();
            return "{\"success\": false, \"error\": \"OCR processing failed: " + e.getMessage() + "\"}";
        }
    }

    /**
     * Validate if the uploaded file is an image based on content type.
     *
     * @param file the uploaded file
     * @return true if the file is an image, false otherwise
     */
    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null &&
                (contentType.startsWith("image/") || Objects.requireNonNull(file.getOriginalFilename()).matches(".*\\.(png|jpg|jpeg|bmp|tiff)$"));
    }

    /**
     * Map the OCR-extracted text to a Receipt object.
     *
     * @param extractedText the text extracted from the image
     * @return a Receipt object populated with the extracted data
     */
    private Receipt mapTextToReceipt(String extractedText) {
        Receipt receipt = new Receipt();
        String[] lines = extractedText.split("\n");

        for (String line : lines) {
            if (line.startsWith("Vendor:")) {
                String vendorName = line.replace("Vendor:", "").trim();
                receipt.setVendorName(vendorName.isEmpty() ? "Unknown Vendor" : vendorName);
                System.out.println("Mapped Vendor: " + vendorName); // Log mapped value
            } else if (line.startsWith("Item:")) {
                String itemName = line.replace("Item:", "").trim();
                receipt.setItemName(itemName.isEmpty() ? "Unknown Item" : itemName);
                System.out.println("Mapped Item: " + itemName); // Log mapped value
            } else if (line.startsWith("Price:")) {
                try {
                    double price = Double.parseDouble(line.replace("Price:", "").trim());
                    receipt.setPrice(price);
                    System.out.println("Mapped Price: " + price); // Log mapped value
                } catch (NumberFormatException e) {
                    receipt.setPrice(0.0); // Default value if parsing fails
                    System.out.println("Failed to map Price, set to default: 0.0");
                }
            } else if (line.startsWith("Quantity:")) {
                try {
                    int quantity = Integer.parseInt(line.replace("Quantity:", "").trim());
                    receipt.setQuantity(quantity);
                    System.out.println("Mapped Quantity: " + quantity); // Log mapped value
                } catch (NumberFormatException e) {
                    receipt.setQuantity(1); // Default value if parsing fails
                    System.out.println("Failed to map Quantity, set to default: 1");
                }
            } else if (line.startsWith("Total:")) {
                try {
                    double totalPrice = Double.parseDouble(line.replace("Total:", "").trim());
                    receipt.setTotalPrice(totalPrice);
                    System.out.println("Mapped Total: " + totalPrice); // Log mapped value
                } catch (NumberFormatException e) {
                    receipt.setTotalPrice(0.0); // Default value if parsing fails
                    System.out.println("Failed to map Total, set to default: 0.0");
                }
            } else if (line.startsWith("Date:")) {
                try {
                    LocalDate date = LocalDate.parse(line.replace("Date:", "").trim());
                    receipt.setDate(date);
                    System.out.println("Mapped Date: " + date); // Log mapped value
                } catch (Exception e) {
                    receipt.setDate(LocalDate.now()); // Default to today if parsing fails
                    System.out.println("Failed to map Date, set to default: " + LocalDate.now());
                }
            }
        }

        return receipt;
    }
}
