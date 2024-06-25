import os
import shutil
from fastapi import HTTPException

class FileManager:
    def __init__(self, base_path: str, root_folder: str):
        self.base_path = base_path
        self.root_path = os.path.join(base_path, root_folder)
        os.makedirs(self.root_path, exist_ok=True)

    def get_files(self, path: str, show_hidden_items: bool):
        """
        Args:
            path (str): 來源目錄
            show_hidden_items (bool): 顯示隱藏檔案

        Raises:
            HTTPException: (status_code=404, detail="Directory not found")

        Returns:
            "files": 來源目錄下的所有檔案
        """             
        full_path = os.path.join(self.base_path, path)
        if not os.path.exists(full_path):
            raise HTTPException(status_code=404, detail="Directory not found")
        files = []
        for item in os.listdir(full_path):
            if not show_hidden_items and item.startswith('.'):
                continue
            files.append(item)
        return {"files": files}

    def delete(self, path: str, names: list):
        """
        Args:
            path (str): 來源目錄
            names (list): 欲刪除的檔案名稱s

        Returns:
            "status": "deleted"
        """        
        full_path = os.path.join(self.base_path, path)
        for name in names:
            item_path = os.path.join(full_path, name)
            if os.path.exists(item_path):
                if os.path.isfile(item_path):
                    os.remove(item_path)
                else:
                    os.rmdir(item_path)
        return {"status": "deleted"}

    def copy(self, path: str, target_path: str, names: list, rename_files: bool):
        """
        Args:
            path (str): 來源目錄
            target_path (str): 目標目錄
            names (list): 欲複製的檔案名稱s
            rename_files (bool): 重新命名(不複寫)檔案

        Returns:
            "status": "copied"
        """        
        source_path = os.path.join(self.base_path, path)
        dest_path = os.path.join(self.base_path, target_path)
        os.makedirs(dest_path, exist_ok=True)
        for name in names:
            source_item = os.path.join(source_path, name)
            dest_item = os.path.join(dest_path, name)
            if os.path.exists(source_item):
                if rename_files:
                    dest_item = self._rename_file(dest_item)
                if os.path.isfile(source_item):
                    shutil.copy2(source_item, dest_item)
                else:
                    shutil.copytree(source_item, dest_item)
        return {"status": "copied"}

    def move(self, path: str, target_path: str, names: list, rename_files: bool):
        """
        Args:
            path (str): 來源目錄
            target_path (str): 目標目錄
            names (list): 欲移動的檔案名稱s
            rename_files (bool): 重新命名(不複寫)檔案

        Returns:
            "status": "moved"
        """        
        source_path = os.path.join(self.base_path, path)
        dest_path = os.path.join(self.base_path, target_path)
        os.makedirs(dest_path, exist_ok=True)
        for name in names:
            source_item = os.path.join(source_path, name)
            dest_item = os.path.join(dest_path, name)
            if os.path.exists(source_item):
                if rename_files:
                    dest_item = self._rename_file(dest_item)
                shutil.move(source_item, dest_item)
        return {"status": "moved"}

    def details(self, path: str, names: list):
        """
        Args:
            path (str): 來源目錄
            names (list): 欲顯示的檔案名稱s

        Returns:
            "details": 檔案資訊
        """        
        full_path = os.path.join(self.base_path, path)
        details = []
        for name in names:
            item_path = os.path.join(full_path, name)
            if os.path.exists(item_path):
                item_details = {
                    "name": name,
                    "is_file": os.path.isfile(item_path),
                    "size": os.path.getsize(item_path),
                    "modified_time": os.path.getmtime(item_path)
                }
                details.append(item_details)
        return {"details": details}

    def create(self, path: str, name: str):
        """
        Args:
            path (str): 來源目錄
            name (str): 欲創建的目錄名稱

        Returns:
            "status": "created"
        """        
        full_path = os.path.join(self.base_path, path, name)
        os.makedirs(full_path, exist_ok=True)
        return {"status": "created"}

    def search(self, path: str, search_string: str, show_hidden_items: bool, case_sensitive: bool):
        """
        Args:
            path (str): 來源目錄
            search_string (str): 欲搜尋的字串(檔案名中)
            show_hidden_items (bool): 顯示隱藏檔案
            case_sensitive (bool): false>忽略大小寫

        Returns:
            "results": 所有符合的檔案
        """        
        full_path = os.path.join(self.base_path, path)
        results = []
        for root, dirs, files in os.walk(full_path):
            for name in files + dirs:
                if not show_hidden_items and name.startswith('.'):
                    continue
                if case_sensitive:
                    if search_string in name:
                        results.append(os.path.relpath(os.path.join(root, name), self.base_path))
                else:
                    if search_string.lower() in name.lower():
                        results.append(os.path.relpath(os.path.join(root, name), self.base_path))
        return {"results": results}

    def rename(self, path: str, name: str, new_name: str):
        """
        Args:
            path (str): 來源目錄
            name (str): 欲重命名的檔案名稱
            new_name (str): 新名稱

        Returns:
            "status": "renamed"
        """        
        full_path = os.path.join(self.base_path, path, name)
        new_full_path = os.path.join(self.base_path, path, new_name)
        os.rename(full_path, new_full_path)
        return {"status": "renamed"}

    def _rename_file(self, path: str) -> str:
        base, extension = os.path.splitext(path)
        counter = 1
        new_path = f"{base}({counter}){extension}"
        while os.path.exists(new_path):
            counter += 1
            new_path = f"{base}({counter}){extension}"
        return new_path
