'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Search,
  UserPlus,
  X,
  Phone,
  Mail,
  Building2,
  Stethoscope,
  Trash2,
} from 'lucide-react';


const tokens = {
  paper: '#FAFBFC',
  ink: '#101828',
  slate: '#475467',
  slateLight: '#98A2B3',
  teal: '#0E7C86',
  tealSoft: '#E3F2F1',
  amber: '#C76E00',
  amberSoft: '#FBEDDC',
  red: '#B42318',
  redSoft: '#FEF3F2',
  line: '#E4E7EC',
};

const fontDisplay = "'Space Grotesk', 'IBM Plex Sans', sans-serif";
const fontBody = "'Inter', system-ui, sans-serif";
const fontMono = "'IBM Plex Mono', 'SFMono-Regular', monospace";

function InfoField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: tokens.tealSoft, color: tokens.teal }}
      >
        <Icon size={16} strokeWidth={2} />
      </div>
      <div>
        <p
          className="uppercase"
          style={{ fontFamily: fontBody, fontSize: 10.5, fontWeight: 600, color: tokens.slateLight, letterSpacing: '0.08em' }}
        >
          {label}
        </p>
        <p style={{ fontFamily: fontBody, fontSize: 13.5, fontWeight: 600, color: tokens.ink, marginTop: 2 }}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

