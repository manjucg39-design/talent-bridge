import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ClipboardList, CheckCircle, Upload, X, Video, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { User } from '../../types';

const SPORTS = ['Athletics', 'Football', 'Hockey', 'Kabaddi', 'Volleyball', 'Basketball', 'Badminton', 'Wrestling', 'Swimming'];
const TEST_TYPES = ['sprint', 'jump', 'endurance', 'agility', 'strength'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

const measurementFields: Record<string, { key: string; label: string; placeholder: string }[]> = {
  sprint:    [{ key: '100m', label: '100m Time (seconds)', placeholder: '14.2' }, { key: '60m', label: '60m Time (seconds)', placeholder: '9.5' }],
  jump:      [{ key: 'long_jump', label: 'Long Jump (meters)', placeholder: '4.5' }, { key: 'high_jump', label: 'High Jump (meters)', placeholder: '1.3' }],
  endurance: [{ key: '1500m', label: '1500m Time (seconds)', placeholder: '360' }, { key: '800m', label: '800m Time (seconds)', placeholder: '180' }],
  agility:   [{ key: 't_test', label: 'T-Test Time (seconds)', placeholder: '9.8' }],
  strength:  [{ key: 'pushups', label: 'Push-ups (reps)', placeholder: '25' }, { key: 'situps', label: 'Sit-ups (reps)', placeholder: '30' }],
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AddFitnessTest() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    studentId: '', testType: 'sprint', sport: 'Athletics',
    testDate: new Date().toISOString().split('T')[0], notes: '',
  });
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [assessment, setAssessment] = useState<{ performanceScore: number; potentialFlag: boolean; recommendation: string } | null>(null);

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoConsent, setVideoConsent] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoError, setVideoError] = useState('');
  const [students, setStudents] = useState<User[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [studentError, setStudentError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    api.get('/tests/my-students').then(response => {
      setStudents(response.data.data.students || []);
    }).catch(() => setStudentError('Unable to load registered students.'));
  }, []);

  const loadTests = (studentId: string) => {
    if (!studentId) { setTests([]); return; }
    api.get(`/tests/${studentId}`).then(response => setTests(response.data.data || [])).catch(() => setTests([]));
  };

  const editTest = (test: any) => {
    setEditingTestId(test._id);
    setForm({ studentId: String(test.studentId), testType: test.testType, sport: test.sport, testDate: new Date(test.testDate).toISOString().split('T')[0], notes: test.notes || '' });
    setMeasurements(Object.fromEntries(Object.entries(test.measurements || {}).map(([key, value]) => [key, String(value)])));
    setSuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTest = async (testId: string) => {
    if (!window.confirm('Delete this fitness test and its assessment?')) return;
    try {
      await api.delete(`/tests/${testId}`);
      loadTests(form.studentId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete test');
    }
  };

  const handleVideoSelect = (file: File) => {
    setVideoError('');
    if (!ALLOWED_TYPES.includes(file.type)) {
      setVideoError('Only MP4, MOV, and WebM video files are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setVideoError('File size must be under 100 MB.');
      return;
    }
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleVideoSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleVideoSelect(file);
  }, []);

  const removeVideo = () => {
    setVideoFile(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    setVideoConsent(false);
    setVideoError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (videoFile && !videoConsent) {
      setError('Please confirm consent before uploading a video.');
      return;
    }

    setLoading(true);
    try {
      const parsedMeasurements: Record<string, number> = {};
      for (const [k, v] of Object.entries(measurements)) {
        if (v) parsedMeasurements[k] = parseFloat(v);
      }

      const res = editingTestId
        ? await api.put(`/tests/${editingTestId}`, { ...form, measurements: parsedMeasurements })
        : await api.post('/tests', { ...form, measurements: parsedMeasurements });
      const { test, assessment: aiAssessment } = res.data.data;

      // Upload video if selected
      if (videoFile && videoConsent) {
        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('studentId', form.studentId);
        formData.append('testId', test._id);
        formData.append('consent', 'true');

        await api.post('/videos/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          },
        });
      }

      setAssessment(aiAssessment);
      setSuccess(true);
      setEditingTestId(null);
      loadTests(form.studentId);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit test');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setForm(f => ({ ...f, studentId: '', notes: '' }));
    setEditingTestId(null);
    setMeasurements({});
    setAssessment(null);
    removeVideo();
    setUploadProgress(0);
  };

  if (success && assessment) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="card text-center">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Test Submitted Successfully</h2>
          <p className="text-gray-600 mb-4">AI-assisted preliminary assessment generated.</p>
          {videoFile && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-sm text-blue-700">
              <Video size={14} className="inline mr-1" /> Video uploaded successfully.
              <p className="text-xs text-blue-500 mt-1">Video evidence uploaded. Automated computer-vision analysis is not enabled in this MVP.</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="text-4xl font-bold text-primary-600 mb-1">{assessment.performanceScore}</div>
            <p className="text-sm text-gray-500">Performance Score</p>
            {assessment.potentialFlag && <span className="badge-green mt-2 inline-block">Potential Flagged</span>}
            <p className="text-sm text-gray-700 mt-3 bg-blue-50 rounded-lg p-2">{assessment.recommendation}</p>
            <p className="text-xs text-gray-400 mt-2 italic">Preliminary AI-assisted assessment only. Not an official selection.</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={resetForm} className="btn-secondary">Add Another Test</button>
            <button onClick={() => navigate('/dashboard/teacher')} className="btn-primary">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const fields = measurementFields[form.testType] || [];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <ClipboardList size={24} className="text-primary-600" /> Add Fitness Test
      </h1>

      <div className="card">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4 flex items-start gap-2"><AlertCircle size={16} className="flex-shrink-0 mt-0.5" />{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student */}
          <div>
            <label className="label">Registered Student</label>
            <select className="input" value={form.studentId} onChange={e => { set('studentId', e.target.value); loadTests(e.target.value); }} required>
              <option value="">Select a registered student</option>
              {students.map(student => <option key={student.id || String((student as unknown as { _id: string })._id)} value={student.id || String((student as unknown as { _id: string })._id)}>{student.name} ({student.email})</option>)}
            </select>
            {studentError && <p className="text-xs text-red-600 mt-1">{studentError}</p>}
            {students.length === 0 && !studentError && <p className="text-xs text-gray-400 mt-1">Add a student from My Students before recording a test.</p>}
          </div>

          {/* Test type + sport */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Test Type</label>
              <select className="input" value={form.testType} onChange={e => { set('testType', e.target.value); setMeasurements({}); }}>
                {TEST_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Sport</label>
              <select className="input" value={form.sport} onChange={e => set('sport', e.target.value)}>
                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="label">Test Date</label>
            <input type="date" className="input" value={form.testDate} onChange={e => set('testDate', e.target.value)} required />
          </div>

          {/* Measurements */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Measurements</p>
            <div className="space-y-3">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input type="number" step="0.01" min="0.01" className="input" value={measurements[f.key] || ''} onChange={e => setMeasurements(m => ({ ...m, [f.key]: e.target.value }))} placeholder={f.placeholder} required={f.key === fields[0]?.key} />
                </div>
              ))}
            </div>
          </div>

          {/* Video Upload */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">Test Video <span className="text-gray-400 font-normal">(optional)</span></p>
            <p className="text-xs text-gray-500 mb-3">MP4, MOV, or WebM · Max 100 MB</p>

            {!videoFile ? (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'}`}
              >
                <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">Drag & drop video here</p>
                <p className="text-xs text-gray-400 mt-1">or click to browse files</p>
                <input ref={fileInputRef} type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={handleFileInput} />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Preview */}
                <video
                  src={videoPreviewUrl || ''}
                  controls
                  className="w-full max-h-48 bg-black"
                  preload="metadata"
                />
                {/* File info */}
                <div className="p-3 bg-gray-50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Video size={16} className="text-primary-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{videoFile.name}</p>
                      <p className="text-xs text-gray-500">{formatBytes(videoFile.size)}</p>
                    </div>
                  </div>
                  <button type="button" onClick={removeVideo} className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0">
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {videoError && <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><AlertCircle size={12} />{videoError}</p>}

            {/* Upload progress */}
            {loading && videoFile && uploadProgress > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Uploading video...</span><span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-primary-600 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Consent */}
            {videoFile && (
              <label className="flex items-start gap-2 mt-3 cursor-pointer">
                <input type="checkbox" checked={videoConsent} onChange={e => setVideoConsent(e.target.checked)} className="mt-0.5 rounded flex-shrink-0" />
                <span className="text-xs text-gray-700">
                  I confirm that the student and parent/guardian have provided consent for this video to be uploaded and used for sports assessment purposes. The video will not be publicly accessible.
                </span>
              </label>
            )}

            <div className="mt-2 bg-yellow-50 border border-yellow-100 rounded-lg p-2 text-xs text-yellow-700">
              <strong>Note:</strong> Video evidence uploaded. Automated computer-vision analysis is not enabled in this MVP. AI assessment is based on manually entered measurements only.
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes (optional)</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Surface conditions, weather, observations..." />
          </div>

          <button type="submit" disabled={loading || (!!videoFile && !videoConsent)} className="btn-primary w-full py-2.5">
            {loading ? 'Submitting & Analysing...' : editingTestId ? 'Save Test Changes' : 'Submit Test & Generate Assessment'}
          </button>
        </form>
      </div>
      {form.studentId && <div className="card"><h2 className="font-semibold text-gray-900 mb-4">Existing Fitness Tests</h2>{tests.length === 0 ? <p className="text-sm text-gray-500">No tests recorded for this student.</p> : <div className="space-y-3">{tests.map(test => <div key={test._id} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3"><div><p className="font-medium text-gray-900">{test.testType} · {test.sport}</p><p className="text-xs text-gray-500">{new Date(test.testDate).toLocaleDateString()} · {Object.entries(test.measurements || {}).map(([key, value]) => `${key}: ${value}`).join(', ')}</p></div><div className="flex items-center gap-1"><button type="button" title="Edit test" onClick={() => editTest(test)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"><Pencil size={15} /></button><button type="button" title="Delete test" onClick={() => deleteTest(test._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={15} /></button></div></div>)}</div>}</div>}
    </div>
  );
}
