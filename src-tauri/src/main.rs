// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
 use tauri::WebviewWindowBuilder;
 use tauri::WebviewUrl;

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let window = WebviewWindowBuilder::new(
        app,
        "main",
        WebviewUrl::External(app.config().app.windows[0].url.clone()),
      )
      .initialization_script(include_str!("../../src/inject.js")) // ここでJS注入
      .build()?;

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}