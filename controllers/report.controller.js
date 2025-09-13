import PDFDocument from "pdfkit";

export const downloadReport = async (req, res) => {
    let doc;
    try {
        const results = req.body;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `inline; filename=accessibility-report-${Date.now()}.pdf`
        );

        doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            bufferPages: true
        });
        doc.pipe(res);

        // Color palette
        const colors = {
            primary: '#2563eb',
            success: '#059669',
            warning: '#d97706',
            error: '#dc2626',
            text: '#374151',
            lightGray: '#f3f4f6',
            mediumGray: '#9ca3af'
        };

        // Helper: Ensure enough space on page 
        const ensureSpace = (requiredHeight = 50) => {
            if (doc.y + requiredHeight > doc.page.height - 50) {
                doc.addPage();
            }
        };

        // Header
        const addHeader = () => {
            doc.rect(0, 0, doc.page.width, 120).fill(colors.primary);

            doc.fillColor('white')
                .fontSize(28)
                .font('Helvetica-Bold')
                .text('Accessibility Insight', 50, 40, { align: 'center' });

            doc.fontSize(14)
                .font('Helvetica')
                .text('Comprehensive Web Accessibility Analysis', 50, 75, { align: 'center' });

            doc.y = 140;
        };

        // Meta Section
        const addMetaSection = () => {
            ensureSpace(100);
            const metaY = doc.y;

            doc.roundedRect(50, metaY, doc.page.width - 100, 80, 8)
                .fill(colors.lightGray)
                .stroke();

            doc.fillColor(colors.text)
                .fontSize(12)
                .font('Helvetica-Bold')
                .text('Report Details', 70, metaY + 15);

            doc.font('Helvetica')
                .fontSize(11)
                .text(`URL: ${results.url || "N/A"}`, 70, metaY + 35)
                .text(`Generated: ${new Date(results.timestamp || Date.now()).toLocaleString()}`, 70, metaY + 50);

            doc.y = metaY + 100;
        };

        //Section Header
        const addSectionHeader = (title, icon, color = colors.primary) => {
            ensureSpace(40);
            const headerY = doc.y;

            doc.roundedRect(50, headerY - 5, doc.page.width - 100, 30, 5)
                .fill(color)
                .fillOpacity(0.1);

            doc.fillColor(color)
                .fillOpacity(1)
                .fontSize(18)
                .font('Helvetica-Bold')
                .text(`${icon} ${title}`, 60, headerY + 5);

            doc.moveDown(0.8);
        };

        // Summary Cards
        const addSummaryCards = () => {
            if (!results.summary) {
                ensureSpace(20);
                doc.fillColor(colors.mediumGray)
                    .fontSize(12)
                    .text("No summary data available", 60);
                return;
            }

            const summaryEntries = Object.entries(results.summary);
            const cardWidth = 120;
            const cardHeight = 60;
            const spacing = 20;
            let x = 60;
            let y = doc.y;

            summaryEntries.forEach(([key, value], index) => {
                if (index > 0 && index % 4 === 0) {
                    y += cardHeight + spacing;
                    x = 60;
                }

                ensureSpace(cardHeight + 20);

                doc.roundedRect(x, y, cardWidth, cardHeight, 8)
                    .fill('white')
                    .stroke(colors.mediumGray);

                doc.fillColor(colors.primary)
                    .fontSize(20)
                    .font('Helvetica-Bold')
                    .text(String(value), x + 10, y + 10, { width: cardWidth - 20, align: 'center' });

                doc.fillColor(colors.text)
                    .fontSize(10)
                    .font('Helvetica')
                    .text(key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                        x + 10, y + 35, { width: cardWidth - 20, align: 'center' });

                x += cardWidth + spacing;
            });

            doc.y = y + cardHeight + 20;
        };

        // Issues List
        const addIssuesList = (issues, title, icon, color, maxItems = 10) => {
            addSectionHeader(title, icon, color);

            if (!issues?.length) {
                ensureSpace(20);
                doc.fillColor(colors.success)
                    .fontSize(12)
                    .font('Helvetica')
                    .text(`✅ No ${title.toLowerCase()} found - Great job!`, 60);
                doc.moveDown();
                return;
            }

            issues.slice(0, maxItems).forEach((issue, i) => {
                const textHeight = doc.heightOfString(issue.description || issue.message || 'No description', { width: doc.page.width - 140 });
                ensureSpace(textHeight + 30);

                const itemY = doc.y;

                doc.circle(70, itemY + 8, 8).fill(color);

                doc.fillColor('white')
                    .fontSize(10)
                    .font('Helvetica-Bold')
                    .text(String(i + 1), 66, itemY + 4);

                doc.fillColor(colors.text)
                    .fontSize(12)
                    .font('Helvetica-Bold')
                    .text(issue.description || issue.message || 'No description', 90, itemY, { width: doc.page.width - 140 });

                if (issue.impact) {
                    doc.fontSize(10)
                        .font('Helvetica')
                        .fillColor(colors.mediumGray)
                        .text(`Impact: ${issue.impact}`, 90, doc.y + 2);
                }

                if (issue.helpUrl) {
                    doc.fontSize(9)
                        .fillColor(colors.primary)
                        .text('Learn more →', 90, doc.y + 2, { link: issue.helpUrl, underline: true });
                }

                doc.moveDown(0.8);

                doc.strokeColor(colors.lightGray)
                    .lineWidth(0.5)
                    .moveTo(60, doc.y)
                    .lineTo(doc.page.width - 60, doc.y)
                    .stroke();

                doc.moveDown(0.3);
            });

            if (issues.length > maxItems) {
                ensureSpace(20);
                doc.fillColor(colors.mediumGray)
                    .fontSize(10)
                    .text(`... and ${issues.length - maxItems} more items`, 60);
            }
        };

        // Footer
        const addFooter = () => {
            const pageCount = doc.bufferedPageRange().count;
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i);

                doc.strokeColor(colors.lightGray)
                    .lineWidth(1)
                    .moveTo(50, doc.page.height - 50)
                    .lineTo(doc.page.width - 50, doc.page.height - 50)
                    .stroke();

                doc.fillColor(colors.mediumGray)
                    .fontSize(10)
                    .font('Helvetica')
                    .text(`Generated by Accessibility Auditor | Page ${i + 1} of ${pageCount}`,
                        50, doc.page.height - 35, { align: 'center', width: doc.page.width - 100 });
            }
        };

        // Generate PDF
        addHeader();
        addMetaSection();

        addSectionHeader('Summary');
        addSummaryCards();

        addIssuesList(results.urgentIssues, 'Critical Issues', colors.error);
        addIssuesList(results.topIssues, 'Top Issues', colors.warning);
        addIssuesList(results.actionableItems, 'Actionable Items', colors.primary);
        addIssuesList(results.detailedResults?.violations, 'All Violations', colors.text, 20);

        if (!results.urgentIssues?.length &&
            !results.topIssues?.length &&
            !results.actionableItems?.length &&
            !results.detailedResults?.violations?.length) {
            doc.addPage();

            const pageWidth = doc.page.width;

            
           

            doc.moveDown(2);

         
            doc.fontSize(36)
                .font('Helvetica-Bold')
                .fillColor(colors.text)
                .text('Excellent Accessibility!', { align: 'center' });

            doc.moveDown(1);

         
            doc.fontSize(16)
                .font('Helvetica')
                .fillColor(colors.text)
                .text(
                    'No accessibility issues were found. Your website meets accessibility standards!',
                    {
                        align: 'center',
                        width: pageWidth - 100
                    }
                );
        }

        addFooter();
        doc.end();

    } catch (error) {
        console.error("PDF generation failed:", error);
        if (doc) {
            try { doc.end(); } catch (e) { console.error(e); }
        }
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Failed to generate PDF",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};
