const fs = require('fs');

// 1. Update src/pages/InstitutionRegistration.tsx
let uiCode = fs.readFileSync('src/pages/InstitutionRegistration.tsx', 'utf8');

// Remove from zod schema
const zodToRemove = `  yiCoordinatorName: z.string().optional(),
  yiCoordinatorPhone: z.string().optional(),
  yiCoordinatorEmail: z.string().optional(),
  
  yuvaSpocName: z.string().optional(),
  yuvaSpocPhone: z.string().optional(),
  
  transportCoordinatorName: z.string().optional(),
  transportCoordinatorPhone: z.string().optional(),
`;
uiCode = uiCode.replace(zodToRemove, '');

// Remove from UI
const uiToRemove = `              <div className="pt-4 border-t border-[#e1e2ec] dark:border-gray-700 space-y-4">
                <h4 className="text-sm font-semibold text-[#6750a4]">Yi Coordinator (Optional)</h4>
                <Input label="Name" {...register('yiCoordinatorName')} error={formErrors.yiCoordinatorName?.message} />
                <Input label="Phone" {...register('yiCoordinatorPhone')} error={formErrors.yiCoordinatorPhone?.message} />
                <Input label="Email" type="email" {...register('yiCoordinatorEmail')} error={formErrors.yiCoordinatorEmail?.message} />
              </div>

              <div className="pt-4 border-t border-[#e1e2ec] dark:border-gray-700 space-y-4">
                <h4 className="text-sm font-semibold text-[#6750a4]">Yuva SPOC (Optional)</h4>
                <Input label="Name" {...register('yuvaSpocName')} error={formErrors.yuvaSpocName?.message} />
                <Input label="Phone" {...register('yuvaSpocPhone')} error={formErrors.yuvaSpocPhone?.message} />
              </div>

              <div className="pt-4 border-t border-[#e1e2ec] dark:border-gray-700 space-y-4">
                <h4 className="text-sm font-semibold text-[#6750a4]">Transport Coordinator (Optional)</h4>
                <Input label="Name" {...register('transportCoordinatorName')} error={formErrors.transportCoordinatorName?.message} />
                <Input label="Phone" {...register('transportCoordinatorName')} error={formErrors.transportCoordinatorPhone?.message} />
              </div>

`;
uiCode = uiCode.replace(uiToRemove, '');

fs.writeFileSync('src/pages/InstitutionRegistration.tsx', uiCode);


// 2. Update apps-script/Code.js
let appCode = fs.readFileSync('apps-script/Code.js', 'utf8');

const appToRemove = `    setVal('Yi Coordinator Name', p.yiCoordinatorName || payload[0].yiCoordinatorName);
    setVal('Yi Coordinator Phone', p.yiCoordinatorPhone || payload[0].yiCoordinatorPhone);
    setVal('Yi Coordinator Email', p.yiCoordinatorEmail || payload[0].yiCoordinatorEmail);
    setVal('Yuva SPOC Name', p.yuvaSpocName || payload[0].yuvaSpocName);
    setVal('Yuva SPOC Phone', p.yuvaSpocPhone || payload[0].yuvaSpocPhone);
    setVal('Transport Coordinator Name', p.transportCoordinatorName || payload[0].transportCoordinatorName);
    setVal('Transport Coordinator Phone', p.transportCoordinatorPhone || payload[0].transportCoordinatorPhone);
`;
appCode = appCode.replace(appToRemove, '');

fs.writeFileSync('apps-script/Code.js', appCode);

console.log("Fields removed successfully.");
