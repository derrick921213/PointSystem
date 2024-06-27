// File: src/components/FileUploader.js

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import styles from "./FileUploader.module.css";

const FileUploader = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState(null);
  const UploadURL = `${window.location.protocol}//${window.location.hostname}:8000/files/markdown`;

  const onDrop = useCallback((acceptedFiles) => {
    const validExtensions = [".md", ".mdx"];
    const filteredFiles = acceptedFiles.filter((file) =>
      validExtensions.includes(file.name.slice(-4))
    );

    if (filteredFiles.length !== acceptedFiles.length) {
      setError("Only .md and .mdx files are allowed");
      return;
    }

    const uploadPromises = filteredFiles.map((file) => {
      const formData = new FormData();
      formData.append("file", file);

      return axios.post(`${UploadURL}/${file.name}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Cache-Control": "no-cache",
        },
        withCredentials: true,
      });
    });

    Promise.all(uploadPromises)
      .then((responses) => {
        const newFiles = filteredFiles.map((file) => file.name);
        setUploadedFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setError(null);
      })
      .catch((err) => {
        setError("An error occurred while uploading files");
        console.error(err);
      });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    accept: { "plain/text": [".md", ".mdx"] }, // Convert array to comma-separated string
  });

  return (
    <div {...getRootProps({ className: styles.dropzone })}>
      <input
        {...getInputProps()}
        {...({
          webkitdirectory: "true",
        } as React.InputHTMLAttributes<HTMLInputElement>)}
      />
      <p>Drag & drop some files here, or click to select files</p>
      <em>(Only .md and .mdx files will be accepted)</em>

      {error && <p className={styles.error}>{error}</p>}

      <h4>Uploaded Files:</h4>
      <ul>
        {uploadedFiles.map((file) => (
          <li key={file}>{file}</li>
        ))}
      </ul>
    </div>
  );
};

export default FileUploader;
