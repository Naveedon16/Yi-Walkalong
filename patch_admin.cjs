const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Replace export summary
const newExport = `  const handleExportSummary = () => {
    if (!stats) return;
    
    let content = \`WalkAlong 2026 Registration Summary\\nGenerated: \${new Date().toLocaleString()}\\n\\n\`;
    content += \`Total Registrations: \${stats.totalRegistrations}\\n\`;
    content += \`Total Participants: \${stats.totalParticipants}\\n\\n\`;

    content += \`Confirmed: \${stats.confirmedRegistrations}\\n\`;
    content += \`Pending: \${stats.pendingValidation}\\n\\n\`;
    
    content += \`Categories Breakdown:\\n\`;
    Object.entries(stats.byCategory || {}).forEach(([cat, counts]) => {
      const catName = cat.replace(/_/g, ' ');
      if (typeof counts === 'object') {
        const total = counts.individual + counts.family + counts.caretaker;
        content += \`- \${catName}: \${total} total (\${counts.individual} individuals, \${counts.family} family, \${counts.caretaker} caretakers)\\n\`;
      } else {
        content += \`- \${catName}: \${counts}\\n\`;
      }
    });
    
    content += \`\\nRegistration Trends:\\n\`;
    (stats.trends || []).forEach(trend => {
      content += \`- \${trend.date}: \${trend.participants} participants\\n\`;
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = \`walkalong-registration-summary-\${dateStr}.txt\`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };`;

code = code.replace(/  const handleExportSummary = \(\) => \{[\s\S]*?URL\.revokeObjectURL\(url\);\n  \};/m, newExport);

// Replace Pie Chart
const pieChartRegex = /<Pie[\s\S]*?<\/Pie>/;
const newPieChart = `<Pie
                    data={Object.entries(stats.byCategory || {}).map(([name, counts]) => ({
                      name: name.replace(/_/g, ' '),
                      value: typeof counts === 'object' ? counts.individual + counts.family + counts.caretaker : counts
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {Object.keys(stats.byCategory || {}).map((entry, index) => {
                      const colors = ['#6750a4', '#b3261e', '#2e7d32', '#f9a825', '#1976d2', '#c2185b', '#0097a7', '#558b2f'];
                      return <Cell key={\`cell-\${index}\`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>`;

code = code.replace(pieChartRegex, newPieChart);

// Also we need to replace the legend since the legend colors are hardcoded
const customLegendRegex = /<div className="flex justify-center gap-6 mt-4">[\s\S]*?<\/div>/;
const newCustomLegend = `<div className="flex justify-center gap-6 mt-4 flex-wrap">
                {Object.keys(stats.byCategory || {}).map((cat, index) => {
                  const colors = ['#6750a4', '#b3261e', '#2e7d32', '#f9a825', '#1976d2', '#c2185b', '#0097a7', '#558b2f'];
                  return (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{ backgroundColor: colors[index % colors.length] }}></div>
                      <span className="text-sm text-[#49454f] ">{cat.replace(/_/g, ' ')}</span>
                    </div>
                  );
                })}
              </div>`;

code = code.replace(customLegendRegex, newCustomLegend);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard.tsx");
