'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import { CollegeDetail } from '@/lib/collegeRepository';

const ALL_STANDARD_BRANCHES = [
  { name: 'B.E. / B.Tech Computer Science and Engineering', code: 'CSE', duration: '4 Years' },
  { name: 'B.E. / B.Tech Information Science and Engineering', code: 'ISE', duration: '4 Years' },
  { name: 'B.E. / B.Tech Information Technology', code: 'IT', duration: '4 Years' },
  { name: 'B.E. / B.Tech Artificial Intelligence', code: 'AI', duration: '4 Years' },
  { name: 'B.E. / B.Tech Data Science', code: 'DS', duration: '4 Years' },
  { name: 'B.E. / B.Tech Electronics and Communication Engineering', code: 'ECE', duration: '4 Years' },
  { name: 'B.E. / B.Tech Electrical and Electronics Engineering', code: 'EEE', duration: '4 Years' },
  { name: 'B.E. / B.Tech Mechanical Engineering', code: 'ME', duration: '4 Years' },
  { name: 'B.E. / B.Tech Civil Engineering', code: 'CIVIL', duration: '4 Years' },
  { name: 'B.E. / B.Tech Biotechnology', code: 'BT', duration: '4 Years' },
];

export default function AdminCollegeEditPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string;
  const id = decodeURIComponent(rawId || '');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [college, setCollege] = useState<CollegeDetail | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('PRIVATE');
  const [ratingDisplay, setRatingDisplay] = useState('4.5/5');
  const [feesDisplay, setFeesDisplay] = useState('₹2.0–₹3.0 Lakh/year');
  const [overview, setOverview] = useState('');
  const [placementText, setPlacementText] = useState('');
  const [reviewsText, setReviewsText] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [approval, setApproval] = useState('AICTE / NBA Accredited');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [newBranchInput, setNewBranchInput] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/admin/colleges/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load college data');
        return res.json();
      })
      .then((res) => {
        const c: CollegeDetail = res.data;
        setCollege(c);
        setName(c.name || '');
        setState(c.state || '');
        setCity(c.city || '');
        setType(c.type || 'PRIVATE');
        setRatingDisplay(c.ratingDisplay || `${c.rating}/5`);
        setFeesDisplay(c.feesDisplay || '₹1.5–₹2.5 Lakh/year');
        setOverview(c.overview || '');
        setPlacementText(c.placementText || '');
        setReviewsText(c.reviewsText || '');
        setAffiliation(c.affiliation || '');
        setApproval(c.approval || 'AICTE / NBA Accredited');
        setSelectedBranches((c.courses || []).map((crs) => crs.name));
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load college for editing');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleToggleBranch = (branchName: string) => {
    if (selectedBranches.includes(branchName)) {
      setSelectedBranches(selectedBranches.filter((b) => b !== branchName));
    } else {
      setSelectedBranches([...selectedBranches, branchName]);
    }
  };

  const handleAddCustomBranch = () => {
    if (!newBranchInput.trim()) return;
    const branchName = newBranchInput.trim();
    if (!selectedBranches.includes(branchName)) {
      setSelectedBranches([...selectedBranches, branchName]);
    }
    setNewBranchInput('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Rebuild courses array based on selected branches
      const updatedCourses = selectedBranches.map((bName, idx) => {
        const std = ALL_STANDARD_BRANCHES.find((s) => s.name === bName);
        return {
          id: `crs-edit-${idx + 1}`,
          name: bName,
          branchCode: std?.code || 'ENGG',
          duration: std?.duration || '4 Years',
          feesDisplay: feesDisplay,
        };
      });

      // Parse numeric rating & fees
      const matchRating = ratingDisplay.match(/([0-9.]+)/);
      const numRating = matchRating ? parseFloat(matchRating[1]) : 4.0;

      const matchFees = feesDisplay.match(/([0-9.]+)/);
      let numFees = 150000;
      if (matchFees) {
        const fVal = parseFloat(matchFees[1]);
        numFees = (feesDisplay.includes('Lakh') || fVal < 100) ? Math.round(fVal * 100000) : Math.round(fVal);
      }

      const payload: Partial<CollegeDetail> = {
        name,
        state,
        city,
        type,
        ratingDisplay,
        rating: Math.min(5, Math.max(1, numRating)),
        feesDisplay,
        fees: numFees,
        overview,
        placementText,
        reviewsText,
        affiliation,
        approval,
        courses: updatedCourses,
        totalBranchesOffered: updatedCourses.length,
      };

      const res = await fetch(`/api/admin/colleges/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Changes saved and reflected live across the platform!');
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error?.message || 'Failed to save updates');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while saving changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <Skeleton className="h-8 w-64 bg-slate-200" />
        <Skeleton className="h-96 w-full rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">College Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">Could not locate college to edit.</p>
        <Link href="/admin/colleges" className="inline-block mt-4 text-xs font-bold text-indigo-600 underline">
          ← Return to Colleges Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/admin" className="hover:text-indigo-600 font-medium">
          Dashboard
        </Link>
        <span>&gt;</span>
        <Link href="/admin/colleges" className="hover:text-indigo-600 font-medium">
          Colleges Catalog
        </Link>
        <span>&gt;</span>
        <span className="font-bold text-slate-900 truncate max-w-sm">Edit: {college.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Edit College Record</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Live Excel Source
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Modify any detail for {college.name}. Changes update immediately across search, catalog, and student views.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/colleges/${encodeURIComponent(college.slug || college.id)}`}
            target="_blank"
            className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            View Live Profile ↗
          </Link>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Section 1: Basic Information */}
        <Card className="p-6 bg-white border-slate-200 rounded-2xl shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>🏛️</span> Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                College Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                State *
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Location / City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Institution Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="PRIVATE">PRIVATE</option>
                <option value="GOVERNMENT">GOVERNMENT</option>
                <option value="DEEMED">DEEMED</option>
                <option value="AUTONOMOUS">AUTONOMOUS</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Student Rating (e.g. 4.7/5)
              </label>
              <input
                type="text"
                value={ratingDisplay}
                onChange={(e) => setRatingDisplay(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Annual Tuition Fees (e.g. ₹2.0–₹3.0 Lakh/year)
              </label>
              <input
                type="text"
                value={feesDisplay}
                onChange={(e) => setFeesDisplay(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Affiliation (University)
              </label>
              <input
                type="text"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Overview & Statements from Excel */}
        <Card className="p-6 bg-white border-slate-200 rounded-2xl shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>📝</span> Official Descriptions & Records
          </h2>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Institutional Overview
            </label>
            <textarea
              rows={3}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Placement Summary
            </label>
            <textarea
              rows={2}
              value={placementText}
              onChange={(e) => setPlacementText(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Student Reviews Summary
            </label>
            <textarea
              rows={2}
              value={reviewsText}
              onChange={(e) => setReviewsText(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </Card>

        {/* Section 3: Offered Branches / Courses */}
        <Card className="p-6 bg-white border-slate-200 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>🎓</span> Offered Engineering Branches ({selectedBranches.length} Selected)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle active programs or add custom specialized engineering branches.
              </p>
            </div>
          </div>

          {/* Standard Branch Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_STANDARD_BRANCHES.map((b) => {
              const isSelected = selectedBranches.includes(b.name);
              return (
                <label
                  key={b.name}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-300 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleBranch(b.name)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <span>{b.name.replace('B.E. / B.Tech ', '')}</span>
                    <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {b.code}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Custom Branches Input */}
          <div className="pt-3 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              placeholder="Add custom program (e.g. B.Tech Aerospace Engineering)..."
              value={newBranchInput}
              onChange={(e) => setNewBranchInput(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="button"
              onClick={handleAddCustomBranch}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              + Add Branch
            </button>
          </div>
        </Card>

        {/* Form Actions Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
          <Link
            href="/admin/colleges"
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
          >
            Cancel & Back
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={saving}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-8 py-3 rounded-xl shadow-lg"
          >
            💾 Save Changes & Reflect Live →
          </Button>
        </div>
      </form>
    </div>
  );
}
