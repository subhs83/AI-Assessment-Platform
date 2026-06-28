import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import aiApi from "../../../api/aiApi";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";

import {
  FileText,
  Type,
  Image as ImageIcon,
  Eye,
  RefreshCw,
  Search,
  History
} from "lucide-react";

export default function AIHistoryPage() {
  const { schoolSlug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);

      const res = await aiApi.getHistory(schoolSlug, {
        search,
        difficulty,
        status,
        page,
        limit,
      });

      setData(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  },[schoolSlug,search, difficulty, status, page, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);


  useEffect(() => {
    const container = document.querySelector("main");

    if (container) {
      container.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [page]);

  // -------------------------
  // SOURCE ICON
  // -------------------------
  const getSourceIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileText size={14} />;
      case "image":
        return <ImageIcon size={14} />;
      default:
        return <Type size={14} />;
    }
  };

      // -------------------------
      // View Questions Handler
      // -------------------------

  const handleView = (id) => {
    navigate(
      `/school/${schoolSlug}/teacher/ai/preview/${id}`
    );
  };  
    // -------------------------
    // Again Generate Handler
    // -------------------------

const handleGenerateAgain = (item) => {
    navigate(
      `/school/${schoolSlug}/teacher/ai/generate`,
      {
        state: {
          fromHistory: true,
          source_type: item.source_type,
          source_text: item.source_text,
          topic: item.topic,
          difficulty: item.difficulty,
          question_count: item.question_count,
        },
      }
    );
  };

  return (
  <div className="max-w-5xl mx-auto">
      {/* HEADER */}
      <PageHeader
        title="AI Question History"
        description="Browse and manage previously generated AI question sets."
        actions={""}
      />

      {/* FILTERS */}
      <div className="bg-white border rounded-xl p-4 mb-5 shadow-sm">

        <div className="flex flex-col md:flex-row gap-3">

          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              className="w-full border rounded-lg pl-9 pr-3 py-2"
              placeholder="Search topic..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          <select
            className="border rounded-lg px-3 py-2"
            value={difficulty}
            onChange={(e) => {
              setPage(1);
              setDifficulty(e.target.value);
            }}
          >
            <option value="">All Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            className="border rounded-lg px-3 py-2"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

        </div>

      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-10 text-gray-500">
          Loading AI History...
        </div>
      )}

      {/* EMPTY */}
      {!loading && data.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center">

          <History
            size={40}
            className="mx-auto mb-3 text-gray-400"
          />

          <h3 className="font-semibold">
            No AI History Found
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Generate your first AI question set to see it here.
          </p>

        </div>
      )}

      {/* LIST */}
      <div className="space-y-4">

        {data.map((item) => (

          <div
            key={item.id}
            className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
          >

            <div className="flex flex-col gap-4">

              {/* TOP */}
              <div>

                <div className="flex flex-wrap items-center gap-2 mb-2">

                  <span
                    className={`text-xs px-2 py-1 rounded-full flex items-center gap-1
                      ${
                        item.source_type === "pdf"
                          ? "bg-red-100 text-red-700"
                          : item.source_type === "image"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }
                    `}
                  >
                    {getSourceIcon(item.source_type)}
                    {item.source_type?.toUpperCase()}
                  </span>

                  <span
                    className={`text-xs px-2 py-1 rounded-full
                      ${
                        item.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    `}
                  >
                    {item.status}
                  </span>

                </div>

                <h2 className="font-semibold text-lg line-clamp-2 truncate">
                  {item.topic || "Untitled"}
                </h2>

                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">

                  <span>
                    Difficulty: {item.difficulty}
                  </span>

                  <span>
                    Questions: {item.question_count}
                  </span>

                </div>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(item.created_at).toLocaleString()}
                </p>

              </div>

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2">

                <Button
                  variant="info"
                  onClick={() => handleView(item.id)}
                >
                  <Eye size={16} />
                  View Questions
                </Button>

                <Button
                  variant="success"
                  onClick={() => handleGenerateAgain(item)}
                >
                  <RefreshCw size={16} />
                  Generate Again
                </Button>

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* PAGINATION */}
      {!loading && data.length > 0 && (
        <div className="flex justify-center items-center gap-3 mt-6">

          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => {
              setPage(page - 1);
            }}
          >
            Previous
          </Button>

          <span className="text-sm font-medium">
            Page {page}
          </span>

          <Button
            variant="secondary"
            disabled={data.length < limit}
            onClick={() => {
              setPage(page + 1);

            }}
          >
            Next
          </Button>

        </div>
      )}

    </div>
  );
}