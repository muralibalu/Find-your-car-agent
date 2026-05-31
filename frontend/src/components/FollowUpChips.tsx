interface Props {
  chips: string[]
  onSelect: (question: string) => void
}

export default function FollowUpChips({ chips, onSelect }: Props) {
  return (
    <div className="pt-2">
      <p className="text-xs text-gray-400 mb-2">You might want to ask:</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, i) => (
          <button
            key={i}
            onClick={() => onSelect(chip)}
            className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl hover:border-blue-400 hover:text-blue-600 transition shadow-sm"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}
