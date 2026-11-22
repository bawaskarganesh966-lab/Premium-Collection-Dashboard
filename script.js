
document.addEventListener("DOMContentLoaded", function () {

    const STORAGE_KEY = "premiumPayments";

    const form = document.getElementById("paymentForm");
    const historyTable = document.getElementById("paymentHistory");
    const totalAmount = document.getElementById("totalAmount");
    const totalPayments = document.getElementById("totalPayments");
    const searchInput = document.getElementById("searchInput");

    const receiptSection = document.getElementById("receiptSection");
    const printButton = document.getElementById("printReceipt");
    const closeButton = document.getElementById("closeReceipt");

    const nameInput = document.getElementById("name");
    const policyInput = document.getElementById("policy");
    const amountInput = document.getElementById("amount");
    const dateInput = document.getElementById("date");

    let editingIndex = -1;

    // Check HTML elements
    if (
        !form || !historyTable || !totalAmount ||
        !totalPayments || !searchInput ||
        !nameInput || !policyInput ||
        !amountInput || !dateInput
    ) {
        console.error("HTML elements missing. Check index.html IDs.");
        return;
    }

    // Get Payments
    function getPayments() {
        try {
            return JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );
        } catch (error) {
            console.error("Payment data error:", error);
            return [];
        }
    }

    // Save Payments
    function savePayments(payments) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(payments)
        );
    }

    // Display Payment History
    function renderPayments() {

        const payments = getPayments();

        const searchText = searchInput.value
            .trim()
            .toLowerCase();

        historyTable.innerHTML = "";

        let total = 0;

        payments.forEach(function (payment) {
            total += Number(payment.amount || 0);
        });

        totalAmount.textContent =
            "Rs. " + total.toLocaleString("en-IN");

        totalPayments.textContent = payments.length;

        let visibleCount = 0;

        payments.forEach(function (payment, index) {

            const customerName =
                String(payment.name || "");

            const policyNumber =
                String(payment.policy || "");

            const matches =
                customerName.toLowerCase().includes(searchText) ||
                policyNumber.toLowerCase().includes(searchText);

            if (!matches) {
                return;
            }

            visibleCount++;

            const row = historyTable.insertRow();

            row.insertCell(0).textContent = customerName;
            row.insertCell(1).textContent = policyNumber;

            row.insertCell(2).textContent =
                "Rs. " + Number(payment.amount || 0).toLocaleString("en-IN");

            row.insertCell(3).textContent =
                payment.date || "Not Provided";

            const actionCell = row.insertCell(4);

            // Edit Button
            const editButton = document.createElement("button");

            editButton.textContent = "Edit";
            editButton.style.backgroundColor = "#1976d2";
            editButton.style.color = "white";

            editButton.addEventListener("click", function () {

                nameInput.value = customerName;
                policyInput.value = policyNumber;
                amountInput.value = payment.amount || "";
                dateInput.value =
                    payment.date === "Not Provided"
                        ? ""
                        : payment.date || "";

                editingIndex = index;

                form.querySelector(
                    "button[type='submit']"
                ).textContent = "Update Payment";

                form.scrollIntoView({
                    behavior: "smooth"
                });
            });

            // Delete Button
            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Delete";
            deleteButton.style.backgroundColor = "red";
            deleteButton.style.color = "white";

            deleteButton.addEventListener("click", function () {

                if (confirm("Are you sure you want to delete?")) {

                    const updatedPayments = getPayments();

                    updatedPayments.splice(index, 1);

                    savePayments(updatedPayments);

                    editingIndex = -1;
                    form.reset();

                    form.querySelector(
                        "button[type='submit']"
                    ).textContent = "Submit Payment";

                    renderPayments();

                    alert("Payment Deleted Successfully!");
                }
            });

            // View Receipt Button
            const receiptButton = document.createElement("button");

            receiptButton.textContent = "View Receipt";
            receiptButton.style.backgroundColor = "#16813d";
            receiptButton.style.color = "white";

            receiptButton.addEventListener("click", function () {

                if (!receiptSection) {
                    alert("Receipt section missing in index.html");
                    return;
                }

                document.getElementById("receiptName").textContent =
                    customerName;

                document.getElementById("receiptPolicy").textContent =
                    policyNumber;

                document.getElementById("receiptAmount").textContent =
                    payment.amount || "0";

                document.getElementById("receiptDate").textContent =
                    payment.date || "Not Provided";

                receiptSection.style.display = "block";

                receiptSection.scrollIntoView({
                    behavior: "smooth"
                });
            });

            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);
            actionCell.appendChild(receiptButton);

        });

        if (visibleCount === 0) {
            const row = historyTable.insertRow();
            const cell = row.insertCell(0);

            cell.colSpan = 5;
            cell.textContent = "No Payment Records Found";
            cell.style.textAlign = "center";
        }
    }

    // Add or Update Payment
    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const customerName = nameInput.value.trim();
        const policyNumber = policyInput.value.trim();

        if (!customerName || !policyNumber) {
            alert("Please enter Customer Name and Policy Number.");
            return;
        }

        const payment = {
            name: customerName,
            policy: policyNumber,
            amount: amountInput.value || "0",
            date: dateInput.value || "Not Provided"
        };

        const payments = getPayments();

        if (editingIndex === -1) {

            payments.push(payment);

            alert("Payment Added Successfully!");

        } else {

            payments[editingIndex] = payment;

            editingIndex = -1;

            alert("Payment Updated Successfully!");
        }

        savePayments(payments);

        form.reset();

        form.querySelector(
            "button[type='submit']"
        ).textContent = "Submit Payment";

        renderPayments();
    });

    // Search Payment
    searchInput.addEventListener("input", function () {
        renderPayments();
    });

    // Print Receipt
    if (printButton) {
        printButton.addEventListener("click", function () {
            window.print();
        });
    }

    // Close Receipt
    if (closeButton) {
        closeButton.addEventListener("click", function () {
            receiptSection.style.display = "none";
        });
    }

    // Load Dashboard
    renderPayments();

});
