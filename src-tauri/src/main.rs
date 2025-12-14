// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod filesystem;
mod git;
mod keychain;
mod models;
mod search;
mod terminal;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::check_ollama_status,
            commands::download_model,
            commands::save_project,
            commands::load_projects,
            commands::generate_code,
            filesystem::create_project_folder,
            filesystem::write_file,
            filesystem::read_file,
            filesystem::list_directory,
            filesystem::delete_file,
            filesystem::create_multiple_files,
            filesystem::rename_file,
            filesystem::create_directory,
            git::git_init,
            git::git_status,
            git::git_add,
            git::git_commit,
            git::git_push,
            git::git_pull,
            git::git_branch_list,
            git::git_checkout,
            git::git_diff,
            git::git_commit_history,
            terminal::execute_command,
            terminal::get_shell_info,
            search::search_in_files,
            keychain::store_api_key,
            keychain::get_api_key,
            keychain::delete_api_key
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
