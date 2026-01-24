+++
title = "HTTP Server From Scratch Dev Log"
date = "2026-01-24"
description = "A chronological record of my suffering."

[taxonomies]
tags = ["devlog"]
[extra]
type = "log" 
growth = "growing" 
+++

# 🏗️ Build Log

*A chronological record of my suffering.*

[Main Branch](https://github.com/brandon-charest/http-rust)

## 📅 2026-01-24

Basic implementation of a reader loop that reads in `8 bytes` at time from socket connection. For this I technically do not need to use `mpsc::channel` but in some of the examples I have seen (which happened to be in Go) it seems like a channel was implemented.

```rust
// Generic function taking any reader that implements Read, Send, and 'static traits
// Returns a Receiver channel to stream lines asynchronously
fn get_lines<R>(mut reader: R) -> mpsc::Receiver<String>
where
    R: Read + Send + 'static,
{
    // Create a Multi-Producer Single-Consumer channel
    let (sender, receiver) = mpsc::channel::<String>();

    // Spawn a new thread to handle the reading without blocking the main thread
    thread::spawn(move || {
        // Small buffer of 8 bytes
        let mut buf = [0; 8];
        let mut current_line = String::new();

        loop {
            match reader.read(&mut buf) {
                Ok(0) => break, // EOF reached
                Ok(n) => {
                    // Convert buffer to string, assuming UTF-8 (lossy handles invalid sequences)
                    let line = String::from_utf8_lossy(&buf[0..n]).to_string();
                    current_line.push_str(&line);

                    // Split the accumulated string by newlines
                    let mut parts: Vec<String> = current_line.split('\n').map(String::from).collect();
                    
                    // The last part is either an incomplete line or empty, so keep it for next iteration
                    current_line = parts.pop().unwrap_or_default();

                    // Send all complete lines through the channel
                    for part in parts {
                        sender.send(part).unwrap();
                    }
                }
                Err(e) => {
                    eprint!("Error: {}", e);
                    break;
                }
            }
        }
        // Send any remaining data as the last line
        sender.send(current_line).unwrap();
    });

    // Return the receiver immediately so the caller can start processing lines
    receiver
}
```

And here is how it's used in the main loop:

```rust
fn main() {
    // Bind the listener to localhost on port 7878
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    // Accept incoming stream connections
    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                // Pass the stream to get_lines to start reading in a separate thread
                let receiver = get_lines(stream);
                
                // Process lines as they become available from the channel
                for line in receiver {
                    println!("{}", line);
                }
            }
            Err(e) => {
                eprint!("Error: {}", e);
            }
        }
    }
}
```