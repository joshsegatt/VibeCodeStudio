use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub children: Option<Vec<FileNode>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileEntry {
    pub path: String,
    pub content: String,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectStructure {
    pub name: String,
    pub root_path: String,
    pub files: Vec<FileEntry>,
}

#[tauri::command]
pub async fn create_project_folder(path: String, name: String) -> Result<String, String> {
    let project_path = Path::new(&path).join(&name);

    fs::create_dir_all(&project_path)
        .map_err(|e| format!("Failed to create project folder: {}", e))?;

    Ok(project_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    // Create parent directories if they don't exist
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent directories: {}", e))?;
    }

    fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))?;

    println!("✅ File written: {}", path);
    Ok(())
}

#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub async fn list_directory(path: String) -> Result<Vec<FileNode>, String> {
    let dir_path = Path::new(&path);

    if !dir_path.exists() {
        return Err(format!("Directory does not exist: {}", path));
    }

    let mut nodes = Vec::new();

    let entries = fs::read_dir(dir_path).map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        let is_directory = path.is_dir();

        let node = FileNode {
            name,
            path: path.to_string_lossy().to_string(),
            is_directory,
            children: None,
        };

        nodes.push(node);
    }

    // Sort: directories first, then files
    nodes.sort_by(|a, b| {
        if a.is_directory == b.is_directory {
            a.name.cmp(&b.name)
        } else if a.is_directory {
            std::cmp::Ordering::Less
        } else {
            std::cmp::Ordering::Greater
        }
    });

    Ok(nodes)
}

#[tauri::command]
pub async fn delete_file(path: String) -> Result<(), String> {
    let file_path = Path::new(&path);

    if file_path.is_dir() {
        fs::remove_dir_all(file_path).map_err(|e| format!("Failed to delete directory: {}", e))?;
    } else {
        fs::remove_file(file_path).map_err(|e| format!("Failed to delete file: {}", e))?;
    }

    println!("🗑️  Deleted: {}", path);
    Ok(())
}

#[tauri::command]
pub async fn create_multiple_files(files: Vec<FileEntry>) -> Result<(), String> {
    println!("📁 Creating {} files...", files.len());

    for file in files {
        // Create parent directories if needed
        if let Some(parent) = Path::new(&file.path).parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directories for {}: {}", file.path, e))?;
        }

        // Write file
        fs::write(&file.path, &file.content)
            .map_err(|e| format!("Failed to write {}: {}", file.path, e))?;

        println!("  ✅ {}", file.path);
    }

    println!("🎉 All files created successfully!");
    Ok(())
}

#[tauri::command]
pub async fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    let old = Path::new(&old_path);
    let new = Path::new(&new_path);

    fs::rename(old, new).map_err(|e| format!("Failed to rename: {}", e))?;

    println!("✏️  Renamed: {} -> {}", old_path, new_path);
    Ok(())
}

#[tauri::command]
pub async fn create_directory(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory: {}", e))?;

    println!("📁 Created directory: {}", path);
    Ok(())
}
