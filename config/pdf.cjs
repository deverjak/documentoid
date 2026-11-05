module.exports = {
  page_media_type: 'print',
  highlight_style: 'github',
  launch_options: { headless: 'shell' },
  pdf_options: {
    format: 'A4',
    printBackground: true,
    margin: { top: '18mm', right: '17mm', bottom: '20mm', left: '17mm' },
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="width:100%;text-align:center;font-size:9px;color:#64748b"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
  }
};
