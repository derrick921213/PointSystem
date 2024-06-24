// File: src/pages/index.js

import React from 'react';
import Layout from '@theme/Layout';
import FileUploader from '@site/src/components/FileUploader';

export default function Home() {
  return (
    <Layout
      title="File Upload Example"
      description="Example of a file upload component using Docusaurus">
      <div style={{ padding: '20px' }}>
        <h1>File Upload Example</h1>
        <FileUploader />
      </div>
    </Layout>
  );
}
