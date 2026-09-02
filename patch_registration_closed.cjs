const fs = require('fs');
let code = fs.readFileSync('src/pages/IndividualRegistration.tsx', 'utf8');

const closedBlock = `
  const navigate = useNavigate();

  return (
    <div className="pt-8 px-4">
      <Card className="p-8 text-center max-w-lg mx-auto mt-12">
        <div className="w-16 h-16 bg-[#f3edf7] rounded-full flex items-center justify-center mx-auto mb-6 text-[#6750a4]">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#1d1b20] mb-4">Registrations Closed</h2>
        <p className="text-[#49454f] mb-8 text-lg">
          Thanks for your interest but the registrations for Yi Walk along 4.0 is closed.
        </p>
        <Button onClick={() => navigate('/')} className="w-full">
          Back to Home
        </Button>
      </Card>
    </div>
  );
`;

code = code.replace(/  const navigate = useNavigate\(\);/m, closedBlock);
fs.writeFileSync('src/pages/IndividualRegistration.tsx', code);
console.log("Patched IndividualRegistration.tsx for closed state");
