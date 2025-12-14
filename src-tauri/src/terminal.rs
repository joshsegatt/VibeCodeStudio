use std::io::{BufRead, BufReader};
use std::process::{Command, Stdio};
use tauri::Emitter;

#[tauri::command]
pub async fn execute_command(
    app: tauri::AppHandle,
    command: String,
    cwd: String,
) -> Result<(), String> {
    let shell = if cfg!(target_os = "windows") {
        "powershell"
    } else {
        "bash"
    };

    let shell_arg = if cfg!(target_os = "windows") {
        "-Command"
    } else {
        "-c"
    };

    let mut child = Command::new(shell)
        .arg(shell_arg)
        .arg(&command)
        .current_dir(&cwd)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    // Stream stdout
    if let Some(stdout) = child.stdout.take() {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(line) = line {
                let _ = app.emit("terminal-output", line);
            }
        }
    }

    // Stream stderr
    if let Some(stderr) = child.stderr.take() {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(line) = line {
                let _ = app.emit("terminal-error", line);
            }
        }
    }

    let status = child
        .wait()
        .map_err(|e| format!("Failed to wait for command: {}", e))?;

    let _ = app.emit("terminal-exit", status.code().unwrap_or(-1));

    Ok(())
}

#[tauri::command]
pub fn get_shell_info() -> Result<String, String> {
    if cfg!(target_os = "windows") {
        Ok("PowerShell".to_string())
    } else if cfg!(target_os = "macos") {
        Ok("zsh".to_string())
    } else {
        Ok("bash".to_string())
    }
}
