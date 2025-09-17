import jsPDF from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from 'docx';
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

const base64ToArrayBuffer = (base64: string) => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    // FIX: Return a Uint8Array instead of an ArrayBuffer to resolve a type ambiguity error with the 'docx' library's ImageRun constructor.
    return bytes;
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

    // --- Day Image ---
    if (day.headerImageUrl) {
      try {
        const base64Data = day.headerImageUrl.split(',')[1];
        const aspectRatio = 16 / 9;
        const imgWidth = maxLineWidth;
        const imgHeight = imgWidth / aspectRatio;
        checkPageBreak(imgHeight + 10);
        doc.addImage(base64Data, 'JPEG', margin, y, imgWidth, imgHeight);
        y += imgHeight + 10;
      } catch (e) {
        console.error("Failed to add image to PDF", e);
      }
    }
    
    // --- Day Header ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#0B2545');
    checkPageBreak(12);
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
  const titleSlide = pptx.addSlide();
  titleSlide.addText(itinerary.tripTitle, { 
    x: 0.5, y: 2.5, w: '90%', h: 1, 
    align: 'center', fontSize: 36, bold: true, color: '0B2545' 
  });
  if (itinerary.days.length > 0 && itinerary.days[0].headerImageUrl) {
      // FIX: Replaced invalid 'opacity' property with 'transparency' and added required 'w' and 'h' to 'sizing'. Assuming 20% opacity means 80% transparency.
      titleSlide.addImage({ data: itinerary.days[0].headerImageUrl, w:'100%', h:'100%', sizing: { type: 'cover', w: '100%', h: '100%' }, transparency: 80 });
  }

  itinerary.days.forEach(day => {
    // Each day gets a new slide
    const daySlide = pptx.addSlide();

    // Add image as a prominent header
    if (day.headerImageUrl) {
        // FIX: Added required 'w' and 'h' properties to the 'sizing' object for the 'cover' type.
        daySlide.addImage({
            data: day.headerImageUrl,
            x: 0, y: 0, w: '100%', h: 2.5,
            sizing: { type: 'cover', w: '100%', h: 2.5 }
        });
    }

    daySlide.addText(`Day ${day.day}: ${day.title}`, { 
        x: 0.5, y: 0.5, w: '90%', h: 0.75, 
        fontSize: 28, bold: true, color: day.headerImageUrl ? 'FFFFFF' : '0B2545',
        shadow: { type: 'outer', color: '000000', blur: 3, offset: 2, opacity: 0.6 }
    });

    let yPos = 2.7; // Start text below the image
    day.activities.forEach(activity => {
        // Simple pagination: if content overflows, create a new slide
        if (yPos > 6.5) {
            const contSlide = pptx.addSlide();
            contSlide.addText(`Day ${day.day}: ${day.title} (cont.)`, { x: 0.5, y: 0.5, w: '90%', h: 0.75, fontSize: 28, bold: true, color: '0B2545' });
            yPos = 1.5;
            contSlide.addText([
                { text: `${activity.time} - ${activity.title}`, options: { bold: true, fontSize: 16, color: '13A89E' } },
                { text: ` (${activity.type})`, options: { fontSize: 12, color: 'A9A9A9' } },
                { text: `\n${activity.description}`, options: { fontSize: 12, color: '4A4A4A', breakLine: true } },
                ...(activity.location ? [{ text: `\nLocation: ${activity.location}`, options: { fontSize: 11, color: '4A4A4A', italic: true, breakLine: true } }] : [])
            ], { x: 0.5, y: yPos, w: '90%', h: 1 });
        } else {
            daySlide.addText([
                { text: `${activity.time} - ${activity.title}`, options: { bold: true, fontSize: 14, color: '13A89E' } },
                { text: ` (${activity.type})`, options: { fontSize: 11, color: 'A9A9A9' } },
                { text: `\n${activity.description}`, options: { fontSize: 12, color: '4A4A4A', breakLine: true } },
                ...(activity.location ? [{ text: `\nLocation: ${activity.location}`, options: { fontSize: 11, color: '4A4A4A', italic: true, breakLine: true } }] : [])
            ], { x: 0.5, y: yPos, w: '90%', h: 1 });
        }
        yPos += 1.0;
    });
  });

  pptx.writeFile({ fileName: `${slugify(itinerary.tripTitle)}.pptx` });
};

export const exportAsDocx = async (itinerary: Itinerary) => {
    const sections = itinerary.days.flatMap((day, index) => {
        const dayContent: Paragraph[] = [];

        if (day.headerImageUrl) {
            try {
                const base64Data = day.headerImageUrl.split(',')[1];
                const imageBuffer = base64ToArrayBuffer(base64Data);
                dayContent.push(new Paragraph({
                    children: [new ImageRun({ data: imageBuffer, transformation: { width: 600, height: 337.5 } })],
                    alignment: AlignmentType.CENTER
                }));
            } catch(e) {
                console.error("Could not process image for DOCX export", e);
            }
        }

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
            ...dayContent,
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

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${slugify(itinerary.tripTitle)}.docx`);
};