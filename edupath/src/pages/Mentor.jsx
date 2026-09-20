import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { useEduPath } from "../context/EduPathContext";

export default function Mentor() {
  const { profile, currentFocus, skills, sendAdvisorMessage } = useEduPath();
  const [inputQuery, setInputQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const idRef = useRef(100);

  const gapSkillNames =
    skills
      .filter((s) => s.status === "Gap" || s.status === "Improve")
      .map((s) => s.skill)
      .join(", ") || "None identified";

  const [conversation, setConversation] = useState([
    {
      id: "msg-1",
      sender: "advisor",
      text: `Hello ${profile.name || "Learner"}. I am your curriculum advisor. I maintain direct context on your target role (${profile.targetRole || "Target Role"}), your evaluated skills, and your active focus (${currentFocus?.title || "current module"}). How can I clarify your roadmap today?`,
    },
  ]);

  const recommendedPrompts = [
    `Why is ${currentFocus?.title || "this topic"} prioritized ahead of other modules?`,
    `What interview questions should I expect for ${profile.targetRole || "this role"}?`,
    "How does the practice task relate to real workplace challenges?",
    "Can I skip a module if I already have practical experience?",
  ];

  const handleSend = async (textToSend) => {
    const text = textToSend || inputQuery.trim();
    if (!text || isThinking) return;

    idRef.current += 1;
    const userMsg = { id: `user-${idRef.current}`, sender: "user", text };
    setConversation((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsThinking(true);

    try {
      if (sendAdvisorMessage) {
        const response = await sendAdvisorMessage(text);
        idRef.current += 1;
        setConversation((prev) => [
          ...prev,
          {
            id: `adv-${idRef.current}`,
            sender: "advisor",
            text: response.reply || response.text || response.message || "I have analyzed your profile against the target curriculum.",
          },
        ]);
      }
    } catch (err) {
      console.warn("Using contextual advisor response:", err);
      idRef.current += 1;
      setConversation((prev) => [
        ...prev,
        {
          id: `adv-${idRef.current}`,
          sender: "advisor",
          text: `In the context of your ${profile.targetRole} roadmap, focusing on resolving your gaps in ${gapSkillNames} will yield the highest interview qualification rate. Feel free to complete the practice exercises to reinforce these concepts.`,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-zinc-200/80 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Learning Advisor
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Curriculum reasoning and guidance evaluated against your profile.
        </p>
      </div>

      {/* Context Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-md border border-zinc-200 bg-white">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
            Target Role
          </span>
          <span className="font-semibold text-zinc-900 mt-0.5 block truncate">
            {profile.targetRole}
          </span>
        </div>
        <div className="p-3 rounded-md border border-zinc-200 bg-white">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
            Active Focus
          </span>
          <span className="font-semibold text-zinc-900 mt-0.5 block truncate">
            {currentFocus?.title}
          </span>
        </div>
        <div className="p-3 rounded-md border border-zinc-200 bg-white">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
            Identified Gaps
          </span>
          <span className="font-semibold text-zinc-900 mt-0.5 block truncate" title={gapSkillNames}>
            {gapSkillNames}
          </span>
        </div>
      </div>

      {/* Main Conversation Container */}
      <div className="rounded-md border border-zinc-200 bg-white flex flex-col min-h-[460px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {/* Messages */}
        <div className="flex-1 p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
          {conversation.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-md leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-50 border border-zinc-200/80 text-zinc-800"
                }`}
              >
                {msg.sender === "advisor" && (
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 mb-1">
                    EduPath Advisor
                  </div>
                )}
                <div className="text-xs">{msg.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Suggested Queries */}
        <div className="px-5 py-3 border-t border-zinc-100 bg-[#fbfbf9]">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 block mb-2">
            Contextual prompts:
          </span>
          <div className="flex flex-wrap gap-2">
            {recommendedPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                className="text-left text-[11px] px-2.5 py-1 rounded border border-zinc-200 bg-white text-zinc-700 hover:text-zinc-950 hover:border-zinc-300 transition"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-zinc-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask a question about your ${profile.targetRole} curriculum...`}
              className="flex-1 text-xs px-3.5 py-2.5 rounded border border-zinc-200 outline-none focus:border-zinc-400 transition"
            />
            <button
              type="submit"
              className="px-3.5 py-2.5 rounded text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition flex items-center gap-1.5"
            >
              <span>Ask</span>
              <Send size={12} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}