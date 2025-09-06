import jsPDF from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import saveAs from 'file-saver';
import { Itinerary } from '../types';

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};


export const exportAsPdf = (itinerary: Itinerary) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxLineWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (spaceNeeded: number) => {
    if (y + spaceNeeded > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // --- Title ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor('#0B2545');
  const titleLines = doc.splitTextToSize(itinerary.tripTitle, maxLineWidth);
  checkPageBreak(12 * titleLines.length);
  doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
  y += 10 * titleLines.length + 5;

  // --- Itinerary Days ---
  itinerary.days.forEach(day => {
    const dayHeader = `Day ${day.day}: ${day.title}`;
    // Add a new page for each day for clear separation.
    if (day.day > 1) {
        doc.addPage();
        y = margin;
    }
    
    // --- Day Header ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#0B2545');
    doc.text(dayHeader, margin, y);
    y += 12;

    // --- Activities ---
    day.activities.forEach(activity => {
        const timeText = `${activity.time} - ${activity.title} (${activity.type})`;
        const descriptionLines = doc.splitTextToSize(activity.description, maxLineWidth - 5);
        const locationLines = activity.location ? doc.splitTextToSize(`Location: ${activity.location}`, maxLineWidth - 5) : [];
        const spaceNeeded = 8 + (descriptionLines.length * 5) + (locationLines.length * 5) + 5;
        
        checkPageBreak(spaceNeeded);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor('#13A89E');
        doc.text(timeText, margin, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor('#4A4A4A');
        doc.text(descriptionLines, margin + 5, y);
        y += descriptionLines.length * 5;

        if (activity.location) {
            doc.setFont('helvetica', 'italic');
            doc.setTextColor('#A9A9A9');
            doc.text(locationLines, margin + 5, y);
            y += locationLines.length * 5;
        }
        y += 5;
    });
  });

  doc.save(`${slugify(itinerary.tripTitle)}.pdf`);
};

export const exportAsPptx = (itinerary: Itinerary) => {
  const pptx = new PptxGenJS();
  
  // Title Slide
  pptx.addSlide().addText(itinerary.tripTitle, { 
    x: 0.5, y: 2.5, w: '90%', h: 1, 
    align: 'center', fontSize: 36, bold: true, color: '0B2545' 
  });

  itinerary.days.forEach(day => {
    // Each day gets a new slide
    const daySlide = pptx.addSlide();
    daySlide.addText(`Day ${day.day}: ${day.title}`, { 
        x: 0.5, y: 0.5, w: '90%', h: 0.75, 
        fontSize: 28, bold: true, color: '0B2545' 
    });

    let yPos = 1.5;
    day.activities.forEach(activity => {
        if (yPos > 6.5) { // Simple pagination within a day slide
            daySlide.addText(`Day ${day.day}: ${day.title} (cont.)`, { x: 0.5, y: 0.5, w: '90%', h: 0.75, fontSize: 28, bold: true, color: '0B2545' });
            yPos = 1.5;
        }
        daySlide.addText([
            { text: `${activity.time} - ${activity.title}`, options: { bold: true, fontSize: 16, color: '13A89E' } },
            { text: ` (${activity.type})`, options: { fontSize: 12, color: 'A9A9A9' } },
            { text: `\n${activity.description}`, options: { fontSize: 12, color: '4A4A4A', breakLine: true } },
            ...(activity.location ? [{ text: `\nLocation: ${activity.location}`, options: { fontSize: 11, color: '4A4A4A', italic: true, breakLine: true } }] : [])
        ], { x: 0.5, y: yPos, w: '90%', h: 1 });
        yPos += 1.2;
    });
  });

  pptx.writeFile({ fileName: `${slugify(itinerary.tripTitle)}.pptx` });
};

export const exportAsDocx = (itinerary: Itinerary) => {
    const sections = itinerary.days.flatMap((day, index) => {
        const activityParagraphs = day.activities.flatMap(activity => [
            new Paragraph({
                children: [
                    new TextRun({ text: `${activity.time} - ${activity.title}`, bold: true, size: 28, color: '13A89E' }),
                    new TextRun({ text: ` (${activity.type})`, size: 22, color: 'A9A9A9' }),
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                children: [new TextRun({ text: activity.description, size: 24, color: '4A4A4A'})],
                spacing: { after: 100 }
            }),
            ...(activity.location ? [new Paragraph({
                // Fix: Changed `italic` to `italics` to match the `docx` library's IRunOptions interface.
                children: [new TextRun({ text: `Location: ${activity.location}`, italics: true, size: 22, color: '4A4A4A'})],
                spacing: { after: 200 }
            })] : [new Paragraph({ spacing: { after: 200 }})])
        ]);

        return [
            new Paragraph({
                text: `Day ${day.day}: ${day.title}`,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 },
                pageBreakBefore: index > 0, // Add page break before every day except the first
            }),
            ...activityParagraphs
        ];
    });

    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({
                    text: itinerary.tripTitle,
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER
                }),
                ...sections
            ]
        }]
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${slugify(itinerary.tripTitle)}.docx`);
    });
};
