import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import jsPDF from "jspdf";

export async function generateReceiptPDF(txn) {
  const doc = new jsPDF();

  doc.text("Gold Scheme Receipt", 20, 20);
  doc.text(`Plan: ${txn.plan_name}`, 20, 35);
  doc.text(`Installment: ${txn.inst_no}`, 20, 45);
  doc.text(`Amount: ₹${txn.amount}`, 20, 55);
  doc.text(`Gold Rate: ₹${txn.gold_rate}`, 20, 65);
  doc.text(`Grams: ${txn.grams}`, 20, 75);
  doc.text(`Date: ${new Date(txn.receipt_date).toLocaleDateString()}`, 20, 85);

  const pdfBase64 = doc.output("datauristring").split(",")[1];
  const fileName = `Receipt_${txn.receipt_no}.pdf`;

  // ✅ Save to device
  const savedFile = await Filesystem.writeFile({
    path: fileName,
    data: pdfBase64,
    directory: Directory.Documents,
    encoding: Encoding.BASE64,
  });

  // ✅ Open share dialog (Download / Open / Share)
  await Share.share({
    title: "Receipt",
    text: "Gold Scheme Receipt",
    url: savedFile.uri,
    dialogTitle: "Open or Share Receipt",
  });
}
