package ClearTrack.backend;
import jakarta.persistence.Table;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDate;





@Entity
@Table (name="receipt")
public class Receipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vendorName;
    private String itemName;
    private double price;
    private int quantity;
    private double totalPrice;
    private LocalDate date;

    // Getters and setters
}


