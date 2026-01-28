use epub::doc::EpubDoc;
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::{AppHandle, Manager};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub struct BookRecord {
    id: String,
    title: String,
    author: Option<String>,
    description: Option<String>,
    cover_path: Option<String>,
}

#[tauri::command]
async fn import_book(app: AppHandle, file_path: String) -> Result<BookRecord, String> {
    // 1. Open EPUB
    println!("Attempting to open EPUB at: {}", file_path);
    let mut doc = EpubDoc::new(&file_path)
        .map_err(|e| format!("Failed to open EPUB: {}", e))?;

    // 2. Extract Metadata
    // doc.mdata(key) returns Option<&MetadataItem>
    // MetadataItem.value appears to be a String based on compiler error
    let title = doc.mdata("title")
        .map(|m| m.value.clone())
        .unwrap_or("Unknown Title".to_string());
        
    let author = doc.mdata("creator")
        .map(|m| m.value.clone());
        
    let description = doc.mdata("description")
        .map(|m| m.value.clone());
    let id = Uuid::new_v4().to_string();

    // 3. Setup storage path
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let covers_dir = app_data_dir.join("covers");
    fs::create_dir_all(&covers_dir).map_err(|e| format!("Failed to create covers dir: {}", e))?;

    // 4. Extract and Process Cover
    let mut cover_path_str: Option<String> = None;

    if let Some((cover_data, _mime)) = doc.get_cover() {
        if let Ok(img) = image::load_from_memory(&cover_data) {
            // Resize (maintain aspect ratio, max height 600)
            let resized = img.resize(1000, 600, image::imageops::FilterType::Lanczos3);
            
            // Save as WebP
            let filename = format!("{}.webp", id);
            let target_path = covers_dir.join(&filename);
            
            // Encode to WebP
            match resized.save(&target_path) {
                Ok(_) => {
                    cover_path_str = Some(target_path.to_string_lossy().to_string());
                }
                Err(e) => {
                    eprintln!("Failed to save cover image: {}", e);
                }
            }
        }
    }

    Ok(BookRecord {
        id,
        title,
        author,
        description,
        cover_path: cover_path_str,
    })
}

#[tauri::command]
async fn process_cover_blob(app: AppHandle, id: String, blob: Vec<u8>) -> Result<String, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let covers_dir = app_data_dir.join("covers");
    fs::create_dir_all(&covers_dir).map_err(|e| format!("Failed to create covers dir: {}", e))?;

    if let Ok(img) = image::load_from_memory(&blob) {
        // Resize (maintain aspect ratio, max height 600)
        let resized = img.resize(1000, 600, image::imageops::FilterType::Lanczos3);
        
        let filename = format!("{}.webp", id);
        let target_path = covers_dir.join(&filename);
        
        match resized.save(&target_path) {
            Ok(_) => {
                Ok(target_path.to_string_lossy().to_string())
            }
            Err(e) => Err(format!("Failed to save cover image: {}", e))
        }
    } else {
        Err("Failed to load image from blob".to_string())
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![greet, import_book, process_cover_blob])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
