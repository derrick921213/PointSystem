import React, { useEffect, useState } from "react";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import axios from "axios";
import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import SubmitExam from "@site/src/components/SubmitExam";

// Define a type for the evaluated MDX module
type MDXModule = {
  default: React.ComponentType;
};

type Metadata = {
  [key: string]: any;
};

function useMDX(content: string, baseUrl: string) {
  const [exports, setExports] = useState<MDXModule>({
    default: runtime.Fragment,
  });

  useEffect(() => {
    evaluate(content, { ...runtime, baseUrl }).then((module: MDXModule) =>
      setExports(module)
    );
  }, [content, baseUrl]);

  return exports;
}

function extractMetadata(content: string): {
  metadata: Metadata;
  content: string;
} {
  const metadata: Metadata = {};
  const metadataRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(metadataRegex);

  if (match) {
    const metadataContent = match[1];
    metadataContent.split("\n").forEach((line) => {
      const [key, value] = line.split(":").map((item) => item.trim());
      if (key && value) {
        metadata[key] = value;
      }
    });

    content = content.replace(metadataRegex, "").trim();
  }

  return { metadata, content };
}

function DynamicPage() {
  const urlParams = new URLSearchParams(window.location.search);
  let filename = urlParams.get("filename") || "q1";
  if (!filename.endsWith(".mdx")) {
    filename += ".mdx";
  }
  const [mdxContent, setMdxContent] = useState<string>("");
  const [metadata, setMetadata] = useState<Metadata>({});
  const [totalQuizs, setTotalQuizs] = useState<number>(0);

  useEffect(() => {
    async function fetchMdx() {
      try {
        const response = await axios.get(
          `http://localhost:8000/files/markdown/${filename}`,
          {
            withCredentials: true,
          }
        );
        const total_quizs = await axios.get(
          `http://localhost:8000/files/q_count`,
          {
            withCredentials: true,
          }
        );

        const { data } = response;
        const quiz_counter = total_quizs.data.total;
        console.log(quiz_counter);
        const { metadata, content } = extractMetadata(data);
        setMdxContent(content);
        setMetadata(metadata);
        setTotalQuizs(quiz_counter);
      } catch (error) {
        console.error("Error fetching MDX content:", error);
      }
    }

    fetchMdx();
  }, [filename]);

  const baseUrl = document.location.origin;
  const exports = useMDX(mdxContent, baseUrl);
  const Content = exports.default;

  return (
    <Layout title={metadata.title || "Dynamic MDX Page"}>
      <div className="container">
        {Content && (
          <MDXProvider>
            <Content />
          </MDXProvider>
        )}
        <SubmitExam metadata={metadata} totalQuizs={totalQuizs} />
      </div>
    </Layout>
  );
}

export default DynamicPage;
