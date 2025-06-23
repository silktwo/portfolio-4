interface MdxProps {
  code: string
}

export function Mdx({ code }: MdxProps) {
  // For now, we'll render the code as plain text
  // In a full implementation, you'd use @mdx-js/react or similar
  return (
    <div className="prose prose-sm max-w-none">
      <div className="whitespace-pre-wrap text-sm text-gray-700">{code}</div>
    </div>
  )
}
