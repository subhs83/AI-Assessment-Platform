import OptionCardGroup from "../../ui/OptionCardGroup";

import {
  Zap,
  BookOpen,
  NotebookPen,
  ClipboardList,
  GraduationCap,

  Leaf,
  Gauge,
  Flame,
  Sparkles,

  Brain,
  BookMarked,
  Wrench,
  Search,
  Scale,
  Settings2,
} from "lucide-react";

export default function AIQuestionSettings({
  difficulty,
  setDifficulty,

  bloomsLevel,
  setBloomsLevel,

  count,
  setCount,
}) {

  const questionOptions = [
  {
      label:"Quick Quiz",
      subtitle:"5 Questions",
      value:5,
      icon:Zap,
      theme:{
        icon:{
            normal:"bg-yellow-100 text-yellow-700",
            selected:"bg-yellow-500 text-white",
      },
      card: {
          normal: "border-slate-200",
          selected: "border-yellow-500 bg-yellow-50",
        },
    }
  },

  {
      label:"Class Test",
      subtitle:"10 Questions",
      value:10,
      icon:BookOpen,
      theme:{
        icon:{
          normal:"bg-blue-100 text-blue-700",
          selected:"bg-blue-600 text-white",
        },
        
        card: {
          normal: "border-slate-200",
          selected: "border-blue-500 bg-blue-50",
        },

      }
  },

  {
      label:"Practice Test",
      subtitle:"20 Questions",
      value:20,
      icon:NotebookPen,

      recommended:true,
      theme:{
        icon:{
          normal:"bg-emerald-100 text-emerald-700",
          selected:"bg-emerald-600 text-white",
        },

        card: {
          normal: "border-slate-200",
          selected: "border-emerald-500 bg-emerald-50",
        },
      }
  },

  {
      label:"Unit Test",
      subtitle:"30 Questions",
      value:30,
      icon:ClipboardList,
      theme:{
        icon:{
          normal:"bg-orange-100 text-orange-700",
          selected:"bg-orange-600 text-white",
        },

        card: {
          normal: "border-slate-200",
          selected: "border-orange-500 bg-orange-50",
        },
      }
  },

  {
      label:"Final Assessment",
      subtitle:"50 Questions",
      value:50,
      icon:GraduationCap,
      theme:{
        icon:{
          normal:"bg-violet-100 text-violet-700",
          selected:"bg-violet-600 text-white",
        },

        card: {
          normal: "border-slate-200",
          selected: "border-violet-500 bg-violet-50",
        },
      }
  },
  ];

  const difficultyOptions = [

  {
      label:"Easy",
      value:"easy",
      icon:Leaf,
      theme:{
        icon:{
          normal:"bg-green-100 text-green-700",
          selected:"bg-green-600 text-white",
        },

        card: {
          normal: "border-slate-200",
          selected: "border-green-500 bg-green-50",
        },
      }
  },

  {
      label:"Medium",
      value:"medium",
      icon:Gauge,
      theme:{
        icon:{
          normal:"bg-amber-100 text-amber-700",
          selected:"bg-amber-600 text-white",
        },

        card: {
          normal: "border-slate-200",
          selected: "border-amber-500 bg-amber-50",
        },
      }
  },

  {
      label:"Hard",
      value:"hard",
      icon:Flame,
      theme:{
        icon:{
        normal:"bg-red-100 text-red-700",
        selected:"bg-red-600 text-white",
        },

        card: {
          normal: "border-slate-200",
          selected: "border-red-500 bg-red-50",
        },
      }
  },

  {
      label:"Mixed",
      value:"mixed",
      icon:Sparkles,

      recommended:true,
      theme:{
        icon:{
          normal:"bg-purple-100 text-purple-700",
          selected:"bg-purple-600 text-white",
        },

        card: {
          normal: "border-slate-200",
          selected: "border-purple-500 bg-purple-50",
        },
      }
  },
  ];

  const bloomsOptions = [

  {
      label:"Remember",
      value:"remember",
      icon:Brain,
      theme:{
        icon:{
          normal:"bg-sky-100 text-sky-700",
          selected:"bg-sky-600 text-white",
        },

        card: {
          normal: "border-slate-200",
          selected: "border-sky-500 bg-sky-50",
        },
      }
  },

  {
      label:"Understand",
      value:"understand",
      icon:BookMarked,
      theme:{
        icon:{
          normal:"bg-indigo-100 text-indigo-700",
          selected:"bg-indigo-600 text-white",
        },

        card: {
          normal: "border-slate-200",
          selected: "border-indigo-500 bg-indigo-50",
        },
      }
  },

  {
      label:"Apply",
      value:"apply",
      icon:Wrench,
      theme:{
        icon:{
          normal:"bg-emerald-100 text-emerald-700",
          selected:"bg-emerald-600 text-white",
        },

        card: {
          normal: "border-slate-200",
          selected: "border-emerald-500 bg-emerald-50",
        },
      }
  },

  {
      label:"Analyze",
      value:"analyze",
      icon:Search,
      theme:{
        icon:{
          normal:"bg-orange-100 text-orange-700",
          selected:"bg-orange-600 text-white",
        },

        card: {
          normal: "border-slate-200",
          selected: "border-orange-500 bg-orange-50",
        },
      }
  },

  {
      label:"Evaluate",
      value:"evaluate",
      icon:Scale,
      theme:{
        icon:{
          normal:"bg-rose-100 text-rose-700",
          selected:"bg-rose-600 text-white",
        },

        card: {
          normal: "border-slate-200",
          selected: "border-rose-500 bg-rose-50",
        },
      }
  },

  {
      label:"Mixed",
      value:"mixed",
      icon:Sparkles,

      recommended:true,
      theme:{
        icon:{
          normal:"bg-violet-100 text-violet-700",
          selected:"bg-violet-600 text-white",
        },

        card: {
          normal: "border-slate-200",
          selected: "border-violet-500 bg-violet-50",
        },
      }
  },
  ];

  return (
    <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

      <div className="mb-8 flex items-start gap-4">

        <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">
          <Settings2 size={24} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Configure Questions
          </h2>

          <p className="mt-1 text-slate-500">
            Customize how AI generates questions for your assessment.
          </p>
        </div>

      </div>

      <div className="space-y-10">

        <OptionCardGroup
          title="Questions"
          description="Choose the number of questions to generate."
          value={count}
          onChange={setCount}
          options={questionOptions}
          columns={5}
        />

        <OptionCardGroup
          title="Difficulty"
          description="Select the overall difficulty level."
          value={difficulty}
          onChange={setDifficulty}
          options={difficultyOptions}
          columns={4}
        />

        <OptionCardGroup
          title="Bloom's Taxonomy"
          description="Focus on a learning objective or let AI balance them automatically."
          value={bloomsLevel}
          onChange={setBloomsLevel}
          options={bloomsOptions}
          columns={6}
        />

      </div>

    </section>
  );
}