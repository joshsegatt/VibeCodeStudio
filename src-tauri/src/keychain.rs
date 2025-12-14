use keyring::Entry;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiKeyResult {
    pub success: bool,
    pub message: String,
}

#[tauri::command]
pub fn store_api_key(provider: String, key: String) -> Result<ApiKeyResult, String> {
    let service = format!("vibe-studio-{}", provider);

    match Entry::new(&service, "api-key") {
        Ok(entry) => match entry.set_password(&key) {
            Ok(_) => Ok(ApiKeyResult {
                success: true,
                message: format!("API key for {} stored securely", provider),
            }),
            Err(e) => Err(format!("Failed to store API key: {}", e)),
        },
        Err(e) => Err(format!("Failed to create keyring entry: {}", e)),
    }
}

#[tauri::command]
pub fn get_api_key(provider: String) -> Result<String, String> {
    let service = format!("vibe-studio-{}", provider);

    match Entry::new(&service, "api-key") {
        Ok(entry) => {
            match entry.get_password() {
                Ok(password) => Ok(password),
                Err(_) => Ok(String::new()), // Return empty string if not found
            }
        }
        Err(e) => Err(format!("Failed to access keyring: {}", e)),
    }
}

#[tauri::command]
pub fn delete_api_key(provider: String) -> Result<ApiKeyResult, String> {
    let service = format!("vibe-studio-{}", provider);

    match Entry::new(&service, "api-key") {
        Ok(entry) => match entry.delete_password() {
            Ok(_) => Ok(ApiKeyResult {
                success: true,
                message: format!("API key for {} deleted", provider),
            }),
            Err(e) => Err(format!("Failed to delete API key: {}", e)),
        },
        Err(e) => Err(format!("Failed to access keyring: {}", e)),
    }
}
