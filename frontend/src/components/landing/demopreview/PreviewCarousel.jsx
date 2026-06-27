import { useEffect, useState } from "react";

import TeacherDashboardPreview from "./TeacherDashboardPreview";
import AIQuestionPreview from "./AIQuestionPreview";
import ExamCreationPreview from "./ExamCreationPreview";
import LeaderboardPreview from "./LeaderboardPreview";
import AIHistoryPreview from "./AIHistoryPreview";
import { motion, AnimatePresence } from "framer-motion";

export default function PreviewCarousel() {

const previews = [
{
title: "Teacher Dashboard",
component: <TeacherDashboardPreview />
},
{
title: "AI Question Generator",
component: <AIQuestionPreview />
},
{
title: "Exam Creation",
component: <ExamCreationPreview />
},
{
title: "Leaderboard",
component: <LeaderboardPreview />
},
{
title: "AI History",
component: <AIHistoryPreview />
}
];

const [current, setCurrent] = useState(0);

useEffect(() => {

const interval = setInterval(() => {

  setCurrent((prev) => (prev + 1) % previews.length);

}, 4000);

return () => clearInterval(interval);

}, [previews.length]);

return (

<div className="space-y-6">

  {/* Current Preview */}

  <AnimatePresence mode="wait">

      <motion.div
        key={current}
        initial={{
          opacity: 0,
          x: 40
        }}
        animate={{
          opacity: 1,
          x: 0
        }}
        exit={{
          opacity: 0,
          x: -40
        }}
        transition={{
          duration: 0.4
        }}
      >

        {previews[current].component}

      </motion.div>

    </AnimatePresence>

  {/* Dots */}

  <div className="flex items-center justify-center gap-3">

    {previews.map((_, index) => (

      <button
        key={index}
        onClick={() => setCurrent(index)}
        className={`
          h-3
          rounded-full
          transition-all
          duration-300
          hover:scale-110
          ${
            current === index
              ? "w-10 bg-blue-600"
              : "w-3 bg-gray-300 hover:bg-gray-400"
          }
        `}
      />

    ))}

  </div>

  {/* Title */}

  <div className="text-center">

    <div className="text-sm text-gray-500">
      Platform Preview
    </div>

    <AnimatePresence mode="wait">

        <motion.div
          key={current}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="font-semibold text-gray-900 mt-1"
        >

          {previews[current].title}

        </motion.div>

      </AnimatePresence>

  </div>

</div>

);
}
