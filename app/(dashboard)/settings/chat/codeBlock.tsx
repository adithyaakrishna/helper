import { Highlight } from "prism-react-renderer";
import CodeCopyButton from "./codeCopyButton";

const theme = {
  plain: {
    backgroundColor: "transparent",
    color: "var(--syntax-plain)",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "var(--syntax-comment)" },
    },
    {
      types: ["keyword", "attr-name"],
      style: { color: "var(--syntax-keyword)" },
    },
    {
      types: ["function", "tag"],
      style: { color: "var(--syntax-function)" },
    },
    {
      types: ["string", "attr-value"],
      style: { color: "var(--syntax-string)" },
    },
    {
      types: ["number", "variable", "boolean"],
      style: { color: "var(--syntax-number)" },
    },
  ],
};

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  return (
    <div className="relative rounded-xl border bg-muted/50 p-4 pr-12 text-sm font-mono shadow-sm">
      <Highlight code={code} language={language} theme={theme}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} overflow-x-auto`} style={{ ...style }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="leading-relaxed">
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
      <CodeCopyButton code={code} />
    </div>
  );
};

export default CodeBlock;
