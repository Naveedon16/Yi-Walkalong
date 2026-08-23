const fs = require('fs');
let code = fs.readFileSync('src/pages/RegistrationStatus.tsx', 'utf-8');

// 1. Add "Action" column in table
code = code.replace(/<th className="px-4 py-3 rounded-tr-md">Status<\/th>/, '<th className="px-4 py-3">Status</th>\n                      <th className="px-4 py-3 rounded-tr-md">Action</th>');

// 2. Add button in row
code = code.replace(/<td className="px-4 py-3">\n                          <span className=\{`px-2 py-1 rounded-full text-xs font-medium \$\{getStatusColor\(p\.status \|\| 'Confirmed'\)\}`\}>\n                            \{p\.status \|\| 'Confirmed'\}\n                          <\/span>\n                        <\/td>\n                      <\/tr>/g, `<td className="px-4 py-3">
                          <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getStatusColor(p.status || 'Confirmed')}\`}>
                            {p.status || 'Confirmed'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="outline" onClick={() => {
                            setInstitutionResult(null);
                            setSelectedResult({ id: p.registrationId, status: p.status || 'Confirmed', details: p });
                          }}>View Pass</Button>
                        </td>
                      </tr>`);

// 3. Add button in mobile view
code = code.replace(/\{p\.email && \(\n                      <div className="text-sm"><span className="text-\[\#79747e\] dark:text-gray-400 text-xs block">Email<\/span><span className="text-\[\#49454f\] dark:text-gray-300 truncate block">\{p\.email\}<\/span><\/div>\n                    \)\}\n                  <\/div>/g, `{p.email && (
                      <div className="text-sm"><span className="text-[#79747e] dark:text-gray-400 text-xs block">Email</span><span className="text-[#49454f] dark:text-gray-300 truncate block">{p.email}</span></div>
                    )}
                    <div className="mt-3">
                      <Button size="sm" variant="outline" className="w-full" onClick={() => {
                        setInstitutionResult(null);
                        setSelectedResult({ id: p.registrationId, status: p.status || 'Confirmed', details: p });
                      }}>View Pass</Button>
                    </div>
                  </div>`);

fs.writeFileSync('src/pages/RegistrationStatus.tsx', code);
