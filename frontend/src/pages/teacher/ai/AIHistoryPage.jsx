import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import aiApi from "../../../api/aiApi";
import PageHeader from "../../../components/ui/PageHeader";
import {
  HistoryList,
  HistoryFilters,
  HistoryEmptyState,
  HistoryPagination,
} from "../../../components/teacher/ai-history";
import HistorySkeleton from "../../../components/teacher/ai-history/HistorySkeleton";
import { useToast } from "../../../components/ui/Toast";



export default function AIHistoryPage() {
  const { schoolSlug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);

      const res = await aiApi.getHistory(schoolSlug, {
        search,
        difficulty,
        status,
        source_type: sourceType,
        page,
        limit,
      });

      setData(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  },[schoolSlug,search, difficulty, status, page, limit, sourceType]);

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

  const handleGenerate = () => {
    navigate(
      `/school/${schoolSlug}/teacher/ai/generate`
    );
  };

  const handleClearFilters = () => {
    setSearch("");
    setDifficulty("");
    setStatus("");
    setSourceType("");
    setPage(1);
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
      <HistoryFilters
        search={search}
        setSearch={setSearch}

        difficulty={difficulty}
        setDifficulty={setDifficulty}

        status={status}
        setStatus={setStatus}

        sourceType={sourceType}
        setSourceType={setSourceType}

        setPage={setPage}

        onClear={handleClearFilters}
      />
      {/* LOADING */}
      {loading && (
        <HistorySkeleton />
      )}

      {!loading && data.length === 0 && (
        <HistoryEmptyState
          onGenerate={handleGenerate}
        />
      )}

      {/* LIST */}
      <HistoryList
        data={data}
        onView={handleView}
        onGenerateAgain={handleGenerateAgain}
      />

      {/* PAGINATION */}
      {!loading && data.length > 0 && (
      <HistoryPagination
        page={page}
        limit={limit}
        dataLength={data.length}
        setPage={setPage}
      />
    )}

    </div>
  );
}