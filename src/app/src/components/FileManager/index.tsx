import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Form,
  InputGroup,
  ListGroup,
  Container,
  Row,
  Col,
  Breadcrumb,
  Modal,
  Dropdown,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faFileAlt,
  faTrash,
  faArrowUp,
  faUpload,
  faCopy,
  faCut,
  faPaste,
  faEdit,
  faLink,
  faFolderPlus,
  faFileArchive,
  faCloudDownloadAlt,
  faUserShield,
  faUserTag,
  faTags,
  faKey,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css";
import Swal from "sweetalert2";
interface File {
  name: string;
  isDirectory: boolean;
}

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [path, setPath] = useState<string>("markdown");
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [searchString, setSearchString] = useState<string>("");
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file: File;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [theme, setTheme] = useState<string>("light"); // 默认为浅色主题
  const [newName, setNewName] = useState<string>("");
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const API = `${window.location.protocol}//${window.location.hostname}:8000/files/FileOperations`;
  const AUTH_API = `${window.location.protocol}//${window.location.hostname}:8000/auth/isLogin`;
  useEffect(() => {
    checkAdminStatus();
  }, [path]);
  const checkAdminStatus = async () => {
    try {
      const response = await axios.get(AUTH_API, {
        headers: {
          "Cache-Control": "no-store",
        },
        withCredentials: true,
      });
      if (response.data.is_logged_in && response.data.permission === "admin") {
        fetchFiles(path);
      } else {
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "You do not have permission to access this resource.",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.href = "/";
        });
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while checking admin status.",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.href = "/";
      });
    }
  };
  const fetchFiles = async (path: string) => {
    try {
      const response = await axios.post(
        API,
        {
          Action: "read",
          Path: path,
          ShowHiddenItems: false,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
          withCredentials: true,
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setFiles(response.data);
      } else {
        console.error("Unexpected response data:", response.data);
        setFiles([]);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    }
  };

  const handleDelete = async () => {
    if (selectedFile) {
      try {
        await axios.post(
          API,
          {
            Action: "delete",
            Path: path,
            Names: [selectedFile.name],
          },
          {
            headers: {
              "Cache-Control": "no-store",
            },
            withCredentials: true,
          }
        );
        fetchFiles(path);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
      setSelectedFile(null);
      setContextMenu(null);
    }
  };

  const handleCreateFolder = async () => {
    try {
      await axios.post(
        API,
        {
          Action: "create",
          Path: path,
          Name: newFolderName,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
          withCredentials: true,
        }
      );
      setNewFolderName("");
      fetchFiles(path);
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post(
        API,
        {
          Action: "search",
          Path: path,
          SearchString: searchString,
          ShowHiddenItems: false,
          CaseSensitive: false,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
          withCredentials: true,
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setFiles(response.data);
      } else {
        console.error("Unexpected response data:", response.data);
        setFiles([]);
      }
    } catch (error) {
      console.error("Error searching files:", error);
      setFiles([]);
    }
  };

  const navigateToFolder = (folderName: string) => {
    const newPath = `${path}/${folderName}`;
    setPath(newPath);
  };

  const navigateUp = () => {
    const newPath = path.split("/").slice(0, -1).join("/");
    setPath(newPath || "markdown");
  };

  const handleUpload = async () => {
    if (uploadFiles) {
      const formData = new FormData();
      for (let i = 0; i < uploadFiles.length; i++) {
        formData.append("upload_files", uploadFiles[i]);
      }

      try {
        await axios.post(
          `${window.location.protocol}//${window.location.hostname}:8000/files/Upload?path=${path}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "Cache-Control": "no-cache",
            },

            withCredentials: true,
          }
        );
        setShowUploadModal(false);
        setUploadFiles(null);
        fetchFiles(path);
      } catch (error) {
        console.error("Error uploading files:", error);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadFiles(event.target.files);
  };

  const handleContextMenu = (event: React.MouseEvent, file: File) => {
    event.preventDefault();
    setSelectedFile(file);
    setContextMenu({ x: event.clientX, y: event.clientY, file });
  };

  const handleCopy = async () => {
    if (selectedFile) {
      try {
        await axios.post(
          API,
          {
            Action: "copy",
            Path: path,
            TargetPath: path,
            Names: [selectedFile.name],
            RenameFiles: false,
          },
          {
            headers: {
              "Cache-Control": "no-store",
            },
            withCredentials: true,
          }
        );
        fetchFiles(path);
      } catch (error) {
        console.error("Error copying file:", error);
      }
      setContextMenu(null);
    }
  };

  const handleMove = async () => {
    if (selectedFile) {
      try {
        await axios.post(
          API,
          {
            Action: "move",
            Path: path,
            TargetPath: path,
            Names: [selectedFile.name],
            RenameFiles: false,
          },
          {
            headers: {
              "Cache-Control": "no-store",
            },
            withCredentials: true,
          }
        );
        fetchFiles(path);
      } catch (error) {
        console.error("Error moving file:", error);
      }
      setContextMenu(null);
    }
  };

  const handleRename = async () => {
    if (selectedFile) {
      try {
        await axios.post(
          API,
          {
            Action: "rename",
            Path: path,
            Name: selectedFile.name,
            NewName: newName,
          },
          {
            headers: {
              "Cache-Control": "no-store",
            },
            withCredentials: true,
          }
        );
        fetchFiles(path);
      } catch (error) {
        console.error("Error renaming file:", error);
      }
      setShowRenameModal(false);
      setContextMenu(null);
    }
  };

  return (
    <Container
      fluid
      className={`${styles.FSFileManager} ${styles[`FSTheme-${theme}`]}`}
      onClick={() => setContextMenu(null)}
    >
      <Row className="mb-3 align-items-center">
        <Col md={4}>
          <Breadcrumb>
            {path.split("/").map((part, index, array) => (
              <Breadcrumb.Item
                key={index}
                onClick={() => setPath(array.slice(0, index + 1).join("/"))}
                active={index === array.length - 1}
              >
                {part}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </Col>
        <Col md={1}>
          <Button variant="secondary" onClick={navigateUp}>
            <FontAwesomeIcon icon={faArrowUp} /> Up
          </Button>
        </Col>
        <Col md={4}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="New folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <Button onClick={handleCreateFolder}>Create Folder</Button>
          </InputGroup>
        </Col>
        <Col md={2}>
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            <FontAwesomeIcon icon={faUpload} /> Upload
          </Button>
        </Col>
        {/* <Col>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
            />
            <Button onClick={handleSearch}>Search</Button>
          </InputGroup>
        </Col> */}
      </Row>
      <Row>
        <Col md={3} className={styles.FSSidebar}>
          <ListGroup>
            {files
              .filter((file) => file.isDirectory)
              .map((file) => (
                <ListGroup.Item
                  key={file.name}
                  onClick={() => navigateToFolder(file.name)}
                  className={styles.FSFolderItem}
                >
                  <FontAwesomeIcon icon={faFolder} className={styles.FSIcon} />{" "}
                  <span className={styles.FSFileName}>{file.name}</span>
                </ListGroup.Item>
              ))}
          </ListGroup>
        </Col>
        <Col md={9} className={styles.FSrightSidebar}>
          <Row>
            {files.map((file) => (
              <Col
                key={file.name}
                md={3}
                className={`${styles.FSFileItem} ${
                  selectedFile?.name === file.name ? styles.FSSelected : ""
                }`}
                onContextMenu={(e) => handleContextMenu(e, file)}
              >
                <div onClick={() => setSelectedFile(file)}>
                  <FontAwesomeIcon
                    icon={file.isDirectory ? faFolder : faFileAlt}
                    className={styles.FSIcon}
                  />
                  <div className={styles.FSFileName}>{file.name}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
      {contextMenu && (
        <div
          style={{
            position: "absolute",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
          }}
          className="bg-white border rounded"
        >
          <Dropdown.Menu show className="show">
            {/* <Dropdown.Item
              onClick={() => {
                handleCreateFolder();
                setContextMenu(null);
              }}
            >
              <FontAwesomeIcon icon={faFolderPlus} /> Create new directory
            </Dropdown.Item>

            <Dropdown.Item
              onClick={() => {
                handleUpload();
                setContextMenu(null);
              }}
            >
              <FontAwesomeIcon icon={faUpload} /> Upload to current directory
            </Dropdown.Item>

            <Dropdown.Divider />
            <Dropdown.Item
              onClick={() => {
                handleCopy();
                setContextMenu(null);
              }}
            >
              <FontAwesomeIcon icon={faCopy} /> Copy
            </Dropdown.Item> */}

            <Dropdown.Item
              onClick={() => {
                handleDelete();
                setContextMenu(null);
              }}
            >
              <FontAwesomeIcon icon={faTrash} /> Delete
            </Dropdown.Item>
            {/* <Dropdown.Divider /> */}
          </Dropdown.Menu>
        </div>
      )}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Files</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select files to upload</Form.Label>
            <Form.Control type="file" multiple onChange={handleFileChange} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpload}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showRenameModal} onHide={() => setShowRenameModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rename File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>New name</Form.Label>
            <Form.Control
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRenameModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleRename}>
            Rename
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FileManager;
