package ClearTrack.backend;
import jakarta.persistence.*;

import java.time.LocalDate;





@Entity
@Table (name="receipt")
public class Receipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String vendorName;

    @Column
    private String itemName;

    @Column
    private double price;

    @Column
    private int quantity;

    @Column
    private double totalPrice;
    private LocalDate date;

    // Getters and setters
}


