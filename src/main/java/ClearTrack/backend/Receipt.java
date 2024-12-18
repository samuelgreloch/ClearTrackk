package ClearTrack.backend;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;





@Entity
@Table (name="receipt")
public class Receipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Getter
    @Setter
    @Column
    private String vendorName;

    @Getter
    @Setter
    @Column
    private String itemName;

    @Getter
    @Setter
    @Column
    private double price;

    @Getter
    @Setter
    @Column
    private int quantity;

    @Getter
    @Setter
    @Column
    private double totalPrice;

    @Getter
    @Setter
    @Column
    private LocalDate date;

   public long getId() {
       return id;
   }

   public void setId(long id) {
       this.id = id;
   }

}



