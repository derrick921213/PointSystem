// src/pages/index.tsx
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import { useEffect, useState } from "react";

import styles from "./index.module.css";

function HomepageHeader({ examCompleted }: { examCompleted: boolean }) {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {examCompleted ? "恭喜完成考試" : siteConfig.title}
        </Heading>
        {!examCompleted && <p className="hero__subtitle">{siteConfig.tagline}</p>}
        {!examCompleted && (
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/docs/tutorial/intro"
            >
              開始學習GIT
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const [examCompleted, setExamCompleted] = useState(false);

  useEffect(() => {
    const examCompletedFlag = localStorage.getItem('examCompleted') === 'true';
    setExamCompleted(examCompletedFlag);

    if (examCompletedFlag) {
      localStorage.removeItem('examCompleted');
    }
  }, []);

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader examCompleted={examCompleted} />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
