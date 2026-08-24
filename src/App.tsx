/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Gallery } from './pages/Gallery';
import { IndividualRegistration } from './pages/IndividualRegistration';
// import { RegistrationStatus } from './pages/RegistrationStatus';
import { Success } from './pages/Success';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminParticipants } from './pages/AdminParticipants';
import { AdminScanner } from './pages/AdminScanner';
import { VolunteerScanner } from './pages/VolunteerScanner';
import { AdminRoute } from './components/AdminRoute';
import { VolunteerRoute } from './components/VolunteerRoute';
import { SetupInstructions } from './components/SetupInstructions';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const hasGasEndpoint = !!import.meta.env.VITE_GAS_ENDPOINT;

  if (!hasGasEndpoint) {
    return <SetupInstructions />;
  }

    return (
    
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="register/individual" element={<IndividualRegistration />} />
              {/* <Route path="status-check" element={<RegistrationStatus />} /> */}
              <Route path="success" element={<Success />} />
              <Route path="admin/login" element={<AdminLogin />} />
              <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} /> 
              {/* <Route path="admin/scanner" element={<AdminRoute><AdminScanner /></AdminRoute>} /> */}
              <Route path="admin/participants" element={<AdminRoute><AdminParticipants /></AdminRoute>} /> 
              {/* <Route path="volunteer" element={<VolunteerRoute><VolunteerScanner /></VolunteerRoute>} /> */}
            </Route>
          </Routes>
        </Router>
      </ErrorBoundary>
    
  );
}
