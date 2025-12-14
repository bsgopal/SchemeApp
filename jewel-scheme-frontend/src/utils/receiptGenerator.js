import jsPDF from "jspdf";
import QRCode from "qrcode";

export async function generateReceiptPDF(txn) {
  const doc = new jsPDF();

  // QR
  const qr = await QRCode.toDataURL(
    `Receipt:${txn.receipt_no}\nAmount:${txn.amount}\nGrams:${txn.grams}`
  );

  doc.setFontSize(22);
  doc.text("GOLD JEWELLERY RECEIPT", 20, 20);

  doc.setFontSize(14);
  doc.text(`Plan Name: ${txn.plan_name}`, 20, 40);
  doc.text(`Installment: ${txn.inst_no}`, 20, 50);
  doc.text(`Amount Paid: ₹ ${txn.amount}`, 20, 60);
  doc.text(`Gold Rate: ₹ ${txn.gold_rate}`, 20, 70);
  doc.text(`Grams Added: ${txn.grams ? Number(txn.grams).toFixed(3) : "0.000"} g`, 20, 80);
  doc.text(`Receipt No: ${txn.receipt_no}`, 20, 90);
  doc.text(`Date: ${new Date(txn.receipt_date).toLocaleDateString()}`, 20, 100);

  doc.addImage(qr, "PNG", 140, 40, 50, 50);

  doc.save(`Receipt-${txn.receipt_no}.pdf`);
}
