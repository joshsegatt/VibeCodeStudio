use serde::{Deserialize, Serialize};

// Unified Message Format (OpenAI-compatible)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

// Ollama Request/Response
#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaChatRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
    pub stream: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaChatResponse {
    pub model: String,
    pub created_at: String,
    pub message: Option<ChatMessage>,
    pub done: bool,
}

// LM Studio (OpenAI-compatible) Request/Response
#[derive(Debug, Serialize, Deserialize)]
pub struct LMStudioRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
    pub stream: bool,
    pub temperature: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LMStudioResponse {
    pub id: String,
    pub object: String,
    pub created: u64,
    pub model: String,
    pub choices: Vec<LMStudioChoice>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LMStudioChoice {
    pub index: u32,
    pub delta: Option<ChatMessage>,
    pub finish_reason: Option<String>,
}
