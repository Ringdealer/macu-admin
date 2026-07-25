export async function exportChartToPDF(elementId, filename = "report.pdf") {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const report = document.getElementById(elementId);

  if (!report) {
    console.error("[PDF Export] Report not found");
    return;
  }

  const pages = report.querySelectorAll(".pdf-page");

  const pdf = new jsPDF("p", "mm", "a4");

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      width: 1032,
      height: 1460,
    });

    const imgData = canvas.toDataURL("image/png");

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
  }

  pdf.save(filename);
}
