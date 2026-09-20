import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, UploadCloud } from "lucide-react";
import { useEduPath } from "../context/EduPathContext";
import SkillInputWithSuggestions from "../components/SkillInputWithSuggestions";

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, saveProfile, uploadResume, availableRoles } = useEduPath();

  const [formData, setFormData] = useState({
    name: profile.name && profile.name !== "Learner" ? profile.name : "",
    experience: profile.experience || "1–3 Years",
    targetRole: profile.targetRole && profile.targetRole !== "Not specified" ? profile.targetRole : "Data Analyst",
    currentSkills: profile.currentSkills ? profile.currentSkills.join(", ") : "",
    careerGoal: profile.careerGoal || "",
    learningPace: "Moderate (4-6 hrs/week)",
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFilename, setResumeFilename] = useState(profile.resumeFilename || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setResumeFilename(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const parsedSkills = formData.currentSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await saveProfile({
        name: formData.name || "Learner",
        experience: formData.experience,
        targetRole: formData.targetRole || "Data Analyst",
        currentSkills: parsedSkills,
        careerGoal: formData.careerGoal,
      });

      if (resumeFile) {
        await uploadResume(resumeFile);
      }

      navigate("/analysis");
    } catch (err) {
      console.error("Failed to save profile:", err);
      setErrorMessage(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-zinc-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-zinc-200">
          <Link
            to="/"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1.5 transition"
          >
            <ArrowLeft size={14} />
            <span>Return to EduPath overview</span>
          </Link>
          <span className="text-xs text-zinc-400 font-mono">Step 1 of 2: Profile Setup</span>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Learner Configuration
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
            Define your role and baseline skills.
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed">
            EduPath compares your current capabilities against requirements for your target
            role to isolate priority gaps.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="p-6 rounded-md border border-zinc-200 bg-white space-y-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            {/* Name & Experience */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Alex Morgan"
                  className="w-full text-xs p-2.5 rounded border border-zinc-200 bg-white text-zinc-900 outline-none focus:border-zinc-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Experience level
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 rounded border border-zinc-200 bg-white text-zinc-900 outline-none focus:border-zinc-400 transition"
                >
                  <option value="Student / Career Switcher">Student / Career Switcher</option>
                  <option value="0–1 Years">0–1 Years</option>
                  <option value="1–3 Years">1–3 Years</option>
                  <option value="3–5 Years">3–5 Years</option>
                  <option value="5+ Years">5+ Years</option>
                </select>
              </div>
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Target career or role
              </label>
              <input
                type="text"
                name="targetRole"
                value={formData.targetRole}
                onChange={handleInputChange}
                required
                placeholder="e.g. Data Analyst, Frontend Developer..."
                className="w-full text-xs p-2.5 rounded border border-zinc-200 bg-white text-zinc-900 outline-none focus:border-zinc-400 transition"
              />

              {availableRoles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-zinc-400 mr-1">Quick select:</span>
                  {availableRoles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, targetRole: r.title }))}
                      className="px-2 py-0.5 rounded text-[11px] border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 transition"
                    >
                      {r.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current Skills */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-700">
                  Current skills and tools (comma separated)
                </label>
                <span className="text-[11px] text-zinc-400">
                  Dynamic auto-suggestions enabled
                </span>
              </div>
              <SkillInputWithSuggestions
                name="currentSkills"
                value={formData.currentSkills}
                onChange={handleInputChange}
                targetRole={formData.targetRole}
                required
                placeholder="Type a skill (e.g. Python, SQL, React...) to see dynamic suggestions"
              />
            </div>

            {/* Career Goal */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Target objective (3–6 month horizon)
              </label>
              <textarea
                name="careerGoal"
                value={formData.careerGoal}
                onChange={handleInputChange}
                rows={2}
                placeholder="e.g. Pass technical screenings and build a verified portfolio."
                className="w-full text-xs p-2.5 rounded border border-zinc-200 bg-white text-zinc-900 outline-none focus:border-zinc-400 transition resize-none leading-relaxed"
              />
            </div>

            {/* Resume Upload Box */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Resume or portfolio summary (optional)
              </label>
              <label className="flex flex-col items-center justify-center p-5 rounded border border-dashed border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100/50 cursor-pointer transition">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <UploadCloud size={20} className="text-zinc-400 mb-2" />
                {resumeFilename ? (
                  <div className="text-center">
                    <span className="text-xs font-medium text-zinc-900 block">
                      {resumeFilename}
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      Click to replace document
                    </span>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-xs font-medium text-zinc-700 block">
                      Upload resume file (PDF or DOCX)
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      The Profile Agent will parse your projects and verified libraries
                    </span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <Link
              to="/dashboard"
              className="text-xs text-zinc-500 hover:text-zinc-800 transition"
            >
              Skip setup and view current workspace
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-medium bg-zinc-950 text-white hover:bg-zinc-800 transition disabled:opacity-50"
            >
              <span>{isSubmitting ? "Saving Profile..." : "Analyze capabilities & skill gaps"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}