function ConditionTag({ children }) {
  return (
    <span
      className="px-2.5 py-1 rounded-md inline-block"
      style={{
        background: tokens.amberSoft,
        color: tokens.amber,
        fontFamily: fontMono,
        fontSize: 11.5,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label
        className="block uppercase mb-1.5"
        style={{ fontFamily: fontBody, fontSize: 10.5, fontWeight: 700, color: tokens.slate, letterSpacing: '0.06em' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  fontFamily: fontBody,
  fontSize: 13.5,
  color: tokens.ink,
  background: '#fff',
  border: `1px solid ${tokens.line}`,
  borderRadius: 10,
  padding: '9px 12px',
  outline: 'none',
};

export default function DoctorDetailsPage() {
  const params = useParams();
  const doctorId = params?.id;

  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingPatientId, setDeletingPatientId] = useState(null);

  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    condition: '',
  });

  const fetchData = useCallback(async () => {
    if (!doctorId) return;

    setLoading(true);
    setError('');

    try {
      const [doctorRes, patientsRes] = await Promise.all([
        fetch(`/api/doctors/${doctorId}`),
        fetch(`/api/doctors/${doctorId}/patients`),
      ]);

      const doctorData = await doctorRes.json();
      const patientsData = await patientsRes.json();

      if (!doctorRes.ok || !doctorData.success) {
        throw new Error(doctorData.message || 'Doctor details could not be loaded.');
      }

      setDoctor(doctorData.data);
      setPatients(patientsRes.ok && patientsData.success ? patientsData.data || [] : []);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        patient.name?.toLowerCase().includes(query) ||
        patient.condition?.toLowerCase().includes(query) ||
        patient.phone?.toLowerCase().includes(query);

      const matchesGender = genderFilter === 'All' || patient.gender === genderFilter;

      return matchesSearch && matchesGender;
    });
  }, [patients, searchQuery, genderFilter]);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const toastId = toast.loading('Assigning patient...');

    try {
      const payload = { ...patientForm, age: Number(patientForm.age) };

      const res = await fetch(`/api/doctors/${doctorId}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to assign patient.');
      }

      toast.success('Patient assigned successfully!', { id: toastId });
      setPatientForm({ name: '', age: '', gender: 'Male', phone: '', condition: '' });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Something went wrong', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmAndDelete = (patientId, patientName) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p style={{ fontFamily: fontBody, fontSize: 13, fontWeight: 500, color: tokens.ink }}>
            Remove <span style={{ fontWeight: 700 }}>{patientName}</span> from this doctor's list?
          </p>
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{ fontFamily: fontBody, fontSize: 11.5, fontWeight: 600, color: tokens.slate, background: tokens.line }}
              className="px-2.5 py-1 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                executeDeletePatient(patientId);
              }}
              style={{ fontFamily: fontBody, fontSize: 11.5, fontWeight: 600, color: '#fff', background: tokens.red }}
              className="px-2.5 py-1 rounded"
            >
              Remove
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };

  const executeDeletePatient = async (patientId) => {
    setDeletingPatientId(patientId);
    const toastId = toast.loading('Removing patient...');

    try {
      const res = await fetch(`/api/patients/${patientId}`, { method: 'DELETE' });
      const result = await res.json();

      if (res.ok && result.success) {
        toast.success('Patient removed successfully!', { id: toastId });
        fetchData();
      } else {
        throw new Error(result.message || 'Failed to delete patient.');
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting patient.', { id: toastId });
    } finally {
      setDeletingPatientId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ background: tokens.paper }}>
        <div
          className="rounded-full h-8 w-8 animate-spin"
          style={{ border: `2px solid ${tokens.line}`, borderTopColor: tokens.teal }}
        />
        <p style={{ fontFamily: fontMono, fontSize: 12, color: tokens.slateLight }}>Please wait...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div
        className="p-6 rounded-2xl text-sm max-w-xl mx-auto my-8"
        style={{ background: tokens.redSoft, border: `1px solid #FDA29B`, color: tokens.red, fontFamily: fontBody }}
      >
        <p style={{ fontWeight: 600 }}>{error || 'Doctor record not found.'}</p>
        <Link
          href="/doctors"
          className="mt-3 inline-flex items-center gap-1"
          style={{ color: tokens.teal, fontWeight: 600, fontSize: 12.5 }}
        >
          <ArrowLeft size={13} /> Return to Doctors Records
        </Link>
      </div>
    );
  }

  const hasActiveFilters = searchQuery || genderFilter !== 'All';

  return (
    <div className="space-y-8 p-8 min-h-screen" style={{ background: tokens.paper, fontFamily: fontBody }}>
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/doctors"
            className="inline-flex items-center gap-1 mb-2"
            style={{ fontFamily: fontBody, fontSize: 12, fontWeight: 600, color: tokens.teal }}
          >
            <ArrowLeft size={13} /> Back to Doctors Records
          </Link>
          <h1 style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 700, color: tokens.ink }}>
            {doctor.name}
          </h1>
          <p style={{ fontSize: 13, color: tokens.slate, marginTop: 4 }}>
            {doctor.specialization} • {doctor.hospital}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition"
          style={{ background: tokens.teal, color: '#fff', fontFamily: fontBody, fontSize: 13.5, fontWeight: 600 }}
        >
          <UserPlus size={16} /> Assign New Patient
        </button>
      </div>

      {/* Doctor Summary Info Card */}
      <div
        className="rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        style={{ background: '#fff', border: `1px solid ${tokens.line}` }}
      >
        <InfoField icon={Stethoscope} label="Specialization" value={doctor.specialization} />
        <InfoField icon={Building2} label="Hospital / Clinic" value={doctor.hospital} />
        <InfoField icon={Phone} label="Phone Number" value={doctor.phone} />
        <InfoField icon={Mail} label="Email Address" value={doctor.email} />
      </div>

      {/* Assigned Patients Section */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: `1px solid ${tokens.line}` }}>
        <div className="p-6 space-y-4" style={{ borderBottom: `1px solid ${tokens.line}` }}>
          <div>
            <h2 style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 600, color: tokens.ink }}>
              Assigned Patients{' '}
              <span style={{ fontFamily: fontMono, fontSize: 13, color: tokens.slateLight, fontWeight: 500 }}>
                ({filteredPatients.length}/{patients.length})
              </span>
            </h2>
            <p style={{ fontFamily: fontBody, fontSize: 12, color: tokens.slateLight, marginTop: 2 }}>
              Patients currently undergoing treatment under this doctor
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search
                size={15}
                style={{ position: 'absolute', left: 12, top: 10, color: tokens.slateLight }}
              />
              <input
                type="text"
                placeholder="Search name, condition, or phone…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 34 }}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                style={{ ...inputStyle, width: 'auto', paddingRight: 28 }}
              >
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setGenderFilter('All');
                  }}
                  style={{ fontFamily: fontBody, fontSize: 11.5, fontWeight: 600, color: tokens.teal }}
                  className="whitespace-nowrap"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ fontFamily: fontBody, fontSize: 13.5 }}>
            <thead style={{ background: tokens.paper, borderBottom: `1px solid ${tokens.line}` }}>
              <tr>
                {['Patient Name', 'Age / Gender', 'Condition', 'Contact Phone', ''].map((h, i) => (
                  <th
                    key={h + i}
                    className={`px-6 py-3.5 uppercase ${i === 4 ? 'text-right' : ''}`}
                    style={{ fontSize: 10.5, fontWeight: 700, color: tokens.slateLight, letterSpacing: '0.06em' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-14" style={{ color: tokens.slateLight, fontSize: 13 }}>
                    {patients.length === 0
                      ? 'No patients assigned yet. Use "Assign New Patient" to add the first one.'
                      : 'No patients match your search or filter.'}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient, idx) => (
                  <tr
                    key={patient._id}
                    style={{
                      borderTop: idx === 0 ? 'none' : `1px solid ${tokens.line}`,
                    }}
                  >
                    <td className="px-6 py-4" style={{ fontWeight: 600, color: tokens.ink }}>
                      {patient.name}
                    </td>
                    <td className="px-6 py-4" style={{ color: tokens.slate, fontFamily: fontMono, fontSize: 12.5 }}>
                      {patient.age}y • {patient.gender}
                    </td>
                    <td className="px-6 py-4">
                      <ConditionTag>{patient.condition}</ConditionTag>
                    </td>
                    <td className="px-6 py-4" style={{ color: tokens.slate, fontFamily: fontMono, fontSize: 12.5 }}>
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => confirmAndDelete(patient._id, patient.name)}
                        disabled={deletingPatientId === patient._id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition disabled:opacity-50"
                        style={{ background: tokens.redSoft, color: tokens.red, fontSize: 11.5, fontWeight: 600 }}
                      >
                        <Trash2 size={12} />
                        {deletingPatientId === patient._id ? 'Removing…' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Patient Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(16,24,40,0.5)', backdropFilter: 'blur(2px)' }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-5"
            style={{ background: '#fff', border: `1px solid ${tokens.line}`, boxShadow: '0 20px 48px rgba(16,24,40,0.22)' }}
          >
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: `1px solid ${tokens.line}` }}>
              <h3 style={{ fontFamily: fontDisplay, fontSize: 17, fontWeight: 700, color: tokens.ink }}>
                Assign Patient to Dr. {doctor.name}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: tokens.slateLight }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="space-y-4">
              <FormField label="Patient Name *">
                <input
                  type="text"
                  required
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                  placeholder="e.g. Alice Smith"
                  style={inputStyle}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Age *">
                  <input
                    type="number"
                    required
                    min="0"
                    value={patientForm.age}
                    onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                    placeholder="e.g. 34"
                    style={inputStyle}
                  />
                </FormField>
                <FormField label="Gender *">
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Phone Number *">
                <input
                  type="tel"
                  required
                  value={patientForm.phone}
                  onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                  placeholder="e.g. +1 987 654 321"
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Diagnosis / Condition *">
                <input
                  type="text"
                  required
                  value={patientForm.condition}
                  onChange={(e) => setPatientForm({ ...patientForm, condition: e.target.value })}
                  placeholder="e.g. Chronic Hypertension"
                  style={inputStyle}
                />
              </FormField>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl"
                  style={{ border: `1px solid ${tokens.line}`, color: tokens.slate, fontSize: 13.5, fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl disabled:opacity-50"
                  style={{ background: tokens.teal, color: '#fff', fontSize: 13.5, fontWeight: 600 }}
                >
                  {submitting ? 'Assigning…' : 'Assign Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}