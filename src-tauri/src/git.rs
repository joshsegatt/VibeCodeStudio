use git2::{BranchType, DiffOptions, Repository, Signature, StatusOptions};
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct GitStatus {
    pub branch: String,
    pub changes: Vec<GitChange>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitChange {
    pub file: String,
    pub status: String, // "modified", "added", "deleted", "untracked"
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitCommit {
    pub hash: String,
    pub message: String,
    pub author: String,
    pub date: String,
}

#[tauri::command]
pub async fn git_init(path: String) -> Result<(), String> {
    Repository::init(&path).map_err(|e| format!("Failed to initialize repository: {}", e))?;

    println!("✅ Git repository initialized at: {}", path);
    Ok(())
}

#[tauri::command]
pub async fn git_status(path: String) -> Result<GitStatus, String> {
    let repo = Repository::open(&path).map_err(|e| format!("Failed to open repository: {}", e))?;

    // Get current branch
    let head = repo
        .head()
        .map_err(|e| format!("Failed to get HEAD: {}", e))?;
    let branch = head.shorthand().unwrap_or("HEAD").to_string();

    // Get file changes
    let mut opts = StatusOptions::new();
    opts.include_untracked(true);
    opts.recurse_untracked_dirs(true);

    let statuses = repo
        .statuses(Some(&mut opts))
        .map_err(|e| format!("Failed to get status: {}", e))?;

    let mut changes = Vec::new();
    for entry in statuses.iter() {
        let path = entry.path().unwrap_or("").to_string();
        let status = entry.status();

        let status_str = if status.is_wt_modified() || status.is_index_modified() {
            "modified"
        } else if status.is_wt_new() || status.is_index_new() {
            "added"
        } else if status.is_wt_deleted() || status.is_index_deleted() {
            "deleted"
        } else {
            "untracked"
        };

        changes.push(GitChange {
            file: path,
            status: status_str.to_string(),
        });
    }

    Ok(GitStatus { branch, changes })
}

#[tauri::command]
pub async fn git_add(path: String, files: Vec<String>) -> Result<(), String> {
    let repo = Repository::open(&path).map_err(|e| format!("Failed to open repository: {}", e))?;

    let mut index = repo
        .index()
        .map_err(|e| format!("Failed to get index: {}", e))?;

    for file in files {
        index
            .add_path(Path::new(&file))
            .map_err(|e| format!("Failed to add {}: {}", file, e))?;
    }

    index
        .write()
        .map_err(|e| format!("Failed to write index: {}", e))?;

    println!("✅ Staged files successfully");
    Ok(())
}

#[tauri::command]
pub async fn git_commit(path: String, message: String) -> Result<String, String> {
    let repo = Repository::open(&path).map_err(|e| format!("Failed to open repository: {}", e))?;

    let signature = Signature::now("Vibe Studio", "vibe@studio.local")
        .map_err(|e| format!("Failed to create signature: {}", e))?;

    let mut index = repo
        .index()
        .map_err(|e| format!("Failed to get index: {}", e))?;

    let tree_id = index
        .write_tree()
        .map_err(|e| format!("Failed to write tree: {}", e))?;

    let tree = repo
        .find_tree(tree_id)
        .map_err(|e| format!("Failed to find tree: {}", e))?;

    let parent_commit = match repo.head() {
        Ok(head) => Some(
            head.peel_to_commit()
                .map_err(|e| format!("Failed to get parent commit: {}", e))?,
        ),
        Err(_) => None,
    };

    let parents = match &parent_commit {
        Some(p) => vec![p],
        None => vec![],
    };

    let commit_id = repo
        .commit(
            Some("HEAD"),
            &signature,
            &signature,
            &message,
            &tree,
            &parents,
        )
        .map_err(|e| format!("Failed to create commit: {}", e))?;

    println!("✅ Committed: {}", commit_id);
    Ok(commit_id.to_string())
}

#[tauri::command]
pub async fn git_push(path: String, remote: String, branch: String) -> Result<(), String> {
    let repo = Repository::open(&path).map_err(|e| format!("Failed to open repository: {}", e))?;

    let mut remote = repo
        .find_remote(&remote)
        .map_err(|e| format!("Failed to find remote: {}", e))?;

    let refspec = format!("refs/heads/{}:refs/heads/{}", branch, branch);

    remote
        .push(&[&refspec], None)
        .map_err(|e| format!("Failed to push: {}", e))?;

    println!(
        "✅ Pushed to {}/{}",
        remote.name().unwrap_or("origin"),
        branch
    );
    Ok(())
}

#[tauri::command]
pub async fn git_pull(path: String) -> Result<(), String> {
    let repo = Repository::open(&path).map_err(|e| format!("Failed to open repository: {}", e))?;

    // Get current branch
    let head = repo
        .head()
        .map_err(|e| format!("Failed to get HEAD: {}", e))?;
    let branch_name = head.shorthand().ok_or("Failed to get branch name")?;

    // Fetch from remote
    let mut remote = repo
        .find_remote("origin")
        .map_err(|e| format!("Failed to find remote: {}", e))?;

    remote
        .fetch(&[branch_name], None, None)
        .map_err(|e| format!("Failed to fetch: {}", e))?;

    println!("✅ Pulled from origin/{}", branch_name);
    Ok(())
}

#[tauri::command]
pub async fn git_branch_list(path: String) -> Result<Vec<String>, String> {
    let repo = Repository::open(&path).map_err(|e| format!("Failed to open repository: {}", e))?;

    let branches = repo
        .branches(Some(BranchType::Local))
        .map_err(|e| format!("Failed to list branches: {}", e))?;

    let mut branch_names = Vec::new();
    for branch in branches {
        let (branch, _) = branch.map_err(|e| format!("Failed to get branch: {}", e))?;
        if let Some(name) = branch
            .name()
            .map_err(|e| format!("Failed to get branch name: {}", e))?
        {
            branch_names.push(name.to_string());
        }
    }

    Ok(branch_names)
}

#[tauri::command]
pub async fn git_checkout(path: String, branch: String) -> Result<(), String> {
    let repo = Repository::open(&path).map_err(|e| format!("Failed to open repository: {}", e))?;

    let obj = repo
        .revparse_single(&branch)
        .map_err(|e| format!("Failed to find branch: {}", e))?;

    repo.checkout_tree(&obj, None)
        .map_err(|e| format!("Failed to checkout: {}", e))?;

    repo.set_head(&format!("refs/heads/{}", branch))
        .map_err(|e| format!("Failed to set HEAD: {}", e))?;

    println!("✅ Checked out branch: {}", branch);
    Ok(())
}

#[tauri::command]
pub async fn git_diff(path: String, file: String) -> Result<String, String> {
    let repo = Repository::open(&path).map_err(|e| format!("Failed to open repository: {}", e))?;

    let head = repo
        .head()
        .map_err(|e| format!("Failed to get HEAD: {}", e))?;
    let tree = head
        .peel_to_tree()
        .map_err(|e| format!("Failed to get tree: {}", e))?;

    let mut opts = DiffOptions::new();
    opts.pathspec(&file);

    let diff = repo
        .diff_tree_to_workdir(Some(&tree), Some(&mut opts))
        .map_err(|e| format!("Failed to get diff: {}", e))?;

    let mut diff_text = String::new();
    diff.print(git2::DiffFormat::Patch, |_delta, _hunk, line| {
        diff_text.push_str(&format!("{}", String::from_utf8_lossy(line.content())));
        true
    })
    .map_err(|e| format!("Failed to print diff: {}", e))?;

    Ok(diff_text)
}

#[tauri::command]
pub async fn git_commit_history(path: String, limit: usize) -> Result<Vec<GitCommit>, String> {
    let repo = Repository::open(&path).map_err(|e| format!("Failed to open repository: {}", e))?;

    let mut revwalk = repo
        .revwalk()
        .map_err(|e| format!("Failed to create revwalk: {}", e))?;

    revwalk
        .push_head()
        .map_err(|e| format!("Failed to push HEAD: {}", e))?;

    let mut commits = Vec::new();
    for (i, oid) in revwalk.enumerate() {
        if i >= limit {
            break;
        }

        let oid = oid.map_err(|e| format!("Failed to get OID: {}", e))?;
        let commit = repo
            .find_commit(oid)
            .map_err(|e| format!("Failed to find commit: {}", e))?;

        commits.push(GitCommit {
            hash: oid.to_string()[..7].to_string(),
            message: commit.message().unwrap_or("").to_string(),
            author: commit.author().name().unwrap_or("Unknown").to_string(),
            date: commit.time().seconds().to_string(),
        });
    }

    Ok(commits)
}
