import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ComponentPropsWithoutRef } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Headings
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-4 mb-2" {...props}>
              {children}
            </h4>
          ),

          // Paragraphs
          p: ({ children, ...props }) => (
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed" {...props}>
              {children}
            </p>
          ),

          // Links
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
              {...props}
            >
              {children}
            </a>
          ),

          // Lists
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-gray-700 dark:text-gray-300" {...props}>
              {children}
            </li>
          ),

          // Code
          code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="bg-transparent  text-gray-300 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={`${className} block`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => (
            <pre
              className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-lg p-4 mb-4 overflow-x-auto text-sm font-mono"
              {...props}
            >
              {children}
            </pre>
          ),

          // Blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 pl-4 py-2 my-4 text-gray-700 dark:text-gray-300 italic"
              {...props}
            >
              {children}
            </blockquote>
          ),

          // Tables
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th
              className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white"
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700"
              {...props}
            >
              {children}
            </td>
          ),

          // Horizontal rule
          hr: () => (
            <hr className="my-8 border-gray-200 dark:border-gray-700" />
          ),

          // Strong and emphasis
          strong: ({ children, ...props }) => (
            <strong className="font-bold text-gray-900 dark:text-white" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-gray-800 dark:text-gray-200" {...props}>
              {children}
            </em>
          ),

          // Details/Summary (for expandable sections)
          details: ({ children, ...props }) => (
            <details
              className="mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
              {...props}
            >
              {children}
            </details>
          ),
          summary: ({ children, ...props }) => (
            <summary
              className="px-4 py-2 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg"
              {...props}
            >
              {children}
            </summary>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
