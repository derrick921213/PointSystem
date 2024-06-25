// File: src/pages/index.js

import React from 'react';
import Layout from '@theme/Layout';
import FileManager from '@site/src/components/FileManager';

export default function File() {
  return (
    <Layout
      title="File Manage"
      description="File Manage">
      <div style={{ padding: '20px' }}>
        <h1>File Manage</h1>
        <FileManager/>
      </div>
    </Layout>
  );
}
