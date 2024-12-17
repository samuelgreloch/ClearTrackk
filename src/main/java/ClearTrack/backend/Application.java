package ClearTrack.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }


    @GetMapping("/")
    public String displayChartPage() {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Receipts Chart</title>
                    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                </head>
                <body>
                    <h1>Receipts Overview</h1>
                    <canvas id="receiptChart" width="600" height="400"></canvas>
                    <script>
                        // Fetch data from the backend
                        fetch('/api/receipts')
                            .then(response => response.json())
                            .then(data => {
                                // Extract labels and values from the response
                                const labels = data.map(receipt => receipt.itemName + " (" + receipt.vendorName + ")");
                                const values = data.map(receipt => receipt.totalPrice);

                                // Initialize the Chart.js chart
                                const ctx = document.getElementById('receiptChart').getContext('2d');
                                new Chart(ctx, {
                                    type: 'bar',
                                    data: {
                                        labels: labels,
                                        datasets: [{
                                            label: 'Total Price (in USD)',
                                            data: values,
                                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                            borderColor: 'rgba(54, 162, 235, 1)',
                                            borderWidth: 1
                                        }]
                                    },
                                    options: {
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                title: {
                                                    display: true,
                                                    text: 'Price (USD)'
                                                }
                                            },
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: 'Item (Vendor)'
                                                }
                                            }
                                        }
                                    }
                                });
                            });
                    </script>
                </body>
                </html>
                """;
    }
}