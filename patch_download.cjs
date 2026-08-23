const fs = require('fs');
let code = fs.readFileSync('src/pages/InstitutionRegistration.tsx', 'utf8');

const target = `  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.setAttribute("href", "/WalkAlong_Registration_Sheet_Bulk.xlsx");
    link.setAttribute("download", "WalkAlong_Registration_Sheet_Bulk.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`;
  
const replace = `  const downloadTemplate = async () => {
    try {
      const response = await fetch('/WalkAlong_Registration_Sheet_Bulk.xlsx');
      if (!response.ok) throw new Error('Network response was not ok');
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "WalkAlong_Registration_Sheet_Bulk.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download template", error);
      // Fallback to direct link if fetch fails
      const link = document.createElement("a");
      link.setAttribute("href", "/WalkAlong_Registration_Sheet_Bulk.xlsx");
      link.setAttribute("download", "WalkAlong_Registration_Sheet_Bulk.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };`;

code = code.replace(target, replace);
fs.writeFileSync('src/pages/InstitutionRegistration.tsx', code);
