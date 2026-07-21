import { Routes, Route, Navigate } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import Dashboard from './components/Dashboard'
import PatientList from './pages/patients/PatientList'
import PatientAdd from './pages/patients/PatientAdd'
import PatientEdit from './pages/patients/PatientEdit'
import Appointments from './pages/patients/Appointments'
import Hospitalizations from './pages/patients/Hospitalizations'
import MedicalRecords from './pages/patients/MedicalRecords'
import Prescriptions from './pages/patients/Prescriptions'
import Exams from './pages/patients/Exams'
import Billing from './pages/patients/Billing'
import EmergencyContacts from './pages/patients/EmergencyContacts'
import Reports from './pages/patients/Reports'
import ReportsOverview from './pages/rapports/ReportsOverview'
import ReportsPatients from './pages/rapports/ReportsPatients'
import ReportsHospitalizations from './pages/rapports/ReportsHospitalizations'
import ReportsActivity from './pages/rapports/ReportsActivity'
import ReportsFinance from './pages/rapports/ReportsFinance'
import NotificationsPage from './pages/patients/NotificationsPage'

export default function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/add" element={<PatientAdd />} />
          <Route path="patients/edit/:id" element={<PatientEdit />} />
          <Route path="patients/appointments" element={<Appointments />} />
          <Route path="patients/hospitalizations" element={<Hospitalizations />} />
          <Route path="patients/records" element={<MedicalRecords />} />
          <Route path="patients/prescriptions" element={<Prescriptions />} />
          <Route path="patients/exams" element={<Exams />} />
          <Route path="patients/billing" element={<Billing />} />
          <Route path="patients/emergency-contacts" element={<EmergencyContacts />} />
          <Route path="patients/reports" element={<Reports />} />
          <Route path="rapports" element={<ReportsOverview />} />
          <Route path="rapports/patients" element={<ReportsPatients />} />
          <Route path="rapports/hospitalisations" element={<ReportsHospitalizations />} />
          <Route path="rapports/activite" element={<ReportsActivity />} />
          <Route path="rapports/finance" element={<ReportsFinance />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </TooltipProvider>
  )
}
