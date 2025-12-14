use crate::models::ollama::{
    ChatMessage, LMStudioRequest, LMStudioResponse, OllamaChatRequest, OllamaChatResponse,
};
use futures_util::StreamExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Stdio;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Runtime};
use tokio::io::AsyncBufReadExt;
use tokio::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectData {
    name: String,
    code: String,
    chat_history: String,
}

#[tauri::command]
pub async fn check_ollama_status() -> Result<bool, String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(2))
        .build()
        .map_err(|e| e.to_string())?;

    let res = client.get("http://localhost:11434").send().await;
    Ok(res.is_ok())
}

#[derive(Clone, Serialize)]
struct DownloadPayload {
    percent: u64,
    status: String,
}

#[tauri::command]
pub async fn download_model<R: Runtime>(
    app: AppHandle<R>,
    model_name: String,
) -> Result<(), String> {
    let mut child = Command::new("ollama")
        .args(&["pull", &model_name])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn ollama: {}", e))?;

    let stderr = child.stderr.take().ok_or("Failed to open stderr")?;
    let mut reader = tokio::io::BufReader::new(stderr).lines();

    let _handle = tauri::async_runtime::spawn(async move {
        while let Ok(Some(line)) = reader.next_line().await {
            let percent = if line.contains("%") {
                line.split('%')
                    .next()
                    .and_then(|s| s.split_whitespace().last())
                    .and_then(|s| s.parse::<u64>().ok())
                    .unwrap_or(0)
            } else {
                0
            };

            let payload = DownloadPayload {
                percent,
                status: line.clone(),
            };
            let _ = app.emit("download-progress", &payload);
        }
    });

    let status = child.wait().await.map_err(|e| e.to_string())?;
    if status.success() {
        Ok(())
    } else {
        Err(format!("Ollama exited with status: {}", status))
    }
}

fn get_projects_dir() -> PathBuf {
    dirs::document_dir()
        .unwrap_or(PathBuf::from("."))
        .join("AntigravityProjects")
}

#[tauri::command]
pub async fn save_project(name: String, code: String, chat_history: String) -> Result<(), String> {
    let dir = get_projects_dir();
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let file_path = dir.join(format!("{}.json", name));
    let data = ProjectData {
        name,
        code,
        chat_history,
    };
    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    fs::write(file_path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn load_projects() -> Result<Vec<String>, String> {
    let dir = get_projects_dir();
    if !dir.exists() {
        return Ok(vec![]);
    }
    let mut projects = Vec::new();
    let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;
    for entry in entries {
        if let Ok(entry) = entry {
            if let Some(name) = entry.file_name().to_str() {
                if name.ends_with(".json") {
                    projects.push(name.trim_end_matches(".json").to_string());
                }
            }
        }
    }
    Ok(projects)
}

#[derive(Serialize)]
struct GeneratePayload {
    token: String,
}

// THE CONVERSATIONAL PROTOCOL - Allow natural conversation with code generation
const DEFAULT_SYSTEM_PROMPT: &str = "You are a helpful AI coding assistant. You can chat naturally with users and help them create code in ANY programming language (Python, JavaScript, TypeScript, Rust, Go, Java, C++, HTML/CSS, React, Vue, etc.). 

IMPORTANT: When users ask you to create, build, or make something, you MUST provide the complete working code directly in markdown code blocks. Do NOT just give instructions or explanations - write the actual code.

Example:
User: 'Create a Python function to calculate fibonacci'
You: 'Here's a Python function for fibonacci:
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```'

Be friendly and conversational, but always provide working code when requested.";

#[tauri::command]
pub async fn generate_code<R: Runtime>(
    app: AppHandle<R>,
    model: String,
    prompt: String,
    provider: String,
    history: String,
) -> Result<(), String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(120))
        .build()
        .map_err(|e| e.to_string())?;

    // Build messages array - use default system prompt for natural conversation
    let mut messages = vec![ChatMessage {
        role: "system".to_string(),
        content: DEFAULT_SYSTEM_PROMPT.to_string(),
    }];

    // Parse history if provided
    if !history.is_empty() {
        if let Ok(history_msgs) = serde_json::from_str::<Vec<ChatMessage>>(&history) {
            messages.extend(history_msgs);
        }
    }

    // Add user prompt
    messages.push(ChatMessage {
        role: "user".to_string(),
        content: prompt,
    });

    // Route to correct provider
    match provider.as_str() {
        "ollama" => {
            let url = "http://localhost:11434/api/chat";
            let request = OllamaChatRequest {
                model: model.clone(),
                messages: messages.clone(),
                stream: true,
            };

            println!("🚀 Calling Ollama with model: {}", model);
            println!("📝 Messages: {:?}", messages);

            let response = client
                .post(url)
                .json(&request)
                .send()
                .await
                .map_err(|e| format!("Failed to connect to Ollama: {}", e))?;

            if !response.status().is_success() {
                return Err(format!("Ollama API Error: {}", response.status()));
            }

            println!("✅ Ollama responded, streaming...");

            let mut stream = response.bytes_stream();

            while let Some(item) = stream.next().await {
                let chunk = item.map_err(|e| e.to_string())?;
                let text = String::from_utf8_lossy(&chunk);

                for line in text.split('\n') {
                    if line.trim().is_empty() {
                        continue;
                    }

                    if let Ok(res) = serde_json::from_str::<OllamaChatResponse>(line) {
                        if let Some(msg) = res.message {
                            println!("📨 Token: {}", msg.content);
                            let _ =
                                app.emit("generate-token", &GeneratePayload { token: msg.content });
                        }

                        if res.done {
                            println!("✅ Generation finished");
                            let _ = app.emit("generate-finished", ());
                        }
                    }
                }
            }
        }
        "lmstudio" => {
            let url = "http://localhost:1234/v1/chat/completions";
            let request = LMStudioRequest {
                model: model.clone(),
                messages,
                stream: true,
                temperature: 0.7,
            };

            let response = client
                .post(url)
                .json(&request)
                .send()
                .await
                .map_err(|e| format!("Failed to connect to LM Studio: {}", e))?;

            if !response.status().is_success() {
                return Err(format!("LM Studio API Error: {}", response.status()));
            }

            let mut stream = response.bytes_stream();

            while let Some(item) = stream.next().await {
                let chunk = item.map_err(|e| e.to_string())?;
                let text = String::from_utf8_lossy(&chunk);

                for line in text.split('\n') {
                    if line.trim().is_empty() || !line.starts_with("data: ") {
                        continue;
                    }

                    let json_str = line.trim_start_matches("data: ");
                    if json_str == "[DONE]" {
                        let _ = app.emit("generate-finished", ());
                        break;
                    }

                    if let Ok(res) = serde_json::from_str::<LMStudioResponse>(json_str) {
                        if let Some(choice) = res.choices.first() {
                            if let Some(delta) = &choice.delta {
                                if !delta.content.is_empty() {
                                    let _ = app.emit(
                                        "generate-token",
                                        &GeneratePayload {
                                            token: delta.content.clone(),
                                        },
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
        _ => return Err(format!("Unknown provider: {}", provider)),
    }

    Ok(())
}
