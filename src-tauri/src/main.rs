// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod screenshot;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command]
async fn take_screenshot() -> String {
    // capture screenshot
    std::panic::catch_unwind(|| {
        screenshot::capture();
    })
    .unwrap_or_else(|_| {
        format!("Error");
    });
    format!("Capture")
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, take_screenshot])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
