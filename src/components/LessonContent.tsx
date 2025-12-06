import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";
import "katex/dist/katex.min.css";

interface BlockProps {
  type: string;
  children: React.ReactNode;
}

const BLOCKS: Record<string, React.FC<BlockProps>> = {
  tip: ({ children }) => (
    <div className="my-6 border-l-4 border-green-500 bg-green-500/10 p-4">
      <h4 className="font-bold text-green-400">Tip</h4>
      <div className="text-green-100">{children}</div>
    </div>
  ),

  warning: ({ children }) => (
    <div className="my-6 border border-red-500 bg-red-900/20 p-4 text-center">
      <strong className="tracking-widest text-red-400 uppercase">Uwaga</strong>
      <div className="text-red-200">{children}</div>
    </div>
  ),

  definition: ({ children }) => (
    <div className="my-6 border-l-4 border-purple-500 pl-6">
      <span className="text-xs text-purple-400 uppercase">Definition</span>
      <div className="font-serif text-xl text-gray-300 italic">{children}</div>
    </div>
  ),

  example: ({ children }) => (
    <div className="my-6 border-l-4 border-blue-500 bg-blue-500/10 p-4">
      <h4 className="font-bold text-blue-400">Przykłady</h4>
      <div className="text-blue-100">{children}</div>
    </div>
  ),

  default: ({ type, children }) => (
    <div className="relative my-4 rounded border border-gray-700 bg-gray-800 p-4">
      <span className="absolute -top-3 left-4 rounded border border-gray-700 bg-gray-900 px-2 font-mono text-xs text-gray-500 uppercase">
        {type}
      </span>
      <div className="mt-2 text-gray-300">{children}</div>
    </div>
  ),
};

function remarkCalloutDirectives() {
  return (tree: any) => {
    visit(tree, (node) => {
      if (
        node.type === "containerDirective" ||
        node.type === "leafDirective" ||
        node.type === "textDirective"
      ) {
        const data = node.data || (node.data = {});
        data.hName = node.type === "textDirective" ? "span" : "div";
        data.hProperties = {
          ...((node.attributes as any) || {}),
          className: `callout ${node.name}`,
        };
      }
    });
  };
}

//HANDLING CHARTS AND INTERACTIVE CONTENT

interface ChartProps {
  data: any;
}

const CHARTS: Record<string, React.FC<ChartProps>> = {
  bar: ({ data }) => (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <h4 className="mb-4 text-center text-sm text-neutral-400">
        {data.title}
      </h4>
      <div className="flex h-32 items-end justify-center gap-2">
        {data.values.map((val: number, i: number) => (
          <div
            key={i}
            className="w-8 rounded-t bg-blue-500 transition-all hover:bg-blue-400"
            style={{ height: `${val}%` }}
            title={`${val}%`}
          ></div>
        ))}
      </div>
      <div className="mt-2 text-center text-xs text-neutral-500">
        Figure 1.1
      </div>
    </div>
  ),
};

const ChartRenderer = ({ codeString }: { codeString: string }) => {
  try {
    // 1. Parse the JSON config
    const config = JSON.parse(codeString);

    // 2. Find the component based on the "type" field in JSON
    const ChartComponent = CHARTS[config.type];

    if (!ChartComponent) {
      return (
        <div className="text-sm text-red-500">
          Unknown chart type: {config.type}
        </div>
      );
    }

    // 3. Render the chart
    return <ChartComponent data={config} />;
  } catch (error) {
    return (
      <div className="rounded border border-red-500/50 bg-red-900/20 p-4 font-mono text-xs text-red-200">
        <strong>Error parsing graph data:</strong>
        <br />
        {(error as Error).message}
      </div>
    );
  }
};

export default function LessonContent({ content }: { content: string }) {
  return (
    <div className="prose-lg prose-invert numbered-content max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkDirective, remarkCalloutDirectives]}
        rehypePlugins={[[rehypeKatex]]}
        components={{
          //HANDLES LOADING CUSTOM CALLOUTS AND DIVS
          div({ className, children, ...props }) {
            // 1. Check if it's a callout
            if (className?.includes("callout")) {
              const type = className.replace("callout ", "");

              // 2. Look up the component in the dictionary
              const Component = BLOCKS[type] || BLOCKS.default;

              //it has to be something maybe a default so we can safely call it
              return <Component type={type}>{children}</Component>;
            }

            // Standard div
            return (
              <div className={className} {...props}>
                {children}
              </div>
            );
          },

          //HANDLES LOADING INTERACTIVE COMPONENTS
          code(props) {
            const { className, children, ...rest } = props;

            // Check if the language is "chart"
            // Example markdown: ```chart
            const match = /language-(\w+)/.exec(className || "");

            if (match && match[1] === "chart") {
              // Pass the inner text (the JSON) to our renderer
              return (
                <ChartRenderer
                  codeString={String(children).replace(/\n$/, "")}
                />
              );
            }

            // Fallback: Render standard code block
            return (
              <code className={className} {...rest}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
