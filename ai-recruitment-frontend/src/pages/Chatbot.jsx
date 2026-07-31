import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import MainLayout from "../layouts/MainLayout";
import { askRecruiterAI } from "../services/api";

function Chatbot() {
  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Welcome! I'm your AI Recruiter Assistant.\n\nI can analyze resumes, compare candidates, identify technical skills, and provide hiring recommendations.\n\nAsk me anything about the candidates in your recruitment database.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "Summarize a candidate.",
    "Who has the strongest technical skills?",
    "Which candidate has FastAPI experience?",
    "Who should I interview first?",
    "Compare two candidates.",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendQuestion = async () => {
    if (!question.trim()) return;

    const recruiterMessage = {
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, recruiterMessage]);

    setQuestion("");

    setLoading(true);

    try {
      const res = await askRecruiterAI(question);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.response,
        },
      ]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "❌ Sorry, something went wrong while contacting the AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const showSuggestions = messages.length === 1;

  return (
    <MainLayout>
  <div className="max-w-7xl mx-auto">

    {/* Header */}

    <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-3xl shadow-lg p-8 text-white">

        <h1 className="text-4xl font-bold">
          AI Recruiter Assistant
        </h1>



      

    </div>

    {/* Suggested Questions */}

    {showSuggestions && (

      <div className="mt-8 bg-white rounded-3xl shadow-lg p-8">

        <h2 className="text-xl font-bold text-gray-800 mb-5">
          Try asking...
        </h2>

        <div className="flex flex-wrap gap-3">

          {suggestedQuestions.map((item) => (

            <button
              key={item}
              onClick={() => setQuestion(item)}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-medium text-indigo-700 transition-all duration-200 hover:bg-indigo-600 hover:text-white hover:shadow-md"
            >
              {item}
            </button>

          ))}

        </div>

      </div>

    )}

    {/* Chat */}

    <div className="mt-8 bg-white rounded-3xl shadow-lg overflow-hidden">

      <div className="h-[550px] overflow-y-auto bg-gray-50 p-6 space-y-6">

        {messages.map((message, index) => (

          <div
            key={index}
            className={`flex ${
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >

            {message.role === "assistant" && (

              <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                AI
              </div>

            )}

            <div
              className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                message.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-800 shadow-md"
              }`}
            >

              {message.role === "assistant" ? (

                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>
                    {message.content}
                  </ReactMarkdown>
                </div>

              ) : (

                <div className="whitespace-pre-wrap">
                  {message.content}
                </div>

              )}

            </div>

            {message.role === "user" && (

              <div className="ml-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 font-bold text-white">
                You
              </div>

            )}

          </div>

        ))}

        {loading && (

          <div className="flex justify-start">

            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
              AI
            </div>

            <div className="rounded-2xl border bg-white px-5 py-4 shadow-sm">

              <div className="flex items-center gap-2">

                <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500"></div>

                <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:0.15s]"></div>

                <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:0.3s]"></div>

              </div>

            </div>

          </div>

        )}

        <div ref={messagesEndRef} />

      </div>

      {/* Input */}
            

      <div className="border-t bg-white p-5">

        <div className="flex gap-4">

          <input
            type="text"
            placeholder="Ask anything about any candidate..."
            className="flex-1 rounded-xl border border-gray-300 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                sendQuestion();
              }
            }}
          />

          <button
            onClick={sendQuestion}
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Thinking..." : "Send"}
          </button>

        </div>

      </div>

    </div>

  </div>

</MainLayout>

  );
}

export default Chatbot;
                  
          