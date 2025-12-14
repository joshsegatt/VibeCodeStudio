use regex::Regex;
use serde::{Deserialize, Serialize};
use std::fs;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchResult {
    pub file_path: String,
    pub line_number: usize,
    pub line_content: String,
    pub match_start: usize,
    pub match_end: usize,
}

#[tauri::command]
pub async fn search_in_files(
    project_path: String,
    query: String,
    is_regex: bool,
    case_sensitive: bool,
    max_results: Option<usize>,
) -> Result<Vec<SearchResult>, String> {
    let mut results = Vec::new();
    let limit = max_results.unwrap_or(1000);

    // Build regex pattern
    let pattern = if is_regex {
        if case_sensitive {
            Regex::new(&query).map_err(|e| format!("Invalid regex: {}", e))?
        } else {
            Regex::new(&format!("(?i){}", query)).map_err(|e| format!("Invalid regex: {}", e))?
        }
    } else {
        // Escape special regex characters for literal search
        let escaped = regex::escape(&query);
        if case_sensitive {
            Regex::new(&escaped).map_err(|e| format!("Invalid regex: {}", e))?
        } else {
            Regex::new(&format!("(?i){}", escaped)).map_err(|e| format!("Invalid regex: {}", e))?
        }
    };

    // Walk through directory
    for entry in WalkDir::new(&project_path)
        .follow_links(false)
        .max_depth(20)
        .into_iter()
        .filter_entry(|e| {
            // Skip hidden files and common ignore patterns
            let name = e.file_name().to_string_lossy();
            !name.starts_with('.')
                && name != "node_modules"
                && name != "target"
                && name != "dist"
                && name != "build"
        })
    {
        if results.len() >= limit {
            break;
        }

        let entry = entry.map_err(|e| e.to_string())?;

        // Only process files
        if !entry.file_type().is_file() {
            continue;
        }

        // Skip binary files (basic check)
        let path = entry.path();
        if let Some(ext) = path.extension() {
            let ext_str = ext.to_string_lossy().to_lowercase();
            if matches!(
                ext_str.as_str(),
                "exe"
                    | "dll"
                    | "so"
                    | "dylib"
                    | "png"
                    | "jpg"
                    | "jpeg"
                    | "gif"
                    | "ico"
                    | "woff"
                    | "woff2"
                    | "ttf"
                    | "eot"
            ) {
                continue;
            }
        }

        // Read file content
        let content = match fs::read_to_string(path) {
            Ok(c) => c,
            Err(_) => continue, // Skip files that can't be read as text
        };

        // Search in file
        for (line_num, line) in content.lines().enumerate() {
            if results.len() >= limit {
                break;
            }

            if let Some(mat) = pattern.find(line) {
                results.push(SearchResult {
                    file_path: path.to_string_lossy().to_string(),
                    line_number: line_num + 1,
                    line_content: line.to_string(),
                    match_start: mat.start(),
                    match_end: mat.end(),
                });
            }
        }
    }

    Ok(results)
}
