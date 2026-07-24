import { useState, useRef, useEffect } from "react";
import { Printer, ChevronDown } from "lucide-react";

export default function AIPrintButton({
  onPrint,
})
 {

// console.log("AIPrintButton onPrint:", onPrint);
  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
  function handleClickOutside(event) {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target)
    ) {
      setOpen(false);
    }
  }

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () =>
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
}, []);


  const handleMenuClick = (showAnswers) => {
    // console.log("AIPrintButton clicked", showAnswers);
    setOpen(false);
    onPrint(showAnswers);
 
  };

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      <button
        onClick={() => {
            setOpen(!open);
        }}
        className="
            flex items-center gap-2
            rounded-lg border
            bg-white
            px-4 py-2
            text-sm font-medium
            hover:bg-gray-50
        "
        >
        <Printer size={18} />

        Print

        <ChevronDown size={16} />
      </button>

      {open && (
        <div
            className="
            absolute
            bottom-full
            right-0
            z-50
            mb-2
            w-60
            overflow-hidden
            rounded-lg
            border
            bg-white
            shadow-xl
            "
        >
    <button
        type="button"
        onClick={() => handleMenuClick(false)}
        className="
            w-full px-4 py-3
            text-left text-sm
            hover:bg-gray-50
        "
        >
        📄 Question Paper
    </button>

        <button
        type="button"
        onClick={() => handleMenuClick(true)}
        className="
            w-full px-4 py-3
            text-left text-sm
            hover:bg-gray-50
        "
        >
        📄✓ Question Paper (With Answers)
    </button>
  </div>
)}
    </div>
  );
}