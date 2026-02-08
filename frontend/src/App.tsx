import { Routes, Route } from 'react-router-dom';
import StudentApp from './components/student/StudentApp';
import AdminApp from './components/admin/AdminApp';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<StudentApp />} />
        <Route path="/admin" element={<AdminApp />} />
      </Routes>
    </div>
  );
}

export default App;
